import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import './index.css'
import './redfin.css'
import './dark.css'
createRoot(document.getElementById('root')).render(<BrowserRouter><App /><ThemeToggle /></BrowserRouter>)
