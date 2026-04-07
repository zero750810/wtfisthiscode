import type { AnalysisResult, DiagramType, SupportedLanguage } from '../types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

const LOADING_MESSAGES = [
  '正在解讀這坨義大利麵...',
  '天啊，誰寫的...',
  '正在試著理解你同事的傑作...',
  '這個 nested if 有幾層啊...',
  '找到 17 個 TODO，0 個 DONE...',
  '正在追蹤變數去了哪裡...',
  '這個 callback hell 有點深...',
  '正在翻譯工程師的藝術品...',
]

export const useAnalyzeStore = defineStore('analyze', () => {
  const code = ref('')
  const language = ref<SupportedLanguage | 'auto'>('auto')
  const diagramType = ref<DiagramType>('flow')
  const result = ref<AnalysisResult | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loadingMessage = ref('')

  let messageInterval: ReturnType<typeof setInterval> | null = null

  function startLoadingMessages() {
    loadingMessage.value = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
    messageInterval = setInterval(() => {
      loadingMessage.value = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
    }, 2500)
  }

  function stopLoadingMessages() {
    if (messageInterval) {
      clearInterval(messageInterval)
      messageInterval = null
    }
    loadingMessage.value = ''
  }

  async function analyze() {
    if (!code.value.trim()) {
      error.value = '請先貼上程式碼'
      return
    }

    loading.value = true
    error.value = null
    result.value = null
    startLoadingMessages()

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.value,
          language: language.value,
          diagramType: diagramType.value,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: '分析失敗，請稍後再試' }))
        throw new Error((data as { error: string }).error || `HTTP ${res.status}`)
      }

      result.value = await res.json() as AnalysisResult
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : '未知錯誤'
    }
    finally {
      loading.value = false
      stopLoadingMessages()
    }
  }

  return {
    code,
    language,
    diagramType,
    result,
    loading,
    error,
    loadingMessage,
    analyze,
  }
})
