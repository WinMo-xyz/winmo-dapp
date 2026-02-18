exports.handler = async (event) => {
  const path = event.path
    .replace(/^\/.netlify\/functions\/jupiter-proxy/, '')
    .replace(/^\/api\/jupiter/, '') || '/'
  const qs = event.rawQuery ? `?${event.rawQuery}` : ''
  const target = `https://api.jup.ag${path}${qs}`

  try {
    const res = await fetch(target, {
      method: event.httpMethod,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'bfda7f2b-652c-4a12-a752-0bef22f9cbae',
        'Accept': 'application/json',
      },
      ...(event.body ? { body: event.body } : {}),
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
