'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseLocalStorageOptions<T> {
  /** If provided, called with raw parsed JSON. Return migrated value or undefined to skip. */
  migrate?: (raw: unknown) => T | undefined;
}

// Custom event name for intra-tab sync between multiple useLocalStorage instances
const SYNC_EVENT = 'regnum-localstorage-sync';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageOptions<T>
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        const migrated = options?.migrate?.(parsed);
        if (migrated !== undefined) {
          setStoredValue(migrated);
          window.localStorage.setItem(key, JSON.stringify(migrated));
        } else {
          setStoredValue(parsed);
        }
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    setMounted(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Listen for sync events from other instances of the same key
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.key === key) {
        setStoredValue(detail.value);
      }
    };
    window.addEventListener(SYNC_EVENT, handler);
    return () => window.removeEventListener(SYNC_EVENT, handler);
  }, [key]);

  // Ultimo valor de esta instancia, para cuando localStorage esta vacio o no se puede leer
  const valueRef = useRef(storedValue);
  valueRef.current = storedValue;

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    // El valor nuevo se calcula una sola vez y partiendo de lo ultimo guardado, no del estado
    // de esta instancia: otra instancia de la misma clave puede haber escrito recien (su
    // evento de sync todavia no llego) y varias llamadas seguidas se encadenan bien.
    let base = valueRef.current;
    try {
      const item = window.localStorage.getItem(key);
      if (item) base = JSON.parse(item);
    } catch {
      // Si no se puede leer, se usa el estado de esta instancia
    }
    const newValue = value instanceof Function ? value(base) : value;
    try {
      window.localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.warn(`Error writing localStorage key "${key}":`, error);
    }
    valueRef.current = newValue;
    setStoredValue(newValue);
    // Notify other instances of the same key in this tab (async to avoid setState-during-render)
    queueMicrotask(() => {
      window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { key, value: newValue } }));
    });
  }, [key]);

  // Return initialValue until mounted to avoid hydration mismatch.
  // Third element tells consumers when the stored value has been loaded.
  return [mounted ? storedValue : initialValue, setValue, mounted];
}
