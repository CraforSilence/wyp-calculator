// Estado de guerra de Regnum, leído de la página oficial (championsofregnum.com, sec=3).
// La página es HTML sin API, así que se parsea en el servidor (src/app/api/guerra) y el
// navegador recibe este JSON.

export const REALMS = ['Alsius', 'Ignis', 'Syrtis'] as const;
export type Realm = (typeof REALMS)[number];

// Solo RA: AMUN es el servidor de pruebas.
export const WORLDS = ['ra'] as const;
export type World = (typeof WORLDS)[number];

export const OFFICIAL_BASE = 'https://www.championsofregnum.com';
export const officialUrl = (world: World, lang: 'es' | 'en') =>
  `${OFFICIAL_BASE}/index.php?l=${lang === 'en' ? 1 : 0}&sec=3&world=${world}`;

export type BuildingKind = 'castillo' | 'fuerte' | 'muralla';

export interface WarBuilding {
  /** Número del mapa oficial (1–12). */
  num: number;
  /** Nombre tal como lo muestra la página oficial en el idioma pedido. */
  name: string;
  kind: BuildingKind;
  /** Reino al que pertenece el fuerte. */
  location: Realm;
  /** Reino que lo tiene ahora. */
  owner: Realm;
}

export interface WarRelic {
  id: string;
  /** Fuerte de origen ("Imperia") y dónde está ahora. */
  name: string;
  location: string;
}

export interface WarRealm {
  realm: Realm;
  /** Gemas en el altar del reino: el reino de origen de cada una (6 lugares, null = vacío). */
  gems: (Realm | null)[];
  relics: WarRelic[];
}

export interface WarStatus {
  world: World;
  /** Hora de la página oficial, tal cual (ej. "2026-10-29 05:00:19 (GMT+1)"). */
  officialUpdate: string | null;
  /** Momento en que nuestro servidor la leyó (ms epoch). */
  fetchedAt: number;
  buildings: WarBuilding[];
  realms: WarRealm[];
}

// gem_0 = lugar vacío; el resto según el reino de origen de la gema.
const GEM_REALM: Record<string, Realm> = { '1': 'Ignis', '2': 'Alsius', '3': 'Syrtis' };

const realmFromText = (s: string): Realm | null =>
  REALMS.find((r) => s.toLowerCase().includes(r.toLowerCase())) ?? null;

export function kindOf(name: string): BuildingKind {
  if (/muralla|great wall/i.test(name)) return 'muralla';
  if (/castillo|castle/i.test(name)) return 'castillo';
  return 'fuerte';
}

/** Parsea el HTML de la página oficial. Tira error si no encuentra los 12 fuertes. */
export function parseWarStatus(html: string, world: World): WarStatus {
  const update = html.match(/(?:Ultima actualizaci[oó]n|Latest update):\s*([^<\r\n]+)/i);

  // Cada reino aparece como un bloque "war-status-realm" (gemas + reliquias) seguido de
  // "war-status-realm-buildings" (sus 4 fuertes).
  const blocks = html.split('<div class="war-status-realm">').slice(1);
  const realms: WarRealm[] = [];
  const buildings: WarBuilding[] = [];

  blocks.forEach((block, i) => {
    const title = block.match(/float:\s*left;?">([^<]+)</)?.[1] ?? '';
    const realm = realmFromText(title) ?? REALMS[i];
    if (!realm) return;

    const [head, rest = ''] = block.split('war-status-realm-buildings');
    const gems = [...head.matchAll(/gem_(\d+)\.png/g)].map((m) => GEM_REALM[m[1]] ?? null);
    const relics = [...head.matchAll(/title="([^"]+)"[^>]*res_(\d+)\.png/g)].map((m) => {
      const t = m[1];
      const es = t.match(/^Reliquia de (.+?) localizada en (.+)$/i);
      const en = t.match(/^(.+?) relic located at (.+)$/i);
      const [name, location] = es ? [es[1], es[2]] : en ? [en[1], en[2]] : [t, t];
      return { id: m[2], name: name.trim(), location: location.trim() };
    });
    realms.push({ realm, gems, relics });

    for (const m of rest.matchAll(/keep_(\w+)\.gif[\s\S]*?bulding-name">([^<]+)</g)) {
      const owner = realmFromText(m[1]);
      const name = m[2].trim();
      const num = Number(name.match(/\((\d+)\)\s*$/)?.[1] ?? buildings.length + 1);
      if (!owner) continue;
      buildings.push({ num, name: name.replace(/\s*\(\d+\)\s*$/, ''), kind: kindOf(name), location: realm, owner });
    }
  });

  if (buildings.length !== 12 || realms.length !== 3) {
    throw new Error(`formato inesperado (${buildings.length} fuertes, ${realms.length} reinos)`);
  }

  return {
    world,
    officialUpdate: update?.[1].trim() ?? null,
    fetchedAt: Date.now(),
    buildings: buildings.sort((a, b) => a.num - b.num),
    realms,
  };
}
