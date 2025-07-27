"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Search,
  Package,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  ExternalLink,
  Sparkles
} from "lucide-react"
import { getInstalledMCPTools, searchMCPTools, suggestMCPToolsForAgent } from "@/app/actions"
import { SubAgent } from "@/lib/types"

interface MCPToolSuggestionsProps {
  agent?: SubAgent
  tools?: string[]
  onToolsFound?: (tools: any[]) => void
}

export function MCPToolSuggestions({ agent, tools, onToolsFound }: MCPToolSuggestionsProps) {
  const [searching, setSearching] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [suggestions, setSuggestions] = useState<string>("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [installedTools, setInstalledTools] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleAnalyzeAgent = async () => {
    if (!agent) return
    
    setAnalyzing(true)
    try {
      const result = await suggestMCPToolsForAgent(agent)
      setSuggestions(result.suggestions)
      setInstalledTools(result.installedTools)
      setShowResults(true)
    } catch (error) {
      console.error("Error analyzing agent:", error)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSearchTools = async () => {
    const searchTerms = agent ? agent.tools : tools || []
    if (searchTerms.length === 0) return

    setSearching(true)
    try {
      const result = await searchMCPTools(searchTerms)
      setSearchResults(result.foundTools)
      setSuggestions(result.searchSummary)
      setShowResults(true)
      
      if (onToolsFound) {
        onToolsFound(result.foundTools)
      }
    } catch (error) {
      console.error("Error searching tools:", error)
    } finally {
      setSearching(false)
    }
  }

  const getMCPToolBadge = (toolName: string) => {
    const isMCPTool = toolName.startsWith("mcp__")
    if (!isMCPTool) return null
    
    const isInstalled = installedTools.some(installed => 
      toolName.includes(installed.toLowerCase().replace(/-/g, "_"))
    )
    
    return (
      <Badge 
        variant={isInstalled ? "default" : "secondary"} 
        className={`ml-2 text-xs ${isInstalled ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-amber-500/20 text-amber-600 dark:text-amber-400"}`}
      >
        {isInstalled ? (
          <>
            <CheckCircle2 className="h-3 w-3 mr-1" />
            MCP Installed
          </>
        ) : (
          <>
            <AlertCircle className="h-3 w-3 mr-1" />
            MCP Not Found
          </>
        )}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-2">
          <Package className="h-4 w-4 text-purple-500" />
          MCP Tool Enhancement
        </label>
        <div className="flex gap-2">
          {agent && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAnalyzeAgent}
              disabled={analyzing}
              className="text-xs"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 mr-1" />
                  Suggest MCP Tools
                </>
              )}
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleSearchTools}
            disabled={searching || (!agent && (!tools || tools.length === 0))}
            className="text-xs"
          >
            {searching ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-3 w-3 mr-1" />
                Search MCP Registry
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Show MCP badges for current tools */}
      {agent && agent.tools.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {agent.tools.map((tool) => (
            <div key={tool} className="flex items-center">
              <span className="text-sm text-muted-foreground">{tool}</span>
              {getMCPToolBadge(tool)}
            </div>
          ))}
        </div>
      )}

      {showResults && suggestions && (
        <Card className="glass border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-purple-500" />
              MCP Tool Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm whitespace-pre-wrap">{suggestions}</div>

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Available MCP Servers</h4>
                {searchResults.map((tool, i) => (
                  <div key={i} className="p-3 bg-muted/50 rounded-md space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{tool.name}</p>
                        <p className="text-xs text-muted-foreground">{tool.description}</p>
                      </div>
                      {tool.isOfficial && (
                        <Badge variant="secondary" className="text-xs">
                          Official
                        </Badge>
                      )}
                    </div>
                    {tool.installCommand && (
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-background px-2 py-1 rounded flex-1">
                          {tool.installCommand}
                        </code>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {installedTools.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  Currently installed MCP servers:
                </p>
                <div className="flex flex-wrap gap-2">
                  {installedTools.map((tool) => (
                    <Badge key={tool} variant="secondary" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t flex items-center justify-between">
              <a
                href="https://github.com/modelcontextprotocol/servers"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                Browse MCP Server Registry
                <ExternalLink className="h-3 w-3" />
              </a>
              <button
                type="button"
                onClick={() => setShowResults(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Hide recommendations
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        MCP servers extend agent capabilities with database access, API integrations, and specialized tools
      </p>
    </div>
  )
}