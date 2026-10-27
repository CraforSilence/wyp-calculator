import type { WeaponCalcResult } from '@/types/weapon';
import { useT } from '@/i18n/I18nProvider';

type AbilityStats = Pick<WeaponCalcResult, 'riposteDmg' | 'impactoVigoroso' | 'cruzDelSur'>;

export function hasWeaponAbility(r: AbilityStats): boolean {
  return Boolean(r.riposteDmg || r.impactoVigoroso || r.cruzDelSur);
}

/** Habilidad propia de la categoria del arma: Riposte (lanza), Impacto Vigoroso (contundentes), Cruz del Sur (cortantes) */
export function WeaponAbility({ result, fallback = <span className="text-zinc-600">-</span> }: { result: AbilityStats; fallback?: React.ReactNode }) {
  const t = useT();
  if (result.riposteDmg) {
    return <><span className="text-xs text-zinc-500">{t("Riposte")}</span> <span className="text-red-400">{result.riposteDmg}</span></>;
  }
  if (result.impactoVigoroso) {
    return <><span className="text-xs text-zinc-500">{t("Impacto Vig.")}</span> <span className="text-orange-400">{result.impactoVigoroso.min}-{result.impactoVigoroso.max}</span></>;
  }
  if (result.cruzDelSur) {
    return <><span className="text-xs text-zinc-500">{t("Cruz del Sur")}</span> <span className="text-sky-400">{result.cruzDelSur.min}-{result.cruzDelSur.max}</span></>;
  }
  return <>{fallback}</>;
}

/** Valor numerico de la habilidad para comparar entre armas (promedio si es rango) */
export function weaponAbilityValue(r: AbilityStats): number | null {
  if (r.riposteDmg) return r.riposteDmg;
  if (r.impactoVigoroso) return r.impactoVigoroso.prom;
  if (r.cruzDelSur) return r.cruzDelSur.prom;
  return null;
}

export type WeaponAbilityKind = 'riposte' | 'impactoVigoroso' | 'cruzDelSur';

/** Que habilidad tiene el arma: solo tiene sentido comparar valores entre armas con la misma */
export function weaponAbilityKind(r: AbilityStats): WeaponAbilityKind | null {
  if (r.riposteDmg) return 'riposte';
  if (r.impactoVigoroso) return 'impactoVigoroso';
  if (r.cruzDelSur) return 'cruzDelSur';
  return null;
}
