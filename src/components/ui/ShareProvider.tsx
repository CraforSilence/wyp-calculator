'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { buildShareLink, decodeShareCode, encodeShareCode, getSharePreview, SHARE_TYPE_LABELS } from '@/lib/share';
import type { ShareType } from '@/lib/share';
import { useT } from '@/i18n/I18nProvider';

interface ShareContextValue {
  /** Arma el codigo y abre la ventana con el link y el codigo para copiar */
  share: (type: ShareType, data: unknown) => void;
}

const ShareContext = createContext<ShareContextValue | null>(null);

export function useShare() {
  const ctx = useContext(ShareContext);
  if (!ctx) throw new Error('useShare must be used inside ShareProvider');
  return ctx;
}

interface Shared {
  type: ShareType;
  code: string;
  link: string;
  preview: string;
}

function CopyField({ label, hint, value, onCopy, mono }: { label: string; hint: string; value: string; onCopy: () => void; mono?: boolean }) {
  const t = useT();
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-sm font-medium text-zinc-200">{label}</span>
        <span className="text-xs text-zinc-500">{hint}</span>
      </div>
      <div className="flex gap-2">
        <input
          readOnly
          value={value}
          onFocus={(e) => e.target.select()}
          className={`flex-1 min-w-0 bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-amber-500 ${mono ? 'font-mono' : ''}`}
        />
        <Button size="sm" onClick={onCopy}>{t("Copiar")}</Button>
      </div>
    </div>
  );
}

export function ShareProvider({ children }: { children: React.ReactNode }) {
  const t = useT();
  const { toast } = useToast();
  const [shared, setShared] = useState<Shared | null>(null);

  const share = useCallback((type: ShareType, data: unknown) => {
    const code = encodeShareCode(type, data);
    const decoded = decodeShareCode(code);
    setShared({
      type,
      code,
      link: buildShareLink(code),
      preview: decoded ? getSharePreview(decoded, t) : t(SHARE_TYPE_LABELS[type]),
    });
  }, [t]);

  const copy = (text: string, what: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast(t('{what} copiado al portapapeles', { what: t(what) }), 'success'),
      () => toast(t("Error al copiar"), 'error'),
    );
  };

  return (
    <ShareContext.Provider value={{ share }}>
      {children}
      <Modal open={shared !== null} onClose={() => setShared(null)} title={t('Compartir {tipo}', { tipo: shared ? t(SHARE_TYPE_LABELS[shared.type]).toLowerCase() : '' })} size="md">
        {shared && (
          <div className="space-y-4">
            <p className="text-sm text-emerald-400 bg-emerald-900/20 border border-emerald-800/50 rounded px-3 py-2 break-words">
              {shared.preview}
            </p>
            <CopyField
              label={t("Link")}
              hint={t("lo abren y lo cargan con un clic")}
              value={shared.link}
              onCopy={() => copy(shared.link, 'Link')}
            />
            <CopyField
              label={t("Código")}
              hint={t("se pega en Importar")}
              value={shared.code}
              onCopy={() => copy(shared.code, 'Código')}
              mono
            />
            <p className="text-xs text-zinc-500">
              {t('La data viaja dentro del link o el código: no se guarda en ningún servidor. Quien lo reciba lo importa y le queda guardado en su navegador.')}
            </p>
          </div>
        )}
      </Modal>
    </ShareContext.Provider>
  );
}
