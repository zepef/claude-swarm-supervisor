"use client"

import { useState, useRef, useEffect } from "react"
import { Check, ChevronDown, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const AVAILABLE_TOOLS = [
  // Core Claude Code Tools
  { id: "Bash", name: "Bash", category: "System" },
  { id: "Edit", name: "Edit", category: "Files" },
  { id: "Read", name: "Read", category: "Files" },
  { id: "Write", name: "Write", category: "Files" },
  { id: "MultiEdit", name: "Multi Edit", category: "Files" },
  { id: "Grep", name: "Grep", category: "Search" },
  { id: "Glob", name: "Glob", category: "Search" },
  { id: "LS", name: "List Files", category: "Search" },
  { id: "WebFetch", name: "Web Fetch", category: "Web" },
  { id: "WebSearch", name: "Web Search", category: "Web" },
  { id: "Task", name: "Task", category: "Agent" },
  { id: "TodoWrite", name: "Todo Write", category: "Organization" },
  { id: "ExitPlanMode", name: "Exit Plan Mode", category: "System" },
  { id: "NotebookRead", name: "Notebook Read", category: "Organization" },
  { id: "NotebookEdit", name: "Notebook Edit", category: "Organization" },
  
  // MCP Tools (if installed)
  { id: "mcp__supabase__list_projects", name: "Supabase: List Projects", category: "MCP Database" },
  { id: "mcp__supabase__execute_sql", name: "Supabase: Execute SQL", category: "MCP Database" },
  { id: "mcp__supabase__list_tables", name: "Supabase: List Tables", category: "MCP Database" },
  { id: "mcp__shadcn-ui-server__list_shadcn_components", name: "Shadcn: List Components", category: "MCP UI" },
  { id: "mcp__shadcn-ui-server__get_component_details", name: "Shadcn: Component Details", category: "MCP UI" },
  { id: "mcp__vibe_kanban__list_projects", name: "Kanban: List Projects", category: "MCP Project" },
  { id: "mcp__vibe_kanban__create_task", name: "Kanban: Create Task", category: "MCP Project" },
]

interface CompactToolSelectorProps {
  selectedTools: string[]
  onToolsChange: (tools: string[]) => void
}

export function CompactToolSelector({ selectedTools, onToolsChange }: CompactToolSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleTool = (toolId: string) => {
    if (selectedTools.includes(toolId)) {
      onToolsChange(selectedTools.filter(id => id !== toolId))
    } else {
      onToolsChange([...selectedTools, toolId])
    }
  }

  const removeTool = (toolId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onToolsChange(selectedTools.filter(id => id !== toolId))
  }

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToolsChange([])
  }

  // Group tools by category
  const toolsByCategory = AVAILABLE_TOOLS.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = []
    acc[tool.category].push(tool)
    return acc
  }, {} as Record<string, typeof AVAILABLE_TOOLS>)

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Tools</label>
      <div ref={dropdownRef} className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full min-h-[42px] px-3 py-2 text-left bg-background border border-input rounded-md hover:bg-accent/50 transition-colors flex items-center justify-between gap-2 cursor-pointer"
        >
          <div className="flex-1">
            {selectedTools.length === 0 ? (
              <span className="text-muted-foreground">Select tools...</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {selectedTools.map(toolId => {
                  const tool = AVAILABLE_TOOLS.find(t => t.id === toolId)
                  return (
                    <Badge 
                      key={toolId} 
                      variant="secondary" 
                      className="text-xs bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 pr-1"
                    >
                      {tool?.name || toolId}
                      <span
                        onClick={(e) => removeTool(toolId, e)}
                        className="ml-1 hover:text-cyan-700 dark:hover:text-cyan-300 cursor-pointer inline-flex"
                      >
                        <X className="h-3 w-3" />
                      </span>
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {selectedTools.length > 0 && (
              <span
                onClick={clearAll}
                className="text-muted-foreground hover:text-foreground p-1 cursor-pointer inline-flex"
              >
                <X className="h-4 w-4" />
              </span>
            )}
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
            <div className="p-2">
              <button
                type="button"
                onClick={() => {
                  if (selectedTools.length === AVAILABLE_TOOLS.length) {
                    onToolsChange([])
                  } else {
                    onToolsChange(AVAILABLE_TOOLS.map(t => t.id))
                  }
                }}
                className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded transition-colors mb-2"
              >
                {selectedTools.length === AVAILABLE_TOOLS.length ? "Deselect all" : "Select all"}
              </button>
              
              {Object.entries(toolsByCategory).map(([category, tools]) => (
                <div key={category} className="mb-3 last:mb-0">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase">
                    {category}
                  </div>
                  {tools.map(tool => {
                    const isSelected = selectedTools.includes(tool.id)
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => toggleTool(tool.id)}
                        className={`
                          w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded transition-colors flex items-center justify-between
                          ${isSelected ? 'text-cyan-600 dark:text-cyan-400' : ''}
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <span>{tool.name}</span>
                          {tool.id.startsWith("mcp__") && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              MCP
                            </Badge>
                          )}
                        </div>
                        {isSelected && <Check className="h-4 w-4" />}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {selectedTools.length === 0 
          ? "No tools selected - agent will have limited capabilities" 
          : `${selectedTools.length} tool${selectedTools.length === 1 ? '' : 's'} selected`
        }
      </p>
    </div>
  )
}