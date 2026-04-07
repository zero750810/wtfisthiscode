# WTF is this code — MLP 產品規劃文件

> **「WTF is this code?」— 貼程式碼，秒出視覺化流程圖**

---

## 一、產品定位

### 一句話描述
WTF is this code 讓你貼上任何一段程式碼，AI 自動產生互動式流程圖與可攜帶的 Mermaid 語法，幫你（和你的同事）秒懂這段 code 在幹嘛。

### 為什麼是 MLP 而不是 MVP
MVP 只要「能用」，MLP 要「讓人想分享」。我們的目標是讓開發者第一次用就截圖發到社群。

### 目標使用者
- 接手別人專案的工程師（「這到底在寫什麼」）
- Code Review 時想快速理解邏輯的人
- 寫技術文件需要流程圖的人
- 學習新語言/框架時想視覺化理解的新手

### 競品分析
| 工具 | 做法 | 缺什麼 |
|------|------|--------|
| ChatGPT / Claude | 文字解釋程式碼 | 沒有視覺化 |
| Mermaid Live Editor | 手寫語法畫圖 | 要自己寫語法 |
| Code2Flow | 簡易流程圖 | 不支援多語言、圖醜、沒 AI |
| GitHub Copilot | 行內解釋 | 沒有全局視覺化 |

**WTF is this code 的差異化：AI 理解 + 雙引擎視覺化（D3.js 互動圖 + Mermaid 可攜帶語法）**

---

## 二、核心功能（MLP Scope）

### 🎯 Must Have（上線前必須完成）

#### 1. 程式碼輸入
- 左側程式碼編輯器（使用 CodeMirror 或 Monaco Editor）
- 自動偵測程式語言（支援 JS/TS、Python、Go、Rust、Java、C#）
- 支援貼上程式碼片段（不需要完整檔案）
- 範例程式碼按鈕（讓新使用者一鍵體驗）

#### 2. AI 分析引擎
- 呼叫 Gemini API 分析程式碼結構
- 產出結構化 JSON（函式呼叫關係、控制流、資料流）
- Prompt Engineering 確保輸出格式穩定
- 錯誤處理：程式碼太短、語法錯誤、超出 token 限制

#### 3. 雙引擎視覺化
**D3.js 互動圖（預設顯示）**
- 函式呼叫流程圖（節點 = 函式/區塊，邊 = 呼叫關係）
- 節點可拖拉移動
- Hover 顯示該區塊的程式碼片段
- 點擊節點 → 左側編輯器高亮對應程式碼
- 縮放和平移
- 依據節點類型上色（函式、條件、迴圈、錯誤處理）
- 動畫：節點逐步出現，像在「畫」出流程

**Mermaid 語法（一鍵切換）**
- 產出可直接使用的 Mermaid 語法
- 即時預覽 Mermaid 渲染結果
- 一鍵複製語法
- 支援 flowchart / sequence diagram / class diagram 三種圖

#### 4. 多種視覺化模式
使用者可選擇想看的圖表類型：
- **Flow（流程圖）**：程式的執行流程，包含條件分支和迴圈
- **Call Graph（呼叫圖）**：函式之間誰呼叫誰
- **Data Flow（資料流）**：變數和資料怎麼在函式之間傳遞
- **Structure（結構圖）**：class/module 之間的關係

#### 5. 匯出功能
- 複製 Mermaid 語法
- 下載 SVG 圖檔
- 下載 PNG 圖檔
- 分享連結（儲存到 Cloudflare KV，產生短網址）

#### 6. 雙語介面
- 繁體中文 / English 切換
- 使用 Vue I18n
- AI 產出的說明文字也根據語言切換

### ✨ Lovable 細節（讓人想分享的關鍵）

#### 視覺體驗
- 程式碼 → 圖表的生成過程有流暢動畫（不是突然跳出來）
- 深色主題為預設（開發者友善）
- 節點設計精緻，不是預設方塊
- 程式碼編輯器和圖表之間的連動高亮（點圖 ↔ 亮 code）

#### 互動體驗
- 打開網站就有一段範例程式碼 + 已生成的圖，零等待體驗產品
- 載入中的動畫有趣，隨機顯示吐槽語句，例如：
  - 「正在解讀這坨義大利麵...」
  - 「天啊，誰寫的...」
  - 「正在試著理解你同事的傑作...」
  - 「這個 nested if 有幾層啊...」
  - 「找到 17 個 TODO，0 個 DONE...」
- 圖表生成後有一個微妙的「完成」音效或動畫
- 鍵盤快捷鍵（Ctrl+Enter 生成、Ctrl+M 切換 Mermaid）

