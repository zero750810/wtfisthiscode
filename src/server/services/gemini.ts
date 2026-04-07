interface AnalyzeParams {
  code: string
  language: string
  diagramType: string
  apiKey: string
}

interface AnalysisResult {
  title: string
  description: string
  nodes: {
    id: string
    label: string
    type: string
    code_snippet: string
    line_start: number
    line_end: number
  }[]
  edges: {
    from: string
    to: string
    label?: string
    type: string
  }[]
  mermaid: string
}

const DIAGRAM_TYPE_PROMPTS: Record<string, string> = {
  flow: '程式的執行流程，包含條件分支、迴圈和錯誤處理。使用 flowchart TD 語法。',
  callgraph: '函式之間的呼叫關係，誰呼叫了誰。使用 flowchart LR 語法。',
  dataflow: '變數和資料如何在函式之間傳遞和轉換。使用 flowchart TD 語法。',
  structure: 'class、module 或主要結構之間的關係。使用 classDiagram 語法。',
}

function buildPrompt(params: AnalyzeParams): string {
  const diagramDesc = DIAGRAM_TYPE_PROMPTS[params.diagramType] || DIAGRAM_TYPE_PROMPTS.flow
  const lang = params.language === 'auto' ? '自動偵測' : params.language

  return `你是一個程式碼分析專家。分析以下程式碼，產出結構化的 JSON。

程式語言：${lang}
視覺化類型：${params.diagramType}（${diagramDesc}）

程式碼：
\`\`\`
${params.code}
\`\`\`

請回傳以下 JSON 格式（不要包含任何其他文字，不要用 markdown code block 包裝）：
{
  "title": "這段程式碼的一句話摘要",
  "description": "2-3 句更詳細的說明",
  "nodes": [
    {
      "id": "unique_id",
      "label": "節點名稱（簡短）",
      "type": "function | condition | loop | error_handling | return | variable",
      "code_snippet": "對應的原始碼片段",
      "line_start": 1,
      "line_end": 5
    }
  ],
  "edges": [
    {
      "from": "node_id_1",
      "to": "node_id_2",
      "label": "關係描述（可選）",
      "type": "call | condition_true | condition_false | data | next"
    }
  ],
  "mermaid": "完整的 Mermaid 語法字串（使用換行符 \\n 分隔每行）"
}

重要規則：
1. mermaid 欄位必須是有效的 Mermaid 語法，可以直接渲染
2. 節點 id 使用英文和底線，不要用中文
3. Mermaid 語法中的節點文字可以用中文
4. 確保 edges 中的 from 和 to 都對應到 nodes 中存在的 id
5. 只回傳 JSON，不要有任何其他文字
6. Mermaid 節點標籤中禁止使用括號等特殊字元，這些字元在 Mermaid 中有特殊意義會導致解析錯誤。例如：用 "fibonacci n" 而非 "fibonacci(n)"，用 "i 從 2 到 n" 而非 "i=2; i<=n"
7. Mermaid 節點標籤若含有特殊字元，必須用雙引號包裹，例如：A["標籤 (含括號)"]
8. Mermaid 節點 id 不可使用保留字：end、subgraph、graph、flowchart、classDef、click、style。用 node_end 或 finish 取代 end`
}

const MD_BLOCK_START = /^```(?:json)?\s*/i
const MD_BLOCK_END = /\n?```\s*$/

export async function analyzeCode(params: AnalyzeParams): Promise<AnalysisResult> {
  const prompt = buildPrompt(params)

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${params.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 32768,
          responseMimeType: 'application/json',
          thinkingConfig: {
            thinkingBudget: 4096,
          },
        },
      }),
    },
  )

  if (!res.ok) {
    const errorText = await res.text()
    console.error('Gemini API error:', res.status, errorText)
    throw new Error('Gemini API 呼叫失敗')
  }

  const data = await res.json() as {
    candidates?: {
      content?: {
        parts?: { text?: string, thought?: boolean }[]
      }
      finishReason?: string
    }[]
  }

  const candidate = data.candidates?.[0]
  if (candidate?.finishReason === 'MAX_TOKENS') {
    throw new Error('程式碼太複雜，AI 回應被截斷，請縮短程式碼再試')
  }

  // Gemini 2.5 Flash is a thinking model — skip thought parts, take the actual answer
  const parts = candidate?.content?.parts ?? []
  const text = parts
    .filter(p => !p.thought && p.text)
    .map(p => p.text)
    .join('')

  if (!text) {
    throw new Error('Gemini 未回傳有效內容')
  }

  // Strip markdown code blocks if present
  let cleaned = text
    .replace(MD_BLOCK_START, '')
    .replace(MD_BLOCK_END, '')
    .trim()

  // Model may output reasoning text before the JSON — extract the JSON object
  const jsonStart = cleaned.indexOf('{')
  const jsonEnd = cleaned.lastIndexOf('}')
  if (jsonStart !== -1 && jsonEnd > jsonStart) {
    cleaned = cleaned.slice(jsonStart, jsonEnd + 1)
  }

  let result: AnalysisResult
  try {
    result = JSON.parse(cleaned) as AnalysisResult
  }
  catch {
    console.error('JSON parse failed, raw text:', cleaned.slice(0, 500))
    throw new Error('AI 回傳格式異常，請再試一次')
  }

  // Basic validation
  if (!result.nodes || !result.edges || !result.mermaid) {
    throw new Error('Gemini 回傳的格式不正確')
  }

  return result
}
