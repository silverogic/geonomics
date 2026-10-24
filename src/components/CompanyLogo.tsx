import React, { useState } from 'react'

interface CompanyLogoProps {
  logoUrl: string | null
  name: string
  ticker: string
  size?: 'xs' | 'sm' | 'md'
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  logoUrl,
  name,
  ticker,
  size = 'md',
}) => {
  const [hasError, setHasError] = useState(false)

  const sizeClass =
    size === 'xs'
      ? 'w-4 h-4 text-[8px] rounded'
      : size === 'sm'
        ? 'w-5 h-5 text-[9px] rounded-md'
        : 'w-6 h-6 text-[10px] rounded-md'

  if (!logoUrl || hasError) {
    const initial = (name || ticker || '?').trim().charAt(0).toUpperCase()
    return (
      <div
        className={`${sizeClass} bg-slate-800/80 text-indigo-300 font-black font-mono flex items-center justify-center shrink-0 select-none`}
      >
        {initial}
      </div>
    )
  }

  return (
    <img
      src={logoUrl}
      alt={name}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`${sizeClass} object-contain shrink-0`}
    />
  )
}
