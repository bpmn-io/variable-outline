import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

import '@camunda/design-system/styles.css';
import '@bpmn-io/c4-theme/assets/all.css';
import './index.scss';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
