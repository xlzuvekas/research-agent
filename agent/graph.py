from state import ResearchState
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

from copilotkit.langchain import copilotkit_emit_state, copilotkit_customize_config

from tools.tavily_search import tavily_search
from tools.tavily_extract import tavily_extract
from tools.outline_writer import outline_writer
from tools.section_writer import section_writer

load_dotenv('.env')


class MasterAgent:
    def __init__(self):
        self.tools = [tavily_search, tavily_extract, outline_writer, section_writer]
        self.tools_by_name = {tool.name: tool for tool in self.tools}

        # Define a graph
        workflow = StateGraph(ResearchState)

        # Add nodes
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

        # Compile the graph and save it
        self.graph = workflow.compile()

    # Define an async custom research tool node that access and updates the research state
    async def tool_node(self, state: ResearchState, config: RunnableConfig):

        msgs = []
        tool_state = {}
        for tool_call in state["messages"][-1].tool_calls:
            tool = self.tools_by_name[tool_call["name"]]
            tool_call["args"]["state"] = state  # update the state so the tool could access the state
            tool_call["args"]["state"].pop("messages",
                                           None)  # don't call tool with msgs field as it caused serialization error
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
                "sources": new_state.get("sources", {}),
                "cited_sources": new_state.get("cited_sources", {}),
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
        # config = copilotkit_customize_config(
        #     config,
        #
        #     # this will stream the `set_outline` tool-call's `outline` argument, *as if* it was the `outline` state parameter.
        #     # i.e.:
        #     # the tool call: set_outline(outline: string)
        #     # the state: { ..., outline: "..." }
        #     emit_intermediate_state=[
        #         {
        #             "state_key": "outline",  # the name of the key on the agent state we want to interact with
        #             "tool": "outline_writer",  # the name of the tool call
        #             "tool_argument": "research_query",
        #             # the name of the argument on the tool call to treat as intermediate state.
        #         }
        #     ]
        # )

        # Check and cast the last message if needed
        last_message = state['messages'][-1]
        allowed_types = (AIMessage, SystemMessage, HumanMessage, ToolMessage)

        if not isinstance(last_message, allowed_types):
            # Cast the last message to HumanMessage if it's of an unrecognized type
            last_message = HumanMessage(content=last_message.content)
            state['messages'][-1] = last_message

        prompt = f"""Today's date is {datetime.now().strftime('%d/%m/%Y')}.

        You are a highly skilled research agent, dedicated to helping users create comprehensive, well-sourced research reports. Your primary goal is to assist the user in producing a polished, professional report tailored to their needs.

        When writing a report:
        1. Use the search tool to start the research and gather information from credible online sources.
        2. Use the extract tool to extract additional information from relevant URLs.
        3. Use the outline tool to analyze the gathered information and organize it into a clear, logical outline. Break the content into meaningful sections that will guide the report structure.
        4. Use the section writer tool to write a section of the report. At the first pase you should write the full report base on the outline. Ensure the report is well-written, properly sourced, and easy to understand. Avoid responding with the text of the report directly—always use the SectionWrite tool for the final product.

        After completing the report, actively engage with the user to discuss next steps. For instance, ask if they need revisions, additional details, or further research. Keep the process interactive and collaborative.
        """
        # If the user provides a research question or topic, proceed immediately without asking them to restate it. Your focus is to deliver high-quality insights efficiently and effectively.

        model = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        ainvoke_kwargs = {}
        ainvoke_kwargs["parallel_tool_calls"] = False
        response = await model.bind_tools(self.tools,
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
            # If the LLM makes a regular tool call, route to the "tools" node
            if last_message.tool_calls:
                return "tools"

        # If no conditions are met or if it's not an AIMessage, return "end" to stop
        return "end"


#     # Define an async function to run your graph code
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
# # Run the async function
# asyncio.run(MasterAgent().run_graph())

graph = MasterAgent().graph
