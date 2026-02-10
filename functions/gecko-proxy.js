exports.handler = async (event) => {
  const path = event.path.replace(/^\/.netlify\/functions\/gecko-proxy/, '') || '/'
  const qs = event.rawQuery ? `?${event.rawQuery}` : ''
  const target = `https://api.coingecko.com${path}${qs}`

  try {
    const res = await fetch(target, {
      headers: { 'Accept': 'application/json' },
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
