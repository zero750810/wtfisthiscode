import { Hono } from 'hono'
import { analyzeCode } from '../services/gemini'

interface Env {
  GEMINI_API_KEY: string
}

export const analyzeRoute = new Hono<{ Bindings: Env }>()

const MAX_CODE_LENGTH = 10000
const VALID_LANGUAGES = ['auto', 'javascript', 'typescript', 'python', 'go', 'rust', 'java', 'csharp']
const VALID_DIAGRAM_TYPES = ['flow', 'callgraph', 'dataflow', 'structure']
const VALID_MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemma-4-31b-it', 'gemma-4-26b-a4b-it']

analyzeRoute.post('/analyze', async (c) => {
  const body = await c.req.json<{
    code: string
    language: string
    diagramType: string
    model: string
  }>()

  // Input validation
  if (!body.code || typeof body.code !== 'string') {
    return c.json({ error: '請提供程式碼' }, 400)
  }

  if (body.code.trim().length < 10) {
    return c.json({ error: '程式碼太短，至少需要 10 個字元' }, 400)
  }

  if (body.code.length > MAX_CODE_LENGTH) {
    return c.json({ error: `程式碼太長，上限為 ${MAX_CODE_LENGTH} 個字元` }, 400)
  }

  const language = VALID_LANGUAGES.includes(body.language) ? body.language : 'auto'
  const diagramType = VALID_DIAGRAM_TYPES.includes(body.diagramType) ? body.diagramType : 'flow'
  const model = VALID_MODELS.includes(body.model) ? body.model : 'gemini-2.5-flash'

  const apiKey = c.req.header('X-API-Key') || c.env.GEMINI_API_KEY
  if (!apiKey) {
    return c.json({ error: '缺少 API Key' }, 401)
  }

  try {
    const result = await analyzeCode({
      code: body.code,
      language,
      diagramType,
      apiKey,
      model,
    })

    return c.json(result)
  }
  catch (e) {
    console.error('Analyze error:', e)
    const message = e instanceof Error ? e.message : '分析失敗，請稍後再試'
    return c.json({ error: message }, 500)
  }
})
