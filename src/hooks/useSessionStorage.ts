'use client';

import { useState, useEffect, useCallback } from 'react';

export function useSessionStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
    }
    setMounted(true);
  }, [key]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const newValue = value instanceof Function ? value(prev) : value;
      try {
        window.sessionStorage.setItem(key, JSON.stringify(newValue));
      } catch (error) {
        console.warn(`Error writing sessionStorage key "${key}":`, error);
      }
      return newValue;
    });
  }, [key]);

  return [mounted ? storedValue : initialValue, setValue];
}
