<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import CodeEditor from './components/CodeEditor.vue'
import DiagramTypeSelector from './components/DiagramTypeSelector.vue'
import LanguageSelect from './components/LanguageSelect.vue'
import MermaidPreview from './components/MermaidPreview.vue'
import { useAnalyzeStore } from './stores/useAnalyze'

const store = useAnalyzeStore()

function handleKeydown(e: KeyboardEvent) {
  // Ctrl+Enter or Cmd+Enter to analyze
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    store.analyze()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="flex h-screen flex-col">
    <!-- Header -->
    <header class="flex items-center justify-between border-b border-zinc-800 px-6 py-3">
      <div class="flex items-center gap-3">
        <h1 class="text-lg font-bold tracking-tight">
          <span class="text-zinc-400">WTF is this</span>
          <span class="text-emerald-400"> code</span>
          <span class="text-zinc-600">?</span>
        </h1>
      </div>
      <DiagramTypeSelector />
    </header>

    <!-- Main content -->
    <main class="flex flex-1 overflow-hidden">
      <!-- Left panel: Code Editor -->
      <div class="flex w-1/2 flex-col border-r border-zinc-800">
        <div class="flex-1 overflow-hidden p-4">
          <CodeEditor />
        </div>
        <div class="flex items-center gap-3 border-t border-zinc-800 px-4 py-3">
          <button
            class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="store.loading || !store.code.trim()"
            @click="store.analyze()"
          >
            {{ store.loading ? '分析中...' : '生成視覺化' }}
          </button>
          <LanguageSelect />
          <p v-if="store.error" class="text-sm text-red-400">
            {{ store.error }}
          </p>
        </div>
      </div>

      <!-- Right panel: Mermaid Preview -->
      <div class="w-1/2">
        <MermaidPreview />
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-zinc-800 px-6 py-2 text-center text-xs text-zinc-600">
      <kbd class="rounded border border-zinc-700 px-1.5 py-0.5 text-zinc-500">Ctrl+Enter</kbd>
      生成
    </footer>
  </div>
</template>
