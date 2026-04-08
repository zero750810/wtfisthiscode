interface AnalyzeParams {
  code: string
  language: string
  diagramType: string
  apiKey: string
  model: string
}

const THINKING_MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro']
const JSON_MODE_MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash']
const GEMMA_MODELS = ['gemma-4-31b-it', 'gemma-4-26b-a4b-it']

interface AnalysisResult {
  nodes: {
    id: string
    label: string
    type: string
  }[]
  edges: {
    from: string
    to: string
    label?: string
  }[]
}

const DIAGRAM_TYPE_PROMPTS: Record<string, string> = {
  flow: '程式的執行流程，包含條件分支、迴圈和錯誤處理',
  callgraph: '函式之間的呼叫關係，誰呼叫了誰',
  dataflow: '變數和資料如何在函式之間傳遞和轉換',
  structure: 'class、module 或主要結構之間的關係',
}

function buildPrompt(params: AnalyzeParams): string {
  const diagramDesc = DIAGRAM_TYPE_PROMPTS[params.diagramType] || DIAGRAM_TYPE_PROMPTS.flow
  const lang = params.language === 'auto' ? '自動偵測' : params.language
  const supportsJsonMode = JSON_MODE_MODELS.includes(params.model)
  const isGemma = GEMMA_MODELS.includes(params.model)

  const jsonEnforcement = supportsJsonMode
    ? ''
    : `

嚴格要求：你的回應必須是且僅是一個 JSON 物件。
- 不要輸出任何思考過程、解釋、或 markdown
- 不要在 JSON 前後加任何文字
- 第一個字元必須是 {，最後一個字元必須是 }
- 直接輸出 JSON，不要用 \`\`\` 包裹`

  const thinkToken = isGemma ? '<|think|>\n\n' : ''

  return `${thinkToken}你是一個程式碼分析專家。分析以下程式碼，產出結構化的 JSON。${jsonEnforcement}

程式語言：${lang}
視覺化類型：${params.diagramType}（${diagramDesc}）

程式碼：
\`\`\`
${params.code}
\`\`\`

回傳 JSON（不要包含其他文字）：
{"nodes":[{"id":"英文id","label":"簡短名稱","type":"function|condition|loop|error_handling|return|variable"}],"edges":[{"from":"id1","to":"id2","label":"可選說明"}]}

規則：id 用英文底線，label 可中文，edges 的 from/to 必須對應 nodes 的 id，id 禁用 end/subgraph/graph/flowchart`
}

const MD_BLOCK_START = /^```(?:json)?\s*/i
const MD_BLOCK_END = /\n?```\s*$/

export async function analyzeCode(params: AnalyzeParams): Promise<AnalysisResult> {
  const prompt = buildPrompt(params)

  const isThinkingModel = THINKING_MODELS.includes(params.model)
  const supportsJsonMode = JSON_MODE_MODELS.includes(params.model)

  const isGemmaModel = GEMMA_MODELS.includes(params.model)
  // Gemma may still think despite disable token — give it room
  const maxTokens = (isThinkingModel || isGemmaModel) ? 16384 : 4096

  const generationConfig: Record<string, unknown> = {
    temperature: 0,
    maxOutputTokens: maxTokens,
  }

  if (supportsJsonMode) {
    generationConfig.responseMimeType = 'application/json'
  }

  if (isThinkingModel) {
    generationConfig.thinkingConfig = { thinkingBudget: 4096 }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 120000)

  let res: Response
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent?key=${params.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig,
        }),
        signal: controller.signal,
      },
    )
  }
  catch (e) {
    clearTimeout(timeout)
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new Error('AI 回應超時（>120秒），請換一個更快的模型')
    }
    throw e
  }
  finally {
    clearTimeout(timeout)
  }

  if (!res.ok) {
    const errorText = await res.text()
    console.error('Gemini API error:', res.status, errorText)
    if (res.status === 429) {
      throw new Error('API 呼叫次數已達上限，請稍後再試')
    }
    if (res.status === 400) {
      throw new Error(`模型 ${params.model} 不支援此請求，請換一個模型試試`)
    }
    throw new Error(`API 錯誤 (${res.status})，請確認 API Key 和模型是否正確`)
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

  const parts = candidate?.content?.parts ?? []
  // Always filter out thought parts — both Gemini thinking models and Gemma may produce them
  const text = parts
    .filter(p => !p.thought && p.text)
    .map(p => p.text)
    .join('')

  if (!text) {
    console.error('No text in response. Parts:', JSON.stringify(parts.map(p => ({ thought: p.thought, textLen: p.text?.length }))))
    throw new Error('AI 未回傳有效內容')
  }

  console.error('Raw response (first 300):', text.slice(0, 300))

  let cleaned = text
    .replace(MD_BLOCK_START, '')
    .replace(MD_BLOCK_END, '')
    .trim()

  const jsonStart = cleaned.indexOf('{"')
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

  if (!result.nodes || !result.edges) {
    throw new Error('AI 回傳的格式不正確')
  }

  return result
}
