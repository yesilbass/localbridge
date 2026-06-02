/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { callAIProxy } from '../api/ai';
import { EN_CONTENT } from './en';
import { useI18n } from '../i18n';

const CACHE_KEY_PREFIX = 'bridge_content_';
const CACHE_VERSION = 2; // bump when EN_CONTENT gains new namespaces

function readCache(lang) {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY_PREFIX}${lang}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Invalidate caches built before versioning was added
    if (parsed?.__v !== CACHE_VERSION) return null;
    return parsed.content ?? null;
  } catch {
    return null;
  }
}

function writeCache(lang, content) {
  try {
    localStorage.setItem(`${CACHE_KEY_PREFIX}${lang}`, JSON.stringify({ __v: CACHE_VERSION, content }));
  } catch {
    // localStorage full or unavailable — skip silently
  }
}

// Deep-merge translated content with EN_CONTENT so that any namespace or key
// missing from the translation falls back to English instead of being undefined.
function mergeWithEnglish(translated) {
  const merged = {};
  const allNamespaces = new Set([...Object.keys(EN_CONTENT), ...Object.keys(translated)]);
  for (const ns of allNamespaces) {
    if (typeof EN_CONTENT[ns] === 'object' && EN_CONTENT[ns] !== null) {
      merged[ns] = { ...EN_CONTENT[ns], ...(translated[ns] ?? {}) };
    } else {
      merged[ns] = translated[ns] ?? EN_CONTENT[ns];
    }
  }
  return merged;
}

async function translateContent(targetLanguage) {
  return callAIProxy('onboarding_ai', {
    systemPrompt:
      'You are a professional UI translator. Translate all string values in the provided JSON object to ' +
      targetLanguage +
      '. Return ONLY valid JSON with the exact same nested key structure. Never translate the brand name "Bridge". Preserve special characters like "←", "→", "…", "·". Keep translations concise — this is UI copy.',
    prompt: JSON.stringify(EN_CONTENT),
    maxTokens: 8000,
    json: true,
  });
}

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const { language } = useI18n();
  const [content, setContent] = useState(EN_CONTENT);
  const [isTranslating, setIsTranslating] = useState(false);
  const activeRef = useRef(null);

  const loadContent = useCallback(async (lang) => {
    if (lang === 'en') {
      setContent(EN_CONTENT);
      setIsTranslating(false);
      return;
    }

    const cached = readCache(lang);
    if (cached) {
      setContent(mergeWithEnglish(cached));
      setIsTranslating(false);
      return;
    }

    setIsTranslating(true);
    try {
      const translated = await translateContent(lang);
      const merged = mergeWithEnglish(translated);
      writeCache(lang, translated);
      if (activeRef.current === lang) {
        setContent(merged);
      }
    } catch {
      // Fall back to English silently on translation failure
      if (activeRef.current === lang) {
        setContent(EN_CONTENT);
      }
    } finally {
      if (activeRef.current === lang) {
        setIsTranslating(false);
      }
    }
  }, []);

  useEffect(() => {
    activeRef.current = language;
    loadContent(language);
  }, [language, loadContent]);

  return (
    <ContentContext.Provider value={{ s: content, isTranslating }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used within ContentProvider');
  return ctx;
}

export { EN_CONTENT };
