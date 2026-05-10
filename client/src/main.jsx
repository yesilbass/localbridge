import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './appearance.css';
import App from './App.jsx';
import { applyAppearanceFromStorage, initGlobalThemeListeners } from './utils/appearance';
import { I18nProvider } from './i18n';

applyAppearanceFromStorage();
initGlobalThemeListeners();

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <I18nProvider>
            <App />
        </I18nProvider>
    </StrictMode>,
);