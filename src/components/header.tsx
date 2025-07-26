"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { Moon, Sun, Cpu, Home, FolderOpen, Users, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function Header() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-500/20 bg-background/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <Cpu className="h-8 w-8 text-cyan-500 group-hover:text-cyan-400 transition-colors" />
                <div className="absolute inset-0 bg-cyan-500/20 blur-lg group-hover:bg-cyan-400/30 transition-colors"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Claude Swarm
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-cyan-400 transition-colors"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link 
                href="/agents" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-cyan-400 transition-colors"
              >
                <Users className="h-4 w-4" />
                Agents
              </Link>
              <Link 
                href="/swarms" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-cyan-400 transition-colors"
              >
                <Layers className="h-4 w-4" />
                Swarms
              </Link>
              <Link 
                href="/projects" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-cyan-400 transition-colors"
              >
                <FolderOpen className="h-4 w-4" />
                Projects
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative group"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
              <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 rounded-md transition-colors"></div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}