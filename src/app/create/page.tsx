'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CompactAgentSelector } from '@/components/compact-agent-selector';
import { PromptEnhancer } from '@/components/prompt-enhancer';
import { CompatibilityCheck } from '@/components/compatibility-check';
import { createSwarm, saveSwarm, getAgents, enhanceSwarmPrompt, checkSwarmCompatibility } from '@/app/actions';
import { ArrowLeft, Layers, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const swarmSchema = z.object({
  name: z.string().min(1, "Swarm name is required"),
  description: z.string().optional(),
  mainPrompt: z.string().min(1, "Main prompt is required"),
});

type SwarmFormData = z.infer<typeof swarmSchema>;

export default function CreateSwarm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SwarmFormData>({
    resolver: zodResolver(swarmSchema),
  });

  const watchName = watch("name");
  const watchMainPrompt = watch("mainPrompt");

  useEffect(() => {
    async function loadAgents() {
      try {
        const agents = await getAgents();
        setAvailableAgents(agents);
      } catch (error) {
        console.error("Error loading agents:", error);
      }
    }
    loadAgents();
  }, []);

  const onSubmit = async (data: SwarmFormData) => {
    if (selectedAgents.length === 0) {
      alert("Please select at least one agent for your swarm");
      return;
    }

    setSaving(true);
    try {
      // Get full agent data for selected agents
      const swarmAgents = selectedAgents.map(agentName => {
        const agent = availableAgents.find(a => a.name === agentName);
        return agent || { name: agentName, description: '', systemPrompt: '', tools: [] };
      });

      const swarmData = {
        name: data.name,
        description: data.description || '',
        mainPrompt: data.mainPrompt,
        agents: swarmAgents,
      };

      // Create swarm files
      await createSwarm(swarmData);
      
      // Save swarm to database
      await saveSwarm(swarmData);
      
      // Save to localStorage for client-side access
      const swarms = JSON.parse(localStorage.getItem("saved-swarms") || "[]");
      swarms.push({
        ...swarmData,
        subAgents: swarmAgents, // For compatibility
      });
      localStorage.setItem("saved-swarms", JSON.stringify(swarms));
      
      router.push("/swarms");
    } catch (error) {
      console.error("Error creating swarm:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Link href="/swarms">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Swarms
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Create New Swarm
          </h1>
          <p className="text-muted-foreground text-lg">
            Orchestrate multiple AI agents to work together
          </p>
        </div>

        {availableAgents.length === 0 && (
          <Card className="glass border-amber-500/20 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-700 dark:text-amber-400">No agents available</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You need to create some agents first before you can build a swarm.
                  </p>
                  <Link href="/agents/new">
                    <Button size="sm" className="mt-3">
                      Create your first agent
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="glass border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-500" />
              Swarm Configuration
            </CardTitle>
            <CardDescription>
              Define your swarm's identity and behavior
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Swarm Name
                </label>
                <input
                  {...register("name")}
                  className="w-full px-4 py-2 rounded-md border border-input bg-background"
                  placeholder="e.g., Code Review Team, Research Squad"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description (optional)
                </label>
                <input
                  {...register("description")}
                  className="w-full px-4 py-2 rounded-md border border-input bg-background"
                  placeholder="Brief description of what this swarm does"
                />
              </div>

              <CompactAgentSelector 
                selectedAgents={selectedAgents}
                onAgentsChange={setSelectedAgents}
              />

              <div>
                <PromptEnhancer
                  label="Supervisor Prompt"
                  value={watchMainPrompt || ""}
                  onChange={(value) => setValue("mainPrompt", value)}
                  placeholder="Describe the main task for the supervisor to orchestrate. The supervisor will delegate to the selected agents based on this prompt..."
                  rows={6}
                  onEnhance={async () => {
                    const result = await enhanceSwarmPrompt(
                      watchMainPrompt || "",
                      watchName || "Swarm",
                      selectedAgents
                    )
                    return result.enhancedPrompt
                  }}
                />
                {errors.mainPrompt && (
                  <p className="text-sm text-destructive mt-1">{errors.mainPrompt.message}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  This prompt will guide the supervisor in delegating tasks to your selected agents
                </p>
              </div>

              <CompatibilityCheck
                disabled={!watchMainPrompt || selectedAgents.length === 0}
                onCheck={async () => {
                  // Get full agent data for compatibility check
                  const fullAgents = selectedAgents.map(agentName => {
                    const agent = availableAgents.find(a => a.name === agentName);
                    return agent || { name: agentName, description: '', systemPrompt: '', tools: [] };
                  });
                  
                  const result = await checkSwarmCompatibility(watchMainPrompt || "", fullAgents);
                  return result;
                }}
              />

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={saving || availableAgents.length === 0} 
                  className="neon-blue"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Creating..." : "Create Swarm"}
                </Button>
                <Link href="/swarms">
                  <Button variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}