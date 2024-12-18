from dotenv import load_dotenv
import json
import asyncio
from typing import TypedDict, List, Annotated, Literal, Dict, Union, Optional, cast
from datetime import datetime
from pydantic import BaseModel, Field

from langchain_core.messages import AnyMessage, AIMessage, SystemMessage, HumanMessage, ToolMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, START, END, add_messages
from langchain_core.runnables import RunnableConfig
from langgraph.types import Command

from copilotkit.langchain import copilotkit_emit_state, copilotkit_customize_config

from state import ResearchState
from tools.tavily_search import tavily_search
from tools.tavily_extract import tavily_extract
from tools.outline_writer import outline_writer
# from agent.structure_planner import structure_planner
from tools.section_writer import section_writer

load_dotenv('.env')


class MasterAgent:
    def __init__(self):
        self.tools = [tavily_search, tavily_extract, outline_writer, section_writer]
        self.tools_by_name = {tool.name: tool for tool in self.tools}

        # Define a graph
        workflow = StateGraph(ResearchState)

        # Add nodes
        # workflow.add_node("start_node", self.start_node)
        # workflow.add_node("planner", structure_planner)
        workflow.add_node("agent", self.call_model)
        workflow.add_node("tools", self.tool_node)

        # Set the entrypoint as route_query
        workflow.set_entry_point("agent")

        # Determine which node is called next
        workflow.add_conditional_edges(
            "agent",
            self.should_continue,
            {
                "tools": "tools",
                "end": END,
            }

        )

        workflow.add_edge("tools", "agent")
        workflow.add_edge("agent", END)

        # Compile the graph and save it interrupt_after=["planner"]
        self.graph = workflow.compile()

    # Define an async custom research tool node that access and updates the research state
    async def tool_node(self, state: ResearchState, config: RunnableConfig):
        config = copilotkit_customize_config(config, emit_messages=False)
        msgs = []
        tool_state = {}
        for tool_call in state["messages"][-1].tool_calls:
            tool = self.tools_by_name[tool_call["name"]]
            tool_call["args"]["state"] = state  # update the state so the tool could access the state
            tool_call["args"]["state"].pop("messages",
                                           None)  # don't call tool with msgs field as it caused serialization error
            # TODO: make this nicer
            if tool_call["name"] == 'review_proposal':
                print(tool_call)
                break

            new_state, tool_msg = await tool.ainvoke(tool_call["args"])
            tool_call["args"]["state"] = None
            msgs.append(ToolMessage(content=tool_msg, name=tool_call["name"], tool_call_id=tool_call["id"]))
            tool_state = {
                "title": new_state.get("title", ""),
                "outline": new_state.get("outline", ""),
                "intro": new_state.get("intro", ""),
                "sections": new_state.get("sections", []),
                "conclusion": new_state.get("conclusion", ""),
                "footer": new_state.get("footer", []),
                "footnotes": new_state.get("footnotes", None),
                "sources": new_state.get("sources", {}),
                "cited_sources": new_state.get("cited_sources", None),
                "proposal": new_state.get("proposal", {}),
                "structure": new_state.get("structure", {}),
                "tool": new_state.get("tool", {}),
                "messages": msgs
            }
            await copilotkit_emit_state(config, tool_state)

        return tool_state

    # We define a fake node to ask the human
    def ask_human(self, state: ResearchState):
        pass

    # Invoke a model with research tools to gather data about the company
    async def call_model(self, state: ResearchState, config: RunnableConfig):
        print("call_model")

        # Check and cast the last message if needed
        last_message = state['messages'][-1]
        allowed_types = (AIMessage, SystemMessage, HumanMessage, ToolMessage)

        if not isinstance(last_message, allowed_types):
            # Cast the last message to HumanMessage if it's of an unrecognized type
            last_message = HumanMessage(content=last_message.content)
            state['messages'][-1] = last_message

        prompt = (
            f"Today's date is {datetime.now().strftime('%d/%m/%Y')}.\n"
            "You are an expert research assistant, dedicated to helping users create comprehensive, well-sourced research reports. Your primary goal is to assist the user in producing a polished, professional report tailored to their needs.\n\n"
            "When writing a report use the following research tools:\n"
            "1. Use the search tool to start the research and gather additional information from credible online sources when needed.\n"
            "2. Use the extract tool to extract additional content from relevant URLs.\n"
            "3. Use the outline tool to analyze the gathered information and organize it into a clear, logical **outline proposal**. Break the content into meaningful sections that will guide the report structure. Wait for outline approval before continuing to the next phase.\n"
            "4. Use the section writer tool to compose each section of the report based on the **approved outline**. Ensure the report is well-written, properly sourced, and easy to understand. Avoid responding with the text of the report directly—always use the SectionWrite tool for the final product.\n\n"
            "5. After using the outline tool, YOU MUST use review_proposal tool.\n"
            "After using the outline and section writer research tools, actively engage with the user to discuss next steps. **Do not summarize your completed work**, as the user has full access to the research progress.\n\n"
            "Instead of sharing details like generated outlines or reports, simply confirm the task is ready and ask for feedback or next steps. For example:\n"
            "'I have completed [..MAX additional 5 words]. Would you like me to revisit any part or move forward?'\n\n"
            "Your role is to provide support, maintain clear communication, and ensure the final report aligns with the user's expectations."
        )

        proposal = state.get("proposal", {})
        # Extract sections with "approved": True
        if proposal:
            print(proposal)
            outline = {k: {'title': v['title'], 'description': v['description']} for k, v in
                       proposal['sections'].items()
                       if isinstance(v, dict) and v.get('approved')}
            print(outline)
            if outline:
                prompt += (
                    f"### Current State of the Report\n"
                    f"**Approved Outline**:\n{outline}\n\n"
                    "### Next Steps\n"
                    "Based on the current progress, determine the next sections to complete or refine. Ensure to follow the outline and user requirements closely.\n"
                )
        print(prompt)

        model = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        config = copilotkit_customize_config(config, emit_tool_calls=True)
        ainvoke_kwargs = {}
        ainvoke_kwargs["parallel_tool_calls"] = False
        print('*****TOOL*****')
        print(state["copilotkit"]["actions"])
        print('**********')
        for tool in state["copilotkit"]["actions"]:
            self.tools_by_name[tool["name"]] = tool

        response = await model.bind_tools(self.tools + state["copilotkit"]["actions"],
                                          **ainvoke_kwargs).ainvoke([
            SystemMessage(
                content=prompt
            ),
            *state["messages"],
        ], config)

        response = cast(AIMessage, response)

        return {"messages": response}

    # async def start_node(self, state: ResearchState):
    #     print("start_node")
    #     if state.get("proposal", {}).get("approved", False):
    #         goto = 'agent'
    #     else:
    #         goto = 'planner'
    #
    #     return Command(
    #         goto=goto
    #     )

    # Define the function that decides whether to continue research using tools or proceed to writing the report
    def should_continue(self, state: ResearchState) -> Literal["tools", "human", "end"]:
        messages = state['messages']
        last_message = messages[-1]

        # Only perform checks if the last message is an AIMessage
        if isinstance(last_message, AIMessage):
            # If the LLM makes a regular tool call, route to the "tools" node
            if last_message.tool_calls:
                return "tools"

        # If no conditions are met or if it's not an AIMessage, return "end" to stop
        return "end"

    # Define an async function to run your graph code
    # async def run_graph(self):
    #     graph = self.graph
    #     messages = [
    #         HumanMessage(content="Please run research on Tavily company")
    #     ]
    #     async for s in graph.astream({"messages": messages}, stream_mode="values"):
    #         message = s["messages"][-1]
    #         if isinstance(message, tuple):
    #             print(message)
    #         else:
    #             message.pretty_print()


