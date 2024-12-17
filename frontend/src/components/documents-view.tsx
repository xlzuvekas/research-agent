import { Section } from "@/lib/types";
import React, { useEffect, useState } from "react";
import DocumentOptions from "@/components/document-options";
import { DocumentsScrollbar } from "@/components/documents-scrollbar";
import { DocumentViewer } from "@/components/document-viewer";

interface DocumentsViewProps {
    sections: Section[];
    selectedSection?: Section;
    onSelectSection: (sectionId: string) => void;
    streamingSection?: Section | null;
}

export function DocumentsView({ sections, selectedSection, onSelectSection, streamingSection }: DocumentsViewProps) {
    const [zoomLevel, setZoomLevel] = useState(100);
    const [viewableSection, setViewableSection] = useState(selectedSection)

    const handleZoomChange = (value: string | number) => {
        setZoomLevel(Number(value));
    };

    useEffect(() => {
        if (selectedSection) {
            setViewableSection(selectedSection)
            return;
        }

        if (streamingSection?.id && streamingSection.id !== (selectedSection as Section | undefined)?.id) {
            setViewableSection(streamingSection as Section)
        }
    }, [streamingSection, selectedSection]);

    return (
        <div className="flex flex-col flex-1 overflow-y-hidden h-full p-4">
            <DocumentOptions onZoomChange={handleZoomChange}/>

            <div className="flex flex-1 overflow-hidden">
                {/* Selected section view on the left */}
                {viewableSection ? (
                    <DocumentViewer
                        section={viewableSection}
                        zoomLevel={zoomLevel}
                        onSelect={onSelectSection}
                    />
                ) : (
                    <DocumentViewer zoomLevel={zoomLevel} placeholder={sections.length ? "Pick a section from the sections tab to the right, to view and edit" : 'Start by asking a research question in the chat'} />
                )}

                {/* Scrollable thumbnails on the right */}
                <DocumentsScrollbar sections={sections} selectedSectionId={selectedSection?.id} onSelectSection={onSelectSection} />
            </div>
        </div>
    )
}
