<script setup lang="ts">
import type { SupportedLanguage } from '../types'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { go } from '@codemirror/lang-go'
import { java } from '@codemirror/lang-java'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { rust } from '@codemirror/lang-rust'
import { bracketMatching, syntaxHighlighting } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { oneDark, oneDarkHighlightStyle } from '@codemirror/theme-one-dark'
import { EditorView, keymap, lineNumbers, placeholder } from '@codemirror/view'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useAnalyzeStore } from '../stores/useAnalyze'

const store = useAnalyzeStore()
const editorRef = ref<HTMLDivElement>()
let view: EditorView | null = null

const LANGUAGE_EXTENSIONS: Record<string, () => ReturnType<typeof javascript>> = {
  javascript: () => javascript(),
  typescript: () => javascript({ typescript: true }),
  python: () => python(),
  java: () => java(),
  rust: () => rust(),
  go: () => go(),
  csharp: () => java(), // C# syntax is close enough to Java for highlighting
}

const LANGUAGE_PATTERNS: [RegExp, SupportedLanguage][] = [
  [/\b(fn\s+\w+|let\s+mut|impl\s+|pub\s+fn|->)\b/, 'rust'],
  [/\b(func\s+\w+|package\s+\w+|go\s+func|:=)\b/, 'go'],
  [/\b(def\s+\w+|import\s+\w+|from\s+\w+\s+import|print\s*\()\b/, 'python'],
  [/\b(class\s+\w.*\{|namespace\s+\w+|using\s+System)\b/, 'csharp'],
  [/\b(public\s+class|private\s+void|System\.out)\b/, 'java'],
  [/\b(interface\s+\w+|type\s+\w+\s*=|:\s*(string|number|boolean))\b/, 'typescript'],
  [/\b(const\s+\w+|let\s+\w+|function\s+\w+|=>|require\(|import\s+(?:\S.*)?from)\b/, 'javascript'],
]

function detectLanguage(code: string): SupportedLanguage {
  for (const [pattern, lang] of LANGUAGE_PATTERNS) {
    if (pattern.test(code))
      return lang
  }
  return 'javascript'
}

function getLanguageExtension(lang: string) {
  const factory = LANGUAGE_EXTENSIONS[lang]
  return factory ? factory() : javascript()
}

function createState(doc: string) {
  const detectedLang = store.language === 'auto' ? detectLanguage(doc) : store.language
  return EditorState.create({
    doc,
    extensions: [
      lineNumbers(),
      history(),
      bracketMatching(),
      syntaxHighlighting(oneDarkHighlightStyle),
      oneDark,
      getLanguageExtension(detectedLang),
      placeholder('// 在這裡貼上你的程式碼...'),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          store.code = update.state.doc.toString()
        }
      }),
      EditorView.theme({
        '&': { height: '100%', fontSize: '14px' },
        '.cm-scroller': { overflow: 'auto' },
        '.cm-content': { fontFamily: '\'JetBrains Mono\', monospace' },
      }),
    ],
  })
}

onMounted(() => {
  if (!editorRef.value)
    return
  view = new EditorView({
    state: createState(store.code),
    parent: editorRef.value,
  })
})

onUnmounted(() => {
  view?.destroy()
  view = null
})

// Re-create editor state when language changes to update syntax highlighting
watch(() => store.language, () => {
  if (!view)
    return
  const doc = view.state.doc.toString()
  view.setState(createState(doc))
})
</script>

<template>
  <div ref="editorRef" class="h-full w-full overflow-hidden rounded-lg border border-zinc-800" />
</template>
