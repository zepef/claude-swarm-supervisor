"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Loader2, 
  ShieldCheck,
  AlertTriangle,
  Lightbulb
} from "lucide-react"

interface CompatibilityResult {
  isCompatible: boolean
  overallScore: number
  analysis: string
  agentScores?: Record<string, { score: number; reason: string }>
  gaps?: string[]
  suggestions?: string[]
}

interface CompatibilityCheckProps {
  onCheck: () => Promise<CompatibilityResult>
  disabled?: boolean
}

export function CompatibilityCheck({ onCheck, disabled }: CompatibilityCheckProps) {
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<CompatibilityResult | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleCheck = async () => {
    setChecking(true)
    try {
      const checkResult = await onCheck()
      setResult(checkResult)
      setShowDetails(true)
    } catch (error) {
      console.error("Error checking compatibility:", error)
    } finally {
      setChecking(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 60) return "text-amber-600 dark:text-amber-400"
    return "text-red-600 dark:text-red-400"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/10 border-green-500/20"
    if (score >= 60) return "bg-amber-500/10 border-amber-500/20"
    return "bg-red-500/10 border-red-500/20"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
    if (score >= 60) return <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
    return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Compatibility Check</label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleCheck}
          disabled={disabled || checking}
          className="text-xs"
        >
          {checking ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <ShieldCheck className="h-3 w-3 mr-1" />
              Check Compatibility
            </>
          )}
        </Button>
      </div>

      {result && showDetails && (
        <Card className={`glass ${getScoreBg(result.overallScore)}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getScoreIcon(result.overallScore)}
                <span>Compatibility Analysis</span>
              </div>
              <Badge 
                variant="secondary" 
                className={`${getScoreBg(result.overallScore)} ${getScoreColor(result.overallScore)}`}
              >
                {result.overallScore}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm">{result.analysis}</p>
            </div>

            {result.agentScores && Object.keys(result.agentScores).length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Agent Suitability
                </h4>
                <div className="space-y-2">
                  {Object.entries(result.agentScores).map(([agent, data]) => (
                    <div key={agent} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{agent}</span>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getScoreBg(data.score)} ${getScoreColor(data.score)}`}
                        >
                          {data.score}%
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{data.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.gaps && result.gaps.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Capability Gaps
                </h4>
                <ul className="space-y-1">
                  {result.gaps.map((gap, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.suggestions && result.suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  Suggestions
                </h4>
                <ul className="space-y-1">
                  {result.suggestions.map((suggestion, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-cyan-600 dark:text-cyan-400 mt-0.5">→</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Hide analysis
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {!showDetails && result && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
          <div className="flex items-center gap-2">
            {getScoreIcon(result.overallScore)}
            <span className="text-sm">
              Last check: <span className={getScoreColor(result.overallScore)}>{result.overallScore}% compatible</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowDetails(true)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Show details
          </button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Check if your selected agents have the right capabilities for your swarm's purpose
      </p>
    </div>
  )
}