#### 社群傳播
- 「Share」按鈕生成含預覽圖的 OG meta（貼到 Twitter/社群自動展開圖片）
- 圖表右下角有小小的 wtfisthiscode.dev 浮水印（免費版）

---

## 三、技術架構

```
┌─────────────────────────────────────────────┐
│                   Frontend                   │
│           Vue 3 + TypeScript + Vite          │
│                                              │
│  ┌──────────┐  ┌───────────┐  ┌───────────┐ │
│  │CodeMirror│  │  D3.js    │  │ Mermaid.js│ │
│  │ Editor   │  │  Canvas   │  │  Preview  │ │
│  └──────────┘  └───────────┘  └───────────┘ │
│                                              │
│  Vue I18n (zh-TW / en)                       │
│  Pinia (State Management)                    │
└──────────────┬──────────────────────────────┘
               │ fetch API
               ▼
┌─────────────────────────────────────────────┐
│            Cloudflare Workers                │
│                                              │
│  ┌──────────────┐  ┌─────────────────────┐  │
│  │ /api/analyze  │  │ /api/share          │  │
│  │              │  │                     │  │
│  │ • 驗證輸入    │  │ • 存到 KV           │  │
│  │ • 呼叫 Gemini │  │ • 產生短網址         │  │
│  │ • 格式化回傳  │  │ • 讀取分享內容       │  │
│  └──────────────┘  └─────────────────────┘  │
│                                              │
│  Rate Limiting（防濫用）                      │
│  Cloudflare KV（分享連結儲存）                 │
│  Cloudflare D1（使用統計，可選）               │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│         Gemini API (Free Tier)               │
│                                              │
│  Model: gemini-2.5-flash                     │
│  用途: 分析程式碼結構，產出結構化 JSON         │
│  限制: 15 RPM / 1,000 RPD                    │
└─────────────────────────────────────────────┘
```

### 前端技術選擇

| 用途 | 技術 | 理由 |
|------|------|------|
| 框架 | Vue 3 + Composition API | 你的主力技術 |
| 語言 | TypeScript | 型別安全 |
| 建構 | Vite | 快 |
| 程式碼編輯器 | CodeMirror 6 | 輕量、支援多語言高亮 |
| 互動圖表 | D3.js | 最大彈性 |
| Mermaid 渲染 | mermaid.js | 原生支援 |
| 狀態管理 | Pinia | Vue 3 標配 |
| 國際化 | Vue I18n | 中英切換 |
| 樣式 | UnoCSS 或 Tailwind | 快速開發 |
| 部署 | Cloudflare Pages | 免費、快 |

### 後端技術選擇

| 用途 | 技術 | 理由 |
|------|------|------|
| API | Cloudflare Workers | 免費額度大、全球邊緣 |
| 儲存 | Cloudflare KV | 存分享連結、簡單快速 |
| AI | Gemini API (Free) | 零成本 |
| Rate Limiting | Workers 內建邏輯 | 防止免費額度被刷爆 |

---

## 四、AI Prompt 設計

### 核心 Prompt 結構

```
你是一個程式碼分析專家。分析以下程式碼，產出結構化的 JSON。

程式語言：{language}
視覺化類型：{type} (flow / callgraph / dataflow / structure)

程式碼：
\`\`\`
{code}
\`\`\`

請回傳以下 JSON 格式（不要包含任何其他文字）：
{
  "title": "這段程式碼的一句話摘要",
  "description": "2-3 句更詳細的說明",
  "nodes": [
    {
      "id": "unique_id",
      "label": "節點名稱",
      "type": "function | condition | loop | error_handling | return | variable",
      "code_snippet": "對應的原始碼片段",
      "line_start": 1,
      "line_end": 5
    }
  ],
  "edges": [
    {
      "from": "node_id_1",
      "to": "node_id_2",
      "label": "關係描述（可選）",
      "type": "call | condition_true | condition_false | data | next"
    }
  ],
  "mermaid": "完整的 Mermaid 語法字串"
}
```

### Prompt 最佳化策略
- 為每種視覺化類型設計專用 prompt
- 加入 few-shot examples 確保輸出格式穩定
- 設定 temperature = 0 確保一致性
- 大段程式碼先做摘要再分析，避免超出 token 限制

---

## 五、頁面結構與 UI

### 首頁（也是主功能頁）

