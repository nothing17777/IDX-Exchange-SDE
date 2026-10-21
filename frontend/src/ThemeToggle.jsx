import { useState } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light')
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try { localStorage.setItem('theme', next) } catch { /* storage unavailable (private mode) */ }
    setTheme(next)
  }
  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  return <button type="button" className="theme-toggle" onClick={toggle} aria-label={label} title={label}>{theme === 'dark' ? '☀' : '☾'}</button>
}
