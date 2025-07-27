"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  FileInput, 
  FileOutput, 
  FileJson,
  Terminal,
  Monitor,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { IOSpecification } from "@/lib/types"

interface IOSpecificationFormProps {
  value?: IOSpecification
  onChange: (spec: IOSpecification) => void
}

export function IOSpecificationForm({ value, onChange }: IOSpecificationFormProps) {
  const [expanded, setExpanded] = useState(false)
  
  const spec = value || {
    inputType: 'text' as const,
    outputType: 'text' as const,
  }

  const updateSpec = (updates: Partial<IOSpecification>) => {
    onChange({ ...spec, ...updates })
  }

  const inputTypeIcons = {
    text: <Terminal className="h-4 w-4" />,
    file: <FileInput className="h-4 w-4" />,
    json: <FileJson className="h-4 w-4" />,
    none: <Info className="h-4 w-4" />
  }

  const outputTypeIcons = {
    text: <Terminal className="h-4 w-4" />,
    file: <FileOutput className="h-4 w-4" />,
    json: <FileJson className="h-4 w-4" />,
    display: <Monitor className="h-4 w-4" />
  }

  return (
    <Card className="glass border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <FileJson className="h-4 w-4 text-purple-500" />
              IO Specification
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Define how your agent accepts input and produces output
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Input Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">Input Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(['text', 'file', 'json', 'none'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateSpec({ inputType: type })}
                    className={`
                      flex items-center gap-2 p-2 rounded-md border text-sm capitalize
                      ${spec.inputType === type 
                        ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400' 
                        : 'border-input hover:bg-accent'
                      }
                    `}
                  >
                    {inputTypeIcons[type]}
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Output Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">Output Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(['text', 'file', 'json', 'display'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateSpec({ outputType: type })}
                    className={`
                      flex items-center gap-2 p-2 rounded-md border text-sm capitalize
                      ${spec.outputType === type 
                        ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400' 
                        : 'border-input hover:bg-accent'
                      }
                    `}
                  >
                    {outputTypeIcons[type]}
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input Description */}
          {spec.inputType !== 'none' && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Input Description
              </label>
              <input
                type="text"
                value={spec.inputDescription || ''}
                onChange={(e) => updateSpec({ inputDescription: e.target.value })}
                placeholder={
                  spec.inputType === 'file' 
                    ? "Describe the expected file format..."
                    : spec.inputType === 'json'
                    ? "Describe the JSON structure..."
                    : "Describe the expected input..."
                }
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
              />
            </div>
          )}

          {/* Output Description */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Output Description
            </label>
            <input
              type="text"
              value={spec.outputDescription || ''}
              onChange={(e) => updateSpec({ outputDescription: e.target.value })}
              placeholder={
                spec.outputType === 'file' 
                  ? "Describe the output file format..."
                  : spec.outputType === 'json'
                  ? "Describe the JSON response structure..."
                  : "Describe what the agent will produce..."
              }
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
            />
          </div>

          {/* File Types */}
          {spec.inputType === 'file' && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Accepted File Types
              </label>
              <input
                type="text"
                value={spec.acceptedFileTypes?.join(', ') || ''}
                onChange={(e) => updateSpec({ 
                  acceptedFileTypes: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
                placeholder=".txt, .csv, .json, .md"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated list of file extensions
              </p>
            </div>
          )}

          {/* Sample Input */}
          {spec.inputType !== 'none' && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Sample Input
              </label>
              <textarea
                value={spec.sampleInput || ''}
                onChange={(e) => updateSpec({ sampleInput: e.target.value })}
                placeholder={
                  spec.inputType === 'json'
                    ? '{"example": "data"}'
                    : "Provide a sample input for testing..."
                }
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm font-mono"
              />
            </div>
          )}

          {/* IO Summary */}
          <div className="pt-3 border-t">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                {inputTypeIcons[spec.inputType]}
                <span className="capitalize">{spec.inputType} Input</span>
              </div>
              <span>→</span>
              <div className="flex items-center gap-2">
                {outputTypeIcons[spec.outputType]}
                <span className="capitalize">{spec.outputType} Output</span>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}