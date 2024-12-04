import { Sources } from "@/lib/types";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default function SourcesModal({ sources }: { sources: Sources }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [filter, setFilter] = useState('all')

    // const filteredSources = Object.values(sources).filter(source =>
    //     source.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    //     (filter === 'all' || source.type === filter)
    // )

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="bg-[var(--background-alt)] hover:bg-accent hover:text-accent-foreground">Sources</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Sources</DialogTitle>
                </DialogHeader>
                <div className="flex justify-between items-center mb-4">
                    <Input
                        type="text"
                        placeholder="Search sources..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                Filter by type
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => setFilter('all')}>All</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setFilter('book')}>Books</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setFilter('article')}>Articles</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setFilter('video')}>Videos</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setFilter('audio')}>Audio</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setFilter('image')}>Images</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    <ul className="space-y-4">
                        {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
                        {Object.entries(sources).map(([_, source]) => (
                            <li key={source.id} className="flex items-center p-3 bg-[var(--background)] rounded-md shadow-sm">
                                <div className="mr-4 text-[var(--primary)]">
                                    <File className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold">{source.title}</h4>
                                    <p className="text-sm text-[var(--text-secondary)]">{source.author} • {source.date}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </DialogContent>
        </Dialog>
    )
}