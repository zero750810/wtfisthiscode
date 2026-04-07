<script setup lang="ts">
import mermaid from 'mermaid'
import { nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAnalyzeStore } from '../stores/useAnalyze'

const store = useAnalyzeStore()
const { t } = useI18n()
const containerRef = ref<HTMLDivElement>()
const mermaidCode = ref('')
const showCode = ref(false)
const copied = ref(false)
const renderError = ref('')
let renderCount = 0

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
  renderError.value = ''

  try {
    const id = `mermaid-diagram-${++renderCount}`
    const { svg } = await mermaid.render(id, code)
    await nextTick()
    if (containerRef.value) {
      containerRef.value.innerHTML = svg
      // Make SVG fill the container and be scrollable
      const svgEl = containerRef.value.querySelector('svg')
      if (svgEl) {
        svgEl.removeAttribute('height')
        svgEl.style.maxWidth = '100%'
        svgEl.style.height = 'auto'
        svgEl.style.minHeight = '300px'
      }
    }
  }
  catch (e) {
    console.error('Mermaid render error:', e)
    renderError.value = e instanceof Error ? e.message : String(e)
    showCode.value = true
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
        {{ t('preview.preview') }}
      </button>
      <button
        class="rounded px-3 py-1 text-sm transition-colors"
        :class="showCode ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'"
        @click="showCode = true"
      >
        {{ t('preview.mermaidSyntax') }}
      </button>
      <div class="flex-1" />
      <button
        v-if="mermaidCode"
        class="rounded px-3 py-1 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        @click="copyMermaid"
      >
        {{ copied ? t('preview.copied') : t('preview.copySyntax') }}
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-auto p-4">
      <!-- Mermaid rendered preview -->
      <div v-show="!showCode" ref="containerRef" class="flex items-start justify-center" />

      <!-- Mermaid source code -->
      <div v-show="showCode">
        <p v-if="renderError" class="mb-3 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {{ t('preview.renderError') }}：{{ renderError }}
        </p>
        <pre class="whitespace-pre-wrap rounded-lg bg-zinc-900 p-4 text-sm text-zinc-300">{{ mermaidCode }}</pre>
      </div>

      <!-- Empty state -->
      <div v-if="!store.result && !store.loading" class="flex h-full items-center justify-center">
        <p class="text-zinc-500">
          {{ t('preview.emptyHint') }}
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
