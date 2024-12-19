from importlib.resources import open_text

from dotenv import load_dotenv
from typing import  Literal, cast
from datetime import datetime
import re
import json
import asyncio
from langchain_core.messages import AnyMessage, AIMessage, SystemMessage, HumanMessage, ToolMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, START, END, add_messages
from langchain_core.runnables import RunnableConfig

from copilotkit.langchain import copilotkit_emit_state, copilotkit_customize_config, copilotkit_exit, copilotkit_emit_message

from state import ResearchState
from config import Config
from tools.tavily_search import tavily_search
from tools.tavily_extract import tavily_extract
from tools.outline_writer import outline_writer
from tools.section_writer import section_writer

load_dotenv('.env')

cfg = Config()

class MasterAgent:
    def __init__(self):
        self.tools = [tavily_search, tavily_extract, outline_writer, section_writer]
        self.tools_by_name = {tool.name: tool for tool in self.tools}
        self.frontend_tools = []  # Tools defined in the frontend using 'useCopilotAction'. These tools will be accessible in state["copilotkit"]["actions"]

        # Define a graph
        workflow = StateGraph(ResearchState)

        # Add nodes
        workflow.add_node("agent", self.call_model)
        workflow.add_node("tools", self.tool_node)
        workflow.add_node("human", self.ask_human)
        workflow.add_node("feedback", self.get_feedback)

        # Set the entrypoint as route_query
        workflow.set_entry_point("agent")

        # Determine which node is called next
        workflow.add_conditional_edges(
            "agent",
            self.should_continue,
            {
                "tools": "tools",
                "human": "human",
                "end": END,
            }

        )

        workflow.add_edge("tools", "agent")
        workflow.add_edge("human", "feedback")
        workflow.add_edge("feedback", "agent")
        workflow.add_edge("agent", END)

        # Compile the graph and save it interrupt_after=["planner"]
        self.graph = workflow.compile(interrupt_after=['human'])

    # Define an async custom research tool node that access and updates the research state
    async def tool_node(self, state: ResearchState, config: RunnableConfig):
        config = copilotkit_customize_config(config, emit_messages=False)
        msgs = []
        tool_state = {}
        for tool_call in state["messages"][-1].tool_calls:
            tool = self.tools_by_name[tool_call["name"]]
            # Temporary messages struct that are accessible only to tools.
            state['messages'] = {'HumanMessage' if type(message) == HumanMessage else 'AIMessage' : message.content for message in state['messages']}
            tool_call["args"]["state"] = state  # update the state so the tool could access the state
            new_state, tool_msg = await tool.ainvoke(tool_call["args"])
            tool_call["args"]["state"] = None
            msgs.append(ToolMessage(content=tool_msg, name=tool_call["name"], tool_call_id=tool_call["id"]))
            tool_state = {
                "title": new_state.get("title", ""),
                "outline": new_state.get("outline", {}),
                "sections": new_state.get("sections", []),
                "sources": new_state.get("sources", {}),
                "proposal": new_state.get("proposal", {}),
                "logs": new_state.get("logs", []),
                "tool": new_state.get("tool", {}),
                "messages": msgs
            }
            await copilotkit_emit_state(config, tool_state)

        return tool_state


    @staticmethod
    def ask_human(state: ResearchState):
        # Define a fake node to ask human for feedback in frontend
        pass

    @staticmethod
    async def get_feedback(state: ResearchState, config: RunnableConfig):
        # Get feedback from frontend
        config = copilotkit_customize_config(
            config,
            emit_messages=True,  # enable emitting messages to the frontend
        )
        await copilotkit_exit(config)  # exit copilot after its frontend execution
        last_message = cast(ToolMessage, state["messages"][-1])
        if cfg.DEBUG:
            print("in get_feedback: ",last_message)
        # Checking if the last frontend tool is 'review proposal' so we can update the proposal
        if last_message.name == 'review_proposal':
            # Update proposal and outline
            reviewed_proposal = json.loads(last_message.content)
            if reviewed_proposal["approved"]:
                # Update outline with approved sections
                outline = {k: {'title': v['title'], 'description': v['description']} for k, v in
                           reviewed_proposal['sections'].items()
                           if isinstance(v, dict) and v.get('approved')}

                state['outline'] = outline
            # Update proposal
            state["proposal"] = reviewed_proposal

        return state

    async def call_model(self, state: ResearchState, config: RunnableConfig):
        # Check and cast the last message if needed
        last_message = state['messages'][-1]
        if cfg.DEBUG:
             print(f"In call_model, last_message: {last_message}")
        allowed_types = (AIMessage, SystemMessage, HumanMessage, ToolMessage)

        if not isinstance(last_message, allowed_types):
            # Cast the last message to HumanMessage if it's of an unrecognized type
            last_message = HumanMessage(content=last_message.content)
            state['messages'][-1] = last_message


        # Keep list of frontend tools to know when to break to human node
        for tool in state["copilotkit"]["actions"]:
            self.frontend_tools.append(tool["name"])

        outline = state.get("outline", {})
        sections = state.get("sections", [])
        proposal = state.get("proposal", {})

        prompt = (
                f"Today's date is {datetime.now().strftime('%d/%m/%Y')}.\n"
                "You are an expert research assistant, dedicated to helping users create comprehensive, well-sourced research reports. Your primary goal is to assist the user in producing a polished, professional report tailored to their needs.\n\n"
                "When writing a report use the following research tools:\n"
                "1. Use the search tool to start the research and gather additional information from credible online sources when needed.\n"
                "2. Use the extract tool to extract additional content from relevant URLs.\n"
                "3. Use the outline tool to analyze the gathered information and organize it into a clear, logical **outline proposal**. Break the content into meaningful sections that will guide the report structure. Wait for outline approval before continuing to the next phase.\n"
                "4. After using the outline tool, YOU MUST use review_proposal tool. and pass the proposal as argument \n"
                f"5. Once proposal is approved use the section_writer tool to write ONLY the sections of the report based on the **Approved Outline** {str([outline[section]['title'] for section in outline]) if outline else ''}:generated from the review_proposal tool. Ensure the report is well-written, properly sourced, and easy to understand. Avoid responding with the text of the report directly, always use the section_writer tool for the final product.\n\n"
                "After using the outline and section writer research tools, actively engage with the user to discuss next steps. **Do not summarize your completed work**, as the user has full access to the research progress.\n\n"
                "Instead of sharing details like generated outlines or reports, simply confirm the task is ready and ask for feedback or next steps. For example:\n"
                "'I have completed [..MAX additional 5 words]. Would you like me to [..MAX additional 5 words]?'\n\n"
                "When you have a proposal, you must only write the sections that are approved. If a section is not approved, you must not write it."
                "Your role is to provide support, maintain clear communication, and ensure the final report aligns with the user's expectations."
            )

        if 'remarks' in proposal and not outline:
            prompt += (
                f"**\nReviewed Proposal:**\n{proposal['sections']}\n"
                f"User's feedback: {proposal['remarks']}"
                "You must use the outline_writer tool to write a new outline proposal that incorporates the user's feedback.")
        if outline:
                prompt += (
                    f"### Current State of the Report\n"
                    f"\n**Approved Outline**:\n{outline}\n\n"
                )
        report_content = ""
        for section in sections:
            report_content += (
            f"section {section['idx']} : {section['title']}\n"
            f"content : {section['content']}"
            f"footer : {section['footer']}\n\n")

        prompt += f"**Report**:\n\n{report_content}"

        if cfg.DEBUG:
            print("prompt: ", prompt)

        config = copilotkit_customize_config(config, emit_tool_calls=self.frontend_tools)  # emit only frontend tools
        ainvoke_kwargs = {}
        ainvoke_kwargs["parallel_tool_calls"] = False

        response = await cfg.FACTUAL_LLM.bind_tools(self.tools + state["copilotkit"]["actions"],
                                          **ainvoke_kwargs).ainvoke([
            SystemMessage(
                content=prompt
            ),
            *state["messages"],
        ], config)

        response = cast(AIMessage, response)

        return {"messages": response}

    # Define the function that decides whether to continue research using tools or proceed to writing the report
    def should_continue(self, state: ResearchState) -> Literal["tools", "human", "end"]:
        messages = state['messages']
        last_message = messages[-1]
        # Only perform checks if the last message is an AIMessage
        if isinstance(last_message, AIMessage):
            if last_message.tool_calls:
                for tool_call in last_message.tool_calls:
                    # If the LLM makes a frontend tool call, route to the "human" node
                    # This essentially checks if the tool call is 'review_proposal', as it is the only frontend tool at the moment.
                    if tool_call['name'] in self.frontend_tools:
                        return "human"
                # If the LLM makes a regular tool call, route to the "tools" node
                return "tools"
        # If no conditions are met or if it's not an AIMessage, return "end" to stop
        return "end"

# #Run the async function
#    # used for running graph locally
#    #Define an async function to run your graph code
#     async def run_graph(self):
#         graph = self.graph
#         messages = [
#             HumanMessage(content="Please run research on Tavily company")
#         ]
#         async for s in graph.astream({"messages": messages}, stream_mode="values"):
#             message = s["messages"][-1]
#             if isinstance(message, tuple):
#                 print(message)
#             else:
#                 message.pretty_print()
#
#
# #Run the async function
# asyncio.run(MasterAgent().run_graph())

graph = MasterAgent().graph
