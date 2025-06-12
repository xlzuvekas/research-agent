# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is ANA (Agent Native Application), a research canvas app that combines Human-in-the-Loop capabilities with Tavily's real-time search and CopilotKit's agentic interface. It's powered by LangGraph and consists of two main components:
- **Agent**: A LangGraph-based research agent that handles search, content extraction, outline writing, and section generation
- **Frontend**: A Next.js application with CopilotKit integration for interactive research

## Common Commands

### Agent Development
```bash
cd agent
langgraph up                    # Start the agent (runs on http://localhost:8123)
langgraph build                 # Build the agent
```

### Frontend Development
```bash
cd frontend
pnpm install                    # Install dependencies
pnpm run dev                    # Start frontend in local mode
pnpm run remote-lgc-dev         # Start frontend in remote mode
pnpm run build                  # Build for production
pnpm run lint                   # Run linter
```

### Full Setup Flow
```bash
# Terminal 1: Start the agent
cd agent
langgraph up

# Terminal 2: Create tunnel to agent
npx copilotkit@latest dev --port 8123

# Terminal 3: Start frontend
cd frontend
pnpm run dev
```

## Architecture Overview

### Agent Architecture (LangGraph)
The agent uses a state graph pattern with the following key components:

1. **Graph Structure** (`agent/graph.py`):
   - Entry point: `call_model_node` - Invokes the LLM with tools
   - Tool execution: `tool_node` - Executes tools and manages state
   - Feedback handling: `process_feedback_node` - Handles user feedback via interrupts
   - Tools are bound to the model with `parallel_tool_calls=False`

2. **State Management** (`agent/state.py`):
   - Extends CopilotKit's state management
   - Maintains messages, outline, sections, sources, and proposal state

3. **Tools** (`agent/tools/`):
   - `tavily_search.py`: Web search using Tavily API
   - `tavily_extract.py`: Content extraction from URLs
   - `outline_writer.py`: Creates research outline proposals
   - `section_writer.py`: Writes individual sections with markdown formatting
   - `review_proposal`: Special tool that triggers user feedback flow

4. **Message Handling**:
   - Messages are temporarily converted to a list of dicts when passed to tools
   - Preserves full conversation history and message order
   - Tools access messages via `state['messages']` as a list of `{type: str, content: str}` dicts

### Frontend Architecture (Next.js + CopilotKit)
1. **Research Context** (`frontend/src/components/research-context.tsx`):
   - Manages global research state with `useCoAgent` hook
   - Syncs with localStorage for persistence
   - Provides state and actions to all components

2. **Key Components**:
   - `DocumentsView`: Main document viewer with section editing
   - `DocumentViewer`: Renders markdown sections with edit capabilities
   - `ResearchCanvas`: Main layout component
   - Integration with CopilotKit for agent communication

3. **State Flow**:
   - Agent state updates stream through CopilotKit
   - Frontend receives state updates via `copilotkit_emit_state`
   - User interactions trigger agent actions through CopilotKit

## Key Technical Details

### Models Used
- **FACTUAL_LLM**: GPT-4o-mini (temperature=0.0) - Main agent reasoning and section writing
- **BASE_LLM**: GPT-4 (temperature=0.2) - Configured but not actively used

### Environment Variables
Agent `.env`:
- `OPENAI_API_KEY`
- `TAVILY_API_KEY`
- `LANGSMITH_API_KEY`

Frontend `.env`:
- `OPENAI_API_KEY`
- `LANGSMITH_API_KEY`
- `NEXT_PUBLIC_COPILOT_CLOUD_API_KEY`
- `LOCAL_DEPLOYMENT_URL` (http://localhost:8123)

### Known Issues and Fixes
1. **Message handling bug**: The original code lost message history by converting to dict. Fixed by preserving messages as a list of dicts.
2. **React render loop**: Fixed by using functional state updates in `DocumentsView.handleSectionEdit`