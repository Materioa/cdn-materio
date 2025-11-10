export default () => {
  const response = {
    status: 'ok',
    ts: Date.now()
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=0, must-revalidate'
    }
  });
};

