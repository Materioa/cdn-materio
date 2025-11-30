/**
 * Vercel Edge Health Check API
 * Endpoint: /api/health
 * Runtime: edge (Deno-like environment)
 */

export const config = { runtime: 'edge' };

export default () => {
  const body = { status: 'ok', ts: Date.now() };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=0, s-maxage=0, must-revalidate'
    }
  });
};
