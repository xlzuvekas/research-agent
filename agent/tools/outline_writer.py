import json5 as json
from datetime import datetime
from typing import Optional, Dict

from langchain_community.adapters.openai import convert_openai_messages
from langchain_core.tools import tool
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI

from copilotkit.langchain import copilotkit_emit_state, copilotkit_customize_config, copilotkit_emit_message
from langchain_core.runnables import RunnableConfig

# Define proposal structure keys at module level for single source of truth
PROPOSAL_FORMAT = {
    "sections": {
        "description": "The main sections that compose this research",  # This is a description on what are "sections"
        "section1": {  # Key is the name of the item
            "title": "Title of the item",
            "description": "Description of section1",
            "approved": True,
            # Defines if this goes in the final structure. Set only important parts to True by default
        }
    },
}

PROPOSAL_KEYS = list(PROPOSAL_FORMAT.keys())

# class Section:
#     title: str = Field(description="Title of the section")
#     description: str = Field(description="Description of the section")
#     approved: bool
#
# class Proposal:
#     sections: Dict[Section]

class OutlineWriterInput(BaseModel):
    research_query: str = Field(description="Research query")
    state: Optional[Dict] = Field(description="State of the research")

@tool("outline_writer", args_schema=OutlineWriterInput, return_direct=True)
async def outline_writer(research_query, state):
    """Writes a research outline proposal based on the research query"""
    # Get sources from state
    sources = state.get("sources", {})
    sources_summary = ""
    for url, source in sources.items():
        sources_summary += f"- title: {source['title']}"
        sources_summary += f" url:  {source['url']}"
        sources_summary += f" content:  {source['content']}\n"

    # Check if a current proposal exists
    current_proposal = state.get('proposal', None)
    current_proposal_text = (
        f"Current proposal:\n{json.dumps(current_proposal, indent=2)}\n\n"
        if current_proposal else ""
    )

    prompt = [{
        "role": "system",
        "content": "You are an AI assistant that helps users plan research structures. "
                   "Your task is to propose a logical structure for a research paper that "
                   "the user can review and modify. "
    }, {
        "role": "user",
        "content": f"Today's date is {datetime.now().strftime('%d/%m/%Y')}\n."
                   f"Research Topic: {research_query}\n"
                   f"Create a detailed proposal that includes report's sections"
                   f"Please return nothing but a JSON in the "
                   f"following format:\n"
                   f"{json.dumps(PROPOSAL_FORMAT, indent=2)}\n"
                   f"Here are some relevant sources to consider while planning the report:\n"
                   f"{sources_summary}\n"
                   f"{current_proposal_text}"
                   f"Your Proposal:"
    }]

    lc_messages = convert_openai_messages(prompt)
    optional_params = {
        "response_format": {"type": "json_object"}
    }

    config = RunnableConfig()
    state["logs"] = state.get("logs", [])
    state["logs"].append({
        "message": "💭 Thinking of a research proposal",
        "done": False
    })
    await copilotkit_emit_state(config, state)

    state["logs"].append({
        "message": "✨ Generating a research proposal outline",
        "done": False
    })
    state["logs"][-2]["done"] = True
    await copilotkit_emit_state(config, state)

    response = ChatOpenAI(model='gpt-4o-mini', max_retries=1, model_kwargs=optional_params).invoke(lc_messages, config).content

    for i, log in enumerate(state["logs"]):
        state["logs"][i]["done"] = True
    await copilotkit_emit_state(config, state)

    try:
        proposal = json.loads(response)

        # Validate proposal structure using module-level keys
        if not all(key in proposal for key in PROPOSAL_KEYS):
            raise ValueError(f"Missing required keys in proposal. Required: {PROPOSAL_KEYS}")

        # Add timestamp to proposal
        proposal["timestamp"] = datetime.now().isoformat()
        proposal["approved"] = False

        tool_msg = f"Generated the following outline proposal:\n{response}"
        state["proposal"] = proposal

        # Clear logs
        state["logs"] = []
        await copilotkit_emit_state(config, state)

        return state, tool_msg
    except (json.JSONDecodeError, ValueError) as e:
        # Create fallback structure using same keys
        fallback = {
            key: [] for key in PROPOSAL_KEYS
        }
        fallback.update({
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        })
        state["proposal"] = fallback

        # Clear logs
        state["logs"] = []
        await copilotkit_emit_state(config, state)

        return state, f"Error generating outline proposal: {e}"



