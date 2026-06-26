import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register the PWA service worker for background rest-timer notifications.
// Skip it when running inside the Capacitor native shell: there we use a native
// notification plugin, and a service worker inside the WebView can interfere
// with local asset loading.
const isNativeShell = !!(window as any).Capacitor?.isNativePlatform?.();
if ('serviceWorker' in navigator && !isNativeShell) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('SW successfully registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.error('SW registration failure:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

