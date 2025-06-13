import type { Section as TSection } from "@/lib/types";
import Footer from "@/components/document-footer";
import React, { useMemo } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DocumentEditor, DocumentEditorProps } from "@/components/documents-editor";
import { Clock, FileText } from "lucide-react";

interface DocumentViewerProps {
    section?: TSection;
    zoomLevel: number,
    compact?: boolean;
    highlight?: boolean;
    onSelect?: (sectionId: string) => void;
    placeholder?: string;
    onSectionEdit: DocumentEditorProps['onSectionEdit']
    editMode: boolean
}

export function DocumentViewer({
    section,
    zoomLevel,
    compact = false,
    highlight = false,
    onSelect,
    placeholder,
    onSectionEdit,
    editMode,
}: DocumentViewerProps) {
    const { title, content, id, footer } = section ?? {};
    
    // Calculate reading time (average 200 words per minute)
    const wordCount = content ? content.split(/\s+/).length : 0;
    const readingTime = Math.ceil(wordCount / 200);

    const scalingStyle = useMemo(() => {
        if (compact) {
            const scaleFactor = 0.1;
            return {
                width: `calc(210mm * ${scaleFactor})`,
                height: `calc(297mm * ${scaleFactor})`,
                fontSize: `calc(16px * ${scaleFactor})`,
                padding: '5px',
                '& *': {
                    fontSize: `calc(16px * ${scaleFactor})`,
                }
            }
        }
        return {
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top left'
        }
    }, [compact, zoomLevel])

        if (editMode) {
        return (
            <DocumentEditor
                section={section!}
                zoomLevel={zoomLevel}
                onSectionEdit={onSectionEdit}
            />
        )
    }

    return (
        <div
            key={id}
            className={`bg-card overflow-auto border border-border rounded-lg transition-all duration-200 ${
                compact ? `hover:shadow-md hover:border-primary cursor-pointer ${highlight ? 'border-primary shadow-md' : ''}` : 'shadow-sm z-10 flex-1 flex flex-col'
            }`}
            style={scalingStyle}
            {...(compact ? {
                onClick: () => onSelect?.(id ?? ''),
                role: 'button',
                tabIndex: 0,
            } : {})}
        >
            {placeholder ? (
                <div className="flex-1 flex items-center justify-center">
                    <h1 className="text-xl text-center py-5 px-10 text-muted-foreground">{placeholder}</h1>
                </div>
            ) : (
                <>
                    {!compact && content && (
                        <div className="border-b border-border px-6 py-3 bg-muted/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <FileText className="h-4 w-4" />
                                        <span>{wordCount} words</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{readingTime} min read</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div id={`${id}`} className={`${compact ? 'max-h-full h-full overflow-hidden relative flex flex-col justify-center p-6' : 'flex-1 overflow-auto p-8'}`}>
                        {compact ? (
                            <h4 className="text-[10px] w-full text-center">{title}</h4>
                        ) : (
                            <div className="prose prose-gray max-w-none">
                                <h1 className="text-2xl font-bold mb-6 text-foreground">{title}</h1>
                                <div className="text-base leading-relaxed">
                                    <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
                                </div>
                                {footer?.length ? <Footer footer={footer ?? ''}/> : null}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