# @tool("outline_writer", args_schema=OutlineWriterInput, return_direct=True)
# async def outline_writer(research_query, state):
#     """writes a research outline based on the research query"""
#     config = RunnableConfig()
#     # Log search queries
#     state["logs"] = state.get("logs", [])
#     state["logs"].append({
#         "message": f"Planning report's outline...",
#         "done": False
#     })
#     await copilotkit_emit_state(config, state)
#
#     # Get sources from state
#     sources = state.get("sources", {})
#     sources_summary = ""
#     for url, source in sources.items():
#         sources_summary += f"\n title: {source['title']}"
#         sources_summary += f"\n url:  {source['url']}"
#         sources_summary += f"\n content:  {source['content']}"
#
#     structure = state.get("structure", {})
#     print('outline_writer')
#     prompt = [{
#         "role": "system",
#         "content": "You are an AI assistant that helps users write research outlines. "
#                    "You have been given a research query and a list of sources. "
#                    "Your task is to write a research outline based on the query and the sources. "
#     }, {
#         "role": "user",
#         "content": f"Today's date is {datetime.now().strftime('%d/%m/%Y')}\n."
#                    f"Query or Topic: {research_query}\n"
#                    f"{sources_summary}\n"
#                    f"Desired structure: {structure}\n"
#                    f"Your task is to write a critically acclaimed research outline on the "
#                    f"topic above. The outline should include an introduction, body, and conclusion. "
#                    f"Please return nothing but a JSON in the following format:\n"
#                    f"{sample_outline}\n "
#                    f"Your Outline:"
#     }]
#
#     lc_messages = convert_openai_messages(prompt)
#     optional_params = {
#         "response_format": {"type": "json_object"}
#     }
#
#     response = ChatOpenAI(model='gpt-4o-mini', max_retries=1, model_kwargs=optional_params).invoke(
#         lc_messages).content
#     outline = json.loads(response)
#
#     # Add the outline to the state
#     state["outline"] = outline
#     state["logs"][-1]["done"] = True
#     await copilotkit_emit_state(config, state)
#
#     tool_msg = f"Generated the following new outline:\n{json.dumps(outline)}"
#
#     return state, tool_msg
#
#
# sample_outline = """
# {
#     "Introduction": {
#         paragraph_1: "The research explores the benefits and challenges of AI in the workplace.",
#         paragraph_2: "The sources used in the research include articles from reputable sources such as Forbes and Harvard Business Review.",
#         paragraph_3: "The main points of the research include the benefits of AI in improving productivity and efficiency, the challenges of AI in replacing human jobs, and the ethical implications of AI in the workplace."
#     },
#     "Body": {
#         paragraph_1: "The benefits of AI in the workplace are numerous. AI can automate repetitive tasks, analyze large amounts of data quickly, and improve decision-making processes.",
#         paragraph_2: "However, AI also poses challenges in the workplace. AI can replace human jobs, leading to unemployment and economic instability.",
#         paragraph_3: "The ethical implications of AI in the workplace are complex. AI raises questions about privacy, security, and bias in decision-making processes."
#         paragraph_4: "The sources used in the research provide valuable insights into the benefits and challenges of AI in the workplace. Forbes discusses the impact of AI on the future of work, while Harvard Business Review explores the ethical implications of AI in decision-making."
#         paragraph_5: "Overall, the research highlights the importance of understanding the benefits and challenges of AI in the workplace to make informed decisions about its implementation."
#     },
#     "Conclusion": {
#         paragraph_1: "In conclusion, the research provides a comprehensive overview of the benefits and challenges of AI in the workplace.",
#         paragraph_2: "The research recommends further investigation into the ethical implications of AI in decision-making processes and the impact of AI on the future of work.",
#         paragraph_3: "The research concludes with a call to action to explore the opportunities and risks of AI in the workplace to create a more inclusive and equitable future."
#     }
# """
