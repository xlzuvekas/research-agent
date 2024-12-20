# open-research-ANA 🔍

This demo showcases ANA (Agent Native Application), a research canvas app that combines Human-in-the-Loop capabilities with [Tavily's](https://tavily.com/) real-time search and CopilotKit's agentic interface. 

Powered by [LangGraph](https://www.langchain.com/langgraph), it simplifies complex research tasks, making them more interactive and efficient.

<p align="left">
   <a href="https://docs.copilotkit.ai/coagents" rel="dofollow">
      <strong>Explore the CopilotKit docs »</strong>
   </a>
</p>

![tavily-demo](https://github.com/user-attachments/assets/70c7db1b-de5b-4fb2-b447-09a3a1b78d73)

## Quick Start 🚀

### 1. Prerequisites
This projects uses the following tools:

- [pnpm](https://pnpm.io/installation)
- [Docker](https://docs.docker.com/get-docker/)
- [Langgraph CLI](https://langchain-ai.github.io/langgraph/cloud/reference/cli/)

### 2. API Keys Needed
Running locally, you'll need the following API keys:

- [OpenAI](https://platform.openai.com/api-keys)
- [Tavily](https://tavily.com/#pricing)
- [LangSmith](https://docs.smith.langchain.com/administration/how_to_guides/organization_management/create_account_api_key)
- [CopilotKit](https://cloud.copilotkit.ai)

### 3. Start the Agent
There are two main components to this project: the agent and the frontend. First, we'll start the agent. If you are
using Copilot Cloud and LangGraph Platform, you can skip this step.

```bash
cd agent

# Create and populate .env
cat << EOF > .env
OPENAI_API_KEY=your_key
TAVILY_API_KEY=your_key
LANGSMITH_API_KEY=your_key
EOF

# Start the agent
langgraph up

# Note the API URL from the output (e.g., http://localhost:8000)
```

### 4. Start the Frontend
Next, we'll start the frontend.

```bash
cd frontend
pnpm install

# Create and populate .env
cat << EOF > .env
LOCAL_DEPLOYMENT_URL=http://localhost:8000  # URL from langgraph up
OPENAI_API_KEY=your_key
LANGSMITH_API_KEY=your_key
NEXT_PUBLIC_COPILOT_CLOUD_API_KEY=your_key
EOF

# Start the app
pnpm run dev
```

## Using with Copilot Cloud ☁️
You can use either a local agent or a LangGraph Platform deployment with Copilot Cloud. Copilot Cloud is a 
free to start hosted runtime for CopilotKit that allows you easily integrate your LangGraph Platform endpoints
into your CopilotKit agent.

### Option 1: Local Agent
1. Create a tunnel to your local agent:
```bash
npx @copilotkit/cli tunnel 8000
```

### Option 2: LangGraph Platform
1. Deploy your agent using [LangGraph Platform](https://langchain-ai.github.io/langgraph/cloud/deployment/cloud/)
2. Use the deployment URL provided

### Register the Endpoint
For either option:
1. Go to [Copilot Cloud](https://cloud.copilotkit.ai)
2. Add a new Remote Endpoint
3. Enter your tunnel URL or LangGraph Platform deployment URL
4. Provide your `LANGSMITH_API_KEY`
5. Test and Save

## Deployment Options 🛠️

### Local Development (Default)
```bash
pnpm run dev
```

### Remote Agent
```bash
# Deploy agent using LangGraph Platform
# Set DEPLOYMENT_URL in frontend/.env
pnpm run remote-lgc-dev
```

## Documentation 📚
- [CopilotKit Docs](https://docs.copilotkit.ai/coagents)
- [LangGraph Platform Docs](https://langchain-ai.github.io/langgraph/cloud/deployment/cloud/)
