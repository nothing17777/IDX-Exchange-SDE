// Browser-local store for the things the side rail shows: saved homes, recent
// searches and the home-buying checklist. There is no sign-in, so everything
// lives in localStorage and is scoped to this browser.
import { useSyncExternalStore } from 'react'

const KEYS = { favorites: 'idx.favorites', searches: 'idx.searches', plan: 'idx.plan' }
const listeners = new Set()

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const value = JSON.parse(raw)
    return Array.isArray(fallback) ? (Array.isArray(value) ? value : fallback) : value ?? fallback
  } catch {
    // Private mode, cleared site data or a value another tab wrote badly.
    return fallback
  }
}

function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage unavailable */ }
  listeners.forEach((fn) => fn())
}

const subscribe = (fn) => {
  listeners.add(fn)
  // Another tab writing the same keys fires 'storage' here, not our listeners.
  window.addEventListener('storage', fn)
  return () => { listeners.delete(fn); window.removeEventListener('storage', fn) }
}

// useSyncExternalStore compares snapshots by identity, so each getter caches its
// parsed value and only replaces it when the underlying JSON actually changed.
function cachedGetter(key, fallback) {
  let raw = null
  let parsed = fallback
  return () => {
    let next = null
    try { next = localStorage.getItem(key) } catch { /* storage unavailable */ }
    if (next !== raw) { raw = next; parsed = read(key, fallback) }
    return parsed
  }
}

const getFavorites = cachedGetter(KEYS.favorites, [])
const getSearches = cachedGetter(KEYS.searches, [])
const getPlan = cachedGetter(KEYS.plan, {})

export function useFavorites() {
  return useSyncExternalStore(subscribe, getFavorites, () => [])
}

export function useSearches() {
  return useSyncExternalStore(subscribe, getSearches, () => [])
}

export function usePlan() {
  return useSyncExternalStore(subscribe, getPlan, () => ({}))
}

export function isFavorite(id) {
  return getFavorites().some((p) => String(p.id) === String(id))
}

// Stores a copy of the card fields so /favorites renders without refetching each
// listing; the id still links through to the live detail page.
export function toggleFavorite(property) {
  const id = String(property.id)
  const list = getFavorites()
  const without = list.filter((p) => String(p.id) !== id)
  if (without.length !== list.length) { write(KEYS.favorites, without); return false }
  const { price, address, city, state, beds, baths, sqft, photos } = property
  write(KEYS.favorites, [{ id, price, address, city, state, beds, baths, sqft, photos, savedAt: Date.now() }, ...without])
  return true
}

export function removeFavorite(id) {
  write(KEYS.favorites, getFavorites().filter((p) => String(p.id) !== String(id)))
}

const MAX_SEARCHES = 12

export function recordSearch({ q, category, path }) {
  const term = (q || '').trim()
  if (!term) return
  const list = getSearches().filter((s) => !(s.q.toLowerCase() === term.toLowerCase() && s.category === category))
  write(KEYS.searches, [{ q: term, category, path, at: Date.now() }, ...list].slice(0, MAX_SEARCHES))
}

export function removeSearch(at) {
  write(KEYS.searches, getSearches().filter((s) => s.at !== at))
}

export function clearSearches() {
  write(KEYS.searches, [])
}

export function togglePlanStep(id) {
  const plan = getPlan()
  write(KEYS.plan, { ...plan, [id]: !plan[id] })
}
