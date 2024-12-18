import { Section } from "@/lib/types";
import React, { useEffect, useState } from "react";
import DocumentOptions from "@/components/document-options";
import { DocumentsScrollbar } from "@/components/documents-scrollbar";
import { DocumentViewer } from "@/components/document-viewer";
import { useResearch } from "@/components/research-context";
import { DocumentOptionsState } from "@/types/document-options-state";

interface DocumentsViewProps {
    sections: Section[];
    selectedSection?: Section;
    onSelectSection: (sectionId: string) => void;
    streamingSection?: Section | null;
}

export function DocumentsView({ sections, selectedSection, onSelectSection, streamingSection }: DocumentsViewProps) {
    const { state, setResearchState } = useResearch()
    const [viewableSection, setViewableSection] = useState(selectedSection)
    const [documentOptionsState, setDocumentOptionsState] = useState<DocumentOptionsState>({ mode: 'full', editMode: false, zoom: 100 })

    const handleSectionEdit = (editedSection: Section) => {
        setResearchState({
            ...state,
            sections: state.sections.map(section => section.id === editedSection.id ? editedSection : section)
        })
    }

    useEffect(() => {
        if (selectedSection) {
            setViewableSection(selectedSection)
            return;
        }

        if (streamingSection?.id && streamingSection.id !== (selectedSection as Section | undefined)?.id) {
            setViewableSection(streamingSection as Section)
        }
    }, [streamingSection, selectedSection]);

    const emptyState = (
        <DocumentViewer
            editMode={false}
            onSectionEdit={handleSectionEdit}
            zoomLevel={documentOptionsState.zoom}
            placeholder={sections.length ? "Pick a section from the sections tab to the right, to view and edit" : 'Start by asking a research question in the chat'}
        />
    )

    return (
        <div className="flex flex-col flex-1 overflow-y-hidden h-full p-4">
            <DocumentOptions
                onChange={change => setDocumentOptionsState(prev => ({ ...prev, ...change }))}
                state={documentOptionsState}
                canEdit={!!viewableSection || documentOptionsState.mode === 'full'}
            />

            {documentOptionsState.mode === 'section' ? (
                <div className="flex flex-1 overflow-hidden">
                    {/* Selected section view on the left */}
                    {viewableSection ? (
                        <DocumentViewer
                            section={viewableSection}
                            zoomLevel={documentOptionsState.zoom}
                            onSelect={onSelectSection}
                            onSectionEdit={handleSectionEdit}
                            editMode={documentOptionsState.editMode}
                        />
                    ) : emptyState}

                    {/* Scrollable thumbnails on the right */}
                    <DocumentsScrollbar
                        sections={sections}
                        selectedSectionId={selectedSection?.id}
                        onSelectSection={onSelectSection}
                    />
                </div>
            ) : (
                sections.length ? (
                    <div className="overflow-auto px-2 space-y-4">
                        {sections?.map(section => (
                                <DocumentViewer
                                    key={section.id}
                                    section={section}
                                    zoomLevel={100}
                                    highlight={false}
                                    compact={false}
                                    onSelect={() => {
                                    }}
                                    onSectionEdit={handleSectionEdit}
                                    editMode={documentOptionsState.editMode}
                                />
                            ))}
                    </div>
                ) : emptyState
            )}
        </div>
    )
}
