'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseLocalStorageOptions<T> {
  /** If provided, called with raw parsed JSON. Return migrated value or undefined to skip. */
  migrate?: (raw: unknown) => T | undefined;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageOptions<T>
): [T, (value: T | ((prev: T) => T)) => void] {
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

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const newValue = value instanceof Function ? value(prev) : value;
      try {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      } catch (error) {
        console.warn(`Error writing localStorage key "${key}":`, error);
      }
      return newValue;
    });
  }, [key]);

  // Return initialValue until mounted to avoid hydration mismatch
  return [mounted ? storedValue : initialValue, setValue];
}
