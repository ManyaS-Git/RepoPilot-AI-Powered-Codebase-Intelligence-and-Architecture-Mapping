import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const repoPath = searchParams.get('repoPath');
    const filePath = searchParams.get('filePath');

    if (!repoPath || !filePath) {
      return NextResponse.json({ success: false, error: 'Missing repoPath or filePath' }, { status: 400 });
    }

    // Security check to prevent directory traversal
    const normalizedFilePath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(repoPath, normalizedFilePath);

    // Ensure the resolved path is actually inside the repoPath
    if (!fullPath.startsWith(path.resolve(repoPath))) {
      return NextResponse.json({ success: false, error: 'Invalid file path' }, { status: 403 });
    }

    const content = await fs.readFile(fullPath, 'utf-8');

    return NextResponse.json({ success: true, data: { content } });
  } catch (error: any) {
    console.error('[v0] File API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to read file' },
      { status: 500 }
    );
  }
}
