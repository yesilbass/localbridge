/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { EN_CONTENT } from './en';
import { useI18n } from '../i18n';

const CACHE_KEY_PREFIX = 'bridge_content_';

function readCache(lang) {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY_PREFIX}${lang}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(lang, content) {
  try {
    localStorage.setItem(`${CACHE_KEY_PREFIX}${lang}`, JSON.stringify(content));
  } catch {
    // localStorage full or unavailable — skip silently
  }
}

async function translateContent(targetLanguage) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('VITE_OPENAI_API_KEY is not set.');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 8000,
      messages: [
        {
          role: 'system',
          content:
            'You are a professional UI translator. Translate all string values in the provided JSON object to ' +
            targetLanguage +
            '. Return ONLY valid JSON with the exact same nested key structure. Never translate the brand name "Bridge". Preserve special characters like "←", "→", "…", "·". Keep translations concise — this is UI copy.',
        },
        { role: 'user', content: JSON.stringify(EN_CONTENT) },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Translation API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('OpenAI returned non-JSON translation response.');
  return JSON.parse(jsonMatch[0]);
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
      setContent(cached);
      setIsTranslating(false);
      return;
    }

    setIsTranslating(true);
    try {
      const translated = await translateContent(lang);
      writeCache(lang, translated);
      if (activeRef.current === lang) {
        setContent(translated);
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
