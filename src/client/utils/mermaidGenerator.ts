import type { AnalysisEdge, AnalysisNode, DiagramType } from '../types'

const RESERVED_WORDS = new Set(['end', 'subgraph', 'graph', 'flowchart', 'classDef', 'click', 'style'])

function safeId(id: string): string {
  return RESERVED_WORDS.has(id) ? `${id}_node` : id
}

function nodeShape(node: AnalysisNode): string {
  const id = safeId(node.id)
  const label = node.label.replace(/"/g, '\'')

  switch (node.type) {
    case 'condition':
      return `${id}{"${label}"}`
    case 'loop':
      return `${id}(("${label}"))`
    case 'return':
      return `${id}(["${label}"])`
    case 'error_handling':
      return `${id}["${label}"]:::error`
    default:
      return `${id}["${label}"]`
  }
}

function edgeArrow(edge: AnalysisEdge): string {
  const from = safeId(edge.from)
  const to = safeId(edge.to)
  const label = edge.label

  if (label) {
    return `    ${from} -- "${label.replace(/"/g, '\'')}" --> ${to}`
  }
  return `    ${from} --> ${to}`
}

export function generateMermaid(
  nodes: AnalysisNode[],
  edges: AnalysisEdge[],
  diagramType: DiagramType,
): string {
  if (diagramType === 'structure') {
    return generateClassDiagram(nodes, edges)
  }

  const direction = diagramType === 'callgraph' ? 'LR' : 'TD'
  const lines: string[] = [`flowchart ${direction}`]

  for (const node of nodes) {
    lines.push(`    ${nodeShape(node)}`)
  }

  lines.push('')

  for (const edge of edges) {
    lines.push(edgeArrow(edge))
  }

  return lines.join('\n')
}

function generateClassDiagram(nodes: AnalysisNode[], edges: AnalysisEdge[]): string {
  const lines: string[] = ['classDiagram']

  for (const node of nodes) {
    lines.push(`    class ${safeId(node.id)} {`)
    lines.push(`        ${node.label}`)
    lines.push(`    }`)
  }

  for (const edge of edges) {
    const label = edge.label ? ` : ${edge.label}` : ''
    lines.push(`    ${safeId(edge.from)} --> ${safeId(edge.to)}${label}`)
  }

  return lines.join('\n')
}
