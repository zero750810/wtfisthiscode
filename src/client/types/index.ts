export interface AnalysisNode {
  id: string
  label: string
  type: 'function' | 'condition' | 'loop' | 'error_handling' | 'return' | 'variable'
  code_snippet: string
  line_start: number
  line_end: number
}

export interface AnalysisEdge {
  from: string
  to: string
  label?: string
  type: 'call' | 'condition_true' | 'condition_false' | 'data' | 'next'
}

export interface AnalysisResult {
  title: string
  description: string
  nodes: AnalysisNode[]
  edges: AnalysisEdge[]
  mermaid: string
}

export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'go' | 'rust' | 'java' | 'csharp'

export type DiagramType = 'flow' | 'callgraph' | 'dataflow' | 'structure'
