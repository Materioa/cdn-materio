/**
 * Vercel Edge Function - PDF proxy endpoint.
 *
 * Handles /api/pdfs/* via vercel.json rewrite to /api/pdfs?path=<segments>.
 */

export const config = { runtime: 'edge' };

const REPO_OWNER = 'Materioa';
const REPO_NAME = 'cdn-materio';
const BRANCH = 'main';

const MEDIA_BASE = `https://media.githubusercontent.com/media/${REPO_OWNER}/${REPO_NAME}/${BRANCH}`;
const RAW_BASE = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}`;

export default async function handler(req) {
  const url = new URL(req.url);
  const rawSearch = url.search || '';
  const queryPath = rawSearch.startsWith('?path=')
    ? rawSearch.slice(6)
    : (url.searchParams.get('path') || '');
  const pathFromUrl = url.pathname.replace(/^\/(api\/)?pdfs\/?/, '');
  const rawPath = (queryPath || pathFromUrl).replace(/^\/+/, '');

  const segments = rawPath.split('/').filter(Boolean);
  const decodedSegments = segments.map((segment) => {
    try {
      return decodeURIComponent(segment);
    } catch (_) {
      return segment;
    }
  });

  const decodedPath = decodedSegments.join('/');
  const encodedPath = decodedSegments.map((segment) => encodeURIComponent(segment)).join('/');
  const rawJoinedPath = segments.join('/');
  const pdfPath = decodedPath || rawJoinedPath;

  if (!pdfPath) {
    return new Response('Not found', {
      status: 404,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  const candidatePaths = Array.from(new Set([encodedPath, rawJoinedPath].filter(Boolean)));
  const candidateUrls = candidatePaths.flatMap((pathPart) => [
    `${MEDIA_BASE}/pdfs/${pathPart}`,
    `${RAW_BASE}/pdfs/${pathPart}`
  ]);

  const attempts = [];

  for (const sourceUrl of candidateUrls) {
    try {
      const sourceRes = await fetch(sourceUrl, {
        headers: {
          Accept: 'application/pdf,*/*;q=0.8',
          'User-Agent': 'cdn-materio-pdf-proxy/1.0'
        }
      });
      attempts.push(`${sourceRes.status} ${sourceUrl}`);
      if (sourceRes.ok) {
        return buildResponse(sourceRes.body, pdfPath);
      }
    } catch (_) {
      attempts.push(`ERR ${sourceUrl}`);
    }
  }

  const debug = attempts.join(' | ');

  return new Response('PDF not found', {
    status: 404,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'X-PDF-Debug': debug.length > 900 ? debug.slice(0, 900) : debug
    }
  });
}

function buildResponse(body, pdfPath) {
  const filename = decodeURIComponent(pdfPath.split('/').pop() || 'file.pdf');

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