# Run the async function
# asyncio.run(MasterAgent().run_graph())

graph = MasterAgent().graph

# prompt = (
#     f"Today's date is {datetime.now().strftime('%d/%m/%Y')}.\n"
#     "You are a highly skilled research agent, dedicated to helping users create comprehensive, well-sourced research reports. Your primary goal is to assist the user in producing a polished, professional report tailored to their needs.\n\n"
#     "When writing a report:\n"
#     "1. **Research Phase**: Use the search tool to gather information from credible online sources.\n"
#     "2. **Information Extraction**: Use the extract tool to collect additional details from relevant URLs.\n"
#     "3. **Outline Proposal**: Use the outline tool to analyze the gathered information and organize it into a clear, logical outline. **Do not generate or include the full outline directly in your message**. Instead, simply inform the user that an outline has been created and ask for approval.\n"
#     "- For example: 'I have generated an outline proposal for your review. Would you like me to make any changes or proceed with the next steps?'\n"
#     "4. **Report Writing**: Use the section writer tool to write each section of the report based on the **approved outline**. Ensure the report is clear, professional, well-organized, and properly sourced. Avoid sharing the report content directly—always use the SectionWrite tool for the final product.\n\n"
#     "After completing your task, keep the process collaborative and interactive. Avoid summarizing the completed work unnecessarily, as the user has full access to the research progress. \n"
#     "Instead of sharing details like generated outlines or reports, simply confirm the task is ready and ask for feedback or next steps. For example:\n"
#     "'I have completed this phase. Would you like me to revisit any part or move forward?'\n\n"
#     "Your role is to provide support, maintain clear communication, and ensure the final report aligns with the user's expectations."
# )


