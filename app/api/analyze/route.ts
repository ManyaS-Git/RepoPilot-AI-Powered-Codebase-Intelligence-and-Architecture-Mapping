import { NextRequest, NextResponse } from 'next/server';
import { buildFileTree, extractDependencies, generateSummary } from '@/lib/analyzer';
import { buildArchitectureGraph } from '@/lib/graph-builder';
import { AnalysisResult } from '@/lib/types';
import simpleGit from 'simple-git';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const git = simpleGit();

export const maxDuration = 60;

async function setupRepository(gitUrl?: string, uploadDir?: string): Promise<string> {
  const tmpDir = path.join(os.tmpdir(), `repopilot-${Date.now()}`);
  await fs.mkdir(tmpDir, { recursive: true });

  if (gitUrl) {
    try {
      console.log(`[v0] Cloning repository from ${gitUrl}`);
      await git.clone(gitUrl, tmpDir);
    } catch (error) {
      throw new Error(`Failed to clone repository: ${error}`);
    }
  } else if (uploadDir) {
    // Copy uploaded files to tmpDir
    const files = await fs.readdir(uploadDir);
    for (const file of files) {
      const src = path.join(uploadDir, file);
      const dst = path.join(tmpDir, file);
      await fs.cp(src, dst, { recursive: true });
    }
  }

  return tmpDir;
}

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Analyze API called');

    const formData = await request.formData();
    const gitUrl = formData.get('gitUrl') as string | null;
    const uploadedFiles = formData.getAll('files') as File[] | null;

    if (!gitUrl && (!uploadedFiles || uploadedFiles.length === 0)) {
      return NextResponse.json({ success: false, error: 'Either gitUrl or files are required' }, { status: 400 });
    }

    // Setup repository
    let repoPath: string;
    let uploadDir: string | undefined;

    if (uploadedFiles && uploadedFiles.length > 0) {
      uploadDir = path.join(os.tmpdir(), `upload-${Date.now()}`);
      await fs.mkdir(uploadDir, { recursive: true });

      // Extract uploaded files
      for (const file of uploadedFiles) {
        const buffer = await file.arrayBuffer();
        const filePath = path.join(uploadDir, file.name);
        await fs.writeFile(filePath, Buffer.from(buffer));
      }
    }

    repoPath = await setupRepository(gitUrl || undefined, uploadDir);
    console.log(`[v0] Repository setup at ${repoPath}`);

    // Analyze repository
    console.log('[v0] Starting analysis...');

    const fileTree = await buildFileTree(repoPath);
    console.log(`[v0] Built file tree with ${fileTree.length} top-level items`);

    const dependencies = await extractDependencies(repoPath, fileTree);
    console.log(`[v0] Extracted dependencies from ${Object.keys(dependencies).length} files`);

    const summary = await generateSummary(repoPath, fileTree);
    console.log(`[v0] Generated summary: ${summary.totalFiles} files, complexity: ${summary.complexity}`);

    const architectureGraph = buildArchitectureGraph(fileTree, dependencies);
    console.log('[v0] Built architecture graph');

    const result: AnalysisResult = {
      id: `repo-${Date.now()}`,
      name: gitUrl ? gitUrl.split('/').pop()?.replace('.git', '') || 'Repository' : 'Uploaded Repository',
      description: gitUrl || 'Uploaded code repository',
      fileTree,
      dependencies,
      architectureGraph,
      summary,
      timestamp: Date.now(),
      repoPath, // Keep track of the local path for file access
    };

    // Cleanup: We no longer delete the repository so we can serve file contents!
    // But we should clean up the upload ZIP/files if we used an intermediate directory.
    try {
      if (uploadDir) {
        await fs.rm(uploadDir, { recursive: true, force: true });
      }
    } catch (err) {
      console.error('[v0] Cleanup error:', err);
    }

    console.log('[v0] Analysis complete');

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[v0] Analysis error:', error);

    // Cleanup on error
    try {
      const tmpDirs = await fs.readdir(os.tmpdir());
      for (const dir of tmpDirs) {
        if (dir.startsWith('repopilot-') || dir.startsWith('upload-')) {
          const fullPath = path.join(os.tmpdir(), dir);
          const stat = await fs.stat(fullPath);
          if (stat.isDirectory()) {
            await fs.rm(fullPath, { recursive: true, force: true });
          }
        }
      }
    } catch (err) {
      // Ignore cleanup errors
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
