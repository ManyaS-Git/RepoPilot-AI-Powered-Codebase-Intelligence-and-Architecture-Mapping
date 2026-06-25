import { DependencyMap, FileNode } from './types';

export function buildArchitectureGraph(
  fileTree: FileNode[],
  dependencies: DependencyMap,
  maxDepth: number = 3
): string {
  // Extract main modules from file tree
  const mainModules = extractMainModules(fileTree);

  if (mainModules.length === 0) {
    return generateSimpleDiagram(fileTree);
  }

  // Build Mermaid graph
  let mermaid = 'graph TD\n';

  // Add nodes for main modules
  const moduleIds: Record<string, string> = {};
  let nodeId = 0;

  for (const module of mainModules) {
    const id = `M${nodeId++}`;
    moduleIds[module] = id;
    const cleanName = module.split('/').pop() || module;
    mermaid += `    ${id}["${cleanName}"]\n`;
  }

  // Build dependency edges
  const edges = new Set<string>();
  const visited = new Set<string>();

  function addEdgesForModule(module: string, depth: number): void {
    if (depth === 0 || visited.has(module)) return;
    visited.add(module);

    // Find files in this module
    const filesInModule = Object.keys(dependencies).filter((file) => file.startsWith(module + '/') || file === module);

    for (const file of filesInModule) {
      const imports = dependencies[file] || [];

      for (const imp of imports) {
        // Find which module this import belongs to
        const importedModule = findModuleForImport(imp, mainModules, module);
        if (importedModule && importedModule !== module) {
          const fromId = moduleIds[module];
          const toId = moduleIds[importedModule];

          if (fromId && toId) {
            edges.add(`    ${fromId} --> ${toId}\n`);
          }
        }
      }
    }

    // Recursively add edges for imported modules
    for (const module2 of mainModules) {
      if (module2 !== module && visited.has(module2) === false) {
        addEdgesForModule(module2, depth - 1);
      }
    }
  }

  for (const module of mainModules) {
    addEdgesForModule(module, maxDepth);
  }

  mermaid += Array.from(edges).join('');

  // Add styling
  if (Object.keys(moduleIds).length > 0) {
    mermaid += '\n    classDef module fill:#4f46e5,stroke:#312e81,stroke-width:2px,color:#fff\n';
    mermaid += '    class ' + Object.values(moduleIds).join(',') + ' module\n';
  }

  return mermaid;
}

function extractMainModules(fileTree: FileNode[], minFiles: number = 1): string[] {
  const modules: string[] = [];

  function traverse(nodes: FileNode[], prefix: string = ''): void {
    for (const node of nodes) {
      if (node.type === 'directory') {
        const currentPath = prefix ? `${prefix}/${node.name}` : node.name;

        if (node.children) {
          const fileCount = node.children.filter((n) => n.type === 'file').length;

          // Include directory if it has enough files or is top-level
          if (fileCount >= minFiles || !prefix) {
            modules.push(currentPath);
          }

          traverse(node.children, currentPath);
        }
      }
    }
  }

  traverse(fileTree);

  // Filter to top-level important modules
  return modules.filter((m) => !m.includes('/') || m.split('/').length <= 2);
}

function findModuleForImport(importPath: string, modules: string[], currentModule: string): string | null {
  // Handle relative imports
  if (importPath.startsWith('.')) {
    return currentModule;
  }

  // Handle external packages
  if (!importPath.startsWith('.')) {
    // External dependency - check if any local module exports this
    for (const module of modules) {
      if (module.toLowerCase() === importPath.toLowerCase() || importPath.includes(module)) {
        return module;
      }
    }
    return null;
  }

  return null;
}

export function generateSimpleDiagram(fileTree: FileNode[]): string {
  let mermaid = 'graph TD\n';
  let nodeId = 0;
  const nodeIds: Record<string, string> = {};

  function traverse(nodes: FileNode[], depth: number = 0): void {
    if (depth > 2) return; // Limit depth for readability

    for (const node of nodes) {
      if (node.type === 'directory' && node.children && node.children.length > 0) {
        const id = `N${nodeId++}`;
        nodeIds[node.path] = id;
        const label = node.name;
        mermaid += `    ${id}["📁 ${label}"]\n`;

        // Add children
        for (const child of node.children) {
          if (child.type === 'directory') {
            const childId = `N${nodeId++}`;
            nodeIds[child.path] = childId;
            mermaid += `    ${childId}["📁 ${child.name}"]\n`;
            mermaid += `    ${id} --> ${childId}\n`;
          } else {
            const icon = getFileIcon(child.language || '');
            mermaid += `    ${id} --> ["${icon} ${child.name}"]\n`;
          }
        }

        traverse(node.children, depth + 1);
      } else if (node.type === 'file' && depth === 0) {
        // Handle files in the root if it's a flat repository
        const id = `N${nodeId++}`;
        const icon = getFileIcon(node.language || '');
        mermaid += `    ${id}["${icon} ${node.name}"]\n`;
      }
    }
  }

  traverse(fileTree);

  if (nodeId === 0) {
    mermaid += `    Root["Empty Repository"]\n`;
  }

  // Add styling
  mermaid += '\n    classDef dir fill:#3b82f6,stroke:#1e40af,stroke-width:2px,color:#fff\n';
  mermaid += '    classDef file fill:#10b981,stroke:#047857,stroke-width:1px,color:#fff\n';

  return mermaid;
}

function getFileIcon(language: string): string {
  const icons: Record<string, string> = {
    javascript: '📜',
    typescript: '📘',
    python: '🐍',
    java: '☕',
    go: '🐹',
    rust: '🦀',
    css: '🎨',
    html: '🌐',
  };
  return icons[language] || '📄';
}
