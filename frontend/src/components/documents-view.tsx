import { Section } from "@/lib/types";
import React, { useMemo, useState } from "react";
import DocumentOptions from "@/components/document-options";
import { DocumentsScrollbar } from "@/components/documents-scrollbar";
import { DocumentViewer } from "@/components/document-viewer";

interface DocumentsViewProps {
    sections: Section[];
    selectedSection?: Section;
    onSelectSection: (sectionId: string) => void;
}

export function DocumentsView({ sections, selectedSection, onSelectSection }: DocumentsViewProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(100);
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

    const unselectedSections = useMemo(() => (
        sections.filter(section => section.id !== selectedSection?.id)
    ), [sections, selectedSection?.id]);

    return (
        <div className="flex flex-col flex-1 overflow-y-hidden h-full p-4">
            <DocumentOptions onZoomChange={handleZoomChange}/>

            <div className="flex flex-1">
                {/* Selected section view on the left */}
                {selectedSection?.id !== undefined ? (
                    <DocumentViewer
                        section={selectedSection}
                        zoomLevel={zoomLevel}
                        onSelect={onSelectSection}
                    />
                ) : (
                    <DocumentViewer zoomLevel={zoomLevel} placeholder="Click on one of the sections to the left to view and edit" />
                )}

                {/* Scrollable thumbnails on the right */}
                <DocumentsScrollbar sections={unselectedSections} onSelectSection={onSelectSection} />
            </div>

            <div className="flex items-center justify-between mt-4 px-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 0}
                        className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages - 1}
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
