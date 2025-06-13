import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { DocumentOptionsState } from "@/types/document-options-state";
import ViewEditToggle from "@/components/ui/view-edit-toggle";
import { cn } from "@/lib/utils";

interface DocumentOptionsProps {
    state: DocumentOptionsState;
    onChange: (newState: Partial<DocumentOptionsState>) => void;
    canEdit: boolean;
}

export default function DocumentOptions({ 
    state, 
    onChange, 
    canEdit
}: DocumentOptionsProps) {
    const getItemClass = (selected = false) => cn(
        "hover:bg-accent active:bg-muted transition-colors cursor-pointer",
        {
            'bg-accent text-accent-foreground': selected
        },
    )
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="inline-flex bg-secondary rounded-md p-1">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        className="border border-input inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 mr-2">
                        {state.mode === 'section' ? 'Section View' : 'Full Document'}
                        <ChevronDown className="ml-2 h-4 w-4"/>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="border border-border bg-popover">
                        <DropdownMenuItem onClick={() => onChange({ mode: 'full' })} className={getItemClass(state.mode === 'full')}>
                            Full Document
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onChange({ mode: 'section' })} className={getItemClass(state.mode === 'section')}>
                            Section View
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="inline-flex bg-secondary rounded-md p-1 h-[44px]">
                    <ViewEditToggle
                        mode={state.editMode ? 'edit' : 'view'}
                        onToggle={mode => onChange({ editMode: mode === 'edit' })}
                        disabled={!canEdit}
                    />
                </div>
        </div>
    );
}
