import React from "react";
import { DocumentViewer } from "@/components/document-viewer";
import { Section } from "@/lib/types";
import { ChevronLeft } from "lucide-react";

interface DocumentsScrollbarProps {
    sections: Section[];
    onSelectSection: (sectionId: string) => void;
}

export function DocumentsScrollbar({
    sections,
    onSelectSection,
}: DocumentsScrollbarProps) {
    return (
        <div className="group fixed right-0 top-0 h-full transition-transform duration-300 transform translate-x-full hover:translate-x-0 z-10">
            <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 bg-[#FAF9F6] p-1 rounded-l-lg border border-black/10 cursor-pointer z-20 border-r-0">
                <ChevronLeft className="group-hover:rotate-180 transition-transform duration-500" />
            </div>
            <div className="p-4 overflow-y-auto space-y-2 flex flex-col overflow-x-hidden border border-black/10 bg-[#FAF9F6] h-full relative">
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
        </div>
    )
}
