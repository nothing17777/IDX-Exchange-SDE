import { NavLink } from 'react-router-dom'
import { useFavorites } from '../saved.js'

// Same glyphs the static rail markup used, now as real links.
const ICONS = {
  search: 'M29.41,26.59,23.77,21A12,12,0,0,0,14,2c-.17,0-.33,0-.5,0s-.33,0-.5,0A11,11,0,0,0,2,13c0,.17,0,.33,0,.5s0,.33,0,.5a12,12,0,0,0,19,9.77l5.64,5.64a2,2,0,0,0,2.82-2.82ZM14,22a8,8,0,1,1,8-8A8,8,0,0,1,14,22Z',
  updates: 'M29.41,26.59,23.77,21A12,12,0,0,0,14,2c-.17,0-.33,0-.5,0s-.33,0-.5,0A11,11,0,0,0,2,13c0,.17,0,.33,0,.5s0,.33,0,.5a12,12,0,0,0,19,9.77l5.64,5.64a2,2,0,0,0,2.82-2.82ZM18.17,14.87l-.23.24-3.7,3.78a.35.35,0,0,1-.51,0L10,15.11l-.23-.24a2.93,2.93,0,0,1,.27-4.29C12,9,14,11.29,14,11.29s1.67-2.34,3.9-.71A2.87,2.87,0,0,1,18.17,14.87Z',
  favorites: 'M27 5.6a7.91 7.91 0 00-10.49.87l-.51.47-.46-.47A7.91 7.91 0 005.05 5.6a8 8 0 00-.76 11.92l.65.66L15.29 28.7a1 1 0 001.42 0l10.35-10.52.65-.66A8 8 0 0027 5.6z',
  plan: 'M14.8 1.9a2 2 0 0 1 2.4 0l10.09 9.5a2 2 0 0 1 .71 1.53V28a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V12.93a2 2 0 0 1 .71-1.53zm8.492 11.54a1 1 0 0 0-1.414-.02l-8.417 8.178-3.466-3.21a1 1 0 0 0-1.36 1.468l4.86 4.499 9.777-9.501a1 1 0 0 0 .02-1.414',
  inbox: 'M29.84,17.62,24.52,5.21A2,2,0,0,0,22.68,4H9.32A2,2,0,0,0,7.48,5.21L2.16,17.62a1.92,1.92,0,0,0-.16.79V26a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V18.41A1.92,1.92,0,0,0,29.84,17.62ZM25,20H23.41l-1.56,1.57a1.49,1.49,0,0,1-1.06.43H11.21a1.49,1.49,0,0,1-1.06-.43L8.59,20H7a1,1,0,0,1,0-2H8.79a1.5,1.5,0,0,1,1.06.44L11.41,20h9.18l1.56-1.56A1.5,1.5,0,0,1,23.21,18H25a1,1,0,0,1,0,2Z',
}

const LINKS = [
  { to: '/for-sale', icon: 'search', label: 'Search' },
  { to: '/updates', icon: 'updates', label: 'Updates' },
  { to: '/favorites', icon: 'favorites', label: 'Favorites' },
  { to: '/plan', icon: 'plan', label: 'Plan' },
  { to: '/inbox', icon: 'inbox', label: 'Inbox' },
]

export default function Sidebar() {
  const favorites = useFavorites()
  return (
    <nav className="side" aria-label="Your activity">
      {LINKS.map(({ to, icon, label }) => (
        <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'side-link is-active' : 'side-link')}>
          <svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d={ICONS[icon]} /></svg>
          {label}
          {label === 'Favorites' && favorites.length > 0 && <span className="side-badge">{favorites.length}</span>}
        </NavLink>
      ))}
    </nav>
  )
}
