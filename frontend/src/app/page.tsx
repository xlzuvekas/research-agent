'use client'

import Toolbar from "@/components/toolbar";
import DocumentViewer from "@/components/document-viewer";
import Chat from "@/components/chat";
import { useEffect, useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import { useCoAgent, useCoAgentStateRender } from "@copilotkit/react-core";
import { ResearchState } from "@/lib/types";

const CHAT_MIN_WIDTH = 30;
const CHAT_MAX_WIDTH = 50;

const initialState: ResearchState = {
    title: "",
    outline: {},
    intro: "",
    sections: [],
    conclusion: "",
    footnotes: "",
    sources: {},
    cited_sources: {},
    tool: "",
    messages: []
};

export default function HomePage() {
    const [chatWidth, setChatWidth] = useState(50) // Initial chat width in percentage
    const dividerRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const { state, setState } = useCoAgent<ResearchState>({
        name: 'agent',
        initialState,
    });

    console.log(state)

    useCoAgentStateRender({
        name: 'agent',
        render: ({ state, nodeName, status }) => {
            console.log({
                state,
                nodeName,
                status,
            })

            return status === 'inProgress' ? 'Loading...' : (
                <div>
                    Here's some info to help you debug:
                    <pre>state: {JSON.stringify(state, null, 2)}</pre>
                    <pre>nodeName: {nodeName}</pre>
                    <pre>status: {status}</pre>
                </div>
            );
        },
    });

    useEffect(() => {
        const divider = dividerRef.current
        const container = containerRef.current
        let isDragging = false

        const startDragging = () => {
            isDragging = true
            document.addEventListener('mousemove', onDrag)
            document.addEventListener('mouseup', stopDragging)
        }

        const onDrag = (e: MouseEvent) => {
            if (!isDragging) return
            const containerRect = container!.getBoundingClientRect()
            const newChatWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
            setChatWidth(Math.max(CHAT_MIN_WIDTH, Math.min(CHAT_MAX_WIDTH, newChatWidth))) // Limit chat width between 20% and 80%
        }

        const stopDragging = () => {
            isDragging = false
            document.removeEventListener('mousemove', onDrag)
            document.removeEventListener('mouseup', stopDragging)
        }

        divider?.addEventListener('mousedown', startDragging)

        return () => {
            divider?.removeEventListener('mousedown', startDragging)
            document.removeEventListener('mousemove', onDrag)
            document.removeEventListener('mouseup', stopDragging)
        }
    }, [])

    return (
        <div
            className="h-screen bg-[#FAF9F6] text-[#3D2B1F] font-lato">
            <div className="grid h-full" style={{ gridTemplateColumns: 'auto 1fr' }}>
                {/* Toolbar */}
                <Toolbar/>

                {/* Main Chat Window */}
                <div className="flex h-full" ref={containerRef}>
                    <div style={{width: `${chatWidth}%`}}>
                        <Chat/>
                    </div>

                    <div
                        ref={dividerRef}
                        className="w-1 bg-[var(--border)] hover:bg-[var(--primary)] cursor-col-resize flex items-center justify-center"
                    >
                        <GripVertical className="h-6 w-6 text-[var(--primary)]"/>
                    </div>

                    {/* Document Viewer */}
                    <DocumentViewer />
                </div>
            </div>
        </div>
    );
}
