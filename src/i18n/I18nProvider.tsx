'use client';

import { createContext, Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { EN } from './en';
import { ES } from './es';

export type Lang = 'es' | 'en';

const LANG_KEY = 'regnum-lang';
const DICTS: Record<Lang, Record<string, string>> = { es: ES, en: EN };

export type TFunction = (key: string, vars?: Record<string, string | number>) => string;

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TFunction;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Traduccion estilo gettext: la clave es el texto en español tal como esta en el codigo.
 * - es: usa ES solo para corregir claves viejas guardadas sin tilde ("Dano critico %").
 * - en: usa EN; si falta una traduccion se muestra el español (y en dev se avisa).
 * Variables con {nombre}: t('Puesto {n}', { n: 2 }).
 */
function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  let text = DICTS[lang][key];
  if (text === undefined) {
    if (lang === 'en' && process.env.NODE_ENV !== 'production' && key) reportMissing(key);
    text = ES[key] ?? key;
  }
  if (vars) {
    text = text.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
  }
  return text;
}

const missing = new Set<string>();
// Textos que ya estan en ingles (por ejemplo, un valor traducido dos veces): no son faltantes
const EN_VALUES = new Set(Object.values(EN));
function reportMissing(key: string) {
  if (missing.has(key) || EN_VALUES.has(key)) return;
  missing.add(key);
  (window as unknown as { __i18nMissing?: Set<string> }).__i18nMissing = missing;
  console.warn('[i18n] falta traduccion:', key);
}

function detectLang(): Lang {
  try {
    const stored = window.localStorage.getItem(LANG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed === 'es' || parsed === 'en') return parsed;
    }
  } catch { /* sin storage */ }
  return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Arranca en español (lo que renderiza el servidor) y cambia al montar si corresponde
  const [lang, setLangState] = useState<Lang>('es');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- el idioma guardado solo se conoce en el cliente
    setLangState(detectLang());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try { window.localStorage.setItem(LANG_KEY, JSON.stringify(next)); } catch { /* sin storage */ }
  }, []);

  const t = useCallback<TFunction>((key, vars) => translate(lang, key, vars), [lang]);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}

/**
 * Texto traducido con elementos adentro: rich(t, 'Ganó {nombre} por {n}', { nombre: <b>X</b>, n: 3 }).
 * Sirve cuando parte de la frase va resaltada y el orden de las palabras cambia entre idiomas.
 */
export function rich(t: TFunction, key: string, nodes: Record<string, React.ReactNode>): React.ReactNode {
  const text = t(key);
  return text.split(/(\{\w+\})/g).map((part, i) => {
    const m = part.match(/^\{(\w+)\}$/);
    return <Fragment key={i}>{m && m[1] in nodes ? nodes[m[1]] : part}</Fragment>;
  });
}

/** Atajo para los componentes: const t = useT(); */
export function useT(): TFunction {
  return useI18n().t;
}
