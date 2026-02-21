import { useState, memo } from 'react'
import './AssetLogo.css'

export default memo(function AssetLogo({ logo, name, size = 32 }) {
  const [failed, setFailed] = useState(false)

  if (!logo || failed) {
    return (
      <span className="asset-logo asset-logo-initial" style={{ width: size, height: size, fontSize: size * 0.45 }}>
        {(name || '?').charAt(0).toUpperCase()}
      </span>
    )
  }

  return (
    <span className="asset-logo" style={{ width: size, height: size }}>
      <img
        src={logo}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </span>
  )
})
