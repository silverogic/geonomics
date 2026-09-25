import React, { useId } from 'react'

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  className?: string
  label?: string
  showGlow?: boolean
}

/**
 * Themed Spinner component aligned with Geonomics' neon dark theme.
 * Features an orbital indigo-blue-cyan gradient track, glowing drop shadow,
 * and an ambient central pulsing micro-orb.
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className = '',
  label,
  showGlow = true,
}) => {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '') || 'spin'
  const gradientId = `spinner-grad-${rawId}`
  const glowId = `spinner-glow-${rawId}`

  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'xs'
      ? 16
      : size === 'sm'
      ? 24
      : size === 'md'
      ? 36
      : size === 'lg'
      ? 48
      : 64

  return (
    <div
      role="status"
      aria-label={label || 'Loading...'}
      className={`inline-flex flex-col items-center justify-center gap-2.5 ${className}`}
    >
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: `${pixelSize}px`, height: `${pixelSize}px` }}
      >
        {/* Ambient neon backdrop glow */}
        {showGlow && (
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/25 via-blue-500/20 to-cyan-400/25 blur-md animate-pulse pointer-events-none"
            style={{ transform: 'scale(1.2)' }}
          />
        )}

        {/* Central glowing micro orb */}
        <div
          className="absolute rounded-full bg-gradient-to-tr from-indigo-500 via-blue-400 to-cyan-300 opacity-70 animate-ping pointer-events-none"
          style={{
            width: `${Math.max(4, Math.round(pixelSize * 0.18))}px`,
            height: `${Math.max(4, Math.round(pixelSize * 0.18))}px`,
            animationDuration: '2.5s',
          }}
        />

        {/* Rotating SVG orbital gradient ring */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full animate-spin"
          style={{ animationDuration: '0.9s' }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />   {/* indigo-500 */}
              <stop offset="50%" stopColor="#3b82f6" />  {/* blue-500 */}
              <stop offset="100%" stopColor="#06b6d4" /> {/* cyan-400 */}
            </linearGradient>
            {showGlow && (
              <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#6366f1" floodOpacity="0.6" />
              </filter>
            )}
          </defs>

          {/* Background subtle orbital track */}
          <circle
            cx="24"
            cy="24"
            r="19"
            stroke="currentColor"
            strokeWidth="3.5"
            className="text-slate-800/80"
          />

          {/* Foreground gradient glowing spinning arc */}
          <circle
            cx="24"
            cy="24"
            r="19"
            stroke={`url(#${gradientId})`}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="119.38"
            strokeDashoffset="35"
            filter={showGlow ? `url(#${glowId})` : undefined}
          />
        </svg>
      </div>

      {label && (
        <span className="text-xs sm:text-sm font-semibold text-slate-300 animate-pulse tracking-wide text-center">
          {label}
        </span>
      )}
    </div>
  )
}
