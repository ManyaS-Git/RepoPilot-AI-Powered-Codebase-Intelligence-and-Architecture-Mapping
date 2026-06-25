export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  language?: string;
  children?: FileNode[];
}

export interface DependencyMap {
  [filePath: string]: string[];
}

export interface RepositorySummary {
  totalFiles: number;
  languages: Record<string, number>;
  entryPoints: string[];
  mainModules: string[];
  complexity: 'low' | 'medium' | 'high';
}

export interface AnalysisResult {
  id: string;
  name: string;
  description: string;
  fileTree: FileNode[];
  dependencies: DependencyMap;
  architectureGraph: string; // Mermaid markdown
  summary: RepositorySummary;
  timestamp: number;
  repoPath?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatContext {
  repositoryAnalysis: AnalysisResult;
  conversationHistory: ChatMessage[];
  selectedFiles?: string[];
}

export interface AnalysisRequest {
  gitUrl?: string;
  uploadedFiles?: File[];
}

export interface AnalysisResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
  progress?: {
    current: number;
    total: number;
    status: string;
  };
}

export interface ChatRequest {
  message: string;
  codeContext: string;
  selectedFiles?: string[];
  repositoryId: string;
}

export interface CodePreviewRequest {
  fileContent: string;
  language: string;
}
