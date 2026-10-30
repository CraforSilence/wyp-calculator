'use client';

import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { generateId } from '@/lib/utils';
import { emptySetup, normalizeSetup, type SavedTrainerSetup, type TrainerSetup } from '@/lib/trainer';

/** Lo que está abierto en el entrenador */
const CURRENT_KEY = 'regnum-trainer-current';
/** Setup guardado del que salió lo que está abierto (para "Guardar cambios") */
const LOADED_KEY = 'regnum-trainer-loaded';
const SAVED_KEY = 'regnum-trainer-saved';
const MAX_SAVED = 50;

export function useTrainer() {
  const [current, setCurrentRaw, mounted] = useLocalStorage<TrainerSetup>(CURRENT_KEY, emptySetup('Caballero'), {
    migrate: (raw) => normalizeSetup(raw as TrainerSetup),
  });
  const [loadedId, setLoadedId] = useLocalStorage<string | null>(LOADED_KEY, null);
  const [saved, setSaved] = useLocalStorage<SavedTrainerSetup[]>(SAVED_KEY, []);

  const setCurrent = useCallback((setup: TrainerSetup) => setCurrentRaw(setup), [setCurrentRaw]);

  /** Guarda como setup nuevo y lo deja como el abierto. Devuelve el id, o null si ya hay demasiados. */
  const saveAs = useCallback((nombre: string, setup: TrainerSetup = current): string | null => {
    if (saved.length >= MAX_SAVED) return null;
    const id = generateId();
    setSaved((prev) => [...prev, { id, nombre, createdAt: new Date().toISOString(), setup }]);
    setLoadedId(id);
    return id;
  }, [current, saved.length, setSaved, setLoadedId]);

  /** Pisa un setup guardado con lo que está abierto */
  const overwrite = useCallback((id: string, nombre: string) => {
    setSaved((prev) => prev.map((s) => (s.id === id ? { ...s, nombre, setup: current } : s)));
    setLoadedId(id);
  }, [current, setSaved, setLoadedId]);

  const load = useCallback((id: string) => {
    const found = saved.find((s) => s.id === id);
    if (!found) return;
    setCurrentRaw(normalizeSetup(found.setup));
    setLoadedId(id);
  }, [saved, setCurrentRaw, setLoadedId]);

  const remove = useCallback((id: string) => {
    setSaved((prev) => prev.filter((s) => s.id !== id));
    if (loadedId === id) setLoadedId(null);
  }, [loadedId, setSaved, setLoadedId]);

  /** Setup nuevo en blanco: deja de estar atado al guardado que estaba abierto */
  const reset = useCallback((setup: TrainerSetup) => {
    setCurrentRaw(setup);
    setLoadedId(null);
  }, [setCurrentRaw, setLoadedId]);

  /** Lo que viene de un código: se guarda y se abre */
  const importSetup = useCallback((setup: TrainerSetup, nombre: string) => {
    const id = generateId();
    setSaved((prev) => (prev.length >= MAX_SAVED ? prev : [...prev, { id, nombre, createdAt: new Date().toISOString(), setup }]));
    setCurrentRaw(setup);
    setLoadedId(id);
  }, [setSaved, setCurrentRaw, setLoadedId]);

  const loaded = saved.find((s) => s.id === loadedId) ?? null;

  return { current, setCurrent, mounted, saved, loaded, saveAs, overwrite, load, remove, reset, importSetup, maxSaved: MAX_SAVED };
}
