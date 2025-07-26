import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Cpu, Layers, Play, Users, Sparkles, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 animate-gradient"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Cpu className="h-20 w-20 text-cyan-500 animate-pulse-ring" />
              <div className="absolute inset-0 bg-cyan-500/30 blur-2xl"></div>
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient">
            Claude Swarm Supervisor
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Orchestrate intelligent AI agent swarms with the power of Claude Code SDK. 
            Build, manage, and deploy collaborative AI teams.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/create">
              <Button size="lg" className="neon-cyan group">
                <Sparkles className="h-5 w-5 mr-2 group-hover:animate-spin" />
                Get Started
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/projects">
              <Button size="lg" variant="outline" className="border-cyan-500/50 hover:bg-cyan-500/10">
                View Projects
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid gap-8 md:grid-cols-3 mb-12 max-w-6xl mx-auto">
          <Card className="glass border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 group">
            <CardHeader>
              <div className="mb-4">
                <div className="relative inline-block">
                  <Users className="h-12 w-12 text-cyan-500 group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-cyan-500/20 blur-xl"></div>
                </div>
              </div>
              <CardTitle className="text-2xl">Intelligent Agents</CardTitle>
              <CardDescription className="text-base">
                Create specialized AI agents with unique capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Design agents with specific roles, tools, and expertise. Each agent can focus on what they do best.
              </p>
              <Link href="/agents">
                <Button variant="link" className="p-0 text-cyan-500 hover:text-cyan-400">
                  Explore Agents <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group">
            <CardHeader>
              <div className="mb-4">
                <div className="relative inline-block">
                  <Layers className="h-12 w-12 text-blue-500 group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl"></div>
                </div>
              </div>
              <CardTitle className="text-2xl">Dynamic Swarms</CardTitle>
              <CardDescription className="text-base">
                Orchestrate teams of agents working in harmony
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Combine multiple agents into powerful swarms that collaborate to solve complex problems.
              </p>
              <Link href="/swarms">
                <Button variant="link" className="p-0 text-blue-500 hover:text-blue-400">
                  Manage Swarms <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 group">
            <CardHeader>
              <div className="mb-4">
                <div className="relative inline-block">
                  <Zap className="h-12 w-12 text-purple-500 group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-purple-500/20 blur-xl"></div>
                </div>
              </div>
              <CardTitle className="text-2xl">Real-time Sessions</CardTitle>
              <CardDescription className="text-base">
                Launch and control swarm executions live
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Watch as your AI agents collaborate in real-time, delegating tasks and sharing insights.
              </p>
              <Link href="/supervise">
                <Button variant="link" className="p-0 text-purple-500 hover:text-purple-400">
                  Start Session <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/create">
              <Button variant="outline" className="border-cyan-500/50 hover:bg-cyan-500/10">
                <Sparkles className="h-4 w-4 mr-2" />
                Create New Swarm
              </Button>
            </Link>
            <Link href="/agents/new">
              <Button variant="outline" className="border-blue-500/50 hover:bg-blue-500/10">
                <Users className="h-4 w-4 mr-2" />
                Design Agent
              </Button>
            </Link>
            <Link href="/supervise">
              <Button variant="outline" className="border-purple-500/50 hover:bg-purple-500/10">
                <Play className="h-4 w-4 mr-2" />
                Launch Session
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats section */}
        <div className="grid gap-6 md:grid-cols-3 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-500 mb-2 animate-glow">∞</div>
            <p className="text-muted-foreground">Possible Configurations</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-500 mb-2 animate-glow">100%</div>
            <p className="text-muted-foreground">Claude-Powered</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-500 mb-2 animate-glow">24/7</div>
            <p className="text-muted-foreground">AI Collaboration</p>
          </div>
        </div>
      </div>
    </div>
  );
}