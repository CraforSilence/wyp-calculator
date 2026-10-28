'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { HelpPopover } from './HelpPopover';
import { translateLabel, type SelectOption } from './Select';
import { useT } from '@/i18n/I18nProvider';

interface IconSelectProps {
  value: string;
  onChange: (value: string) => void;
  /** Con `group`, las opciones se muestran agrupadas en el orden en que aparecen. */
  options: SelectOption[];
  /** Ícono de cada opción (y de la elegida). */
  renderIcon?: (value: string) => ReactNode;
  label?: string;
  tooltip?: string;
  className?: string;
  disabled?: boolean;
}

const LIST_MAX_HEIGHT = 288;

/**
 * Selector con íconos en las opciones. Un <select> nativo no puede mostrar imágenes en la lista,
 * así que este dibuja la suya (en un portal, para que no la recorten las tarjetas).
 */
export function IconSelect({ value, onChange, options, renderIcon, label, tooltip, className = '', disabled }: IconSelectProps) {
  const t = useT();
  const id = useId();
  const listId = `${id}-list`;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState<{ left: number; top: number; width: number; up: boolean } | null>(null);

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = options[selectedIndex];
  const labelOf = (o: SelectOption) => translateLabel(o.label, t);

  const place = useCallback(() => {
    const r = buttonRef.current?.getBoundingClientRect();
    if (!r) return;
    const below = window.innerHeight - r.bottom;
    const up = below < LIST_MAX_HEIGHT && r.top > below;
    setPos({ left: r.left, top: up ? r.top - 4 : r.bottom + 4, width: Math.max(r.width, 224), up });
  }, []);

  const openList = (index = selectedIndex) => {
    if (disabled) return;
    place();
    setActive(Math.max(index, 0));
    setOpen(true);
  };
  const close = () => setOpen(false);
  const choose = (index: number) => {
    const opt = options[index];
    if (opt) onChange(opt.value);
    close();
    buttonRef.current?.focus();
  };

  // Seguir al botón si la página se mueve; cerrar con un clic afuera.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!buttonRef.current?.contains(target) && !listRef.current?.contains(target)) close();
    };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, place]);

  useLayoutEffect(() => {
    if (open && active >= 0) listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1;
    const move = (to: number) => { e.preventDefault(); if (open) setActive(Math.min(Math.max(to, 0), last)); else openList(); };
    switch (e.key) {
      case 'ArrowDown': return move(active + 1);
      case 'ArrowUp': return move(active - 1);
      case 'Home': return move(0);
      case 'End': return move(last);
      case 'Enter':
      case ' ':
        e.preventDefault();
        return open ? choose(active) : openList();
      case 'Escape':
        if (open) { e.preventDefault(); close(); }
        return;
      case 'Tab':
        return close();
      default:
        // Salta a la siguiente opción que empieza con la letra tecleada.
        if (e.key.length === 1 && /\p{L}/u.test(e.key)) {
          const from = open ? active : selectedIndex;
          const key = e.key.toLowerCase();
          for (let i = 1; i <= options.length; i++) {
            const idx = (from + i) % options.length;
            if (labelOf(options[idx]).toLowerCase().startsWith(key)) {
              if (open) setActive(idx); else onChange(options[idx].value);
              break;
            }
          }
        }
    }
  };

  const iconSlot = (v: string) => renderIcon && (
    <span className="flex w-[1.2em] shrink-0 justify-center text-base">{v ? renderIcon(v) : null}</span>
  );

  let lastGroup: string | undefined;
  const items: ReactNode[] = [];
  options.forEach((opt, i) => {
    if (opt.group && opt.group !== lastGroup) {
      items.push(
        <li key={`g-${opt.group}`} role="presentation" className="px-2.5 pt-2 pb-1 text-xs font-semibold text-zinc-400">
          {t(opt.group)}
        </li>,
      );
    }
    lastGroup = opt.group;
    const isSelected = i === selectedIndex;
    items.push(
      <li
        key={opt.value || '_empty'}
        id={`${id}-opt-${i}`}
        data-index={i}
        role="option"
        aria-selected={isSelected}
        onMouseEnter={() => setActive(i)}
        onMouseDown={(e) => { e.preventDefault(); choose(i); }}
        className={`flex items-center gap-2 px-2.5 py-1.5 cursor-pointer ${opt.group ? 'pl-4' : ''} ${
          i === active ? 'bg-zinc-700/80' : ''
        } ${isSelected ? 'text-amber-400' : opt.value ? 'text-zinc-100' : 'text-zinc-500'}`}
      >
        {iconSlot(opt.value)}
        <span className="flex-1 truncate">{labelOf(opt)}</span>
        {isSelected && <span aria-hidden className="text-xs">✓</span>}
      </li>,
    );
  });

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs text-zinc-400 font-medium">
          {label}
          {tooltip && <HelpPopover text={tooltip} />}
        </label>
      )}
      <button
        ref={buttonRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? `${id}-opt-${active}` : undefined}
        title={!label ? tooltip : undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
        className={`flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-left text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors disabled:opacity-50 ${className}`}
      >
        {iconSlot(value)}
        <span className="flex-1 truncate">{selected ? labelOf(selected) : ''}</span>
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0 text-zinc-400" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
      {open && pos && createPortal(
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          style={{
            position: 'fixed', left: pos.left, width: pos.width, maxHeight: LIST_MAX_HEIGHT,
            ...(pos.up ? { bottom: window.innerHeight - pos.top } : { top: pos.top }),
          }}
          className="z-[100] overflow-y-auto rounded-md border border-zinc-700 bg-zinc-900 py-1 text-sm shadow-xl shadow-black/50"
        >
          {items}
        </ul>,
        document.body,
      )}
    </div>
  );
}
