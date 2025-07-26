"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Check, X, Loader2 } from "lucide-react"

interface PromptEnhancerProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  onEnhance: () => Promise<string>
}

export function PromptEnhancer({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  rows = 6,
  onEnhance 
}: PromptEnhancerProps) {
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null)
  const [showComparison, setShowComparison] = useState(false)

  const handleEnhance = async () => {
    if (!value.trim()) return
    
    setIsEnhancing(true)
    try {
      const enhanced = await onEnhance()
      setEnhancedPrompt(enhanced)
      setShowComparison(true)
    } catch (error) {
      console.error("Error enhancing prompt:", error)
    } finally {
      setIsEnhancing(false)
    }
  }

  const acceptEnhancement = () => {
    if (enhancedPrompt) {
      onChange(enhancedPrompt)
      setShowComparison(false)
      setEnhancedPrompt(null)
    }
  }

  const rejectEnhancement = () => {
    setShowComparison(false)
    setEnhancedPrompt(null)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">{label}</label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleEnhance}
          disabled={!value.trim() || isEnhancing}
          className="text-xs"
        >
          {isEnhancing ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Enhancing...
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3 mr-1" />
              Enhance with AI
            </>
          )}
        </Button>
      </div>

      {!showComparison ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="w-full px-4 py-2 rounded-md border border-input bg-background resize-none"
          placeholder={placeholder}
        />
      ) : (
        <div className="space-y-4">
          <Card className="glass border-amber-500/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  Your Original Prompt
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{value}</p>
            </CardContent>
          </Card>

          <Card className="glass border-cyan-500/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-cyan-700 dark:text-cyan-400">
                  AI-Enhanced Prompt
                </span>
                <Sparkles className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <p className="text-sm whitespace-pre-wrap">{enhancedPrompt}</p>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={rejectEnhancement}
              className="border-red-500/50 hover:bg-red-500/10"
            >
              <X className="h-4 w-4 mr-1" />
              Keep Original
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={acceptEnhancement}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <Check className="h-4 w-4 mr-1" />
              Use Enhanced
            </Button>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {showComparison 
          ? "Review the enhanced prompt and choose which version to use"
          : "Write a simple description and click 'Enhance with AI' for a professional prompt"
        }
      </p>
    </div>
  )
}