<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import CodeEditor from './components/CodeEditor.vue'
import DiagramTypeSelector from './components/DiagramTypeSelector.vue'
import LanguageSelect from './components/LanguageSelect.vue'
import MermaidPreview from './components/MermaidPreview.vue'
import { useAnalyzeStore } from './stores/useAnalyze'

const store = useAnalyzeStore()
const { t, locale } = useI18n()
const showApiKeyInput = ref(false)

function toggleLocale() {
  const next = locale.value === 'zh-TW' ? 'en' : 'zh-TW'
  locale.value = next
  localStorage.setItem('locale', next)
}

function handleKeydown(e: KeyboardEvent) {
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
      <div class="flex items-center gap-3">
        <DiagramTypeSelector />

        <!-- Language toggle -->
        <button
          class="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          @click="toggleLocale"
        >
          {{ locale === 'zh-TW' ? 'EN' : '中文' }}
        </button>

        <!-- GitHub -->
        <a
          href="https://github.com/zero750810/wtfisthiscode"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-lg border border-zinc-700 p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          title="GitHub"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
          </svg>
        </a>

        <!-- API Key -->
        <div class="relative">
          <button
            class="rounded-lg border px-3 py-1.5 text-sm transition-colors"
            :class="store.apiKey
              ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
              : 'border-red-500/30 text-red-400 hover:bg-red-500/10'"
            @click="showApiKeyInput = !showApiKeyInput"
          >
            {{ store.apiKey ? t('header.apiKeySet') : t('header.apiKeyMissing') }}
          </button>
          <div
            v-if="showApiKeyInput"
            class="absolute right-0 top-full z-10 mt-2 w-80 rounded-lg border border-zinc-700 bg-zinc-900 p-3 shadow-xl"
          >
            <label class="mb-1.5 block text-xs text-zinc-400">{{ t('header.apiKeyLabel') }}</label>
            <input
              type="password"
              :value="store.apiKey"
              :placeholder="t('header.apiKeyPlaceholder')"
              class="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-500"
              @input="store.saveApiKey(($event.target as HTMLInputElement).value)"
            >
            <p class="mt-1.5 text-xs text-zinc-500">
              {{ t('header.apiKeyHint') }}
            </p>
          </div>
        </div>
      </div>
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
            {{ store.loading ? t('editor.generating') : t('editor.generate') }}
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
      {{ t('footer.generate') }}
    </footer>
  </div>
</template>
