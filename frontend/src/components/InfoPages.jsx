import { Link } from 'react-router-dom'
import './rail.css'

// Everything factual here comes from idxexchange.com: the product line-up and
// positioning from the homepage, the contact details from /contact/, the MLS
// integration detail from /mls-partners/, and the program tracks and prices
// from /internship and /training_registration.
const PHONE = '(650) 209-0551'
const ADDRESS = ['10020 W. Fairview Ave, Suite 104', 'Boise, Idaho 83704']

function Page({ title, lead, children, aside }) {
  return <div className={aside ? 'info-page has-aside' : 'info-page'}>
    <div>
      <h1>{title}</h1>
      {lead && <p className="info-lead">{lead}</p>}
      {children}
    </div>
    {aside && <aside className="info-aside">{aside}</aside>}
  </div>
}

function Cards({ items }) {
  return <div className="info-cards">
    {items.map((c) => (
      <div className="info-card" key={c.title}>
        <h3>{c.title}</h3>
        <p>{c.body}</p>
        {c.to && <Link to={c.to}>{c.cta} →</Link>}
      </div>
    ))}
  </div>
}

function ContactCard() {
  return <>
    <h3>Talk to IDX Exchange</h3>
    <p className="info-contact"><strong>Phone</strong><a href="tel:+16502090551">{PHONE}</a></p>
    <p className="info-contact"><strong>Address</strong><span>{ADDRESS[0]}<br />{ADDRESS[1]}</span></p>
    <p className="info-contact"><strong>Online</strong><a href="https://idxexchange.com/contact/" target="_blank" rel="noreferrer">idxexchange.com/contact</a></p>
  </>
}

export function Sell() {
  return <Page
    title="Sell your home"
    lead="Price it with the same data the market is using. IDX Exchange builds machine-learning price prediction on real MLS transaction data, so the number you start from is grounded in what comparable homes actually sold for."
    aside={<ContactCard />}
  >
    <Cards items={[
      { title: '1. Understand your home’s value', body: 'Our price prediction models are trained on sold transactions, not asking prices. That is the difference between what a home was listed at and what a buyer paid.' },
      { title: '2. Check what your market is doing', body: 'Market Stats dashboards track inventory, price movement and days on market by region, so you can see whether you are listing into a rising or a slowing market.' },
      { title: '3. Work with an agent', body: 'An agent lists your home on the MLS, which is what feeds every search portal, including this one.', to: '/agents', cta: 'Find an agent' },
      { title: '4. Watch comparable listings', body: 'Search the homes competing with yours in the same ZIP code and save them to track price cuts.', to: '/for-sale', cta: 'Browse listings' },
    ]} />
    <h2 className="info-h2">What your listing looks like here</h2>
    <p>Every listing on this site comes through the MLS and carries its photos, beds and baths, square footage, year built, map location and any scheduled open houses. That is the same record buyers see on the portals your agent syndicates to.</p>
  </Page>
}

export function Agents() {
  return <Page
    title="Find an agent"
    lead="IDX Exchange is a tech company that works with real estate professionals — agents, brokers and MLS organizations — rather than a brokerage that employs agents directly."
    aside={<ContactCard />}
  >
    <h2 className="info-h2">How to find the right one</h2>
    <ul className="info-ul">
      <li><strong>Pick for the ZIP code, not the brand.</strong> An agent who closes deals every month in your target neighborhood knows its pricing better than a bigger name from across the metro.</li>
      <li><strong>Ask what they have sold recently.</strong> Recent sold comparables in your price band matter more than total career volume.</li>
      <li><strong>Ask how they price.</strong> Agents who work from sold data and market statistics, not a gut number, are the ones our tools are built for.</li>
      <li><strong>Check their listings.</strong> Pull up homes they represent and see the photography, the detail and the open house scheduling.</li>
    </ul>
    <h2 className="info-h2">If you are an agent or broker</h2>
    <p>IDX Exchange provides plug-and-play websites with MLS property search, market statistics and a home value estimator built in, plus AI-driven research dashboards and a shared marketing model that targets specific ZIP codes.</p>
    <Cards items={[
      { title: 'All-In-One Website', body: 'The base website model: choose your domain and IDX Exchange handles MLS search, market stats and the home value estimator.', to: '/advertise', cta: 'See what is included' },
      { title: 'MLS integration', body: 'Listings are pulled through Trestle and Bridge, in partnership with MLS organizations and associations nationwide.' },
    ]} />
  </Page>
}

