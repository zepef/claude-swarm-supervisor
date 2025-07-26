"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, Edit, Trash2, Bot } from "lucide-react"
import { getAgents, deleteAgent as deleteAgentServer } from "@/app/actions"

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAgents() {
      try {
        // Try to load from server first
        const serverAgents = await getAgents()
        if (serverAgents.length > 0) {
          setAgents(serverAgents)
          // Sync with localStorage
          localStorage.setItem("saved-agents", JSON.stringify(serverAgents))
        } else {
          // Fallback to localStorage
          const savedAgents = localStorage.getItem("saved-agents")
          if (savedAgents) {
            setAgents(JSON.parse(savedAgents))
          }
        }
      } catch (error) {
        console.error("Error loading agents:", error)
        // Fallback to localStorage on error
        const savedAgents = localStorage.getItem("saved-agents")
        if (savedAgents) {
          setAgents(JSON.parse(savedAgents))
        }
      } finally {
        setLoading(false)
      }
    }
    
    loadAgents()
  }, [])

  const deleteAgent = async (index: number) => {
    try {
      await deleteAgentServer(index)
      const newAgents = agents.filter((_, i) => i !== index)
      setAgents(newAgents)
      localStorage.setItem("saved-agents", JSON.stringify(newAgents))
    } catch (error) {
      console.error("Error deleting agent:", error)
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
            Agent Library
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your specialized AI agents
          </p>
        </div>

        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bot className="h-4 w-4" />
              <span>{agents.length} agents</span>
            </div>
          </div>
          <Link href="/agents/new">
            <Button className="neon-cyan">
              <Plus className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass border-cyan-500/20 animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-cyan-500/20 rounded w-3/4"></div>
                  <div className="h-4 bg-cyan-500/10 rounded w-full mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-cyan-500/10 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : agents.length === 0 ? (
          <Card className="glass border-cyan-500/20 text-center py-12">
            <CardContent>
              <Bot className="h-16 w-16 mx-auto text-cyan-500/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No agents yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first specialized AI agent to get started
              </p>
              <Link href="/agents/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Agent
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent, index) => (
              <Card 
                key={index} 
                className="glass border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Bot className="h-5 w-5 text-cyan-500" />
                        {agent.name}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {agent.description || "No description provided"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Tools:</p>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const toolsArray = Array.isArray(agent.tools) 
                          ? agent.tools 
                          : agent.tools?.split(",").map((t: string) => t.trim()).filter((t: string) => t) || []
                        
                        return toolsArray.length > 0 ? (
                          toolsArray.map((tool: string, i: number) => (
                            <span 
                              key={i} 
                              className="px-2 py-1 text-xs bg-cyan-500/10 text-cyan-400 rounded-md border border-cyan-500/20"
                            >
                              {tool}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">No tools specified</span>
                        )
                      })()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/agents/edit/${index}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deleteAgent(index)}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}