'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useShareImport } from '@/hooks/useShareImport';
import { decodeShareCode, getSharePreview, SHARE_TYPE_LABELS } from '@/lib/share';
import type { ShareResult, ShareType, ComparePayload } from '@/lib/share';
import { useT } from '@/i18n/I18nProvider';

/** Que pasa con cada tipo al importarlo, para que nadie se lleve sorpresas */
const WHAT_HAPPENS: Record<ShareType, string> = {
  weapon: 'Se agrega a Mis armas. No toca nada de lo que ya tenés.',
  jewelry: 'Se agrega a Mis joyas. No toca nada de lo que ya tenés.',
  armor: 'Se agrega a tus sets de armadura. No toca nada de lo que ya tenés.',
  build: 'Reemplaza tu Build actual (personaje, arma, joyería y armadura). Si querés conservarlo, compartilo antes para tener el código.',
  compare: 'Las armas que no tengas se agregan a Mis armas y quedan elegidas en Comparar. Tu personaje no cambia, salvo que lo marques abajo.',
  trainer: 'Se agrega a tus setups guardados del Entrenador y queda abierto. No toca nada de lo que ya tenés.',
};

const TYPE_ICONS: Record<ShareType, string> = {
  weapon: '/icons/arma.svg',
  jewelry: '/icons/anillo.svg',
  armor: '/icons/pechera.svg',
  build: '/logo/wypforge-mark.png',
  compare: '/icons/comparar.svg',
  trainer: '/icons/entrenador.svg',
};

export default function ImportarPage() {
  const t = useT();
  const router = useRouter();
  const { toast } = useToast();
  const { importShare } = useShareImport();
  const [code, setCode] = useState('');
  const [result, setResult] = useState<ShareResult | null>(null);
  const [error, setError] = useState('');
  const [withCharacter, setWithCharacter] = useState(false);

  const handleChange = (value: string) => {
    setCode(value);
    setWithCharacter(false);
    if (!value.trim()) {
      setResult(null);
      setError('');
      return;
    }
    const decoded = decodeShareCode(value);
    setResult(decoded);
    setError(decoded ? '' : t('No reconozco este código. Revisá que esté completo (empieza con WYP-) o pegá el link entero.'));
  };

  // Link de compartir: el codigo viene en el hash (/importar#WYP-...)
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    let value = hash;
    try { value = decodeURIComponent(hash); } catch { /* se usa tal cual */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- se lee una sola vez al abrir el link
    handleChange(value);
  }, []);

  const handleImport = () => {
    if (!result) return;
    const outcome = importShare(result, { withCharacter });
    toast(outcome.message, 'success');
    if (result.type === 'build') {
      try { window.sessionStorage.setItem('regnum-build-tab', JSON.stringify('build')); } catch { /* sin storage */ }
    }
    router.push(outcome.href);
  };

  const compareChar = result?.type === 'compare' ? (result.data as ComparePayload).character : null;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title={t("Importar")}
        description={t("Pegá un código o un link de WypForge: armas, joyas, armaduras, builds, comparativos o setups del entrenador. Lo detectamos solo y te llevamos a la sección que corresponde.")}
      />

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4">
        <div>
          <label htmlFor="share-code" className="block text-sm text-zinc-300 mb-1">{t("Código o link")}</label>
          <textarea
            id="share-code"
            autoFocus
            value={code}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={t("WYP-B:... o https://.../importar#WYP-...")}
            rows={5}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 font-mono resize-none break-all"
          />
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-900/20 border border-red-800/50 rounded px-3 py-2">{error}</div>
        )}

        {result && (
          <div className="rounded-lg border border-emerald-800/50 bg-emerald-900/10 p-3 space-y-3 animate-fade-in-up">
            <div className="flex items-start gap-3">
              <span className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-lg border border-zinc-700 bg-zinc-800 p-1.5">
                <img src={TYPE_ICONS[result.type]} alt="" className="w-full h-full object-contain" />
              </span>
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wider text-emerald-500">{t(SHARE_TYPE_LABELS[result.type])}</div>
                <div className="text-sm font-medium text-zinc-100 break-words">{getSharePreview(result, t)}</div>
                <p className={`text-xs mt-1 ${result.type === 'build' ? 'text-amber-400' : 'text-zinc-400'}`}>{t(WHAT_HAPPENS[result.type])}</p>
              </div>
            </div>

            {compareChar && (
              <label className="flex items-start gap-2 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={withCharacter}
                  onChange={(e) => setWithCharacter(e.target.checked)}
                  className="mt-1 accent-amber-500"
                />
                <span>
                  {t("Usar también su personaje")}
                  <span className="block text-xs text-zinc-500">
                    {t(compareChar.subclase)} · {t('FUE')} {compareChar.stats.STR} · {t('DES')} {compareChar.stats.DXT} · INT {compareChar.stats.INT}.{' '}
                    {t('Así ves los mismos números que vio quien lo compartió.')}
                  </span>
                </span>
              </label>
            )}

            <Button className="w-full" onClick={handleImport}>
              {t('Cargar y abrir {tipo}', { tipo: t(SHARE_TYPE_LABELS[result.type]).toLowerCase() })}
            </Button>
          </div>
        )}
      </div>

      <p className="text-xs text-zinc-500 mt-4">
        {t('Para compartir algo tuyo usá el botón Compartir en Armas, Joyería, Armaduras, Comparar, el Build o el Entrenador.')}{' '}
        {t('La data viaja dentro del código: no se guarda en ningún servidor.')}
      </p>
    </div>
  );
}
