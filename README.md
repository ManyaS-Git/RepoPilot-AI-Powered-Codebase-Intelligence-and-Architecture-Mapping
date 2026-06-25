# RepoPilot AI

![RepoPilot AI](https://img.shields.io/badge/Status-Live-success) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![OpenRouter](https://img.shields.io/badge/AI-OpenRouter-blue)

🚀 **Live Deployment**: [RepoPilot AI on Vercel](https://frontend-phdndvgpl-shaarmamanya-3559s-projects.vercel.app)

**Problem:** Developers waste hours trying to understand unfamiliar repositories and complex codebases.
**Solution:** An intelligent AI system that clones repositories, builds interactive architecture graphs, and dynamically reads files from disk to accurately answer your deepest code questions.

## 🎯 Why This Project Stands Out (For Recruiters)
RepoPilot AI goes beyond a simple LLM API wrapper. It demonstrates the advanced implementation of highly sought-after engineering paradigms:

- **RAG & LLM Engineering**: Implements dynamic context injection. By securely loading AST data, architecture summaries, and live file contents from disk on demand, it provides the AI with deep repository context while strictly managing token limits for optimal performance.
- **System Design**: A unified architecture leveraging Next.js API Routes and server-side ephemeral caching (`os.tmpdir`) to securely parse, store, and manage user-uploaded or cloned GitHub repositories without exhausting serverless environments.
- **Dev Tools Mastery**: Integrates `@babel/parser` and `simple-git` for robust backend static code analysis, using traversal algorithms to construct valid Mermaid.js diagrams to visualize complex file relationships.
- **Full-Stack Polish**: Showcases end-to-end expertise, from a highly responsive Tailwind/Shadcn UI with syntax highlighting and loading states, down to Vercel production deployments and API stream management.

## 🚀 Core Features

- **Automated Static Analysis**: Clones any public GitHub repository and parses the structure and dependencies.
- **Interactive Architecture Diagrams**: Generates beautiful, interactive Mermaid.js diagrams visualizing the core modules and their connections.
- **Dynamic Code Previews**: View any file directly in the browser with full syntax highlighting.
- **Deep-Context AI Chat**: Integrated with OpenRouter (Google Gemini 2.5 Flash Free by default). When you select a file in the UI, the backend securely reads the raw file from the disk cache and injects it into the AI's context window.

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + Shadcn UI
- **AI Integration:** Vercel AI SDK + OpenRouter Provider
- **Visualization:** Mermaid.js
- **Code Analysis:** Babel Parser & Simple-Git

## ⚙️ Local Development

1. **Clone the repository and install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up Environment Variables:**
   Create a `.env` file in the root of the project:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```

3. **Run the Development Server:**
   ```bash
   pnpm run dev
   ```
   Available at [http://localhost:3000](http://localhost:3000).

---
*Built to demonstrate robust software engineering and an obsession with developer experience.*
