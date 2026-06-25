import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { AnalysisResult } from '@/lib/types';
import { buildSystemPrompt, buildCodeContext, truncateToTokenLimit } from '@/lib/context-builder';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, repositoryAnalysis, selectedFile } = body;

    if (!message || !repositoryAnalysis) {
      return new Response('Missing message or repository analysis', { status: 400 });
    }

    const analysis: AnalysisResult = repositoryAnalysis;

    console.log('[v0] Chat API called - message:', message);

    // Build system prompt
    const systemPrompt = buildSystemPrompt(analysis);

    // Build code context
    let codeContext = '';
    try {
      // For the MVP, we'll limit file access to in-memory representation
      codeContext = `
## Repository Analysis

**Structure Overview:**
- Total Files: ${analysis.summary.totalFiles}
- Languages: ${Object.entries(analysis.summary.languages)
        .map(([lang, count]) => `${lang} (${count})`)
        .join(', ')}
- Main Modules: ${analysis.summary.mainModules.join(', ') || 'Not identified'}
- Entry Points: ${analysis.summary.entryPoints.join(', ') || 'Not identified'}

**Architecture:**
\`\`\`mermaid
${analysis.architectureGraph}
\`\`\`

**Dependencies:**
${buildDependencySummary(analysis.dependencies)}
`;
      
      if (selectedFile && analysis.repoPath) {
        try {
          const fs = await import('fs/promises');
          const path = await import('path');
          const normalizedPath = path.normalize(selectedFile).replace(/^(\.\.(\/|\\|$))+/, '');
          const fullPath = path.join(analysis.repoPath, normalizedPath);
          if (fullPath.startsWith(path.resolve(analysis.repoPath))) {
            const content = await fs.readFile(fullPath, 'utf-8');
            codeContext += `\n\n## Selected File Context: ${selectedFile}\n\`\`\`\n${content}\n\`\`\`\n`;
          }
        } catch (err) {
          console.error('[v0] Failed to read selected file for chat:', err);
        }
      }
    } catch (err) {
      console.error('[v0] Error building code context:', err);
      codeContext = 'Unable to build full code context.';
    }

    // Truncate to stay within token limits
    const userMessage = `${codeContext}\n\nUser Question: ${message}`;
    const truncatedMessage = truncateToTokenLimit(userMessage, 50000);

    console.log('[v0] Streaming response...');

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const result = await streamText({
      model: openrouter('google/gemini-2.5-flash:free'),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: truncatedMessage,
        },
      ],
      temperature: 0.7,
    });

    console.log('[v0] Returning streamed response');

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('[v0] Chat error:', error);
    return new Response(`Error: ${error.message || 'Chat failed'}`, { status: 500 });
  }
}

function buildDependencySummary(dependencies: Record<string, string[]>): string {
  const externalDeps = new Set<string>();
  const internalFileCount = Object.keys(dependencies).length;

  for (const imports of Object.values(dependencies)) {
    for (const imp of imports) {
      if (!imp.startsWith('.')) {
        externalDeps.add(imp);
      }
    }
  }

  let summary = '';

  if (externalDeps.size > 0) {
    summary += `**Key External Dependencies:**\n${Array.from(externalDeps)
      .slice(0, 15)
      .map((dep) => `- ${dep}`)
      .join('\n')}\n\n`;
  }

  summary += `**Internal Structure:**\n- Total source files: ${internalFileCount}\n`;

  return summary;
}
