import { useState, useRef, useCallback, useMemo, memo } from 'react'
import { usePortfolioHistory } from '../hooks/usePortfolioHistory'
import './BalanceChart.css'

const RANGES = [
  { label: '1D', days: 1 },
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: 'YTD', days: 'ytd' },
  { label: '1Y', days: 365 },
  { label: 'ALL', days: 730 },
]

const PADDING = { top: 20, right: 16, bottom: 4, left: 16 }

function getDayCount(days) {
  if (days === 'ytd') {
    const now = new Date()
    const jan1 = new Date(now.getFullYear(), 0, 1)
    return Math.ceil((now - jan1) / 86400000) || 1
  }
  return days
}

/**
 * Fallback: generate simulated balance history when no real data is available.
 */
function generateFallbackHistory(totalValue, dayCount) {
  if (!totalValue || totalValue <= 0) return []

  const points = Math.min(dayCount <= 1 ? 96 : dayCount <= 7 ? 168 : dayCount * 2, 500)
  const now = Date.now()
  const start = now - dayCount * 86400000
  const step = (now - start) / (points - 1)

  let seed = Math.round(totalValue * 100) + dayCount * 7
  const rand = () => { seed = (seed * 16807 + 0) % 2147483647; return (seed % 10000) / 10000 }

  const drift = (rand() - 0.4) * 0.6
  const startValue = totalValue * (1 - drift)
  const volatility = dayCount <= 1 ? 0.005 : dayCount <= 30 ? 0.015 : 0.03

  const data = []
  let val = startValue
  for (let i = 0; i < points; i++) {
    const t = start + step * i
    const progress = i / (points - 1)
    const target = startValue + (totalValue - startValue) * progress
    val += (rand() - 0.48) * val * volatility
    val = val * 0.95 + target * 0.05
    if (val < 0) val = totalValue * 0.01
    data.push({ time: t, value: val })
  }
  data[data.length - 1].value = totalValue
  return data
}

function buildPath(data, width, height) {
  if (!data.length) return {}

  const xMin = data[0].time
  const xMax = data[data.length - 1].time
  const xRange = xMax - xMin || 1
  const values = data.map(d => d.value)
  const yMin = Math.min(...values)
  const yMax = Math.max(...values)
  const yRange = yMax - yMin || 1

  const drawW = width - PADDING.left - PADDING.right
  const drawH = height - PADDING.top - PADDING.bottom

  const points = data.map(d => ({
    x: PADDING.left + ((d.time - xMin) / xRange) * drawW,
    y: PADDING.top + (1 - (d.value - yMin) / yRange) * drawH,
  }))

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const area = line + ` L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`

  return { line, area, points }
}

function formatValue(val) {
  if (val >= 1) return '$' + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (val >= 0.01) return '$' + val.toFixed(4)
  return '$' + val.toFixed(6)
}

function formatDate(ts, dayCount) {
  const d = new Date(ts)
  if (dayCount <= 1) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (dayCount <= 30) return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatRangeLabel(range) {
  if (range.days === 'ytd') return 'YTD'
  if (range.days === 1) return 'Today'
  if (range.days === 7) return 'Past week'
  if (range.days === 30) return 'Past month'
  if (range.days === 90) return 'Past 3 months'
  if (range.days === 365) return 'Past year'
  return 'All time'
}

export default memo(function BalanceChart({ totalValue, holdings, chainName }) {
  const [activeRange, setActiveRange] = useState(RANGES[RANGES.length - 1]) // default ALL
  const [hover, setHover] = useState(null)
  const svgRef = useRef(null)

  const dayCount = getDayCount(activeRange.days)

  // Fetch real historical prices for all held tokens
  const { history, isLoading } = usePortfolioHistory(holdings, dayCount)

  // Use real history when available, fall back to simulated data
  const fallback = useMemo(
    () => generateFallbackHistory(totalValue, dayCount),
    [totalValue, dayCount]
  )
  const data = history.length > 0 ? history : (!isLoading ? fallback : [])

  const width = 800
  const height = 240
  const { line, area, points } = useMemo(
    () => buildPath(data, width, height),
    [data, width, height]
  )

  const handleMouseMove = useCallback((e) => {
    if (!data.length || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const ratio = Math.max(0, Math.min(1, (x - PADDING.left) / (rect.width - PADDING.left - PADDING.right)))
    const idx = Math.round(ratio * (data.length - 1))
    setHover(idx)
  }, [data])

  const handleMouseLeave = useCallback(() => setHover(null), [])

  if (!data.length && !isLoading) return null

  const startVal = data.length ? data[0].value : 0
  const currentVal = hover !== null && data[hover] ? data[hover].value : totalValue
  const changeAbs = currentVal - startVal
  const changePct = startVal > 0 ? ((currentVal - startVal) / startVal) * 100 : 0
  const isUp = changeAbs >= 0
  const strokeColor = isUp ? 'var(--success)' : 'var(--red)'

  const hoverPoint = hover !== null && points?.[hover] ? points[hover] : null
  const hoverData = hover !== null ? data[hover] : null

  const displayValue = hover !== null && data[hover] ? currentVal : totalValue

  return (
    <div className="balance-chart glass-card">
      <div className="balance-chart-header">
        <div className="balance-chart-info">
          <h3 className="balance-chart-title">{chainName || 'Wallet'}</h3>
          <p className="balance-chart-value">{formatValue(displayValue)}</p>
          {data.length > 0 && (
            <p className={`balance-chart-change ${isUp ? 'positive' : 'negative'}`}>
              {isUp ? '+' : ''}{changePct.toFixed(2)}% ({isUp ? '+' : ''}${Math.abs(changeAbs).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
              <span className="balance-chart-range-label"> · {formatRangeLabel(activeRange)}</span>
            </p>
          )}
          {isLoading && <p className="balance-chart-loading">Loading chart data...</p>}
        </div>
        <div className="balance-chart-ranges">
          {RANGES.map(r => (
            <button
              key={r.label}
              className={`balance-range-btn ${activeRange.label === r.label ? 'active' : ''}`}
              onClick={() => { setActiveRange(r); setHover(null) }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {data.length > 0 && (
        <div className="balance-chart-svg-wrap">
          <svg
            ref={svgRef}
            className="balance-chart-svg"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            {area && <path d={area} fill="url(#balGrad)" />}
            {line && <path d={line} fill="none" stroke={strokeColor} strokeWidth="2" vectorEffect="non-scaling-stroke" />}
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
              className="balance-chart-tooltip"
              style={{
                left: `${(hoverPoint.x / width) * 100}%`,
                top: `${(hoverPoint.y / height) * 100}%`,
              }}
            >
              <span className="tooltip-price">{formatValue(hoverData.value)}</span>
              <span className="tooltip-date">{formatDate(hoverData.time, dayCount)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
})
