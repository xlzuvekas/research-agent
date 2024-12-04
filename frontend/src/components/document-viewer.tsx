import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Document, Section as TSection } from "@/lib/types";
import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function DocumentOptions() {
    return (
        <div className="flex justify-center items-center mb-4 font-noto">
            <div className="inline-flex bg-[#8B4513]/5 rounded-md shadow-md p-1">
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

                <Select defaultValue="100">
                    <SelectTrigger className="w-[100px] bg-white">
                        <SelectValue placeholder="View"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="100">100%</SelectItem>
                        <SelectItem value="75">75%</SelectItem>
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

    return (
        <div className="flex-1 p-4 flex flex-col h-full">
            <DocumentOptions/>

            <div
                className="bg-white shadow-sm p-6 overflow-auto border border-black/10 flex-grow max-h-[75%]">
                {doc.sections?.length ? (
                    <>
                        <h3 className="text-xl font-semibold mb-4">{doc.title}</h3>
                        <div className="prose prose-sm prose-stone">
                            {doc.sections.map(({title, content, idx}) => (
                                <Section key={idx} idx={idx} title={title} content={content} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="font-noto flex items-center justify-center w-full h-full">
                        <p className="relative -top-5">
                            Interact with the research agent and your research document will show up here.
                        </p>
                    </div>
                )}
                <Footnotes footnotes={doc.footnotes} />
            </div>
        </div>
    )
}