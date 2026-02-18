exports.handler = async (event) => {
  const path = event.path.replace(/^\/.netlify\/functions\/kyberswap-proxy/, '') || '/'
  const qs = event.rawQuery ? `?${event.rawQuery}` : ''
  const target = `https://aggregator-api.kyberswap.com${path}${qs}`

  const headers = {
    'Accept': 'application/json',
  }
  if (process.env.VITE_KYBERSWAP_CLIENT_ID) {
    headers['x-client-id'] = process.env.VITE_KYBERSWAP_CLIENT_ID
  }

  // Forward Content-Type for POST requests (route/build)
  if (event.httpMethod === 'POST') {
    headers['Content-Type'] = 'application/json'
  }

  try {
    const res = await fetch(target, {
      method: event.httpMethod,
      headers,
      body: event.httpMethod === 'POST' ? event.body : undefined,
    })

    const body = await res.text()

    return {
      statusCode: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body,
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
