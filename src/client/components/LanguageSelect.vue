<script setup lang="ts">
import { useAnalyzeStore } from '../stores/useAnalyze'

const store = useAnalyzeStore()

const LANGUAGES = [
  { value: 'auto', label: '自動偵測' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
] as const
</script>

<template>
  <select
    v-model="store.language"
    class="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300 outline-none transition-colors focus:border-emerald-500"
  >
    <option v-for="lang in LANGUAGES" :key="lang.value" :value="lang.value">
      {{ lang.label }}
    </option>
  </select>
</template>
