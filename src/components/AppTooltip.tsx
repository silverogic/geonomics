import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface TooltipState {
  content: string
  x: number
  y: number
  followCursor: boolean
  rect: DOMRect | null
}

function findTooltipElement(target: EventTarget | null): Element | null {
  if (!(target instanceof Element)) return null
  let curr: Element | null = target

  while (curr && curr !== document.body && curr !== document.documentElement) {
    const rawTitle = curr.getAttribute('title')
    if (rawTitle && rawTitle.trim().length > 0) {
      const trimmed = rawTitle.trim()
      curr.setAttribute('data-tooltip', trimmed)
      if (!curr.hasAttribute('aria-label')) {
        curr.setAttribute('aria-label', trimmed.replace(/\n+/g, ' - '))
      }
      curr.removeAttribute('title')
      return curr
    }

    const dataTooltip = curr.getAttribute('data-tooltip')
    if (dataTooltip && dataTooltip.trim().length > 0) {
      return curr
    }

    curr = curr.parentElement
  }

  return null
}

function getValueColorClass(val: string): string {
  const trimmed = val.trim()
  if (/^\+\d/.test(trimmed)) return 'text-emerald-400'
  if (/^-\d/.test(trimmed)) return 'text-rose-400'
  return 'text-indigo-300'
}

export const AppTooltip: React.FC = () => {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const activeElRef = useRef<Element | null>(null)
  const [pos, setPos] = useState<{ left: number; top: number; placement: 'top' | 'bottom' | 'cursor' }>({
    left: -9999,
    top: -9999,
    placement: 'top',
  })

  useEffect(() => {
    // Skip hover tooltips on coarse touch devices
    const isTouchPrimary = window.matchMedia?.('(pointer: coarse)').matches

    const handleMouseOverOrMove = (e: MouseEvent) => {
      if (isTouchPrimary) return

      const el = findTooltipElement(e.target)
      if (!el) {
        if (activeElRef.current) {
          activeElRef.current = null
          setTooltip(null)
        }
        return
      }

      const content = el.getAttribute('data-tooltip')?.trim() || ''
      if (!content) {
        activeElRef.current = null
        setTooltip(null)
        return
      }

      const rect = el.getBoundingClientRect()
      const isSvg = el instanceof SVGElement
      const followCursor = isSvg || rect.width > 200 || rect.height > 90

      activeElRef.current = el
      setTooltip({
        content,
        x: e.clientX,
        y: e.clientY,
        followCursor,
        rect,
      })
    }

    const handleHide = () => {
      if (activeElRef.current) {
        activeElRef.current = null
        setTooltip(null)
      }
    }

    document.addEventListener('mouseover', handleMouseOverOrMove, { passive: true })
    document.addEventListener('mousemove', handleMouseOverOrMove, { passive: true })
    document.addEventListener('scroll', handleHide, { capture: true, passive: true })
    document.addEventListener('mousedown', handleHide, { passive: true })
    document.addEventListener('keydown', handleHide, { passive: true })
    window.addEventListener('blur', handleHide)

    return () => {
      document.removeEventListener('mouseover', handleMouseOverOrMove)
      document.removeEventListener('mousemove', handleMouseOverOrMove)
      document.removeEventListener('scroll', handleHide, { capture: true })
      document.removeEventListener('mousedown', handleHide)
      document.removeEventListener('keydown', handleHide)
      window.removeEventListener('blur', handleHide)
    }
  }, [])

  useEffect(() => {
    if (!tooltip || !tooltipRef.current) return

    const tipEl = tooltipRef.current
    const tipW = tipEl.offsetWidth || 180
    const tipH = tipEl.offsetHeight || 36
    const vw = window.innerWidth
    const vh = window.innerHeight
    const pad = 10

    if (tooltip.followCursor || !tooltip.rect) {
      let left = tooltip.x + 14
      let top = tooltip.y + 14

      if (left + tipW + pad > vw) {
        left = Math.max(pad, tooltip.x - tipW - 12)
      }
      if (top + tipH + pad > vh) {
        top = Math.max(pad, tooltip.y - tipH - 12)
      }

      setPos({ left, top, placement: 'cursor' })
    } else {
      const r = tooltip.rect
      let left = r.left + r.width / 2 - tipW / 2
      left = Math.max(pad, Math.min(left, vw - tipW - pad))

      let top = r.top - tipH - 8
      let placement: 'top' | 'bottom' = 'top'
      if (top < pad) {
        top = r.bottom + 8
        placement = 'bottom'
      }

      setPos({ left, top, placement })
    }
  }, [tooltip])

  if (!tooltip) return null

  const lines = tooltip.content
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length === 0) return null

  return createPortal(
    <div
      ref={tooltipRef}
      role="tooltip"
      style={{
        left: `${pos.left}px`,
        top: `${pos.top}px`,
      }}
      className="fixed z-[100] pointer-events-none select-none rounded-xl bg-slate-950/95 backdrop-blur-md border border-indigo-500/40 px-3 py-2 text-xs text-slate-100 shadow-[0_12px_32px_rgba(0,0,0,0.85),0_0_16px_rgba(99,102,241,0.18)] max-w-[290px] transition-opacity duration-75"
    >
      {lines.length > 1 ? (
        <div className="space-y-1">
          {/* Header Line */}
          <div className="font-bold text-white border-b border-slate-800/90 pb-1 mb-1 flex items-center justify-between gap-2">
            <span className="truncate">{lines[0]}</span>
          </div>
          {/* Detail Lines */}
          {lines.slice(1).map((line, idx) => {
            const colonIdx = line.indexOf(':')
            if (colonIdx > 0 && colonIdx < line.length - 1) {
              const keyPart = line.slice(0, colonIdx).trim()
              const valPart = line.slice(colonIdx + 1).trim()
              return (
                <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
                  <span className="text-slate-400 font-medium truncate">{keyPart}</span>
                  <span className={`font-mono font-bold shrink-0 ${getValueColorClass(valPart)}`}>
                    {valPart}
                  </span>
                </div>
              )
            }
            return (
              <div key={idx} className="text-[11px] text-slate-300 font-mono">
                {line}
              </div>
            )
          })}
        </div>
      ) : (
        (() => {
          const single = lines[0]
          const colonIdx = single.indexOf(':')
          if (colonIdx > 0 && colonIdx < single.length - 1) {
            const keyPart = single.slice(0, colonIdx).trim()
            const valPart = single.slice(colonIdx + 1).trim()
            return (
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-slate-400 font-medium">{keyPart}:</span>
                <span className={`font-mono font-bold ${getValueColorClass(valPart)}`}>{valPart}</span>
              </div>
            )
          }
          return <div className="font-medium text-slate-100 leading-snug">{single}</div>
        })()
      )}
    </div>,
    document.body
  )
}
