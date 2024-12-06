import { FileText, Home, MessageCircle, Search, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useResearch } from "@/components/research-context";

export default function Toolbar() {
    const { setSourcesModalOpen } = useResearch();

    return (
        <div
            className="flex h-full flex-col items-center justify-between bg-[#F5F0EA] p-4 shadow-md my-auto">
            <div className="space-y-8">
                <Home className="h-6 w-6 text-[#8B4513]"/>
                <Search className="h-6 w-6 text-[#8B4513]" />
                <div className="relative">
                    <FileText 
                        className="h-6 w-6 text-[#8B4513] cursor-pointer hover:text-[#8B4513]/80" 
                        onClick={() => setSourcesModalOpen(true)}
                    />
                </div>
                <MessageCircle className="h-6 w-6 text-[#8B4513]"/>
                <Settings className="h-6 w-6 text-[#8B4513]"/>
            </div>
            <Avatar className="border-2 border-[#8B4513]/20">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn"/>
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
        </div>
    )
}