from langchain_core.messages import AnyMessage
from langgraph.graph import add_messages
from typing import TypedDict, Dict, Union, List, Annotated
from langgraph.graph import MessagesState

# class Log(TypedDict):
#     """
#     Represents a log of an action performed by the agent.
#     """
#     message: str
#     done: bool

class ResearchState(MessagesState):
    title: str
    outline: dict
    intro: str
    sections: List[dict]  # list of dicts with 'title','content',and 'idx'
    conclusion: str
    footnotes: str
    sources: Dict[str, Dict[str, Union[str, float]]]
    cited_sources: Dict[str, List[str]]  # sources used and a list of quotes used to support the answer
    tool: str
    logs: List[dict]
    # messages: Annotated[list[AnyMessage], add_messages]


