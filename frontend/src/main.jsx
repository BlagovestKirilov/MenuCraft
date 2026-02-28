import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './i18n/i18n';
import './index.css';

// Capture the initial URL (needed for Facebook OAuth callback redirect)
const initialEntry = window.location.pathname + window.location.search;

// Clean the browser URL bar — MemoryRouter keeps routing in memory
window.history.replaceState({}, '', '/');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  </React.StrictMode>
);