```
┌─────────────────────────────────────────────────────────┐
│  💀 wtfisthiscode          [Flow] [Call] [Data] [Struct]  EN│ZH│
├────────────────────────┬────────────────────────────────┤
│                        │                                │
│   ┌──────────────┐     │     ┌──────────────────────┐   │
│   │              │     │     │                      │   │
│   │  Code Editor │     │     │    D3.js 互動圖表     │   │
│   │              │     │     │                      │   │
│   │  (CodeMirror)│     │     │    or                │   │
│   │              │     │     │                      │   │
│   │              │     │     │    Mermaid 預覽       │   │
│   │              │     │     │                      │   │
│   │              │     │     │                      │   │
│   └──────────────┘     │     └──────────────────────┘   │
│                        │                                │
│   [▶ 生成視覺化]        │  [D3.js | Mermaid] [複製] [↓]  │
│   [語言: auto-detect]   │                                │
├────────────────────────┴────────────────────────────────┤
│  ⌨️ Ctrl+Enter 生成 · Ctrl+M 切換 Mermaid · 開源於 GitHub │
└─────────────────────────────────────────────────────────┘
```

### 設計方向
- **主題**：深色系為主，帶有「開發者工具」的調性
- **色彩**：深灰底 + 螢光綠/藍作為重點色（像終端機的感覺）
- **字體**：程式碼用 JetBrains Mono，UI 文字用 Noto Sans TC + 英文無襯線
- **風格**：介於 GitHub Dark 和 Vercel Dashboard 之間——乾淨但有個性
- **動畫**：圖表生成時節點「生長」出來的動畫，不是瞬間出現

---

## 六、開發路線圖

### Phase 1：核心骨架（Week 1-2）
- [ ] 專案初始化（Vue 3 + Vite + TypeScript）
- [ ] CodeMirror 6 編輯器整合 + 語言自動偵測
- [ ] Cloudflare Workers API 骨架
- [ ] Gemini API 串接 + Prompt 設計
- [ ] 基本 JSON 解析和錯誤處理
- [ ] 基本 Mermaid 渲染（先做最簡單的視覺化確認 pipeline 通了）

### Phase 2：D3.js 視覺化（Week 3-4）
- [ ] D3.js force-directed graph 基礎實作
- [ ] 節點類型上色和圖示
- [ ] 拖拉、縮放、平移
- [ ] Hover 顯示程式碼片段
- [ ] 點擊節點 ↔ 編輯器高亮連動
- [ ] 節點生成動畫

### Phase 3：Lovable 體驗（Week 5-6）
- [ ] 深色主題 UI 精修
- [ ] 首頁範例程式碼（開箱即有圖）
- [ ] 載入動畫和完成動畫
- [ ] 四種視覺化模式切換
- [ ] Mermaid 語法一鍵複製
- [ ] SVG / PNG 匯出
- [ ] 鍵盤快捷鍵

### Phase 4：分享與國際化（Week 7-8）
- [ ] Cloudflare KV 分享連結
- [ ] OG Meta 預覽圖（用 Workers 動態生成）
- [ ] Vue I18n 雙語切換
- [ ] Rate Limiting 實作
- [ ] 行動裝置響應式（至少可以看圖，不用在手機上編輯）

### Phase 5：發佈與推廣
- [ ] Landing Page 文案
- [ ] README + 開源到 GitHub
- [ ] 寫一篇技術文章（如何用 Gemini API + D3.js 做程式碼視覺化）
- [ ] 發到 Hacker News、Reddit r/webdev、Dev.to、PTT Soft_Job
- [ ] 發到 Twitter / X 附上 demo 動圖

---

## 七、成本估算

| 項目 | 費用 |
|------|------|
| Gemini API | $0（免費額度） |
| Cloudflare Pages | $0（免費方案） |
| Cloudflare Workers | $0（每天 100,000 次請求免費） |
| Cloudflare KV | $0（免費方案含 100,000 次讀/天） |
| 域名（如 wtfisthiscode.dev） | ~$12/年 |
| **總計** | **~$12/年** |

---

## 八、成功指標

### 產品面
- 首次使用者從貼上程式碼到看到圖 < 5 秒
- 圖表正確率 > 80%（AI 不會每次都完美，但大方向要對）
- 至少支援 6 種程式語言

### 推廣面
- GitHub Star > 100（第一個月）
- 技術文章獲得 > 50 個 claps/likes
- 被至少一個開發者社群/電子報提到

### 履歷面
- 能在面試中花 5 分鐘展示完整 demo
- 涵蓋的技術關鍵字：Vue 3, TypeScript, D3.js, Cloudflare Workers, AI/LLM Integration, Prompt Engineering, i18n

---

## 九、未來擴展方向（MLP 之後）

- VS Code 擴充功能版本
- GitHub App（PR 自動生成流程圖）
- 支援上傳整個 repo（不只是片段）
- 使用者帳號 + 歷史紀錄
- 團隊協作（多人看同一張圖）
- 更多圖表類型（sequence diagram、state machine）
- 付費方案（更高 API 限制、私有分享、去浮水印）
