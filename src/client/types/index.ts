export interface AnalysisNode {
  id: string
  label: string
  type: 'function' | 'condition' | 'loop' | 'error_handling' | 'return' | 'variable'
}

export interface AnalysisEdge {
  from: string
  to: string
  label?: string
}

export interface AnalysisResult {
  nodes: AnalysisNode[]
  edges: AnalysisEdge[]
}

export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'go' | 'rust' | 'java' | 'csharp'

export type DiagramType = 'flow' | 'callgraph' | 'dataflow' | 'structure'

export type SupportedModel = 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'gemini-2.0-flash' | 'gemma-4-31b-it' | 'gemma-4-26b-a4b-it'
