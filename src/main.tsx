import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register the PWA service worker for background rest-timer notifications.
// Skip it when running inside the Capacitor native shell: there we use a native
// notification plugin, and a service worker inside the WebView can interfere
// with local asset loading.
const isNativeShell = !!(window as any).Capacitor?.isNativePlatform?.();

// Tag the document on native Android so CSS can disable GPU-heavy ambient
// animations — the WebView's compositor is the bottleneck there, not the device.
if ((window as any).Capacitor?.getPlatform?.() === 'android') {
  document.documentElement.classList.add('native-android');
}
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

