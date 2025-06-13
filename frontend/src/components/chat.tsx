'use client'

import { CopilotChat } from "@copilotkit/react-ui";
import { INITIAL_MESSAGE, MAIN_CHAT_INSTRUCTIONS, MAIN_CHAT_TITLE } from "@/lib/consts";
import { MessageSquare } from "lucide-react";
// TODO: fix
// @ts-expect-error -- ignore
import { CopilotChatProps } from "@copilotkit/react-ui/dist/components/chat/Chat";

export default function Chat(props: CopilotChatProps) {
  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Custom Chat Header */}
      <div className="border-b border-border px-4 py-3 bg-muted/30">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="font-medium text-sm">{MAIN_CHAT_TITLE}</h2>
        </div>
      </div>
      
      {/* CopilotChat with custom styling */}
      <div className="flex-1 overflow-hidden">
        <CopilotChat
            instructions={MAIN_CHAT_INSTRUCTIONS}
            labels={{
                title: MAIN_CHAT_TITLE,
                initial: INITIAL_MESSAGE,
            }}
            className="h-full w-full simba-chat"
            {...props}
        />
      </div>
    </div>
  )
}
