import json5 as json
from datetime import datetime
from typing import Optional, Dict, cast
from langchain_core.messages import AIMessage, ToolMessage
from langchain_core.runnables import RunnableConfig
from langchain_community.adapters.openai import convert_openai_messages
from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
import random
import string
from copilotkit.langchain import copilotkit_customize_config, copilotkit_emit_state

@tool
def WriteSection(title: str, content: str, section_number: int, footer: str = ""): # pylint: disable=invalid-name,unused-argument
    """Write a section with content and footer containing references"""

def generate_random_id(length=6):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

class SectionWriterInput(BaseModel):
    research_query: str = Field(description="The research query or topic for the section.")
    section_title: str = Field(description="The title of the specific section to write.")
    idx: int = Field(description="An index representing the order of this section (starting at 0")
    state: Optional[Dict] = Field(description="State of the research")


@tool("section_writer", args_schema=SectionWriterInput, return_direct=True)
async def section_writer(research_query, section_title, idx, state):
    """Writes a specific section of a research report based on the query, section title, and provided sources."""

    config = RunnableConfig()
    # Log search queries
    state["logs"] = state.get("logs", [])
    state["logs"].append({
        "message": f"Writing the {section_title} section...",
        "done": False
    })
    await copilotkit_emit_state(config, state)

    section_id = generate_random_id()
    section = {
        "title": section_title,
        "content": "",
        "footer": "",
        "idx": idx,
        "id": section_id,
    }

    stream_states = {
        "content": {
            "state_key": f"section_stream.content.{idx}.{section_id}.{section_title}",
            "tool": "WriteSection",
            "tool_argument": "content"
        },
        "footer": {
            "state_key": f"section_stream.footer.{idx}.{section_id}.{section_title}",
            "tool": "WriteSection",
            "tool_argument": "footer"
        }
    }

    modified_config = copilotkit_customize_config(
        config,
        emit_intermediate_state=list(stream_states.values())
    )

    sources = state.get("sources").values()

    # Define the system and user prompts
    prompt = [{
        "role": "system",
        "content": (
            "You are an AI assistant that writes specific sections of research reports in markdown format. "
            "You must use the write_section tool to write the section content. "
            "Use all appropriate markdown features for academic writing, including but not limited to:\n\n"
            "- Headers (# through ######)\n"
            "- Text formatting (*italic*, **bold**, ***bold italic***, ~~strikethrough~~)\n"
            "- Lists (ordered and unordered, with proper nesting)\n"
            "- Block quotes and nested blockquotes\n"
            "- Code blocks for technical content\n"
            "- Tables for structured data\n"
            "- Links [text](url)\n"
            "- Images ![alt text](url)\n"
            "- Footnote/footer/references [^1] with proper markdown formatting\n"
            "- Mathematical equations using LaTeX syntax ($inline$ and $$block$$)\n\n"
            "Format the content professionally with appropriate spacing and structure for academic papers:\n"
            "- Add blank lines before and after headers\n"
            "- Add blank lines before and after lists\n"
            "- Add blank lines before and after blockquotes\n"
            "- Add blank lines before and after code blocks\n"
            "- Add blank lines before and after tables\n"
            "- Add blank lines before and after math blocks\n\n"
            "IMPORTANT RULES FOR REFERENCES:\n\n"
            "1. Footnotes are only required when the section content references external sources or needs citations\n"
            "2. If footnotes exist, they must be section-specific and start from [^1] in each section\n" 
            "3. The same source may have different reference numbers in different sections\n"
            "4. All references must be placed in the footer field, not in the content\n"
            "5. Do not add separation lines between content and references\n"
            "6. Format references as a list, with each reference on a new line starting with [^n]:\n\n"
            "   [^1]: First reference\n"
            "   [^2]: Second reference\n"
            "   etc."
        )
    }, {
        "role": "user",
        "content": (
            f"Today's date is {datetime.now().strftime('%d/%m/%Y')}.\n\n"
            f"Research Query: {research_query}\n\n" 
            f"Section Title: {section_title}\n\n"
            f"Section Number: {idx}\n\n"
            f"Sources:\n{sources}\n\n"
            f"Write a section using the write_section tool. The section should be detailed and well-structured in markdown. "
            f"Use appropriate markdown formatting to create a professional academic document. "
            f"Only use footnotes when citing sources or referencing external material. "
            f"If footnotes are used, they must start from [^1] in this section. "
            f"References must be defined in the footer field, not in the content. Each reference should link to a source URL."
        )
    }]

    # Convert prompts for OpenAI API
    lc_messages = convert_openai_messages(prompt)

    # Invoke OpenAI's model with tool
    model = ChatOpenAI(model="gpt-4o-mini", max_retries=1)
    response = model.bind_tools([WriteSection]).invoke(lc_messages, modified_config)

    state["logs"][-1]["done"] = True
    await copilotkit_emit_state(config, state)

    ai_message = cast(AIMessage, response)
    if ai_message.tool_calls:
        if ai_message.tool_calls[0]["name"] == "WriteSection":
            section["title"] = ai_message.tool_calls[0]["args"].get("title", "")
            section["content"] = ai_message.tool_calls[0]["args"].get("content", "")
            section["footer"] = ai_message.tool_calls[0]["args"].get("footer", "")

    state["sections"].append(section)

    # Process each stream state
    for stream_type, stream_info in stream_states.items():
        if stream_info["state_key"] in state:
            state[stream_info["state_key"]] = None
    await copilotkit_emit_state(config, state)

    tool_msg = f"Wrote the {section_title} Section, idx: {idx}"

    return state, tool_msg


sample_section = """
{
    "title": "Introduction to AI in the Workplace",
    "content": "## Introduction to AI in the Workplace\n\nArtificial Intelligence (AI) has emerged as a transformative force in modern workplaces[^1]. This section explores the fundamental concepts of AI and its wide-ranging applications in professional environments.\n\n### Current State of AI Technology\n\nThe evolution of AI capabilities has accelerated dramatically in recent years, characterized by:\n\n* **Machine Learning Systems**\n  * Deep Learning Networks\n  * Natural Language Processing\n  * Computer Vision\n\n* **Automation Platforms**\n  * Robotic Process Automation (RPA)\n  * Intelligent Workflow Systems\n\n### Impact on Business Operations\n\nThe integration of AI has fundamentally altered organizational operations in several key areas:\n\n1. **Productivity Enhancement**\n   * Task automation reduces manual workload[^2]\n   * Smart scheduling optimizes resource allocation\n\n2. **Decision Support**\n   * Data-driven insights guide strategic planning\n   * Predictive analytics enhance forecasting\n\n> \"AI is not just a technological upgrade; it represents a paradigm shift in how we approach work itself.\" - Dr. Sarah Chen, AI Ethics Board\n\n#### Mathematical Representation\n\nThe efficiency gain ($E$) can be expressed as:\n\n$$E = \\sum_{i=1}^{n} (T_m - T_a)_i \\cdot C_i$$\n\nWhere:\n* $T_m$ = Manual processing time\n* $T_a$ = AI-assisted processing time\n* $C_i$ = Cost factor for task $i$",
    "footer": "[^1]: Smith, J. & Kumar, R. (2023). *AI in Modern Business: A Comprehensive Analysis*. Journal of Business Technology, 15(2), 45-67. https://doi.org/10.1234/jbt.2023.15.2.45\n\n[^2]: Johnson, A., Zhang, L., & Patel, K. (2023). *Workplace Automation Trends: 2023 Insights*. Tech Review Quarterly, 8(4), 112-128. https://doi.org/10.5678/trq.2023.8.4.112"
}
"""
