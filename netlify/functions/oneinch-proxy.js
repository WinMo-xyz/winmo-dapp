export default async (req) => {
  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/.netlify\/functions\/oneinch-proxy/, '') || '/'
  const target = `https://api.1inch.dev${path}${url.search}`

  const res = await fetch(target, {
    method: req.method,
    headers: {
      'Authorization': `Bearer ${process.env.VITE_1INCH_API_KEY || ''}`,
      'Accept': 'application/json',
    },
  })

  return new Response(res.body, {
    status: res.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
