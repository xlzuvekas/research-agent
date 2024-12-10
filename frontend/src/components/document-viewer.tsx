import type { Section as TSection } from "@/lib/types";
import Footnotes from "@/components/footnotes";
import { useMemo } from "react";

interface DocumentViewerProps {
    section?: TSection;
    zoomLevel: number,
    compact?: boolean;
    onSelect?: (sectionId: string) => void;
    placeholder?: string;
}

export function DocumentViewer({
    section,
    zoomLevel,
    compact = false,
    onSelect,
    placeholder,
}: DocumentViewerProps) {
    const { title, content, id, footnotes } = section ?? {};

    const scalingStyle = useMemo(() => {
        if (compact) {
            const scaleFactor = 0.1;
            return {
                width: `calc(210mm * ${scaleFactor})`,
                height: `calc(297mm * ${scaleFactor})`,
                fontSize: `calc(16px * ${scaleFactor})`,
                padding: '10px',
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

    return (
        <div
            key={id}
            className={`bg-white shadow-sm p-6 overflow-auto border border-black/10 transition-all duration-200 ${
                compact ? 'shadow hover:scale-105' : 'shadow-lg z-10 flex-1'
            }`}
            style={scalingStyle}
            {...(compact ? {
                onClick: () => onSelect?.(id ?? ''),
                role: 'button',
                tabIndex: 0,
            } : {})}
        >
            {placeholder ? (<h1 className="text-xl font-noto text-center py-5 px-10">{placeholder}</h1>) : (
                <div id={`${id}`}>
                    <h4>{title}</h4>
                    <p>{content}</p>
                </div>
            )}
            {!compact && !placeholder && <Footnotes footnotes={footnotes ?? ''}/>}
        </div>
    )
}
