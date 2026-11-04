import { beforeEach, describe, expect, it } from 'vitest'
import { isFavorite, toggleFavorite, removeFavorite, recordSearch, removeSearch, clearSearches } from './saved.js'

const favorites = () => JSON.parse(localStorage.getItem('idx.favorites') || '[]')
const searches = () => JSON.parse(localStorage.getItem('idx.searches') || '[]')
const home = { id: 7, address: '1 Main St', city: 'Boise', state: 'ID', price: 500000, photos: ['a.jpg'] }

beforeEach(() => localStorage.clear())

describe('favorites', () => {
  it('saves a home and reports it as saved', () => {
    expect(toggleFavorite(home)).toBe(true)
    expect(isFavorite(7)).toBe(true)
    expect(favorites()[0].address).toBe('1 Main St')
  })

  it('matches ids across string and number forms', () => {
    toggleFavorite(home)
    expect(isFavorite('7')).toBe(true)
  })

  it('toggles the same home back off', () => {
    toggleFavorite(home)
    expect(toggleFavorite({ ...home })).toBe(false)
    expect(favorites()).toHaveLength(0)
  })

  it('keeps the newest save first', () => {
    toggleFavorite(home)
    toggleFavorite({ ...home, id: 8, address: '2 Main St' })
    expect(favorites().map((p) => p.id)).toEqual(['8', '7'])
  })

  it('removes by id', () => {
    toggleFavorite(home)
    removeFavorite('7')
    expect(favorites()).toHaveLength(0)
  })

  it('survives a corrupt stored value', () => {
    localStorage.setItem('idx.favorites', '{not json')
    expect(isFavorite(7)).toBe(false)
    expect(toggleFavorite(home)).toBe(true)
  })
})

describe('recent searches', () => {
  it('ignores an empty term', () => {
    recordSearch({ q: '   ', category: 'sale', path: '/for-sale' })
    expect(searches()).toHaveLength(0)
  })

  it('de-duplicates the same term and category, ignoring case', () => {
    recordSearch({ q: 'Boise', category: 'sale', path: '/for-sale?q=Boise' })
    recordSearch({ q: 'boise', category: 'sale', path: '/for-sale?q=boise' })
    expect(searches()).toHaveLength(1)
    expect(searches()[0].q).toBe('boise')
  })

  it('keeps the same term under a different category', () => {
    recordSearch({ q: 'Boise', category: 'sale', path: '/for-sale?q=Boise' })
    recordSearch({ q: 'Boise', category: 'rent', path: '/rent?q=Boise' })
    expect(searches()).toHaveLength(2)
  })

  it('caps the history at 12', () => {
    for (let i = 0; i < 15; i++) recordSearch({ q: `City ${i}`, category: 'sale', path: '/for-sale' })
    expect(searches()).toHaveLength(12)
    expect(searches()[0].q).toBe('City 14')
  })

  it('removes one entry and clears all', () => {
    recordSearch({ q: 'Boise', category: 'sale', path: '/for-sale' })
    removeSearch(searches()[0].at)
    expect(searches()).toHaveLength(0)
    recordSearch({ q: 'Boise', category: 'sale', path: '/for-sale' })
    clearSearches()
    expect(searches()).toHaveLength(0)
  })
})
