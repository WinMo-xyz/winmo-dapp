exports.handler = async (event) => {
  const path = event.path
    .replace(/^\/.netlify\/functions\/cmc-proxy/, '')
    .replace(/^\/api\/cmc/, '') || '/'
  const qs = event.rawQuery ? `?${event.rawQuery}` : ''
  const target = `https://pro-api.coinmarketcap.com${path}${qs}`

  try {
    const res = await fetch(target, {
      headers: {
        'X-CMC_PRO_API_KEY': process.env.VITE_CMC_API_KEY || '',
        'Accept': 'application/json',
      },
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
