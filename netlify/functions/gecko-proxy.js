export default async (req) => {
  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/.netlify\/functions\/gecko-proxy/, '') || '/'
  const target = `https://api.coingecko.com${path}${url.search}`

  const res = await fetch(target, {
    headers: { 'Accept': 'application/json' },
  })

  return new Response(res.body, {
    status: res.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
