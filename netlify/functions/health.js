/**
 * Lightweight Health Check API
 * Endpoint: /.netlify/functions/health
 */

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Handle GET requests
  if (event.httpMethod === 'GET') {
    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'cdn-materio',
      version: '1.0.0',
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  }

  // Handle unsupported methods
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};
