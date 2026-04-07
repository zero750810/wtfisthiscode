<script setup lang="ts">
import mermaid from 'mermaid'
import { nextTick, onMounted, ref, watch } from 'vue'
import { useAnalyzeStore } from '../stores/useAnalyze'

const store = useAnalyzeStore()
const containerRef = ref<HTMLDivElement>()
const mermaidCode = ref('')
const showCode = ref(false)
const copied = ref(false)

onMounted(() => {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    darkMode: true,
    fontFamily: '\'JetBrains Mono\', monospace',
  })
})

watch(() => store.result?.mermaid, async (code) => {
  if (!code || !containerRef.value)
    return
  mermaidCode.value = code

  try {
    const { svg } = await mermaid.render('mermaid-diagram', code)
    await nextTick()
    if (containerRef.value) {
      containerRef.value.innerHTML = svg
    }
  }
  catch {
    if (containerRef.value) {
      containerRef.value.innerHTML = '<p class="text-red-400 p-4">Mermaid 語法解析失敗</p>'
    }
  }
})

async function copyMermaid() {
  if (!mermaidCode.value)
    return
  await navigator.clipboard.writeText(mermaidCode.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Toolbar -->
    <div class="flex items-center gap-2 border-b border-zinc-800 px-4 py-2">
      <button
        class="rounded px-3 py-1 text-sm transition-colors"
        :class="!showCode ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'"
        @click="showCode = false"
      >
        預覽
      </button>
      <button
        class="rounded px-3 py-1 text-sm transition-colors"
        :class="showCode ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'"
        @click="showCode = true"
      >
        Mermaid 語法
      </button>
      <div class="flex-1" />
      <button
        v-if="mermaidCode"
        class="rounded px-3 py-1 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        @click="copyMermaid"
      >
        {{ copied ? '已複製!' : '複製語法' }}
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-auto p-4">
      <!-- Mermaid rendered preview -->
      <div v-show="!showCode" ref="containerRef" class="flex items-center justify-center [&>svg]:max-w-full" />

      <!-- Mermaid source code -->
      <pre v-show="showCode" class="whitespace-pre-wrap rounded-lg bg-zinc-900 p-4 text-sm text-zinc-300">{{ mermaidCode }}</pre>

      <!-- Empty state -->
      <div v-if="!store.result && !store.loading" class="flex h-full items-center justify-center">
        <p class="text-zinc-500">
          貼上程式碼後按下「生成視覺化」，流程圖會出現在這裡
        </p>
      </div>

      <!-- Loading state -->
      <div v-if="store.loading" class="flex h-full flex-col items-center justify-center gap-4">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-400" />
        <p class="text-sm text-zinc-400">
          {{ store.loadingMessage }}
        </p>
      </div>
    </div>
  </div>
</template>
