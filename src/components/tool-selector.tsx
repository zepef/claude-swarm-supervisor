"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Terminal, 
  Search, 
  Globe, 
  Edit, 
  FolderOpen,
  FileCode,
  GitBranch,
  Database,
  Wrench
} from "lucide-react"

const AVAILABLE_TOOLS = [
  { 
    id: "Bash", 
    name: "Bash", 
    description: "Execute shell commands",
    icon: Terminal,
    category: "System"
  },
  { 
    id: "Edit", 
    name: "Edit", 
    description: "Edit files in place",
    icon: Edit,
    category: "File Operations"
  },
  { 
    id: "Read", 
    name: "Read", 
    description: "Read file contents",
    icon: FileText,
    category: "File Operations"
  },
  { 
    id: "Write", 
    name: "Write", 
    description: "Write new files",
    icon: FileCode,
    category: "File Operations"
  },
  { 
    id: "Grep", 
    name: "Grep", 
    description: "Search file contents",
    icon: Search,
    category: "Search"
  },
  { 
    id: "Glob", 
    name: "Glob", 
    description: "Find files by pattern",
    icon: FolderOpen,
    category: "Search"
  },
  { 
    id: "WebFetch", 
    name: "Web Fetch", 
    description: "Fetch web content",
    icon: Globe,
    category: "Web"
  },
  { 
    id: "WebSearch", 
    name: "Web Search", 
    description: "Search the web",
    icon: Search,
    category: "Web"
  },
  { 
    id: "Task", 
    name: "Task", 
    description: "Launch sub-agents",
    icon: GitBranch,
    category: "Agent"
  },
  { 
    id: "TodoWrite", 
    name: "Todo Write", 
    description: "Manage task lists",
    icon: Database,
    category: "Organization"
  }
]

const CATEGORIES = ["System", "File Operations", "Search", "Web", "Agent", "Organization"]

interface ToolSelectorProps {
  selectedTools: string[]
  onToolsChange: (tools: string[]) => void
}

export function ToolSelector({ selectedTools, onToolsChange }: ToolSelectorProps) {
  const toggleTool = (toolId: string) => {
    if (selectedTools.includes(toolId)) {
      onToolsChange(selectedTools.filter(id => id !== toolId))
    } else {
      onToolsChange([...selectedTools, toolId])
    }
  }

  const toggleAll = () => {
    if (selectedTools.length === AVAILABLE_TOOLS.length) {
      onToolsChange([])
    } else {
      onToolsChange(AVAILABLE_TOOLS.map(tool => tool.id))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Available Tools</label>
        <button
          type="button"
          onClick={toggleAll}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {selectedTools.length === AVAILABLE_TOOLS.length ? "Deselect all" : "Select all"}
        </button>
      </div>
      
      <div className="space-y-4">
        {CATEGORIES.map(category => {
          const categoryTools = AVAILABLE_TOOLS.filter(tool => tool.category === category)
          return (
            <div key={category} className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {category}
              </h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {categoryTools.map(tool => {
                  const Icon = tool.icon
                  const isSelected = selectedTools.includes(tool.id)
                  
                  return (
                    <label
                      key={tool.id}
                      className={`
                        relative flex cursor-pointer items-start gap-3 rounded-lg border p-3 
                        transition-all hover:bg-accent/50
                        ${isSelected 
                          ? 'border-cyan-500/50 bg-cyan-500/10 dark:border-cyan-500/30 dark:bg-cyan-500/5' 
                          : 'border-border'
                        }
                      `}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleTool(tool.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium leading-none">
                            {tool.name}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {tool.description}
                        </p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      
      {selectedTools.length > 0 && (
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-2">
            Selected tools ({selectedTools.length}):
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedTools.map(toolId => (
              <Badge 
                key={toolId} 
                variant="secondary" 
                className="text-xs bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
              >
                {toolId}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}