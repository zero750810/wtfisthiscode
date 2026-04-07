<script setup lang="ts">
import type { DiagramType } from '../types'
import { useAnalyzeStore } from '../stores/useAnalyze'

const store = useAnalyzeStore()

const TYPES: { value: DiagramType, label: string }[] = [
  { value: 'flow', label: 'Flow' },
  { value: 'callgraph', label: 'Call' },
  { value: 'dataflow', label: 'Data' },
  { value: 'structure', label: 'Struct' },
]
</script>

<template>
  <div class="flex gap-1">
    <button
      v-for="t in TYPES"
      :key="t.value"
      class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
      :class="store.diagramType === t.value
        ? 'bg-emerald-500/20 text-emerald-400'
        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'"
      @click="store.diagramType = t.value"
    >
      {{ t.label }}
    </button>
  </div>
</template>
