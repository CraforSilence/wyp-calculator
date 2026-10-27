'use client';

import { Button } from '@/components/ui/Button';
import { useT } from '@/i18n/I18nProvider';

export interface ChecklistItem {
  label: string;
  done: boolean;
  /** Para que sirve o cuando hace falta; se muestra mientras no este cargado. */
  note?: string;
  /** Lo necesita la simulacion: se resalta mientras falte. */
  required?: boolean;
}

interface StepIntroProps {
  step: number;
  title: string;
  children: React.ReactNode;
  checklist?: ChecklistItem[];
}

/** Recuadro guia al inicio de cada paso del Build. */
export function StepIntro({ step, title, children, checklist }: StepIntroProps) {
  return (
    <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-600 text-white text-sm font-semibold">
          {step}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-amber-300">{title}</h2>
          <div className="mt-1 text-sm text-zinc-300 space-y-1">{children}</div>
          {checklist && checklist.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs">
              {checklist.map((item) => (
                <li
                  key={item.label}
                  className={`flex items-baseline gap-1.5 ${
                    item.done ? 'text-emerald-400' : item.required ? 'text-amber-400' : 'text-zinc-500'
                  }`}
                >
                  <span aria-hidden>{item.done ? '✓' : item.required ? '!' : '○'}</span>
                  <span className="font-medium">{item.label}</span>
                  {!item.done && item.note && <span className="text-zinc-500">· {item.note}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

interface StepNavProps {
  prev?: { label: string; onClick: () => void };
  next?: { label: string; onClick: () => void };
  /** Aviso cuando falta completar algo del paso; no bloquea el avance. */
  hint?: string;
}

/** Botones Volver / Continuar al pie de cada paso del Build. */
export function StepNav({ prev, next, hint }: StepNavProps) {
  const t = useT();
  return (
    <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col-reverse sm:flex-row sm:items-center gap-3">
      {prev ? (
        <Button variant="ghost" onClick={prev.onClick} className="self-start">
          ← {t('Volver a {paso}', { paso: prev.label })}
        </Button>
      ) : <span />}
      {next && (
        <div className="sm:ml-auto flex flex-col sm:items-end gap-1.5">
          {hint && <p className="text-xs text-zinc-500">{hint}</p>}
          <Button size="lg" onClick={next.onClick}>
            {t('Continuar con {paso}', { paso: next.label })} →
          </Button>
        </div>
      )}
    </div>
  );
}

interface WithSidePanelProps {
  children: React.ReactNode;
  panel: React.ReactNode;
}

/**
 * Contenido del paso a la izquierda y un panel de resultado a la derecha que queda fijo al
 * bajar. En pantallas chicas el panel va al final, debajo del contenido.
 */
export function WithSidePanel({ children, panel }: WithSidePanelProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="space-y-4 min-w-0">{children}</div>
      <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">{panel}</aside>
    </div>
  );
}
