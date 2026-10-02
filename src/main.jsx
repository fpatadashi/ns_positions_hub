import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './shared/components/ErrorBoundary.jsx';
import ErrorLogWidget from './shared/components/ErrorLogWidget.jsx';
import { installGlobalErrorCapture } from './shared/lib/errorLog.js';
import './styles.css';

installGlobalErrorCapture();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
    <ErrorLogWidget />
  </React.StrictMode>
);
