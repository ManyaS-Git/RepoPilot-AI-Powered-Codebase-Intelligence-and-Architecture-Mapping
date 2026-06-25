import fs from 'fs/promises';
import path from 'path';
import { FileNode, DependencyMap, RepositorySummary } from './types';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

const SUPPORTED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rs'];
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', 'coverage', '.next', 'venv', '__pycache__'];

interface ParsedImports {
  imports: string[];
  exports: string[];
}

function isIgnoredDir(dir: string): boolean {
  return IGNORE_DIRS.some(ignored => dir.includes(ignored));
}

export async function buildFileTree(basePath: string): Promise<FileNode[]> {
  const nodes: FileNode[] = [];

  async function traverse(currentPath: string, relativePath: string = ''): Promise<FileNode[]> {
    const files = await fs.readdir(currentPath);
    const result: FileNode[] = [];

    for (const file of files) {
      if (file.startsWith('.')) continue;

      const fullPath = path.join(currentPath, file);
      const relPath = relativePath ? `${relativePath}/${file}` : file;

      try {
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory()) {
          if (isIgnoredDir(fullPath)) continue;

          const children = await traverse(fullPath, relPath);
          if (children.length > 0) {
            result.push({
              name: file,
              path: relPath,
              type: 'directory',
              children,
            });
          }
        } else {
          const ext = path.extname(file).toLowerCase();
          if (SUPPORTED_EXTENSIONS.includes(ext)) {
            result.push({
              name: file,
              path: relPath,
              type: 'file',
              language: getLanguage(ext),
              size: stat.size,
            });
          }
        }
      } catch (err) {
        // Skip files we can't read
        continue;
      }
    }

    return result;
  }

  return traverse(basePath);
}

function getLanguage(ext: string): string {
  const langMap: Record<string, string> = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.java': 'java',
    '.go': 'go',
    '.rs': 'rust',
  };
  return langMap[ext] || 'text';
}

export async function extractDependencies(basePath: string, fileTree: FileNode[]): Promise<DependencyMap> {
  const dependencies: DependencyMap = {};

  async function processFile(filePath: string): Promise<ParsedImports> {
    try {
      const fullPath = path.join(basePath, filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      const imports: string[] = [];
      const exports: string[] = [];

      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        try {
          const ast = parse(content, {
            sourceType: 'module',
            plugins: ['typescript', 'jsx', 'decorators-legacy'],
          });

          traverse(ast, {
            ImportDeclaration(nodePath: any) {
              const source = nodePath.node.source.value;
              if (!source.startsWith('.')) {
                // External dependency
                imports.push(source.split('/')[0]);
              } else {
                // Local import
                imports.push(source);
              }
            },
            ExportDeclaration(nodePath: any) {
              if (nodePath.node.declaration) {
                const dec = nodePath.node.declaration;
                if ('name' in dec && dec.name) {
                  exports.push(dec.name);
                }
              }
            },
          });
        } catch (err) {
          // Parser error, skip
        }
      }

      return { imports, exports };
    } catch (err) {
      return { imports: [], exports: [] };
    }
  }

  function flattenFileTree(nodes: FileNode[], parent = ''): string[] {
    const files: string[] = [];
    for (const node of nodes) {
      if (node.type === 'file') {
        files.push(node.path);
      } else if (node.children) {
        files.push(...flattenFileTree(node.children, node.path));
      }
    }
    return files;
  }

  const files = flattenFileTree(fileTree);

  for (const file of files) {
    const parsed = await processFile(file);
    dependencies[file] = parsed.imports;
  }

  return dependencies;
}

export async function generateSummary(basePath: string, fileTree: FileNode[]): Promise<RepositorySummary> {
  const languages: Record<string, number> = {};
  let totalFiles = 0;
  const entryPoints: string[] = [];
  const mainModules: string[] = [];

  function traverseTree(nodes: FileNode[]): void {
    for (const node of nodes) {
      if (node.type === 'file') {
        totalFiles++;
        const lang = node.language || 'unknown';
        languages[lang] = (languages[lang] || 0) + 1;

        // Identify entry points
        if (['index.js', 'index.ts', 'main.js', 'main.ts', 'app.js', 'app.ts'].includes(node.name)) {
          entryPoints.push(node.path);
        }
      } else if (node.children) {
        traverseTree(node.children);
      }
    }
  }

  traverseTree(fileTree);

  // Find main modules (directories with multiple files)
  function findMainModules(nodes: FileNode[], threshold = 3): void {
    for (const node of nodes) {
      if (node.type === 'directory' && node.children) {
        const fileCount = node.children.filter((n) => n.type === 'file').length;
        if (fileCount >= threshold) {
          mainModules.push(node.path);
        }
        findMainModules(node.children, threshold);
      }
    }
  }

  findMainModules(fileTree);

  // Determine complexity
  let complexity: 'low' | 'medium' | 'high' = 'low';
  if (totalFiles > 50) complexity = 'medium';
  if (totalFiles > 200) complexity = 'high';

  return {
    totalFiles,
    languages,
    entryPoints,
    mainModules,
    complexity,
  };
}
