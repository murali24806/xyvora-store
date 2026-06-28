import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { SiteSettingsProvider } from './context/SiteSettingsContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SiteSettingsProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </SiteSettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
