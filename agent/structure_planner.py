from typing import TypedDict, List, Annotated, Literal, Dict, Union, Optional, cast
from langchain_community.adapters.openai import convert_openai_messages
from copilotkit.langchain import copilotkit_emit_state, copilotkit_customize_config, copilotkit_emit_message
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
from agent.state import ResearchState
from langchain_core.runnables import RunnableConfig
import json
from datetime import datetime
from langgraph.types import Command

# Define proposal structure keys at module level for single source of truth
PROPOSAL_FORMAT = {
    "sections": {
        "description": "The main sections that compose this research",  # This is a description on what are "sections"
        "section1": { # Key is the name of the item
            "title": "Title of the item",
            "description": "Description of section1",
            "approved": False,  # Defines if this goes in the final structure. Set only important parts to True by default
        }
    },
    "key_points": {
        "description": "...",  # This is a description on what are "key points"
        "point1": { # Key is the name of the item
            "title": "Title of the item",
            "description": "Description of key point1",
            "approved": False, # Defines if this goes in the final structure. Set only important parts to True by default
        }
    },
    "document_features": { # Features are technical, structural things for the research: should we have footnotes? Should we have citations?
        "description": "...",  # This is a description on what are "features". Things like "footnotes", "citations" etc.
        "feature1": { # Key is the name of the item
            "title": "Title of the item",
            "description": "Description of key point1",
            "approved": False, # Defines if this goes in the final structure. Set only important parts to True by default
        }
    },
}

PROPOSAL_KEYS = list(PROPOSAL_FORMAT.keys())

class StructurePlannerInput(BaseModel):
    research_query: str = Field(description="Research query to plan structure for")
    state: Optional[Dict] = Field(description="State of the research")

async def structure_planner(state: ResearchState, config: RunnableConfig) -> tuple[ResearchState, str]:
    """Plans and proposes a research structure for user approval"""

    research_query = state.get('messages', [])[0]
    config = copilotkit_customize_config(config, emit_messages=False)

    prompt = [{
        "role": "system",
        "content": "You are an AI assistant that helps users plan research structures. "
                  "Your task is to propose a logical structure for a research paper that "
                  "the user can review and modify. "
    }, {
        "role": "user",
        "content": f"Today's date is {datetime.now().strftime('%d/%m/%Y')}\n."
                  f"Research Topic: {research_query}\n"
                  f"Create a detailed proposal that includes main sections, subsections, "
                  f"and key points to investigate. Please return nothing but a JSON in the "
                  f"following format:\n"
                  f"{json.dumps(PROPOSAL_FORMAT, indent=2)}\n"
                  f"current proposal:"
                  f"{json.dumps(state.get('proposal', None))}\n"
                  f"Your Proposal:"
    }]

    lc_messages = convert_openai_messages(prompt)
    optional_params = {
        "response_format": {"type": "json_object"}
    }

    state["logs"] = state.get("logs", [])
    state["logs"].append({
        "message": "Thinking of some options",
        "done": False
    })
    await copilotkit_emit_state(config, state)

    state["logs"].append({
        "message": "Putting up a proposal",
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

        return Command(
            update={"logs": [], "proposal": proposal},
            goto="agent"
        )

    except (json.JSONDecodeError, ValueError) as e:
        # Create fallback structure using same keys
        fallback = {
            key: [] for key in PROPOSAL_KEYS
        }
        fallback.update({
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        })

        return Command(
            update={"logs": [], "proposal": fallback},
            goto="agent"
        )

# async def user_planning_response(state: ResearchState, config: RunnableConfig): # pylint: disable=unused-argument
#     """Resume after planning: Either re-iterate or move on to write research"""
#     ai_message = cast(AIMessage, state["messages"][-2])
#     tool_message = cast(ToolMessage, state["messages"][-1])
#     if tool_message.content == "APPROVE":
#         return Command(
#             goto='agent'
#         )
#     else:
#         return Command(
#             goto='planner'
#         )