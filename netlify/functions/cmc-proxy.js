export default async (req) => {
  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/.netlify\/functions\/cmc-proxy/, '') || '/'
  const target = `https://pro-api.coinmarketcap.com${path}${url.search}`

  const res = await fetch(target, {
    headers: {
      'X-CMC_PRO_API_KEY': process.env.VITE_CMC_API_KEY || '',
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
