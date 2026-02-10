import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchPriceHistory, isCryptoAsset, generatePriceHistory } from '../services/coingeckoApi'
import './PriceChart.css'

const RANGES = [
  { label: '24H', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '1Y', days: 365 },
]

const PADDING = { top: 20, right: 16, bottom: 4, left: 16 }

function formatTooltipDate(ts, days) {
  const d = new Date(ts)
  if (days <= 1) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (days <= 30) return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTooltipPrice(price) {
  if (price >= 1) return '$' + price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (price >= 0.01) return '$' + price.toFixed(4)
  return '$' + price.toFixed(6)
}

function buildPath(data, width, height) {
  if (!data.length) return { line: '', area: '' }

  const xMin = data[0].time
  const xMax = data[data.length - 1].time
  const xRange = xMax - xMin || 1
  const prices = data.map(d => d.price)
  const yMin = Math.min(...prices)
  const yMax = Math.max(...prices)
  const yRange = yMax - yMin || 1

  const drawW = width - PADDING.left - PADDING.right
  const drawH = height - PADDING.top - PADDING.bottom

  const points = data.map(d => ({
    x: PADDING.left + ((d.time - xMin) / xRange) * drawW,
    y: PADDING.top + (1 - (d.price - yMin) / yRange) * drawH,
  }))

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const area = line + ` L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`

  return { line, area, points, yMin, yMax, yRange, xMin, xMax, xRange, drawW, drawH }
}

export default function PriceChart({ assetId, price, category, subcategory }) {
  const [days, setDays] = useState(7)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hover, setHover] = useState(null)
  const svgRef = useRef(null)

  const isCrypto = isCryptoAsset(assetId)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    if (isCrypto) {
      fetchPriceHistory(assetId, days).then(result => {
        if (cancelled) return
        if (result) {
          setData(result)
        } else {
          // CoinGecko failed — fall back to generated data
          setData(generatePriceHistory(assetId, price, category || 'crypto', subcategory, days))
        }
        setLoading(false)
      })
    } else {
      // Non-crypto: use generated price history
      setData(generatePriceHistory(assetId, price, category, subcategory, days))
      setLoading(false)
    }

    return () => { cancelled = true }
  }, [assetId, days, isCrypto, price, category, subcategory])

  const handleMouseMove = useCallback((e) => {
    if (!data || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const ratio = Math.max(0, Math.min(1, (x - PADDING.left) / (rect.width - PADDING.left - PADDING.right)))
    const idx = Math.round(ratio * (data.length - 1))
    setHover(idx)
  }, [data])

  const handleMouseLeave = useCallback(() => setHover(null), [])

  if (loading) {
    return (
      <div className="price-chart">
        <div className="price-chart-ranges">
          {RANGES.map(r => (
            <button key={r.days} className={`range-btn ${r.days === days ? 'active' : ''}`} disabled>
              {r.label}
            </button>
          ))}
        </div>
        <div className="price-chart-skeleton">
          <div className="skeleton-wave" />
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="price-chart">
        <div className="price-chart-unavailable">
          <span>Failed to load chart data</span>
        </div>
      </div>
    )
  }

  const width = 800
  const height = 220
  const { line, area, points, yMin, yRange, xMin, xRange, drawW, drawH } = buildPath(data, width, height)
  const isUp = data[data.length - 1].price >= data[0].price
  const strokeColor = isUp ? 'var(--success)' : 'var(--red)'
  const gradId = `priceGrad-${assetId}`

  const hoverPoint = hover !== null && points?.[hover] ? points[hover] : null
  const hoverData = hover !== null ? data[hover] : null

  return (
    <div className="price-chart">
      <div className="price-chart-ranges">
        {RANGES.map(r => (
          <button
            key={r.days}
            className={`range-btn ${r.days === days ? 'active' : ''}`}
            onClick={() => { setDays(r.days); setHover(null) }}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="price-chart-svg-wrap">
        <svg
          ref={svgRef}
          className="price-chart-svg"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gradId})`} />
          <path d={line} fill="none" stroke={strokeColor} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          {hoverPoint && (
            <>
              <line
                x1={hoverPoint.x} y1={PADDING.top}
                x2={hoverPoint.x} y2={height - PADDING.bottom}
                stroke="var(--light-20)" strokeWidth="1" vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={hoverPoint.x} cy={hoverPoint.y}
                r="4" fill={strokeColor} stroke="var(--color-dark)" strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </>
          )}
        </svg>

        {hoverData && hoverPoint && (
          <div
            className="price-chart-tooltip"
            style={{
              left: `${(hoverPoint.x / width) * 100}%`,
              top: `${(hoverPoint.y / height) * 100}%`,
            }}
          >
            <span className="tooltip-price">{formatTooltipPrice(hoverData.price)}</span>
            <span className="tooltip-date">{formatTooltipDate(hoverData.time, days)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
