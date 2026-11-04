import { useFavorites, toggleFavorite } from '../saved.js'

export default function SaveButton({ property, className = 'save-heart' }) {
  const favorites = useFavorites()
  const saved = favorites.some((p) => String(p.id) === String(property.id))
  return (
    <button
      type="button"
      className={saved ? `${className} is-saved` : className}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${property.address || 'this home'} from favorites` : `Save ${property.address || 'this home'} to favorites`}
      title={saved ? 'Saved' : 'Save this home'}
      // The card is wrapped in a <Link>, so the click must not navigate.
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(property) }}
    >
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path
          d="M27 5.6a7.91 7.91 0 00-10.49.87l-.51.47-.46-.47A7.91 7.91 0 005.05 5.6a8 8 0 00-.76 11.92l.65.66L15.29 28.7a1 1 0 001.42 0l10.35-10.52.65-.66A8 8 0 0027 5.6z"
          fill={saved ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2.5"
        />
      </svg>
    </button>
  )
}
