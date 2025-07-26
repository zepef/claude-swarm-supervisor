"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Layers, Edit, Trash2, Bot, Play } from "lucide-react"

export default function SwarmsPage() {
  const [swarms, setSwarms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Load swarms from localStorage or API
    const savedSwarms = localStorage.getItem("saved-swarms")
    if (savedSwarms) {
      setSwarms(JSON.parse(savedSwarms))
    }
    setLoading(false)
  }, [])

  const deleteSwarm = (index: number) => {
    const newSwarms = swarms.filter((_, i) => i !== index)
    setSwarms(newSwarms)
    localStorage.setItem("saved-swarms", JSON.stringify(newSwarms))
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Swarm Library
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your AI agent swarms
          </p>
        </div>

        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers className="h-4 w-4" />
              <span>{swarms.length} swarms</span>
            </div>
          </div>
          <Link href="/create">
            <Button className="neon-blue">
              <Plus className="h-4 w-4 mr-2" />
              Create Swarm
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass border-blue-500/20 animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-blue-500/20 rounded w-3/4"></div>
                  <div className="h-4 bg-blue-500/10 rounded w-full mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-blue-500/10 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : swarms.length === 0 ? (
          <Card className="glass border-blue-500/20 text-center py-12">
            <CardContent>
              <Layers className="h-16 w-16 mx-auto text-blue-500/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No swarms yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first AI agent swarm to get started
              </p>
              <Link href="/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Swarm
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {swarms.map((swarm, index) => (
              <Card 
                key={index} 
                className="glass border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Layers className="h-5 w-5 text-blue-500" />
                        {swarm.name}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {swarm.description || "No description provided"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Sub-agents:</p>
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-blue-400" />
                      <span className="text-sm">{swarm.subAgents?.length || 0} agents</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/supervise" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Launch
                      </Button>
                    </Link>
                    <Link href={`/swarms/edit/${index}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deleteSwarm(index)}
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