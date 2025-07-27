"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Play,
  Upload,
  Download,
  Copy,
  Check,
  Loader2,
  FileJson,
  FileText,
  Terminal,
  AlertCircle,
  Sparkles
} from "lucide-react"
import { SubAgent } from "@/lib/types"
import { testAgent, continueAgentTest } from "@/app/actions"

interface AgentTestRunnerProps {
  agent: SubAgent
  onClose?: () => void
}

export function AgentTestRunner({ agent, onClose }: AgentTestRunnerProps) {
  const [input, setInput] = useState(agent.ioSpec?.sampleInput || "")
  const [fileContent, setFileContent] = useState<string>("")
  const [fileName, setFileName] = useState<string>("")
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type if restrictions exist
    if (agent.ioSpec?.acceptedFileTypes) {
      const ext = `.${file.name.split('.').pop()}`
      if (!agent.ioSpec.acceptedFileTypes.includes(ext)) {
        alert(`File type ${ext} not accepted. Accepted types: ${agent.ioSpec.acceptedFileTypes.join(', ')}`)
        return
      }
    }

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      setFileContent(e.target?.result as string)
    }
    reader.readAsText(file)
  }

  const handleRun = async () => {
    setRunning(true)
    setResult(null)
    
    try {
      if (sessionId) {
        // Continue existing session
        const testResult = await continueAgentTest(
          sessionId,
          agent,
          input
        )
        setResult(testResult)
      } else {
        // Start new session
        const testResult = await testAgent(
          agent, 
          input,
          agent.ioSpec?.inputType === 'file' && fileContent 
            ? { name: fileName, content: fileContent }
            : undefined
        )
        setResult(testResult)
        if (testResult.sessionId) {
          setSessionId(testResult.sessionId)
        }
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setRunning(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const getInputComponent = () => {
    switch (agent.ioSpec?.inputType) {
      case 'file':
        return (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-input rounded-lg p-6 text-center">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileUpload}
                accept={agent.ioSpec.acceptedFileTypes?.join(',')}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                {agent.ioSpec.acceptedFileTypes && (
                  <p className="text-xs text-muted-foreground">
                    Accepted: {agent.ioSpec.acceptedFileTypes.join(', ')}
                  </p>
                )}
              </label>
            </div>
            {fileName && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <FileText className="h-4 w-4" />
                <span className="text-sm">{fileName}</span>
                <Badge variant="secondary" className="text-xs">
                  {(fileContent.length / 1024).toFixed(1)} KB
                </Badge>
              </div>
            )}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Additional instructions (optional)"
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
            />
          </div>
        )
      
      case 'json':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">JSON Input</label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  try {
                    const formatted = JSON.stringify(JSON.parse(input), null, 2)
                    setInput(formatted)
                  } catch (e) {
                    // Invalid JSON, ignore
                  }
                }}
              >
                <FileJson className="h-3 w-3 mr-1" />
                Format
              </Button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"key": "value"}'
              rows={6}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm font-mono"
            />
          </div>
        )
      
      case 'none':
        return (
          <div className="p-4 bg-muted/50 rounded-md text-center">
            <p className="text-sm text-muted-foreground">
              This agent doesn't require input
            </p>
          </div>
        )
      
      default:
        return (
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={agent.ioSpec?.inputDescription || "Enter your test input..."}
            rows={4}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
          />
        )
    }
  }

  const getOutputDisplay = () => {
    if (!result || !result.success) return null

    const output = result.output

    switch (output.type) {
      case 'json':
        return (
          <div className="space-y-2">
            {output.error ? (
              <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                {output.error}
              </div>
            ) : (
              <pre className="p-3 bg-muted rounded-md text-sm overflow-x-auto">
                {output.formatted || output.raw}
              </pre>
            )}
          </div>
        )
      
      case 'file':
        return (
          <div className="space-y-3">
            {output.fileContent ? (
              <>
                <pre className="p-3 bg-muted rounded-md text-sm overflow-x-auto max-h-64">
                  {output.fileContent}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(output.fileContent, output.suggestedFileName)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Output
                </Button>
              </>
            ) : (
              <pre className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                {output.raw}
              </pre>
            )}
          </div>
        )
      
      case 'display':
        return (
          <div className="p-4 bg-background rounded-md border">
            <div dangerouslySetInnerHTML={{ __html: output.raw }} />
          </div>
        )
      
      default:
        return (
          <pre className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
            {output.raw}
          </pre>
        )
    }
  }

  return (
    <Card className="glass border-cyan-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-500" />
              Test Agent: {agent.name}
            </CardTitle>
            <CardDescription>
              {agent.description}
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* IO Type Indicators */}
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-xs">
            <Terminal className="h-3 w-3 mr-1" />
            {agent.ioSpec?.inputType || 'text'} → {agent.ioSpec?.outputType || 'text'}
          </Badge>
          {agent.tools && agent.tools.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              Tools: {agent.tools.length}
            </Badge>
          )}
        </div>

        {/* Input Section */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            {agent.ioSpec?.inputDescription || 'Input'}
          </label>
          {getInputComponent()}
        </div>

        {/* Run Button */}
        <Button
          onClick={handleRun}
          disabled={running || (agent.ioSpec?.inputType === 'file' && !fileContent)}
          className="w-full neon-cyan"
        >
          {running ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Agent...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              {sessionId ? 'Continue Conversation' : 'Run Test'}
            </>
          )}
        </Button>
        
        {sessionId && !running && (
          <Button
            onClick={() => {
              setSessionId(undefined)
              setResult(null)
              setInput(agent.ioSpec?.sampleInput || "")
            }}
            variant="outline"
            size="sm"
          >
            Start New Session
          </Button>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                {agent.ioSpec?.outputDescription || 'Output'}
              </label>
              <div className="flex items-center gap-2">
                {result.success && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(result.output.raw)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
                {result.output?.sessionId && (
                  <Badge variant="secondary" className="text-xs">
                    Session: {result.output.sessionId.slice(0, 8)}...
                  </Badge>
                )}
              </div>
            </div>

            {result.success ? (
              getOutputDisplay()
            ) : (
              <div className="p-3 bg-destructive/10 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                  <p className="text-sm text-destructive">{result.error}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}