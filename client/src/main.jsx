import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './appearance.css';
import App from './App.jsx';
import { applyAppearanceFromStorage, initGlobalThemeListeners } from './utils/appearance';

applyAppearanceFromStorage();
initGlobalThemeListeners();

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>,
);