export function ManageRentals() {
  return <Page
    title="Manage rentals"
    lead="Rental listings on this site come from the MLS feed, the same source as the for-sale inventory."
    aside={<ContactCard />}
  >
    <Cards items={[
      { title: 'Your rental inventory', body: 'Lease and apartment listings are categorized separately from for-sale homes, so renters searching here see only what is actually available to rent.', to: '/rent', cta: 'Browse rentals' },
      { title: 'Listing detail', body: 'Each rental carries photos, beds and baths, square footage, year built and its map location — the full MLS record, not a stripped summary.' },
      { title: 'Reach renters in a ZIP code', body: 'The shared marketing model runs B2C campaigns targeting specific ZIP codes rather than broad, untargeted spend.', to: '/advertise', cta: 'How advertising works' },
      { title: 'Market context', body: 'Market Stats dashboards show how rents and inventory are moving in the regions you operate in.' },
    ]} />
    <h2 className="info-h2">Listing a rental</h2>
    <p>Rentals reach this site through the MLS. Your listing agent or property manager enters it there, and it flows in with the rest of the feed. To ask about getting a rental portfolio onto an IDX Exchange site, call {PHONE}.</p>
  </Page>
}

export function Advertise() {
  return <Page
    title="Advertise"
    lead="IDX Exchange runs a shared marketing model covering both B2B and B2C campaigns, with targeting down to specific ZIP codes."
    aside={<ContactCard />}
  >
    <h2 className="info-h2">What IDX Exchange builds</h2>
    <Cards items={[
      { title: 'Web Development', body: 'A plug-and-play base website: MLS property search, market statistics visualizations and a home value estimator. Choose your domain and IDX Exchange handles the rest.' },
      { title: 'Research', body: 'AI-driven Tableau dashboards delivering real-time real estate insights across geographic regions.' },
      { title: 'Price Prediction', body: 'Machine-learning property price predictions that help agents and brokers make informed pricing decisions.' },
      { title: 'Marketing', body: 'A shared marketing model for B2B and B2C engagement, with campaigns targeting specific ZIP codes.' },
      { title: 'MLS Partners', body: 'Partnerships with MLS agencies nationwide, with listing data integrated through Trestle and Bridge.' },
      { title: 'Data Science', body: 'Machine-learning models and insights from the research team, built on real transaction data.' },
    ]} />
    <h2 className="info-h2">Products</h2>
    <ul className="info-ul">
      <li><strong>All-In-One Website</strong> — the full agent site, live in California and Idaho.</li>
      <li><strong>Market Stats</strong> — regional market statistics dashboards.</li>
      <li><strong>Top Agents &amp; Offices</strong> — competitive analysis of agents and offices by market.</li>
    </ul>
    <p>To talk about pricing or a package, call {PHONE} or visit <a href="https://idxexchange.com/" target="_blank" rel="noreferrer">idxexchange.com</a>.</p>
  </Page>
}

export function Help() {
  return <Page
    title="Get help"
    lead="Questions about this site, the listing data behind it, or the IDX Exchange programs."
    aside={<ContactCard />}
  >
    <h2 className="info-h2">Using this site</h2>
    <dl className="info-faq">
      <dt>Where do the listings come from?</dt>
      <dd>From MLS data, integrated through Trestle and Bridge. IDX Exchange partners with MLS organizations and associations nationwide, including California Regional MLS, bridgeMLS, Intermountain MLS, Stellar MLS and others.</dd>
      <dt>How do I save a home?</dt>
      <dd>Tap the heart on any listing card or property page. Saved homes appear under <Link to="/favorites">Favorites</Link> in the left rail. There is no sign-in yet, so favorites, searches and your plan are stored in this browser only — clearing site data clears them, and they do not follow you to another device.</dd>
      <dt>How do I get back to a search?</dt>
      <dd>Searches you run are listed under <Link to="/searches">Recent searches</Link>, and <Link to="/updates">Updates</Link> shows the newest listings matching the last one.</dd>
      <dt>Why do some photos not load?</dt>
      <dd>Photo URLs in the MLS feed carry access tokens that expire. When one has expired the image 404s, and the gallery drops it rather than showing a broken image, so a listing can show fewer photos than the feed claims.</dd>
      <dt>Is a price on this site an appraisal?</dt>
      <dd>No. Listing prices come from the MLS, and any predicted value is a machine-learning estimate. Neither is an appraisal or a lending decision.</dd>
      <dt>A listing looks wrong. Who fixes it?</dt>
      <dd>Listing records are maintained by the listing agent in the MLS. Corrections have to be made there and flow through on the next sync.</dd>
    </dl>
    <h2 className="info-h2">Programs</h2>
    <dl className="info-faq">
      <dt>What is the internship program?</dt>
      <dd>Seven technical tracks — Data Analyst, Data Scientist, Software Development Engineer, NLP Engineer, AI Agentic Engineer, AWS Cloud Engineer and AI Integration Engineer (MCP) — each 12 weeks on real MLS data, with rolling admissions.</dd>
      <dt>What training is available?</dt>
      <dd>Nine tracks, from Power BI and SQL through Data Science, Full Stack, NLP, Tableau, Agentic AI and AWS Cloud, each ending in a deliverable and a certificate. Pricing is $49 for one module, $75 for any three, or $129 for all nine. Top performers are invited to intern.</dd>
      <dt>How do I reach a person?</dt>
      <dd>Call {PHONE}, or write to the office at {ADDRESS[0]}, {ADDRESS[1]}.</dd>
    </dl>
  </Page>
}
