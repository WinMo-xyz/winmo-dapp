export const handler = async (event) => {
  const path = event.path.replace(/^\/.netlify\/functions\/oneinch-proxy/, '') || '/'
  const qs = event.rawQuery ? `?${event.rawQuery}` : ''
  const target = `https://api.1inch.dev${path}${qs}`

  try {
    const res = await fetch(target, {
      method: event.httpMethod,
      headers: {
        'Authorization': `Bearer ${process.env.VITE_1INCH_API_KEY || ''}`,
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
