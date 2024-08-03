import React from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';

const rootNode = document.getElementById('root');
const root = createRoot(rootNode);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);