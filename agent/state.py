from langchain_core.messages import AnyMessage
from langgraph.graph import add_messages
from typing import TypedDict, Dict, Union, List, Annotated
from langgraph.graph import MessagesState
from copilotkit import CopilotKitState # extends MessagesState

class ResearchState(CopilotKitState):
    title: str
    proposal: Dict[str, Union[str, bool, Dict[str, Union[str, bool]]]]  # Stores proposed structure before user approval
    # structure: Dict[str, List[str]]  # Finalized structure chosen by the user
    outline: dict
    # intro: str
    sections: List[dict]  # list of dicts with 'title','content',and 'idx'
    # conclusion: str
    footnotes: str
    sources: Dict[str, Dict[str, Union[str, float]]]
    # cited_sources: Dict[str, List[str]]  # sources used and a list of quotes used to support the answer
    tool: str
    logs: List[dict]  # list of dicts logs to be sent to frontend with 'message', 'status'
    # messages: Annotated[list[AnyMessage], add_messages]


