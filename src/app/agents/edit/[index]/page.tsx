"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CompactToolSelector } from "@/components/compact-tool-selector"
import { PromptEnhancer } from "@/components/prompt-enhancer"
import { MCPToolSuggestions } from "@/components/mcp-tool-suggestions"
import { updateAgent, getAgents, enhanceAgentPrompt } from "@/app/actions"
import { ArrowLeft, Bot, Save } from "lucide-react"
import Link from "next/link"

const agentSchema = z.object({
  name: z.string().min(1, "Agent name is required"),
  description: z.string().min(1, "Description is required"),
  systemPrompt: z.string().min(1, "System prompt is required"),
})

type AgentFormData = z.infer<typeof agentSchema>

export default function EditAgentPage({ params }: { params: { index: string } }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const agentIndex = parseInt(params.index)
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
  })

  const watchName = watch("name")
  const watchDescription = watch("description")
  const watchSystemPrompt = watch("systemPrompt")

  useEffect(() => {
    async function loadAgent() {
      try {
        // First try to get from server
        const serverAgents = await getAgents()
        let agent = serverAgents[agentIndex]
        
        // Fallback to localStorage
        if (!agent) {
          const localAgents = JSON.parse(localStorage.getItem("saved-agents") || "[]")
          agent = localAgents[agentIndex]
        }
        
        if (agent) {
          setValue("name", agent.name)
          setValue("description", agent.description)
          setValue("systemPrompt", agent.systemPrompt)
          
          // Handle tools
          if (Array.isArray(agent.tools)) {
            setSelectedTools(agent.tools)
          } else if (typeof agent.tools === 'string') {
            const toolsArray = agent.tools.split(",").map(t => t.trim()).filter(t => t)
            setSelectedTools(toolsArray)
          }
        }
      } catch (error) {
        console.error("Error loading agent:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadAgent()
  }, [agentIndex, setValue])

  const onSubmit = async (data: AgentFormData) => {
    setSaving(true)
    try {
      const agentData = {
        name: data.name,
        description: data.description,
        tools: selectedTools,
        systemPrompt: data.systemPrompt,
      }
      
      await updateAgent(agentIndex, agentData)
      
      // Update localStorage for client-side access
      const agents = JSON.parse(localStorage.getItem("saved-agents") || "[]")
      agents[agentIndex] = {
        ...agentData,
        tools: selectedTools.join(", ") // Store as string for localStorage compatibility
      }
      localStorage.setItem("saved-agents", JSON.stringify(agents))
      
      router.push("/agents")
    } catch (error) {
      console.error("Error updating agent:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="glass border-cyan-500/20 animate-pulse">
            <CardHeader>
              <div className="h-8 bg-cyan-500/20 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-10 bg-cyan-500/10 rounded"></div>
                <div className="h-10 bg-cyan-500/10 rounded"></div>
                <div className="h-32 bg-cyan-500/10 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Link href="/agents">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Agents
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
            Edit Agent
          </h1>
          <p className="text-muted-foreground text-lg">
            Modify your agent's configuration
          </p>
        </div>

        <Card className="glass border-cyan-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-cyan-500" />
              Agent Configuration
            </CardTitle>
            <CardDescription>
              Update your agent's identity, capabilities, and behavior
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Agent Name
                </label>
                <input
                  {...register("name")}
                  className="w-full px-4 py-2 rounded-md border border-input bg-background"
                  placeholder="e.g., Code Reviewer, Data Analyst"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <input
                  {...register("description")}
                  className="w-full px-4 py-2 rounded-md border border-input bg-background"
                  placeholder="Brief description of what this agent does"
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                )}
              </div>

              <CompactToolSelector 
                selectedTools={selectedTools}
                onToolsChange={setSelectedTools}
              />

              <MCPToolSuggestions
                agent={{
                  name: watchName || "",
                  description: watchDescription || "",
                  tools: selectedTools,
                  systemPrompt: watchSystemPrompt || ""
                }}
              />

              <div>
                <PromptEnhancer
                  label="System Prompt"
                  value={watchSystemPrompt || ""}
                  onChange={(value) => setValue("systemPrompt", value)}
                  placeholder="Define the agent's role, expertise, and behavior..."
                  rows={8}
                  onEnhance={async () => {
                    const result = await enhanceAgentPrompt(
                      watchSystemPrompt || "",
                      watchName || "Agent",
                      selectedTools
                    )
                    return result.enhancedPrompt
                  }}
                />
                {errors.systemPrompt && (
                  <p className="text-sm text-destructive mt-1">{errors.systemPrompt.message}</p>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={saving} className="neon-cyan">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Link href="/agents">
                  <Button variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}