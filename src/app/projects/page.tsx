"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Layers, FolderOpen, ArrowRight } from "lucide-react"

export default function ProjectsPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent animate-gradient">
            Project Management
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Organize and manage your AI agents and swarms in one place
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          <Link href="/agents" className="group">
            <Card className="glass border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <div className="relative">
                        <Users className="h-8 w-8 text-cyan-500" />
                        <div className="absolute inset-0 bg-cyan-500/20 blur-lg"></div>
                      </div>
                      Agent Library
                    </CardTitle>
                    <CardDescription className="mt-2 text-base">
                      Create and manage specialized AI agents
                    </CardDescription>
                  </div>
                  <ArrowRight className="h-5 w-5 text-cyan-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Build a library of reusable AI agents with specific capabilities, tools, and system prompts.
                  </p>
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-cyan-500 rounded-full"></div>
                      <span>Define agent roles and responsibilities</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-cyan-500 rounded-full"></div>
                      <span>Configure available tools per agent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-cyan-500 rounded-full"></div>
                      <span>Reuse agents across multiple swarms</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/swarms" className="group">
            <Card className="glass border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <div className="relative">
                        <Layers className="h-8 w-8 text-blue-500" />
                        <div className="absolute inset-0 bg-blue-500/20 blur-lg"></div>
                      </div>
                      Swarm Library
                    </CardTitle>
                    <CardDescription className="mt-2 text-base">
                      Orchestrate teams of AI agents
                    </CardDescription>
                  </div>
                  <ArrowRight className="h-5 w-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Create powerful AI swarms by combining multiple agents to work together on complex tasks.
                  </p>
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <span>Combine agents with complementary skills</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <span>Define supervisor prompts and strategies</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <span>Launch and manage swarm sessions</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Card className="glass border-purple-500/20 max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-4 mb-4">
                <FolderOpen className="h-8 w-8 text-purple-500" />
                <h3 className="text-xl font-semibold">Project Structure</h3>
              </div>
              <p className="text-muted-foreground">
                Agents and swarms are saved locally for now. In the future, you can sync them across devices 
                or share with your team.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}