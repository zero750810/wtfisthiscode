import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { analyzeRoute } from './routes/analyze'

interface Env {
  GEMINI_API_KEY: string
}

const app = new Hono<{ Bindings: Env }>()

app.use('/api/*', cors())
app.route('/api', analyzeRoute)

export default app
