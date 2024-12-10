import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function DocumentOptions({ onZoomChange }: { onZoomChange: (value: string) => void }) {
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
