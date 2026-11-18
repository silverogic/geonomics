import React, { useEffect, useState } from 'react'
import { ExternalLink, Globe, LifeBuoy, Users } from 'lucide-react'
import type { Language } from '../types/economics'
import { translations } from '../i18n/translations'
import { fetchVisitorStats, type VisitorStats } from '../services/visitorApi'

interface FooterProps {
  lang: Language
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = translations[lang]
  const [visitors, setVisitors] = useState<VisitorStats | null>(null)

  useEffect(() => {
    let active = true
    fetchVisitorStats().then((stats) => {
      if (active && stats) setVisitors(stats)
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <footer className="mt-16 border-t border-slate-800/80 bg-slate-950 py-10 text-slate-400 text-xs">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-200 font-bold text-base">
            <Globe className="w-5 h-5 text-indigo-400" />
            <span>Geonomics</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <a
              href="https://data.worldbank.org/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
            >
              <span>{t.footerWorldBank}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <a
              href="https://www.imf.org/external/datamapper/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
            >
              <span>{t.footerImf}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <a
              href="https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
            >
              <span>{t.footerEcb}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <a
              href="https://www.bis.org/statistics/cbpol.htm"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
            >
              <span>{t.footerBis}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <a
              href="https://pages.github.com/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
            >
              <span>{t.footerGithub}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <a
              href="https://github.com/silverogic/geonomics/issues"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-slate-300 hover:text-indigo-400 font-medium transition-colors"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.footerSupport}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="text-center text-slate-500 text-[11px] space-y-1">
          <p>* {t.footerDisclaimer}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-600 text-[11px]">
          <span className="text-center sm:text-left">
            (C) {new Date().getFullYear()} Geonomics. Powered by World Bank Open API, IMF World Economic Outlook (WEO), BIS SDMX & ECB Reference Rates. Hosted on GitHub Pages.
          </span>
          {visitors && (
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800/90 text-[11px] font-mono text-slate-300 shrink-0">
              <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                {t.footerVisitorsToday}{' '}
                <strong className="text-emerald-300 tabular-nums">
                  {visitors.today.toLocaleString()}
                </strong>
              </span>
              <span className="text-slate-600">/</span>
              <span>
                {t.footerVisitorsTotal}{' '}
                <strong className="text-slate-100 tabular-nums">
                  {visitors.total.toLocaleString()}
                </strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
