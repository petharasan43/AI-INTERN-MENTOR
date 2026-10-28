import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress non-critical Vite WebSocket HMR errors in preview sandbox environment
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (String(event.reason).includes('WebSocket') || String(event.reason.message).includes('WebSocket'))) {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('WebSocket')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(<App />);
