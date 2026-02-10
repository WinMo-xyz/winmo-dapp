import { useState, useRef, useEffect } from 'react'
import { searchAssets } from '../services/assets'
import AssetLogo from './AssetLogo'
import './SearchBar.css'

export default function SearchBar({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    if (val.length > 0) {
      setResults(searchAssets(val).slice(0, 6))
      setOpen(true)
    } else {
      setResults([])
      setOpen(false)
    }
  }

  const handleSelect = (asset) => {
    setQuery('')
    setResults([])
    setOpen(false)
    onSelect(asset)
  }

  return (
    <div className="search-bar" ref={ref}>
      <div className="search-input-wrap">
        <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search assets..."
          value={query}
          onChange={handleChange}
          onFocus={() => query.length > 0 && setOpen(true)}
          className="search-input"
        />
      </div>
      {open && results.length > 0 && (
        <div className="search-dropdown">
          {results.map((asset) => (
            <button
              key={asset.id}
              className="search-result"
              onClick={() => handleSelect(asset)}
            >
              <AssetLogo logo={asset.logo} name={asset.name} size={20} />
              <span className="search-result-name">{asset.name}</span>
              <span className="search-result-symbol">{asset.symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
