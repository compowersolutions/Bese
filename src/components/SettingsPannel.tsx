/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Palette, Check, Monitor, Feather, Leaf, Layers } from 'lucide-react';
import { useTheme, THEMES, ThemeName } from '../ThemeContext';

const THEME_ICONS: Record<ThemeName, React.ReactNode> = {
  default: <Monitor className="w-4 h-4" />,
  eink:    <Feather className="w-4 h-4" />,
  minimal: <Layers className="w-4 h-4" />,
  soothing:<Leaf className="w-4 h-4" />,
};

export default function SettingsPanel() {
  const { theme, setTheme, settingsOpen, setSettingsOpen } = useTheme();

  return (
    <AnimatePresence>
      {settingsOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setSettingsOpen(false)}
          />
          <motion.div
            key="panel"
            initial={{ opacity: 0, x: 320 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 320 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-80 z-50 flex flex-col shadow-2xl"
            style={{ backgroundColor: 'var(--bg-card)', borderLeft: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" style={{ color: 'var(--accent-text)' }} />
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Settings</span>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-70"
                style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)' }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              <section>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
                  Appearance
                </p>
                <div className="space-y-2">
                  {THEMES.map((t) => {
                    const isActive = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className="w-full text-left rounded-xl p-3.5 transition-all duration-200 flex items-start gap-3"
                        style={{
                          backgroundColor: isActive ? 'var(--accent-bg)' : 'var(--bg-muted)',
                          border: `1.5px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
                          style={{ backgroundColor: t.preview.bg, border: `1px solid ${t.preview.accent}33` }}
                        >
                          <div className="w-5 h-5 rounded-md" style={{ backgroundColor: t.preview.accent }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{t.label}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{THEME_ICONS[t.id]}</span>
                          </div>
                          <p className="text-[10px] leading-relaxed mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {t.description}
                          </p>
                        </div>
                        {isActive && <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-text)' }} />}
                      </button>
                    );
                  })}
                </div>
              </section>

              <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

              <section>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
                  About
                </p>
                <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: 'var(--bg-muted)' }}>
                  {[['App','Botswana Bus Booking'],['Version','1.0.0'],['Region','Botswana 🇧🇼'],['Currency','BWP (Pula)']].map(([k,v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="px-6 py-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <p className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
                Pula ya sarasara · Botswana Transit Engine
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}