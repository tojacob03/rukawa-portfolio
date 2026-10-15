import { createRoot } from 'react-dom/client'
import App from './App.tsx'
// Fonts are bundled locally (no request to Google Fonts -> no visitor IP
// leaves for a third party just to render text). Only the weights the site
// uses. The per-weight files keep their unicode-range, so a browser fetches
// just the subsets a page actually needs (the per-subset files do not).
import '@fontsource/geist/400.css'
import '@fontsource/geist/500.css'
import '@fontsource/geist/600.css'
import '@fontsource/geist/700.css'
import '@fontsource/geist-mono/400.css'
import '@fontsource/geist-mono/500.css'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
