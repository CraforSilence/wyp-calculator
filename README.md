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
