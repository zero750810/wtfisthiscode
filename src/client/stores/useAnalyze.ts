import type { AnalysisResult, DiagramType, SupportedLanguage, SupportedModel } from '../types'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { generateMermaid } from '../utils/mermaidGenerator'

export const useAnalyzeStore = defineStore('analyze', () => {
  const { t, tm } = useI18n()
  const code = ref('')
  const language = ref<SupportedLanguage | 'auto'>('auto')
  const diagramType = ref<DiagramType>('flow')
  const result = ref<AnalysisResult | null>(null)
  const mermaidCode = ref('')
  const loading = ref(false)
  const elapsed = ref(0)
  const error = ref<string | null>(null)
  const loadingMessage = ref('')
  const apiKey = ref(localStorage.getItem('gemini-api-key') ?? '')
  const model = ref<SupportedModel>((localStorage.getItem('ai-model') as SupportedModel) || 'gemini-2.5-flash')

  function saveModel(m: SupportedModel) {
    model.value = m
    localStorage.setItem('ai-model', m)
  }

  let messageInterval: ReturnType<typeof setInterval> | null = null

  function pickLoadingMessage() {
    const messages = tm('loading.messages') as string[]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  function startLoadingMessages() {
    loadingMessage.value = pickLoadingMessage()
    messageInterval = setInterval(() => {
      loadingMessage.value = pickLoadingMessage()
    }, 2500)
  }

  function stopLoadingMessages() {
    if (messageInterval) {
      clearInterval(messageInterval)
      messageInterval = null
    }
    loadingMessage.value = ''
  }

  function saveApiKey(key: string) {
    apiKey.value = key
    if (key) {
      localStorage.setItem('gemini-api-key', key)
    }
    else {
      localStorage.removeItem('gemini-api-key')
    }
  }

  async function analyze() {
    if (!code.value.trim()) {
      error.value = t('editor.pasteFirst')
      return
    }

    if (!apiKey.value.trim()) {
      error.value = t('editor.apiKeyRequired')
      return
    }

    loading.value = true
    error.value = null
    result.value = null
    mermaidCode.value = ''
    elapsed.value = 0
    startLoadingMessages()

    const startTime = Date.now()

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey.value.trim(),
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          code: code.value,
          language: language.value,
          diagramType: diagramType.value,
          model: model.value,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: '分析失敗，請稍後再試' }))
        throw new Error((data as { error: string }).error || `HTTP ${res.status}`)
      }

      const data = await res.json() as AnalysisResult
      result.value = data
      mermaidCode.value = generateMermaid(data.nodes, data.edges, diagramType.value)
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : '未知錯誤'
    }
    finally {
      elapsed.value = ((Date.now() - startTime) / 1000)
      loading.value = false
      stopLoadingMessages()
    }
  }

  return {
    code,
    language,
    diagramType,
    result,
    mermaidCode,
    loading,
    elapsed,
    error,
    loadingMessage,
    apiKey,
    model,
    saveApiKey,
    saveModel,
    analyze,
  }
})
