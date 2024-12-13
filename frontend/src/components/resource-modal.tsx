import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useResearch } from "@/components/research-context";
import { SourceItem } from "@/components/resource-item";

export default function SourcesModal() {
    const { state, sourcesModalOpen, setSourcesModalOpen } = useResearch()
    const [searchTerm, setSearchTerm] = useState('')
    const [filter, setFilter] = useState('all')

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const filteredSources = Object.entries(state.sources ?? {}).filter(([_, source]) =>
        source.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filter === 'all')
    )

    return (
        <Dialog open={sourcesModalOpen} onOpenChange={setSourcesModalOpen}>
            <DialogContent className="sm:max-w-[625px] bg-[#F5F0EA]">
                <DialogHeader>
                    <DialogTitle>Sources</DialogTitle>
                </DialogHeader>
                {filteredSources.length > 0 ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <Input
                                type="text"
                                placeholder="Search sources..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-64 bg-white"
                            />
                            {/*<DropdownMenu>*/}
                            {/*    <DropdownMenuTrigger asChild>*/}
                            {/*        <Button variant="outline" className="bg-white">*/}
                            {/*            Filter by type*/}
                            {/*            <ChevronDown className="ml-2 h-4 w-4"/>*/}
                            {/*        </Button>*/}
                            {/*    </DropdownMenuTrigger>*/}
                            {/*    <DropdownMenuContent>*/}
                            {/*        <DropdownMenuItem onSelect={() => setFilter('all')}>All</DropdownMenuItem>*/}
                            {/*        <DropdownMenuItem onSelect={() => setFilter('book')}>Books</DropdownMenuItem>*/}
                            {/*        <DropdownMenuItem onSelect={() => setFilter('article')}>Articles</DropdownMenuItem>*/}
                            {/*        <DropdownMenuItem onSelect={() => setFilter('video')}>Videos</DropdownMenuItem>*/}
                            {/*        <DropdownMenuItem onSelect={() => setFilter('audio')}>Audio</DropdownMenuItem>*/}
                            {/*        <DropdownMenuItem onSelect={() => setFilter('image')}>Images</DropdownMenuItem>*/}
                            {/*    </DropdownMenuContent>*/}
                            {/*</DropdownMenu>*/}
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                            <div className="space-y-2 pr-2">
                                {filteredSources.map(([id, source]) => <SourceItem source={source} id={id} key={id} />)}
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="font-noto flex items-center justify-center w-full h-full">
                        Once a research was initiated, resources will show up here
                    </p>
                )}
            </DialogContent>
        </Dialog>
    )
}