# WypForge — Weapons and Protections

Calculadora de armas, armaduras y daño para **Regnum Online**.
Online en [wypforge.vercel.app](https://wypforge.vercel.app).

Todo corre en el navegador: no hay cuentas ni servidor. Lo que cargás queda guardado en
`localStorage` y se comparte con códigos.

## Secciones

| Ruta | Qué hace |
|---|---|
| `/` | Home: qué es la herramienta y acceso a cada sección |
| `/build` | Build guiado en 4 pasos: personaje, arma y joyería, armadura y simulación contra un enemigo. Paneles fijos de "Daño por golpe" y "Estado de armadura" |
| `/armas` | Mis armas: precargadas y personalizadas, con bonus, gemas y muescas según la rareza |
| `/joyeria` | Mis joyas (anillos y amuleto, hasta 4 bonus) para precargar en el Build |
| `/armadura` | Sets de armadura, protección por pieza y comparación |
| `/rankings` | Armas ordenadas por DPS, promedio, crítico o velocidad con tu personaje, con ficha de detalle |
| `/comparar` | Hasta 5 armas lado a lado, con veredicto y cuadro comparativo |
| `/entrenador` | Entrenador de poderes de las 6 subclases: puntos de disciplina y de poder como en el juego, setups guardados y compartibles (`WYP-T:`) |
| `/guerra` | Estado de guerra de RA en vivo: fuertes, castillos, murallas, gemas y reliquias, con mapa propio |
| `/importar` | Import general: pegás cualquier código o link y te lleva a su sección |

## Compartir

Arma, joya, set de armadura, build completo y comparativo se comparten desde el botón
**Compartir**, que da dos cosas:

- **Link** `https://.../importar#WYP-...`: abre `/importar` con el código cargado.
  El código va en el hash, así que no viaja al servidor.
- **Código** `WYP-X:...`: JSON comprimido con `lz-string` (`src/lib/share.ts`).

| Prefijo | Tipo | Al importar |
|---|---|---|
| `WYP-W:` | Arma | Se agrega a Mis armas |
| `WYP-J:` | Joya | Se agrega a Mis joyas |
| `WYP-A:` | Set de armadura | Se agrega a los sets |
| `WYP-B:` | Build completo | Reemplaza el build actual |
| `WYP-C:` | Comparativo | Agrega las armas que falten y las deja elegidas; el personaje solo si se marca |

La lógica de importación vive en `src/hooks/useShareImport.ts` y la usan tanto `/importar`
como los botones "Importar" de cada página.

## Idiomas (español / inglés)

Selector ES/EN en la barra; se guarda en el navegador (`regnum-lang`). La primera vez se
elige según el idioma del navegador.

- Cada texto visible pasa por `t('texto en español')` (`useT()` de `src/i18n/I18nProvider.tsx`).
  La clave es el propio texto en español, así el código se sigue leyendo en español.
- `src/i18n/en.ts`: traducciones al inglés. Si falta una, se muestra el español y en
  desarrollo aparece un aviso `[i18n] falta traduccion` en la consola.
- `src/i18n/es.ts`: correcciones para datos guardados sin tilde (por ejemplo, el tipo de
  bonus `'Dano critico %'` se muestra "Daño crítico %"). Esas claves no se renombran para no
  romper lo guardado ni los códigos compartidos.
- Variables con llaves: `t('Quedan {n} lugares', { n })`. Para resaltar partes de la frase,
  `rich(t, 'La más rápida es {arma}', { arma: <b>…</b> })`.
- Los nombres de armas y sets precargados son datos del juego y no se traducen.

## Motor de cálculo

`src/lib/engine/` sigue las fórmulas del juego (`Formulas.md`):

- Daño por tipo con atributo, crítico (`base de la subclase × (1 + bonus%)`) y velocidad.
- Atributos del arma (`atributos`: Fuerza, Destreza, Inteligencia, Constitución, Concentración):
  solo el stat principal de la subclase suma daño, con su multiplicador. Las armas viejas con
  `bonusStat` se leen como el stat principal de la clase del arma (`src/lib/weaponAttributes.ts`).
- Armadura: la protección se aplica según el peso de cada tipo, con daño mínimo de 4–8%;
  luego resistencia general y por tipo.
- El daño especial (gemas) solo lo reduce el factor de protección (PF).

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
npx tsc --noEmit
npx next build
```

Stack: Next.js 16 (App Router), React 19, Tailwind v4, TypeScript.

### Pruebas de punta a punta (Playwright)

```bash
npx playwright install chromium   # solo la primera vez
npm run test:e2e                  # corre todo; levanta `npm run dev` o usa el que ya esté abierto
npm run test:e2e:ui               # modo visual, para ver y depurar paso a paso
npm run test:e2e:report           # abre el reporte HTML de la última corrida
```

- Las pruebas están en `e2e/` y la configuración en `playwright.config.ts`. El navegador se fija
  en español (`es-AR`) para que los textos coincidan.
- `e2e/build-flow.spec.ts` recorre el Build: personaje → arma y joyería → armadura → simulación
  (ofensiva y defensiva). También prueba que el build se conserve al recargar, los avisos cuando
  falta arma o armadura, y el modo Duales del Bárbaro.
- Cada prueba arranca con el navegador limpio. Los números esperados (por ejemplo, 390 – 425 del
  Martillo de Magnas con el Caballero por defecto) salen del motor: si se cambian las fórmulas a
  propósito, hay que actualizarlos.
- `e2e/helpers.ts` tiene atajos para lo que se repite (elegir en un `<select>` por su opción vacía,
  elegir en los selectores con íconos, agregar un bonus de joyería).
- En caso de falla quedan captura y traza en `test-results/` (`npx playwright show-trace <zip>`).

## Guerra

`/guerra` muestra el estado de guerra del servidor RA (AMUN no, es el de pruebas). Se actualiza
sola cada minuto mientras la pestaña está visible.

**De dónde salen los datos.** La página oficial
(`championsofregnum.com/index.php?l=0&sec=3&world=ra`) es HTML sin API ni CORS, así que la lee
nuestro servidor:

- `src/lib/war.ts`: tipos y `parseWarStatus()`, que saca del HTML los 12 fuertes (dueño y reino
  donde está), las 6 gemas de cada altar (`gem_1` = Ignis, `gem_2` = Alsius, `gem_3` = Syrtis,
  `gem_0` = vacío), las reliquias y la hora de la oficial. Si no encuentra 12 fuertes y 3 reinos,
  tira error: es la señal de que la oficial cambió de formato.
- `GET /api/guerra?lang=es|en`: devuelve ese JSON. Pide la oficial en el idioma de la app (los
  nombres de los fuertes vienen traducidos de ahí) y cachea 60 s.
- `GET /api/guerra/imagen?reliquia=79167`: íconos de reliquias desde nuestro dominio, para no
  abrir la CSP (`img-src 'self'`).

Son las únicas rutas de servidor de la app; todo lo demás sigue siendo del navegador.

**Mapa.** `src/components/war/WarMap.tsx` dibuja en SVG, encima de la ilustración
`public/guerra/mapa.webp` (1024×1024, hecha con Leonardo.ai tomando el mapa oficial como
referencia), los escudos de cada fuerte con el color del dueño actual, las murallas y las gemas de
cada altar. Un fuerte en manos de otro reino tiene un anillo que late. Las posiciones (`POS`,
`WALLS`, `ALTAR`) están en píxeles de esa imagen: si se cambia la ilustración, hay que
reubicarlas. Los altares están ubicados a ojo.

**Íconos.** Escudos (`Shield`/`ShieldIcon` en `WarMap.tsx`) y gemas
(`src/components/war/GemShape.tsx`) siguen la grilla 64×64 de `public/icons`: base en el tono
oscuro del reino, mitad izquierda clara, contorno navy y detalles dorados. Los tonos de cada reino
están en `REALM_TONES`.

**Últimos cambios.** La oficial no publica historial. El navegador guarda la última lectura
(`regnum-war-snap-ra`) y al leer de nuevo anota capturas, recuperaciones y gemas movidas en
`regnum-war-log` (últimos 10). Es por navegador: solo ve lo que pasó con la página abierta o
entre visitas. Un historial compartido necesitaría guardar los eventos en un servidor.

## Deploy

Manual a Vercel (no está vinculado a GitHub). Ver [docs/DEPLOY.md](docs/DEPLOY.md).

## Identidad

Logos originales en `public/logo/`. Versiones derivadas para fondo oscuro
(`wypforge-logo-dark.png`, `wypforge-name-dark.png`, `wypforge-mark.png`) y los íconos de
`src/app/` (favicon, apple-icon, imagen para redes) salen de esos originales.

### Íconos

Todos siguen la paleta del logo (contorno navy, azul pizarra, dorado). Se pueden ver juntos en
`/iconos` (página sin link en el menú).

- **Equipo** (arma, flechas, joyas, piezas de armadura): SVG en `public/icons/`, generados por
  `scripts/build-icons.mjs`. Para cambiar uno, editar el script y correr `node scripts/build-icons.mjs`.
- **Tipos de arma** (lanza, maza, espada, hacha, martillo, florín, garrote, arcos, báculo): SVG en
  `public/icons/armas/`, del mismo generador. `src/components/icons/WeaponIcon.tsx` mapea subcategoría → ícono.
- **Clases y subclases**: componentes React en `src/components/icons/CharacterIcons.tsx`.
- **Tipos de daño y bonus**: `src/components/icons/StatIcons.tsx` (`<DamageIcon>`, `<BonusIcon>`).
  Qué ícono lleva cada bonus se define en `src/lib/bonusDisplay.ts` (`bonusIconId`). Los `<select>`
  no pueden mostrar imágenes en las opciones: el ícono del bonus elegido va dentro del selector
  (prop `icon` de `Select`).
