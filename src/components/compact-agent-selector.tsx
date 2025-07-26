"use client"

import { useState, useRef, useEffect } from "react"
import { Check, ChevronDown, X, Bot, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getAgents } from "@/app/actions"

interface Agent {
  name: string
  description: string
  tools: string[] | string
  systemPrompt: string
}

interface CompactAgentSelectorProps {
  selectedAgents: string[]
  onAgentsChange: (agents: string[]) => void
}

export function CompactAgentSelector({ selectedAgents, onAgentsChange }: CompactAgentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadAgents() {
      try {
        // Try to load from server first
        const serverAgents = await getAgents()
        if (serverAgents.length > 0) {
          setAvailableAgents(serverAgents)
        } else {
          // Fallback to localStorage
          const savedAgents = localStorage.getItem("saved-agents")
          if (savedAgents) {
            setAvailableAgents(JSON.parse(savedAgents))
          }
        }
      } catch (error) {
        console.error("Error loading agents:", error)
        // Fallback to localStorage on error
        const savedAgents = localStorage.getItem("saved-agents")
        if (savedAgents) {
          setAvailableAgents(JSON.parse(savedAgents))
        }
      } finally {
        setLoading(false)
      }
    }
    
    loadAgents()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleAgent = (agentName: string) => {
    if (selectedAgents.includes(agentName)) {
      onAgentsChange(selectedAgents.filter(name => name !== agentName))
    } else {
      onAgentsChange([...selectedAgents, agentName])
    }
  }

  const removeAgent = (agentName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onAgentsChange(selectedAgents.filter(name => name !== agentName))
  }

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAgentsChange([])
  }

  // Group agents by their tools/capabilities
  const agentsByCategory = availableAgents.reduce((acc, agent) => {
    const tools = Array.isArray(agent.tools) 
      ? agent.tools 
      : agent.tools?.split(",").map(t => t.trim()).filter(t => t) || []
    
    let category = "General"
    if (tools.some(t => ["Bash", "Edit", "Write"].includes(t))) {
      category = "Development"
    } else if (tools.some(t => ["WebFetch", "WebSearch"].includes(t))) {
      category = "Research"
    } else if (tools.some(t => ["Grep", "Glob", "Read"].includes(t))) {
      category = "Analysis"
    }
    
    if (!acc[category]) acc[category] = []
    acc[category].push(agent)
    return acc
  }, {} as Record<string, Agent[]>)

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Sub-Agents</label>
      <div ref={dropdownRef} className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full min-h-[42px] px-3 py-2 text-left bg-background border border-input rounded-md hover:bg-accent/50 transition-colors flex items-center justify-between gap-2 cursor-pointer"
          style={{ opacity: loading || availableAgents.length === 0 ? 0.5 : 1 }}
        >
          <div className="flex-1">
            {loading ? (
              <span className="text-muted-foreground">Loading agents...</span>
            ) : availableAgents.length === 0 ? (
              <span className="text-muted-foreground flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                No agents available - create some first
              </span>
            ) : selectedAgents.length === 0 ? (
              <span className="text-muted-foreground">Select agents for your swarm...</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {selectedAgents.map(agentName => (
                  <Badge 
                    key={agentName} 
                    variant="secondary" 
                    className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 pr-1"
                  >
                    <Bot className="h-3 w-3 mr-1" />
                    {agentName}
                    <span
                      onClick={(e) => removeAgent(agentName, e)}
                      className="ml-1 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer inline-flex"
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {selectedAgents.length > 0 && (
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

        {isOpen && availableAgents.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
            <div className="p-2">
              <button
                type="button"
                onClick={() => {
                  if (selectedAgents.length === availableAgents.length) {
                    onAgentsChange([])
                  } else {
                    onAgentsChange(availableAgents.map(a => a.name))
                  }
                }}
                className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded transition-colors mb-2"
              >
                {selectedAgents.length === availableAgents.length ? "Deselect all" : "Select all"}
              </button>
              
              {Object.entries(agentsByCategory).map(([category, agents]) => (
                <div key={category} className="mb-3 last:mb-0">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase">
                    {category}
                  </div>
                  {agents.map(agent => {
                    const isSelected = selectedAgents.includes(agent.name)
                    const tools = Array.isArray(agent.tools) 
                      ? agent.tools 
                      : agent.tools?.split(",").map(t => t.trim()).filter(t => t) || []
                    
                    return (
                      <button
                        key={agent.name}
                        type="button"
                        onClick={() => toggleAgent(agent.name)}
                        className={`
                          w-full text-left px-2 py-2 text-sm hover:bg-accent rounded transition-colors
                          ${isSelected ? 'bg-blue-500/10' : ''}
                        `}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Bot className={`h-4 w-4 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`} />
                              <span className={`font-medium ${isSelected ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                                {agent.name}
                              </span>
                            </div>
                            {agent.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 pl-6">
                                {agent.description}
                              </p>
                            )}
                            {tools.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1 pl-6">
                                {tools.slice(0, 3).map((tool, i) => (
                                  <span key={i} className="text-xs text-muted-foreground">
                                    {tool}{i < Math.min(tools.length - 1, 2) ? "," : ""}
                                  </span>
                                ))}
                                {tools.length > 3 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{tools.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {!loading && availableAgents.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedAgents.length === 0 
            ? "No agents selected - add at least one agent to create a swarm" 
            : `${selectedAgents.length} agent${selectedAgents.length === 1 ? '' : 's'} selected`
          }
        </p>
      )}
    </div>
  )
}