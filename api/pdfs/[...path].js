/**
 * Vercel Edge Function – LFS-only PDF proxy
 *
 * Frontend decides when this endpoint should be used.
 * This route directly proxies from media.githubusercontent.com.
 */

export const config = { runtime: 'edge' };

const REPO_OWNER = 'Materioa';
const REPO_NAME = 'cdn-materio';
const BRANCH = 'main';

const LFS_BASE = `https://media.githubusercontent.com/media/${REPO_OWNER}/${REPO_NAME}/${BRANCH}`;

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

  const lfsUrl = `${LFS_BASE}/pdfs/${encodedPath}`;

  // Directly fetch from LFS media endpoint.
  try {
    const lfsRes = await fetch(lfsUrl);
    if (lfsRes.ok) {
      return buildResponse(lfsRes.body, pdfPath);
    }
  } catch (_) {
    // Return not found below.
  }

  return new Response('PDF not found', {
    status: 404,
    headers: { 'Access-Control-Allow-Origin': '*' }
  });
}

function buildResponse(body, pdfPath) {
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
