// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { AnnoncesProvider } from './contexts/AnnoncesContext';
import { ToastProvider } from './components/Toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <AnnoncesProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AnnoncesProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
