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
    const [currentPage, setCurrentPage] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(100);
    const [viewableSection, setViewableSection] = useState(selectedSection)
    const sectionsPerPage = 2;

    const totalPages = Math.ceil((sections.length || 0) / sectionsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

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

            <div className="flex items-center justify-between mt-4 px-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 0 || totalPages <= 1}
                        className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages - 1 || totalPages <= 1}
                        className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Page {currentPage + 1} of {totalPages}</span>
                    <span>•</span>
                    <span>{Math.min((currentPage + 1) * sectionsPerPage, sections.length || 0)} of {sections.length || 0} sections</span>
                    <span>•</span>
                    <span>{zoomLevel}%</span>
                </div>
            </div>
        </div>
    )
}