# prompt = (
#     f"Today's date is {datetime.now().strftime('%d/%m/%Y')}.\n"
#     "You are an expert research assistant, dedicated to helping users create well-structured, professional, and thoroughly researched reports. Your primary objective is to support the user in developing polished reports tailored to their needs through collaboration and precision.\n\n"
#     "When working on a report, follow these steps:\n"
#     "1. **Research Phase**: Use the search tool to gather credible information from trusted online sources.\n"
#     "2. **Information Extraction**: Utilize the extract tool to retrieve relevant details from specific URLs provided or identified during the research.\n"
#     "3. **Outline Proposal**: Analyze the collected information and organize it into a clear, logical outline proposal. Structure the outline into well-defined sections that will serve as a foundation for the report. **Wait for the user's approval of the outline before proceeding**.\n"
#     "4. **Report Writing**: Use the section writer tool to compose each section of the report based on the **approved outline**. Write in a clear, professional, and engaging style, ensuring all content is well-organized, properly sourced, and easy to understand. Avoid pasting the text directly—always use the SectionWrite tool to deliver the final content.\n\n"
#     "Once your task is complete, focus on maintaining an interactive and collaborative process. Engage the user by asking for feedback, revisions, or additional requirements. Avoid summarizing completed work unnecessarily, as the user has full access to the research progress (e.g don't summarize what sources you found, what outline or report you generated).\n\n"
#     "Your role is to provide guidance, structure, and expertise at every stage of the process to ensure the report exceeds expectations."
# )

# prompt = f"""Today's date is {datetime.now().strftime('%d/%m/%Y')}.
#
# You are a highly skilled research agent, dedicated to helping users create comprehensive, well-sourced research reports. Your primary goal is to assist the user in producing a polished, professional report tailored to their needs.
#
# When writing a report:
# 1. Use the search tool to start the research and gather information from credible online sources.
# 2. Use the extract tool to extract additional information from relevant URLs.
# 3. Use the outline tool to analyze the gathered information and organize it into a clear, logical outline. Break the content into meaningful sections that will guide the report structure. Wait for outline approval before continuing to the next phase.
# 4. Use the section writer tool to write a section of the report. At the first pase you should write the full report base on the outline. Ensure the report is well-written, properly sourced, and easy to understand. Avoid responding with the text of the report directly—always use the SectionWrite tool for the final product.
#
# After completing the report, actively engage with the user to discuss next steps. For instance, ask if they need revisions, additional details, or further research. Keep the process interactive and collaborative.
# """
# If the user provides a research question or topic, proceed immediately without asking them to restate it. Your focus is to deliver high-quality insights efficiently and effectively.