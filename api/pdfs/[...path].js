/**
 * Vercel Edge Function – Smart PDF proxy
 *
 * For every request to /pdfs/<path>, this function:
 *   1. Tries raw.githubusercontent.com first (cheap, no LFS overhead)
 *   2. If the response is tiny (< 1 KB) it's an LFS pointer, so
 *      falls back to media.githubusercontent.com for the actual file
 */

export const config = { runtime: 'edge' };

const REPO_OWNER = 'Materioa';
const REPO_NAME = 'cdn-materio';
const BRANCH = 'main';

const LFS_BASE = `https://media.githubusercontent.com/media/${REPO_OWNER}/${REPO_NAME}/${BRANCH}`;
const RAW_BASE = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}`;

// LFS pointers are ~130 bytes. Anything under 1 KB is definitely not a real PDF.
const LFS_POINTER_MAX_SIZE = 1024;

export default async function handler(req) {
  const url = new URL(req.url);
  const pdfPath = url.pathname.replace(/^\/(api\/)?pdfs\//, '');

  if (!pdfPath) {
    return new Response('Not found', { status: 404 });
  }

  const encodedPath = pdfPath
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');

  const rawUrl = `${RAW_BASE}/pdfs/${encodedPath}`;
  const lfsUrl = `${LFS_BASE}/pdfs/${encodedPath}`;

  // 1. Try raw first (works for all non-LFS files, no extra overhead)
  try {
    const rawRes = await fetch(rawUrl);
    if (rawRes.ok) {
      const body = await rawRes.arrayBuffer();

      // If the file is over 1 KB, it's a real PDF — serve it
      if (body.byteLength > LFS_POINTER_MAX_SIZE) {
        return buildResponse(body, pdfPath);
      }

      // Tiny response = LFS pointer, fall through to LFS endpoint
    }
  } catch (_) {
    // raw fetch failed, try LFS
  }

  // 2. Fallback to LFS media endpoint (for old LFS-tracked files)
  try {
    const lfsRes = await fetch(lfsUrl);
    if (lfsRes.ok) {
      return buildResponse(lfsRes.body, pdfPath, true);
    }
  } catch (_) {
    // Both failed
  }

  return new Response('PDF not found', {
    status: 404,
    headers: { 'Access-Control-Allow-Origin': '*' }
  });
}

function buildResponse(body, pdfPath, isStream = false) {
  const filename = decodeURIComponent(pdfPath.split('/').pop());

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, s-maxage=86400, max-age=3600, stale-while-revalidate=604800',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}
