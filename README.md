# open-research-ANA

This demo showcases ANA (Agent Native Application), a research canvas app that combines Human-in-the-Loop capabilities with [Tavily's](https://tavily.com/) real-time search and CopilotKit's agentic interface. 

Powered by [LangGraph](https://www.langchain.com/langgraph), it simplifies complex research tasks, making them more interactive and efficient.

<p align="left">
   <a href="https://docs.copilotkit.ai/coagents" rel="dofollow">
      <strong>Explore the CopilotKit docs »</strong>
   </a>
</p>

![tavily-demo](https://github.com/user-attachments/assets/70c7db1b-de5b-4fb2-b447-09a3a1b78d73)

## Prerequisites

### 📦 Necessary tools
Before you begin, ensure the following is installed:

- [pnpm](https://pnpm.io/installation)
- [Langgraph CLI](https://langchain-ai.github.io/langgraph/cloud/reference/cli/) (requires Docker to be installed and running)
- [Docker](https://docs.docker.com/get-docker/)

### 🔑 API keys

You'll need API keys for the following services:

- [OpenAI](https://platform.openai.com/api-keys)
- [Tavily](https://tavily.com/#pricing)
- [LangSmith](https://docs.smith.langchain.com/administration/how_to_guides/organization_management/create_account_api_key)

## 🚀 Getting Started

There are two main components to this demo: the `agent` and the `frontend`. Both need to be running to use the app.

### 💻 Running the Agent

You have two options for running the agent: locally or remotely.

- If you want to run the agent remotely, you can do so by following the instructions in the [LangGraph Platform docs](https://langchain-ai.github.io/langgraph/cloud/deployment/cloud/). Once deployed, you can use the copy the deployment URL and skip this section.

- If you want to run the agent locally, you can do so by following the instructions below.

#### Navigate to the agent directory

   ```bash
   cd agent
   ```

#### Set up your environment variables

Create a `.env` file:

   ```bash
   touch .env
   ```

Then add your API keys to the `.env` file:

   ```bash
   # .env
   OPENAI_API_KEY=your_openai_api_key_here
   TAVILY_API_KEY=your_tavily_api_key_here
   LANGSMITH_API_KEY=your_langsmith_api_key_here
   ```

#### Start the Agent

   ```bash
   langgraph up
   ```

#### Copy the agent URL

Once you run `langgraph up`, you'll see some output. Grab the `API` URL from the output. 

You'll need this URL to run the frontend.

   ```bash
   $ langgraph up
   # ...    
   - API: http://localhost:<port> # Copy this URL!
   # ...
   ```

### 👨‍💻 Running the UI

#### Install dependencies

First, navigate to the `frontend` directory and install the dependencies:

   ```bash
   cd frontend
   pnpm install
   ```

#### Set up your environment variables

Create a `.env` file:

   ```bash
   touch .env
   ```

Then add the following to the `.env` file:

   ```bash
   # .env
   LOCAL_DEPLOYMENT_URL=http://localhost:<port> # local only, URL from "langgraph up"
   DEPLOYMENT_URL=<deployment-url> # remote only, deploymentURL from LangGraph Platform
   OPENAI_API_KEY=your_openai_api_key_here
   LANGSMITH_API_KEY=your_langsmith_api_key_here
   ```

#### Start the application

To use the **local version** of the agent (default):

   ```bash
   pnpm run dev
   ```


To use the **remote version** of the agent, you can use the following command:

   ```bash
   pnpm run remote-lgc-dev
   ```

This assumes you have deployed the agent and it is is accessible 