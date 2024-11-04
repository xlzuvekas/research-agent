import asyncio
from datetime import datetime
from dotenv import load_dotenv
import json
from langchain_core.tools import tool
from pydantic import BaseModel, Field
from tavily import AsyncTavilyClient
from typing import TypedDict, List, Annotated, Literal, Dict, Union, Optional

load_dotenv('.env')
tavily_client = AsyncTavilyClient()


# Add Tavily's arguments to enhance the web search tool's capabilities
class TavilyQuery(BaseModel):
    query: str = Field(description="web search query")
    topic: str = Field(
        description="type of search, should be 'general' or 'news'. Choose 'news' ONLY when the company you searching is publicly traded and is likely to be featured on popular news")
    days: int = Field(description="number of days back to run 'news' search")
    domains: Optional[List[str]] = Field(default=None,
                                         description="list of domains to include in the research. Useful when trying to gather information from trusted and relevant domains")


# Define the args_schema for the tavily_search tool using a multi-query approach, enabling more precise queries for Tavily.
class TavilySearchInput(BaseModel):
    sub_queries: List[TavilyQuery] = Field(description="set of sub-queries that can be answered in isolation")
    state: Optional[Dict] = Field(description="state, will be provided later")


@tool("tavily_search", args_schema=TavilySearchInput, return_direct=True)
async def tavily_search(sub_queries: List[TavilyQuery], state):
    """Perform searches for each sub-query using the Tavily search tool concurrently."""

    # Define a coroutine function to perform a single search with error handling
    async def perform_search(itm):
        try:
            # Add date to the query as we need the most recent results
            query_with_date = f"{itm.query} {datetime.now().strftime('%m-%Y')}"
            # Attempt to perform the search, hardcoding days to 7 (days will be used only when topic is news)
            response = await tavily_client.search(query=itm.query, topic=itm.topic, days=itm.days, max_results=10)
            return response['results']
        except Exception as e:
            # Handle any exceptions, log them, and return an empty list
            print(f"Error occurred during search for query '{itm.query}': {str(e)}")
            return []

    # Run all the search tasks in parallel
    search_tasks = [perform_search(itm) for itm in sub_queries]
    search_responses = await asyncio.gather(*search_tasks)

    # Combine the results from all the responses
    search_results = []
    for response in search_responses:
        search_results.extend(response)

    sources = state.get('sources', {})
    tool_msg = "In search, found the following new documents:\n"

    for source in search_results:
        # Make sure that this document was not retrieved before
        if not sources or source['url'] not in sources:
            sources[source['url']] = source
            tool_msg += json.dumps(source)
    state['sources'] = sources
    return state, tool_msg
