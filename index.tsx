
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  
  // الرندرة المباشرة بدون أي تعقيدات أو انتظار ملفات خارجية
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
