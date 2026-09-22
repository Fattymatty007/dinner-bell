import React from 'react';
import ReactDOM from 'react-dom/client';
import GroceryList from './GroceryList.jsx';
import LicenseGate from './LicenseGate.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LicenseGate appName="Dinner Bell">
      <GroceryList />
    </LicenseGate>
  </React.StrictMode>
);
