import type { Metadata } from "next";
import "@copilotkit/react-ui/styles.css";
import "./globals.css";
import { CopilotKit } from "@copilotkit/react-core";
import { Inter } from "next/font/google";
import { ResearchProvider } from "@/components/research-context";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter'
})

export const metadata: Metadata = {
    title: "Simba Research Agent",
    description: "AI-powered research assistant for comprehensive academic and professional research",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="h-full">
            <body className={`${inter.variable} ${inter.className} antialiased h-full`}>
                <CopilotKit
                    publicApiKey={process.env.NEXT_PUBLIC_COPILOT_CLOUD_API_KEY} // if using copilot cloud
                    runtimeUrl={process.env.NEXT_PUBLIC_COPILOT_CLOUD_API_KEY ?
                        // copilot cloud
                        "https://api.cloud.copilotkit.ai/copilotkit/v1" :
                        // local
                        "/api/copilotkit"}
                    showDevConsole={false}
                    agent="agent"
                >
                    <TooltipProvider>
                        <ResearchProvider>
                            {children}
                        </ResearchProvider>
                    </TooltipProvider>
                </CopilotKit>
            </body>
        </html>
    );
}
