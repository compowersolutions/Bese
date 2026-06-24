/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeName = 'default' | 'eink' | 'minimal' | 'soothing';

export interface ThemeConfig {
  id: ThemeName;
  label: string;
  description: string;
  preview: { bg: string; card: string; accent: string; text: string };
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'default',
    label: 'Default',
    description: 'Classic slate & sky blue — the original Pula look',
    preview: { bg: '#f8fafc', card: '#ffffff', accent: '#75AADB', text: '#0f172a' },
  },
  {
    id: 'eink',
    label: 'E-Ink',
    description: 'Paper-white, ink-black, serif type. Zero colour distraction.',
    preview: { bg: '#f5f5f0', card: '#ffffff', accent: '#000000', text: '#000000' },
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Pure white canvas, hairline borders, invisible chrome.',
    preview: { bg: '#ffffff', card: '#ffffff', accent: '#111111', text: '#111111' },
  },
  {
    id: 'soothing',
    label: 'Soothing',
    description: 'Soft sage greens and warm whites — easy on the eyes.',
    preview: { bg: '#f0f4f0', card: '#fafcfa', accent: '#5a8a6a', text: '#2d3d2d' },
  },
];

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  settingsOpen: boolean;
  setSettingsOpen: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'default',
  setTheme: () => {},
  settingsOpen: false,
  setSettingsOpen: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    return (localStorage.getItem('bbb_theme') as ThemeName) || 'default';
  });
  const [settingsOpen, setSettingsOpen] = useState(false);

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    localStorage.setItem('bbb_theme', t);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'default') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, settingsOpen, setSettingsOpen }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
