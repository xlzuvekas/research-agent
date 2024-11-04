import json5 as json
from datetime import datetime
from typing import Optional, Dict

from langchain_community.adapters.openai import convert_openai_messages
from langchain_core.tools import tool
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI


class OutlineWriterInput(BaseModel):
    research_query: str = Field(description="research query")
    state: Optional[Dict] = Field(description="state of the search")


@tool("outline_writer", args_schema=OutlineWriterInput, return_direct=True)
async def outline_writer(research_query, state):
    """writes a research outline based on the research query"""

    # Get sources from state
    sources = state.get("sources", {})
    sources_summary = ""
    for url, source in sources.items():
        sources_summary += f"\n title: {source['title']}"
        sources_summary += f"\n url:  {source['url']}"
        sources_summary += f"\n content:  {source['content']}"

    prompt = [{
        "role": "system",
        "content": "You are an AI assistant that helps users write research outlines. "
                     "You have been given a research query and a list of sources. "
                     "Your task is to write a research outline based on the query and the sources. "
    }, {
        "role": "user",
        "content": f"Today's date is {datetime.now().strftime('%d/%m/%Y')}\n."
                   f"Query or Topic: {research_query}\n"
                   f"{sources_summary}\n"
                   f"Your task is to write a critically acclaimed research outline on the "
                   f"topic above. The outline should include an introduction, body, and conclusion. "
                   f"Please return nothing but a JSON in the following format:\n"
                   f"{sample_outline}\n "
                    f"Your Outline:"
    }]

    lc_messages = convert_openai_messages(prompt)
    optional_params = {
        "response_format": {"type": "json_object"}
    }

    response = ChatOpenAI(model='gpt-4o-mini', max_retries=1, model_kwargs=optional_params).invoke(
        lc_messages).content
    outline = json.loads(response)

    # Add the outline to the state
    state["outline"] = outline

    tool_msg = f"Generated the following new outline:\n{json.dumps(outline)}"

    return state, tool_msg



sample_outline = """
{
    "Introduction": {
        paragraph_1: "The research explores the benefits and challenges of AI in the workplace.",
        paragraph_2: "The sources used in the research include articles from reputable sources such as Forbes and Harvard Business Review.",
        paragraph_3: "The main points of the research include the benefits of AI in improving productivity and efficiency, the challenges of AI in replacing human jobs, and the ethical implications of AI in the workplace."
    },
    "Body": {
        paragraph_1: "The benefits of AI in the workplace are numerous. AI can automate repetitive tasks, analyze large amounts of data quickly, and improve decision-making processes.",
        paragraph_2: "However, AI also poses challenges in the workplace. AI can replace human jobs, leading to unemployment and economic instability.",
        paragraph_3: "The ethical implications of AI in the workplace are complex. AI raises questions about privacy, security, and bias in decision-making processes."
        paragraph_4: "The sources used in the research provide valuable insights into the benefits and challenges of AI in the workplace. Forbes discusses the impact of AI on the future of work, while Harvard Business Review explores the ethical implications of AI in decision-making."
        paragraph_5: "Overall, the research highlights the importance of understanding the benefits and challenges of AI in the workplace to make informed decisions about its implementation."
    },
    "Conclusion": {
        paragraph_1: "In conclusion, the research provides a comprehensive overview of the benefits and challenges of AI in the workplace.",
        paragraph_2: "The research recommends further investigation into the ethical implications of AI in decision-making processes and the impact of AI on the future of work.",
        paragraph_3: "The research concludes with a call to action to explore the opportunities and risks of AI in the workplace to create a more inclusive and equitable future."
    }
"""