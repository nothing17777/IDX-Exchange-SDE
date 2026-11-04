import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PropertyCard from './PropertyCard.jsx'
import SaveButton from './SaveButton.jsx'
import { useFavorites, useSearches, usePlan, removeFavorite, removeSearch, clearSearches, togglePlanStep } from '../saved.js'
import './rail.css'

const usd = (n) => (n ? '$' + Number(n).toLocaleString() : 'Price unavailable')
const ago = (ts) => {
  const mins = Math.round((Date.now() - ts) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  return `${Math.round(hrs / 24)} d ago`
}

function Page({ title, lead, children }) {
  return <div className="rail-page">
    <h1>{title}</h1>
    {lead && <p className="rail-lead">{lead}</p>}
    {children}
  </div>
}

function Empty({ children, to = '/for-sale', cta = 'Browse homes' }) {
  return <div className="rail-empty">
    <p>{children}</p>
    <Link className="rail-cta" to={to}>{cta}</Link>
  </div>
}

export function Favorites() {
  const favorites = useFavorites()
  return <Page
    title="Favorites"
    lead={favorites.length ? `${favorites.length} saved ${favorites.length === 1 ? 'home' : 'homes'}. Saved on this browser.` : null}
  >
    {favorites.length === 0
      ? <Empty>You haven&rsquo;t saved any homes yet. Tap the heart on any listing and it will show up here.</Empty>
      : <div className="rail-grid">
          {favorites.map((p) => (
            <div className="rail-fav" key={p.id}>
              <PropertyCard property={p} />
              <button type="button" className="rail-remove" onClick={() => removeFavorite(p.id)}>Remove</button>
            </div>
          ))}
        </div>}
  </Page>
}

export function Searches() {
  const searches = useSearches()
  return <Page title="Recent searches" lead={searches.length ? 'Pick up where you left off.' : null}>
    {searches.length === 0
      ? <Empty>No searches yet. Search for a city, neighborhood or ZIP code and it will be saved here.</Empty>
      : <>
          <ul className="rail-list">
            {searches.map((s) => (
              <li key={s.at}>
                <Link to={s.path}>
                  <strong>{s.q}</strong>
                  <span>{s.category === 'rent' ? 'For rent' : 'For sale'} · {ago(s.at)}</span>
                </Link>
                <button type="button" className="rail-remove" onClick={() => removeSearch(s.at)}>Remove</button>
              </li>
            ))}
          </ul>
          <button type="button" className="rail-remove" onClick={clearSearches}>Clear all searches</button>
        </>}
  </Page>
}

export function Updates() {
  const searches = useSearches()
  const recent = searches[0]
  const term = recent?.q || 'Los Angeles'
  const category = recent?.category || 'sale'
  const [d, setD] = useState(null)

  useEffect(() => {
    let live = true
    setD(null)
    const qs = new URLSearchParams({ q: term, category, sort: 'newest', limit: '9' })
    fetch('/api/properties?' + qs)
      .then((r) => r.json())
      .then((j) => { if (live) setD(Array.isArray(j?.results) ? j : { error: j?.error || 'Could not load updates.', results: [] }) })
      .catch(() => { if (live) setD({ error: 'Could not reach the server. Check that the backend is running.', results: [] }) })
    return () => { live = false }
  }, [term, category])

  return <Page
    title="Updates"
    lead={recent
      ? `Newest listings for your most recent search, ${recent.q}.`
      : 'Newest listings in Los Angeles. Run a search and this follows it instead.'}
  >
    <p><Link className="rail-steplink" to="/searches">See all recent searches →</Link></p>
    {!d && <p className="rail-muted">Loading the latest listings&hellip;</p>}
    {d?.error && <p className="rail-error">{d.error}</p>}
    {d && !d.error && d.results.length === 0 && <Empty>No new listings for {term} right now.</Empty>}
    {d && d.results.length > 0 && <div className="rail-grid">{d.results.map((p) => <PropertyCard key={p.id} property={p} />)}</div>}
  </Page>
}

// Ordered so each step unlocks the next; the mortgage calculator is the one
// tool on the site that answers step 2, so it is linked from there.
const STEPS = [
  { id: 'budget', title: 'Work out what you can afford', body: 'A lender looks at income, debts and down payment. Start with the monthly number you are comfortable paying.' },
  { id: 'payment', title: 'Estimate your monthly payment', body: 'Run a few price and down-payment combinations through the calculator.', to: '/mortgage', cta: 'Open the mortgage calculator' },
  { id: 'preapproval', title: 'Get pre-approved', body: 'A pre-approval letter tells sellers your offer is backed by a lender, and it fixes your real price ceiling.' },
  { id: 'agent', title: 'Find an agent', body: 'An agent who works your target ZIP codes every week knows what a home should actually sell for.', to: '/agents', cta: 'Find an agent' },
  { id: 'search', title: 'Save homes and searches', body: 'Save the homes you like and your searches, then watch Updates for new listings that match.', to: '/for-sale', cta: 'Start searching' },
  { id: 'tour', title: 'Tour homes and open houses', body: 'Open house times are listed on each property page when the listing agent has scheduled one.' },
  { id: 'offer', title: 'Make an offer and close', body: 'Your agent writes the offer, negotiates repairs after inspection, and walks you through closing.' },
]

export function Plan() {
  const plan = usePlan()
  const done = STEPS.filter((s) => plan[s.id]).length
  return <Page title="Your home-buying plan" lead={`${done} of ${STEPS.length} steps done. Progress is kept in this browser.`}>
    <div className="rail-progress" role="img" aria-label={`${done} of ${STEPS.length} steps complete`}>
      <span style={{ width: `${(done / STEPS.length) * 100}%` }} />
    </div>
    <ol className="rail-steps">
      {STEPS.map((s, i) => (
        <li key={s.id} className={plan[s.id] ? 'is-done' : undefined}>
          <label>
            <input type="checkbox" checked={!!plan[s.id]} onChange={() => togglePlanStep(s.id)} />
            <span className="rail-step-n">{i + 1}</span>
            <span>
              <strong>{s.title}</strong>
              <span className="rail-step-body">{s.body}</span>
              {s.to && <Link className="rail-steplink" to={s.to}>{s.cta} →</Link>}
            </span>
          </label>
        </li>
      ))}
    </ol>
  </Page>
}

export function Inbox() {
  const favorites = useFavorites()
  return <Page title="Inbox" lead="Messages from agents and lenders will appear here.">
    <div className="rail-empty">
      <p>You have no messages. There is no sign-in on this site yet, so nothing is tied to an account — reach the team directly instead.</p>
      <ul className="rail-contact">
        <li><strong>Phone</strong><a href="tel:+16502090551">(650) 209-0551</a></li>
        <li><strong>Address</strong><span>10020 W. Fairview Ave, Suite 104<br />Boise, Idaho 83704</span></li>
        <li><strong>Help</strong><Link to="/help">Get help</Link></li>
      </ul>
    </div>
    {favorites.length > 0 && <>
      <h2 className="rail-h2">Ask about a home you saved</h2>
      <ul className="rail-list">
        {favorites.slice(0, 5).map((p) => (
          <li key={p.id}>
            <Link to={`/property/${p.id}`}>
              <strong>{p.address || 'Saved home'}</strong>
              <span>{usd(p.price)} · {[p.city, p.state].filter(Boolean).join(', ')}</span>
            </Link>
            <SaveButton property={p} className="rail-heart" />
          </li>
        ))}
      </ul>
    </>}
  </Page>
}
