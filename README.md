<div align="center">

# WTF is this code?

**Paste code, get instant visual flowcharts.**

**貼上程式碼，秒出視覺化流程圖。**

[Live Demo](https://wtfisthiscode.zero0810.workers.dev) | [Report Bug](https://github.com/zero750810/wtfisthiscode/issues)

</div>

---

## What is this? / 這是什麼？

**EN** — WTF is this code is an AI-powered code visualization tool. Paste any code snippet, and it instantly generates interactive flowcharts and portable Mermaid syntax to help you (and your teammates) understand what the code actually does.

**中文** — WTF is this code 是一個 AI 驅動的程式碼視覺化工具。貼上任何一段程式碼，AI 自動產生互動式流程圖與可攜帶的 Mermaid 語法，幫你（和你的同事）秒懂這段 code 在幹嘛。

## Features / 功能

- **Multi-language support / 多語言支援** — JavaScript, TypeScript, Python, Go, Rust, Java, C#
- **Auto language detection / 自動語言偵測** — No need to specify, we figure it out
- **4 diagram types / 四種圖表模式** — Flow, Call Graph, Data Flow, Structure
- **Dual output / 雙輸出** — Visual preview + copyable Mermaid syntax
- **BYOK (Bring Your Own Key) / 自帶 API Key** — Your Gemini API key stays in your browser, never touches our server
- **Bilingual UI / 中英雙語介面** — Toggle between 繁體中文 and English
- **Dark theme / 深色主題** — Easy on the eyes, built for developers

## Tech Stack / 技術棧

| Layer | Tech |
|-------|------|
| Frontend | Vue 3 + TypeScript + Vite + Tailwind CSS |
| Editor | CodeMirror 6 |
| Visualization | Mermaid.js |
| Backend | Hono on Cloudflare Workers |
| AI | Gemini 2.5 Flash API |
| Hosting | Cloudflare Workers + Static Assets |

## Getting Started / 快速開始

### Prerequisites / 前置條件

- Node.js >= 18
- A [Gemini API Key](https://aistudio.google.com/apikey) (free tier available)

### Setup / 安裝

```bash
git clone https://github.com/zero750810/wtfisthiscode.git
cd wtfisthiscode
npm install
```

### Development / 開發

```bash
npm run dev
```

This starts both the Vite dev server (port 5173) and Wrangler (port 8787) concurrently. Open `http://localhost:5173` in your browser.

前後端會同時啟動。開啟 `http://localhost:5173` 即可使用。

### Build / 建構

```bash
npm run build
```

### Deploy / 部署

```bash
npx wrangler deploy
```

## Usage / 使用方式

1. Open the app and enter your Gemini API Key (click the "API Key" button in the header)
2. Paste your code in the left panel
3. Click "Visualize" (or press `Ctrl+Enter`)
4. View the generated flowchart on the right panel
5. Switch between Preview and Mermaid Syntax tabs
6. Copy the Mermaid syntax to use in your docs, READMEs, or wikis

---

1. 開啟應用程式，點擊右上角「API Key」按鈕輸入你的 Gemini API Key
2. 在左側面板貼上程式碼
3. 點擊「生成視覺化」（或按 `Ctrl+Enter`）
4. 在右側面板查看生成的流程圖
5. 切換「預覽」和「Mermaid 語法」分頁
6. 複製 Mermaid 語法，貼到你的文件、README 或 wiki 中使用

## Keyboard Shortcuts / 快捷鍵

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` / `Cmd+Enter` | Generate visualization / 生成視覺化 |

## Project Structure / 專案結構

```
src/
├── client/                 # Vue 3 Frontend
│   ├── components/         # UI Components
│   ├── i18n/               # i18n locale files (zh-TW, en)
│   ├── stores/             # Pinia stores
│   ├── styles/             # Global styles
│   └── types/              # TypeScript type definitions
└── server/                 # Hono Backend (Cloudflare Workers)
    ├── routes/             # API routes
    └── services/           # Gemini API integration
```

## Contributing / 貢獻

Contributions are welcome! Feel free to open issues or submit pull requests.

歡迎貢獻！請隨時開 issue 或提交 pull request。

## License / 授權

[MIT](LICENSE)

---

<div align="center">

Made with frustration towards unreadable code.

對看不懂的程式碼感到崩潰而生。

</div>
