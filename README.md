# MatCopVili

## Prerequisites

Before you begin, ensure the following tools are installed on your system:

- [pnpm](https://pnpm.io/installation)
- [Langgraph CLI](https://langchain-ai.github.io/langgraph/cloud/reference/cli/) (requires Docker to be installed and running)

---

## Running the Frontend

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Start the application**:

   - To use the **local version** of the agent:
     ```bash
     pnpm run dev
     ```

   - To use the **remote version** of the agent:
     ```bash
     pnpm run remote-lgc-dev
     ```

---

## Running the Agent Locally

1. **Navigate to the agent directory**:
   ```bash
   cd agent
   ```

2. **Start the agent**:
   ```bash
   langgraph up
   ```

