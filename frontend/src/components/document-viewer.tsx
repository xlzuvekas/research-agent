import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Document, Section as TSection } from "@/lib/types";
import { useState } from "react";

function DocumentOptions({ onZoomChange }: { onZoomChange: (value: string) => void }) {
    return (
        <div className="flex justify-center items-center mb-4 font-noto">
            <div className="inline-flex bg-[#F5F0EA] rounded-md shadow-md p-1">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        className="border border-black/10 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 mr-2">
                        Section
                        <ChevronDown className="ml-2 h-4 w-4"/>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>Full page</DropdownMenuItem>
                        <DropdownMenuItem>Section</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Select defaultValue="100" onValueChange={onZoomChange}>
                    <SelectTrigger className="w-[100px] bg-white">
                        <SelectValue placeholder="View"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="100">100%</SelectItem>
                        <SelectItem value="75">75%</SelectItem>
                        <SelectItem value="50">50%</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

function Footnotes({}: Pick<Document, 'footnotes'>) {
    return (
        <div>
            <h4 className="text-2xl font-semibold mt-8 mb-4">Footnotes</h4>
            <ol className="list-decimal pl-6 text-sm">
                <li className="mb-2">Smith, J. (2022). "AI in Scientific Research: A Comprehensive Review." Journal of
                    AI Applications, 15(2), 45-62.
                </li>
                <li className="mb-2">Johnson, A., & Lee, B. (2021). "Machine Learning Techniques for Big Data Analysis
                    in Research." Data Science Quarterly, 8(4), 112-128.
                </li>
                <li className="mb-2">Brown, C. et al. (2023). "Automated Literature Review: A Game Changer for
                    Researchers." AI in Academia, 6(1), 78-95.
                </li>
                <li className="mb-2">Garcia, M., & Wong, R. (2022). "Predictive Modeling in Scientific Research: Case
                    Studies and Best Practices." Computational Science Review, 19(3), 201-220.
                </li>
                <li className="mb-2">Taylor, S. (2023). "The Human-AI Collaboration in Modern Research: Challenges and
                    Opportunities." Future of Science Journal, 7(2), 156-173.
                </li>
            </ol>
        </div>
    )
}

function Section({
    idx,
    title,
    content
}: TSection) {
    return (
        <div id={`${idx}`}>
            <h4>{title}</h4>
            <p>{content}</p>
        </div>
    )
}

export default function DocumentViewer({
    doc
}: { doc: Document }) {
    const [currentPage, setCurrentPage] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(100);
    const sectionsPerPage = 2;

    const startIndex = currentPage * sectionsPerPage;
    const selectedSections = doc.sections?.slice(startIndex, startIndex + sectionsPerPage) || [];

    const totalPages = Math.ceil((doc.sections?.length || 0) / sectionsPerPage);

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

    return (
        <div className="flex-1 p-4 flex flex-col h-full">
            <DocumentOptions onZoomChange={handleZoomChange}/>

            <div className={`bg-white shadow-sm p-6 overflow-auto border border-black/10 flex-grow max-h-[75%] w-[210mm] h-[297mm] mx-auto`} style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}>
                {selectedSections.length ? (
                    <>
                        <h3 className="text-xl font-semibold mb-4">{doc.title}</h3>
                        <div className="prose prose-sm prose-stone">
                            {selectedSections.map(({title, content, idx}) => (
                                <Section key={idx} idx={idx} title={title} content={content} />
                            ))}
                        </div>
                        <Footnotes footnotes={doc.footnotes} />
                    </>
                ) : (
                    <div className="font-noto flex items-center justify-center w-full h-full">
                        <p className="relative -top-5">
                            Interact with the research agent and your research document will show up here.
                        </p>
                    </div>
                )}
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
                    <span>{Math.min((currentPage + 1) * sectionsPerPage, doc.sections?.length || 0)} of {doc.sections?.length || 0} sections</span>
                    <span>•</span>
                    <span>{zoomLevel}%</span>
                </div>
            </div>
        </div>
    )
}