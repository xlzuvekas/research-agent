import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

export default function DocumentViewer() {
    return (
        <div className="flex-1 p-4 flex flex-col h-full">
            <DocumentOptions />

            <div
                className="bg-white shadow-sm p-6 overflow-auto border border-black/10 flex-grow max-h-[75%]">
                <h3 className="text-xl font-semibold mb-4">Document Title</h3>
                <div className="prose prose-sm prose-stone">
                    <p>This is the content of the document. It&#39;s always visible and elevated within its section.</p>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam
                        ultricies, nunc nisl aliquet nunc, vitae aliquam nisl nunc vitae nisl.</p>
                    <h4>Section 1</h4>
                    <p>Phasellus ac dolor vel felis sollicitudin bibendum. Fusce tincidunt, nisl eget aliquam ultricies,
                        nunc nisl aliquet nunc, vitae aliquam nisl nunc vitae nisl.</p>
                    <h4>Section 2</h4>
                    <p>Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec
                        velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula.</p>
                    <ul>
                        <li>Item 1</li>
                        <li>Item 2</li>
                        <li>Item 3</li>
                    </ul>
                    <p>Curabitur aliquet quam id dui posuere blandit. Vivamus magna justo, lacinia eget consectetur sed,
                        convallis at tellus.</p>
                </div>
            </div>
        </div>
    )
}