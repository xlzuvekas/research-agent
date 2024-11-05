import {
    CopilotRuntime,
    OpenAIAdapter,
    copilotRuntimeNextJSAppRouterEndpoint,
    langGraphCloudEndpoint,
} from '@copilotkit/runtime';
import OpenAI from 'openai';
import { NextRequest } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const serviceAdapter = new OpenAIAdapter({ openai });
const runtime = new CopilotRuntime({
    remoteEndpoints: [
        langGraphCloudEndpoint({
            deploymentUrl: 'https://matcopvili-006c9a30efb35afd99b9676057b7accd.default.us.langgraph.app',
            langsmithApiKey: process.env.LANGSMITH_API_KEY!,
            agents: [{
                name: 'agent',
                description: 'Research assistant',
            }],
        })
    ]
});

export const POST = async (req: NextRequest) => {
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
        runtime,
        serviceAdapter,
        endpoint: '/api/copilotkit',
    });

    return handleRequest(req);
};