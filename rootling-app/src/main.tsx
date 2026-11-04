import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// Fonts are bundled with the app rather than loaded from Google, so no third party sees children's visits.
import '@fontsource/fraunces/500.css';
import '@fontsource/fraunces/700.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/noto-sans-tamil/500.css';
import '@fontsource/noto-sans-tamil/700.css';
import '@fontsource/noto-sans-telugu/500.css';
import '@fontsource/noto-sans-telugu/700.css';
import '@fontsource/noto-sans-gurmukhi/500.css';
import '@fontsource/noto-sans-gurmukhi/700.css';
import '@fontsource/noto-sans-gujarati/500.css';
import '@fontsource/noto-sans-gujarati/700.css';
import '@fontsource/noto-sans-malayalam/500.css';
import '@fontsource/noto-sans-malayalam/700.css';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Keeps the app shell available offline once it has loaded (production only, so development always shows fresh code).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => void navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
