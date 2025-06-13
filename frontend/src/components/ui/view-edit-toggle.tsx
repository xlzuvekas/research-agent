"use client"

import { Eye, Pencil } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function ViewEditToggle({
    disabled,
    mode,
    onToggle,
}: {
    disabled: boolean;
    mode: 'view' | 'edit',
    onToggle: (mode: 'view' | 'edit') => void
}) {
    const getButtonClass = (selected = false) => cn(
                "h-8 px-2 rounded-none bg-transparent transition-colors",
                selected ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground",
                "active:bg-muted",
                disabled && "opacity-50 cursor-not-allowed"
            )

  return (
      <div className="flex items-center justify-center border border-input rounded-md overflow-hidden">
        <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle("view")}
            disabled={disabled}
            className={getButtonClass(mode === "view")}
            aria-pressed={mode === "view"}
        >
          <Eye className="h-4 w-4 mr-1"/>
          <span className="sr-only">Switch to view mode</span>
          View
        </Button>
        <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle("edit")}
            disabled={disabled}
            className={getButtonClass(mode === "edit")}
            aria-pressed={mode === "edit"}
        >
          <Pencil className="h-4 w-4 mr-1"/>
          <span className="sr-only">Switch to edit mode</span>
          Edit
        </Button>
      </div>
  )
}

