import React from "react";
import { DocumentViewer } from "@/components/document-viewer";
import { Section } from "@/lib/types";

interface DocumentsScrollbarProps {
    sections: Section[];
    onSelectSection: (sectionId: string) => void;
}

export function DocumentsScrollbar({
    sections,
    onSelectSection,
}: DocumentsScrollbarProps) {
    return (
        <div className="px-4 overflow-y-auto space-y-2 flex flex-col overflow-x-hidden">
            {sections?.map(section => (
                <DocumentViewer
                    key={section.id}
                    section={section}
                    zoomLevel={30}
                    compact
                    onSelect={onSelectSection}
                />
            ))}
        </div>
    )
}