import { AnalysisResult, FileNode } from './types';
import fs from 'fs/promises';
import path from 'path';

const TOKEN_ESTIMATE_CHARS = 4; // Rough estimate: 1 token ≈ 4 chars
const MAX_CONTEXT_TOKENS = 100000; // Stay well under Claude's limit
const MAX_CONTEXT_CHARS = MAX_CONTEXT_TOKENS * TOKEN_ESTIMATE_CHARS;

export function buildSystemPrompt(analysis: AnalysisResult): string {
  const summary = analysis.summary;

  return `You are a code analysis assistant specialized in code review and audit. You help developers understand repository architecture, dependencies, and code patterns.

Repository: ${analysis.name}
Description: ${analysis.description}

Repository Statistics:
- Total Files: ${summary.totalFiles}
- Languages: ${Object.entries(summary.languages)
    .map(([lang, count]) => `${lang} (${count})`)
    .join(', ')}
- Complexity: ${summary.complexity}
- Main Modules: ${summary.mainModules.join(', ') || 'N/A'}
- Entry Points: ${summary.entryPoints.join(', ') || 'N/A'}

Architecture Overview:
\`\`\`mermaid
${analysis.architectureGraph}
\`\`\`

Your role:
1. Help reviewers understand the codebase structure and architecture
2. Explain dependencies and module relationships
3. Identify potential issues or improvements
4. Answer specific questions about code patterns and design decisions
5. Provide insights for code audit and review processes

Be concise, structured, and focus on the most important aspects relevant to code review.`;
}

export async function buildCodeContext(
  analysis: AnalysisResult,
  basePath: string,
  selectedFiles?: string[]
): Promise<string> {
  let context = '';
  let charCount = 0;

  // Add file structure summary
  context += `## Repository Structure\n\n`;
  context += fileTreeToMarkdown(analysis.fileTree, 0, 3) + '\n\n';
  charCount += context.length;

  // Add selected file contents if provided
  if (selectedFiles && selectedFiles.length > 0) {
    context += `## Code Context\n\n`;

    for (const filePath of selectedFiles) {
      if (charCount > MAX_CONTEXT_CHARS) break;

      try {
        const fullPath = path.join(basePath, filePath);
        const content = await fs.readFile(fullPath, 'utf-8');
        const truncatedContent = content.slice(0, Math.max(1000, MAX_CONTEXT_CHARS - charCount));

        context += `### ${filePath}\n\`\`\`\n${truncatedContent}\n\`\`\`\n\n`;
        charCount += truncatedContent.length;
      } catch (err) {
        // File not readable
        context += `### ${filePath}\n(File not readable)\n\n`;
      }
    }
  }

  // Add dependency summary
  context += `## Dependency Map\n\n`;
  context += buildDependencySummary(analysis.dependencies) + '\n';

  return context;
}

function fileTreeToMarkdown(nodes: FileNode[], depth: number, maxDepth: number): string {
  if (depth > maxDepth) return '';

  let markdown = '';
  const indent = '  '.repeat(depth);

  for (const node of nodes) {
    if (node.type === 'file') {
      const lang = node.language ? ` (${node.language})` : '';
      markdown += `${indent}- ${node.name}${lang}\n`;
    } else {
      markdown += `${indent}📁 ${node.name}/\n`;
      if (node.children) {
        markdown += fileTreeToMarkdown(node.children, depth + 1, maxDepth);
      }
    }
  }

  return markdown;
}

function buildDependencySummary(dependencies: Record<string, string[]>): string {
  const externalDeps = new Set<string>();
  const internalDeps = new Map<string, Set<string>>();

  for (const [file, imports] of Object.entries(dependencies)) {
    for (const imp of imports) {
      if (!imp.startsWith('.')) {
        externalDeps.add(imp);
      } else {
        const module = imp.split('/')[0];
        if (!internalDeps.has(module)) {
          internalDeps.set(module, new Set());
        }
        internalDeps.get(module)!.add(file);
      }
    }
  }

  let summary = '';

  if (externalDeps.size > 0) {
    summary += `### External Dependencies\n${Array.from(externalDeps)
      .slice(0, 20)
      .map((dep) => `- ${dep}`)
      .join('\n')}\n\n`;
  }

  if (internalDeps.size > 0) {
    summary += `### Internal Module Dependencies\n${Array.from(internalDeps.entries())
      .slice(0, 10)
      .map(([module, files]) => `- **${module}**: ${files.size} files`)
      .join('\n')}\n`;
  }

  return summary;
}

export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / TOKEN_ESTIMATE_CHARS);
}

export function truncateToTokenLimit(text: string, maxTokens: number): string {
  const maxChars = maxTokens * TOKEN_ESTIMATE_CHARS;
  if (text.length <= maxChars) {
    return text;
  }
  return text.slice(0, maxChars) + '\n\n[... truncated due to token limit ...]';
}
