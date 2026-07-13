# 🚀 RepoPilot AI

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Mermaid.js](https://img.shields.io/badge/Mermaid.js-FF3670?style=for-the-badge&logo=mermaid&logoColor=white)

**RepoPilot AI** is an intelligent AI-powered system that analyzes complex codebases, builds interactive architecture graphs, and allows you to chat dynamically with your repository context to answer your deepest code questions.

## 🎯 The Problem & Solution

**Problem:** Developers waste countless hours trying to understand unfamiliar repositories, navigating complex dependency chains, and making sense of undocumented architectures.

**Solution:** RepoPilot AI automates codebase comprehension. By cloning repositories, parsing Abstract Syntax Trees (ASTs) on-the-fly, and utilizing Retrieval-Augmented Generation (RAG), it delivers accurate, deep-context insights and beautiful interactive architectural diagrams.

## ✨ Core Features

- 🧠 **Automated Static Analysis:** Leverages `@babel/parser` to securely scan codebases, generate abstract syntax trees, and dynamically map out dependencies without executing untrusted code.
- 📊 **Interactive Architecture Visualization:** Dynamically converts complex file relationships into interactive and clear **Mermaid.js** architecture graphs.
- 💬 **Deep-Context AI Chat:** Built with the **Vercel AI SDK** and **OpenRouter**, the built-in AI understands your architecture and allows you to ask targeted questions about any module.
- 📂 **Dynamic File Previews:** Click on any node in the architecture graph to instantly view the file's raw source code with high-fidelity syntax highlighting.
- ⚡ **Ephemeral Server-Side Caching:** Efficiently clones and maps repositories using `simple-git` into localized temporary storage (`os.tmpdir()`), ensuring security and optimal memory usage in serverless environments.

## 🛠 Tech Stack

- **Frontend / Framework:** Next.js 15 (App Router), React 19
- **Styling & UI:** Tailwind CSS, Shadcn UI, Lucide React, Framer Motion (via `tw-animate-css`)
- **AI & Integrations:** Vercel AI SDK, OpenRouter API (Claude / Gemini models), `@ai-sdk/anthropic`
- **Code Analysis:** `@babel/parser`, `@babel/traverse`, `simple-git`
- **Visualization:** `mermaid.js`
- **Language:** TypeScript

## 🏗 System Architecture

1. **Upload / Clone Phase:** The user provides a GitHub URL or uploads files. The backend securely provisions a temporary directory (`os.tmpdir()`) and pulls the repository via `simple-git`.
2. **Analysis Phase:** A custom AST traversal tool recursively scans `.ts`, `.js`, `.py`, `.java`, etc. Files are parsed using Babel to discover local and external `imports`/`exports`.
3. **Graph Construction:** The raw file tree and dependency map are fused into a structured node-link representation suitable for Mermaid.js rendering.
4. **Context Injection:** When users chat with the AI, the backend retrieves raw file content securely from the cached disk location, injecting it into the LLM context window to answer precisely.

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have **Node.js 18+** and **pnpm** installed on your machine.

### 2. Clone the Repository

```bash
git clone https://github.com/ManyaS-Git/RepoPilot-AI-Powered-Codebase-Intelligence-and-Architecture-Mapping.git
cd RepoPilot-AI-Powered-Codebase-Intelligence-and-Architecture-Mapping
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Environment Variables

Create a `.env` file in the root directory and add your OpenRouter API key:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 5. Run the Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📂 Project Structure

```text
├── app/                  # Next.js App Router pages and API routes
│   ├── api/analyze/      # API endpoint for git cloning & AST analysis
│   └── page.tsx          # Landing page UI
├── components/           # Reusable Shadcn UI components
├── lib/                  # Core backend utilities
│   ├── analyzer.ts       # Babel parsing & tree building logic
│   ├── graph-builder.ts  # Mermaid.js architecture graph generation
│   └── types.ts          # TypeScript interfaces for nodes & edges
└── public/               # Static assets
```

## 🤝 Contributing

Contributions are welcome! If you'd like to improve RepoPilot AI:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

*Built to demonstrate robust software engineering, scalable architectures, and an obsession with developer experience.*
