// Genera los íconos de equipo (public/icons/*.svg) en el estilo del logo:
// planos, contorno navy grueso, cuerpo pizarra con una cara más clara y detalles dorados.
// Misma paleta que src/components/icons/CharacterIcons.tsx.
//
// Uso: node scripts/build-icons.mjs

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const O = '#071f2e';  // contorno
const B = '#2c4857';  // cuerpo
const H = '#4d6b7a';  // cara iluminada
const G = '#cba76f';  // dorado
const GL = '#e5c58b'; // dorado claro
const GD = '#a99167'; // dorado oscuro (mangos)
const WOOD = '#8b6b47', WOOD_L = '#a9875e'; // madera (garrote)
const CRYSTAL = '#7cc4e0', CRYSTAL_L = '#d3f0fa'; // cristal (báculo)

// Forma con relleno y contorno.
const shape = (d, fill, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`;
// Forma con cara iluminada: `light` es la mitad clara, sin contorno; el contorno va encima.
const lit = (d, light, fill = B) =>
  `<path d="${d}" fill="${fill}"/><path d="${light}" fill="${H}" stroke="none"/><path d="${d}" fill="none"/>`;
// Trazo sin relleno.
const stroke = (d, color, width) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
// Línea con contorno: pasada gruesa navy y encima la del color.
const line = (d, color, width) => stroke(d, O, width + 3) + stroke(d, color, width);
const circle = (cx, cy, r, fill, extra = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${extra}/>`;
const thin = ' stroke-width="1.5"';
const noStroke = ' stroke="none"';
// Destello de 4 puntas.
const sparkle = (x, y, r) =>
  shape(`M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`, GL, thin);
const diamond = (x, y, w, h, fill = GL) => shape(`M${x} ${y - h}L${x + w} ${y}L${x} ${y + h}L${x - w} ${y}Z`, fill, thin);
// Estrella de `points` puntas (para la cabeza de la maza).
const star = (cx, cy, points, outer, inner) =>
  Array.from({ length: points * 2 }, (_, i) => {
    const r = i % 2 ? inner : outer;
    const a = -Math.PI / 2 + (i * Math.PI) / points;
    return `${i ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join('') + 'Z';
// Las armas se dibujan verticales (punta arriba, centradas en x=32) y se inclinan 45°.
const diag = (parts) => [`<g transform="rotate(45 32 32)">`, ...parts, '</g>'];
// Mango vertical con hasta 3 vendas en la parte de abajo (la empuñadura).
const grip = (top, bottom, fill = GD) => [
  shape(`M29.5 ${top}H34.5V${bottom}H29.5Z`, fill),
  stroke([1, 2, 3].map((i) => bottom - 4 * i).filter((y) => y > top + 2).map((y) => `M29.5 ${y}H34.5`).join(''), O, 1.25),
];
// Arco vertical: la cuerda en x=sx entre (sx, top) y (sx, bottom).
const bow = (limbs, sx, top, bottom, gripY) => [
  stroke(`M${sx} ${top}L${sx} ${bottom}`, GL, 1.5),
  line(limbs, GD, 4),
  shape(`M${gripY[0]} ${gripY[1]}h7v12h-7Z`, G),
  stroke(`M${gripY[0]} ${gripY[1] + 4}h7M${gripY[0]} ${gripY[1] + 8}h7`, O, 1.25),
];

const arrow = (transform = '') => `<g${transform ? ` transform="${transform}"` : ''}>${
  line('M32 14V52', GD, 2.5)
}${shape('M32 3L37.5 15H26.5Z', H)}${shape('M32 45L37 49V58L32 55L27 58V49Z', G)}</g>`;

const ICONS = {
  // Espada recta
  arma: [
    lit('M26 40V13L32 2L38 13V40Z', 'M26 40V13L32 2V40Z'),
    stroke('M32 10V36', O, 2),
    shape('M17 39H47C49 39 50 41 49 43L47.5 45H16.5L15 43C14 41 15 39 17 39Z', G),
    diamond(32, 42, 3, 2.5),
    shape('M29 45H35V56H29Z', GD),
    stroke('M29 48.5H35M29 52H35', O, 1.5),
    circle(32, 59, 3.5, G),
  ],
  // Anillo con gema
  anillo: [
    shape('M13 41a19 17 0 1 0 38 0a19 17 0 1 0 -38 0ZM20 42a12 10 0 1 0 24 0a12 10 0 1 0 -24 0Z', G, ' fill-rule="evenodd"'),
    stroke('M17 46A15 13 0 0 0 28 55', GL, 2),
    shape('M25 21H39L37 28H27Z', GD),
    lit('M23 17L28 10H36L41 17L32 26Z', 'M23 17L28 10H32V26Z'),
    stroke('M23 17H41M28 10L32 17L36 10M32 17V26', O, 1.5),
    sparkle(49, 11, 4.5),
    sparkle(14, 20, 3),
  ],
  // Amuleto con medallón
  amuleto: [
    line('M11 3C13 17 23 24 32 27C41 24 51 17 53 3', G, 2),
    stroke('M11 3C13 17 23 24 32 27C41 24 51 17 53 3', GL, 1, ) .replace('/>', ' stroke-dasharray="1.5 3"/>'),
    circle(32, 28, 3.5, G),
    circle(32, 45, 15, G),
    stroke('M19 52A15 15 0 0 0 45 52', GD, 3).replace('/>', ' stroke-linecap="butt"/>'),
    circle(32, 45, 15, 'none'),
    lit('M32 35A10 10 0 1 0 32.01 35Z', 'M32 35A10 10 0 0 0 32 55Z'),
    lit('M32 38L37 45L32 52L27 45Z', 'M32 38L27 45L32 52Z', G),
    circle(29.5, 43, 1.2, GL, noStroke),
    ...[[32, 30.5], [46.5, 45], [32, 59.5], [17.5, 45]].map(([x, y]) => circle(x, y, 1.6, GL, ' stroke-width="1.25"')),
  ],
  // Haz de flechas
  flechas: [
    arrow('rotate(-24 32 58)'),
    arrow('rotate(24 32 58)'),
    arrow(),
    shape('M24 40H40V45.5H24Z', G),
    stroke('M28 40V45.5M36 40V45.5', O, 1.25),
  ],
  // Yelmo con ranura en T y cresta
  casco: [
    lit(
      'M13 36C13 19 21 9 32 9C43 9 51 19 51 36V50C51 54 48 57 44 57H20C16 57 13 54 13 50Z',
      'M32 9C21 9 13 19 13 36V50C13 54 16 57 20 57H32Z',
    ),
    shape('M28.5 10C28.5 6 30 3 32 2C34 3 35.5 6 35.5 10Z', G),
    line('M32 11V29', G, 3),
    line('M13.5 32H50.5', G, 3),
    shape('M19 37H45V42.5H35.5V55H28.5V42.5H19Z', O),
    circle(18, 48, 1.8, GL, thin),
    circle(46, 48, 1.8, GL, thin),
  ],
  // Hombrera de placas superpuestas
  hombreras: [
    shape('M27.5 13L33 1L38.5 12Z', G),
    lit(
      'M11 31C11 17 21 8 34 8C46 8 54 16 54 29C45 25 21 25 11 31Z',
      'M11 31C11 17 21 8 34 8C27 13 25 20 25 26.5C19 27 14 28.5 11 31Z',
    ),
    lit('M9 37C20 29 45 28 56 34L54 42C44 37 22 38 11 45Z', 'M9 37C14 33.5 19 31.5 25 30.5V38.5C19 40 15 42 11 45Z'),
    lit('M9 47C20 40 45 39 56 44L54 52C44 48 22 49 11 55Z', 'M9 47C14 44 19 42 25 41V48.5C19 50 15 52 11 55Z'),
    stroke('M11.5 43.5C22 36.5 44 35.5 54 40.5', G, 2),
    stroke('M11.5 53.5C22 47.5 44 46.5 54 50.5', G, 2),
    circle(21, 21, 1.8, GL, thin),
    circle(45, 19, 1.8, GL, thin),
    diamond(33, 17, 2.5, 3.5),
  ],
  // Peto con placas abdominales
  pechera: [
    lit(
      'M18 7L26 11C29 15.5 35 15.5 38 11L46 7L55 14L50 26V50C50 56 42 60 32 60C22 60 14 56 14 50V26L9 14Z',
      'M18 7L26 11C28 14 30 15 32 15V60C22 60 14 56 14 50V26L9 14Z',
    ),
    line('M26 11C29 15.5 35 15.5 38 11', G, 3),
    stroke('M32 16V59', O, 1.5),
    stroke('M17 30C23 34.5 29 34.5 32 30C35 34.5 41 34.5 47 30', O, 1.75),
    line('M14.5 42C23 45.5 41 45.5 49.5 42', G, 2.5),
    line('M15 50C23 53.5 41 53.5 49 50', G, 2.5),
    diamond(32, 23, 3, 4),
  ],
  // Guantelete
  guanteletes: [
    ...[[20, 10], [26.5, 6], [33, 8], [39.5, 13]].map(([x, y]) =>
      shape(`M${x} 28V${y + 3}C${x} ${y + 1} ${x + 1.5} ${y} ${x + 3} ${y}C${x + 4.5} ${y} ${x + 6} ${y + 1} ${x + 6} ${y + 3}V28Z`, x < 30 ? H : B)
      + stroke(`M${x} ${y + 9}H${x + 6}M${x} ${y + 15}H${x + 6}`, O, 1.5)),
    shape('M21 38L12 29C10 27 11 23.5 14.5 24L23 31Z', H),
    lit('M20 46V27C20 25 21.5 24 23.5 24H42C44 24 46 25.5 46 28V46Z', 'M20 46V27C20 25 21.5 24 23.5 24H33V46Z'),
    line('M20.5 29H45.5', G, 2.5),
    diamond(33, 37, 3, 4),
    lit('M19 46H45L47 60H17Z', 'M19 46H32V60H17Z'),
    line('M18.2 52H45.8', G, 2.5),
  ],
  // Grebas
  perneras: [
    lit('M14 11H31L30 34L29 56H17L16 34Z', 'M14 11H22.5L23 56H17L16 34Z'),
    lit('M33 11H50L48 34L47 56H35L34 34Z', 'M33 11H41.5L41 56H35L34 34Z'),
    shape('M16 53H30V61H10C10 57 12.5 55 16 55Z', B),
    shape('M48 53H34V61H54C54 57 51.5 55 48 55Z', B),
    stroke('M15.5 22H30.5M33.5 22H49.5', O, 1.5),
    circle(23, 34, 5.5, G), circle(23, 34, 2, GL, thin),
    circle(41, 34, 5.5, G), circle(41, 34, 2, GL, thin),
    shape('M13 4H51V11.5H13Z', G),
    shape('M29 4.5H35V11H29Z', GL, thin),
  ],
  // Escudo redondo con umbo
  escudo: [
    lit('M32 5A27 27 0 1 0 32.01 5Z', 'M32 5A27 27 0 0 0 32 59Z'),
    stroke('M32 8V25M32 39V56M8 32H25M39 32H56', O, 1.5),
    circle(32, 32, 22, 'none', ` stroke="${G}" stroke-width="3"`),
    ...Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4 + Math.PI / 8;
      return circle((32 + 22 * Math.cos(a)).toFixed(1), (32 + 22 * Math.sin(a)).toFixed(1), 1.8, GL, ' stroke-width="1.25"');
    }),
    circle(32, 32, 8, G),
    stroke('M26.5 37A8 8 0 0 0 39 38', GD, 2.5),
    circle(32, 32, 8, 'none'),
    circle(30, 30, 2.5, GL, noStroke),
  ],
  // Brazal con gema
  brazalete: [
    lit('M19 8C26 5.5 38 5.5 45 8L49 56C40 59.5 24 59.5 15 56Z', 'M19 8C23 6.8 27.5 6 32 6V58.6C26 58.6 19.5 57.6 15 56Z'),
    line('M19.5 14C26.5 12 37.5 12 44.5 14', G, 3),
    line('M16.5 50C24 53 40 53 47.5 50', G, 3),
    circle(32, 32, 8, G),
    lit('M32 27A5 5 0 1 0 32.01 27Z', 'M32 27A5 5 0 0 0 32 37Z'),
    circle(30.5, 30.5, 1.2, GL, noStroke),
    stroke('M23 22L41 22M22 42L42 42', O, 1.5),
    sparkle(52, 30, 3.5),
  ],
  // Túnica de mago
  tunica: [
    lit(
      'M22 5L32 11L42 5L57 18L51 28L46 24L52 59H12L18 24L13 28L7 18Z',
      'M22 5L32 11V59H12L18 24L13 28L7 18Z',
    ),
    line('M22 5L32 20L42 5', G, 3),
    stroke('M32 20V59', G, 2),
    line('M13 54H51', G, 2.5),
    shape('M16.5 33H47.5L48 38.5H16Z', G),
    shape('M29 32H35V39.5H29Z', GL, thin),
    sparkle(23, 46, 3),
    sparkle(40, 28, 2.5),
  ],

  // ── Armas por subcategoría (public/icons/armas/) ──
  'armas/espada': diag([
    shape('M28 44V2L32 -6L36 2V44Z', B),
    shape('M28 44V2L32 -6V44Z', H, noStroke),
    shape('M28 44V2L32 -6L36 2V44Z', 'none'),
    stroke('M32 2V40', O, 1.75),
    shape('M18 44H46C48 44 49 46 48 48L47 50H17L16 48C15 46 16 44 18 44Z', G),
    diamond(32, 47, 3, 2.5),
    ...grip(50, 63),
    circle(32, 67, 4, G),
  ]),
  'armas/lanza': diag([
    ...grip(18, 70),
    shape('M30 70H34L33 74H31Z', G),
    lit('M32 -9C38.5 -1 39.5 9 32 19C24.5 9 25.5 -1 32 -9Z', 'M32 -9C25.5 -1 24.5 9 32 19Z'),
    stroke('M32 -3V15', O, 1.5),
    shape('M28 17H36V23H28Z', G),
  ]),
  'armas/maza': diag([
    ...grip(18, 63),
    circle(32, 66.5, 3.5, G),
    shape(star(32, 6, 8, 15, 8.5), B),
    circle(32, 6, 7, H),
    circle(32, 6, 3, G, thin),
    shape('M27.5 17H36.5V23H27.5Z', G),
  ]),
  'armas/hacha': diag([
    ...grip(-4, 64),
    circle(32, 67.5, 3.5, G),
    lit('M35 4C43 4 49 0 54 -6C60.5 6 60.5 23 54 34C49 28 43 24 35 24Z', 'M54 -6C60.5 6 60.5 23 54 34L50 28.5C55 20 55 9 50 0.5Z'),
    shape('M28 8L20 14L28 20Z', H),
    shape('M27 2H37V26H27Z', B),
    stroke('M27 7H37M27 21H37', G, 2),
    circle(32, 14, 2.2, GL, thin),
  ]),
  'armas/martillo': diag([
    ...grip(14, 66),
    circle(32, 69, 3.5, G),
    lit('M12 -2H52V18H12Z', 'M12 -2H52V5H12Z'),
    shape('M8 1H12V15H8ZM52 1H56V15H52Z', H),
    shape('M27 -2H37V18H27Z', G),
    circle(32, 8, 2.2, GL, thin),
    shape('M28.5 -2L32 -10L35.5 -2Z', G),
  ]),
  'armas/florin': diag([
    lit(
      'M28 46L26.5 40L28.5 34L26.5 28L28.5 22L26.5 16L28.5 10L27 4L32 -10L37 4L35.5 10L37.5 16L35.5 22L37.5 28L35.5 34L37.5 40L36 46Z',
      'M28 46L26.5 40L28.5 34L26.5 28L28.5 22L26.5 16L28.5 10L27 4L32 -10V46Z',
    ),
    stroke('M32 0V42', O, 1.5),
    shape('M13 45C13 47.5 15 49 17 49H47C49 49 51 47.5 51 45L46 46.5H18Z', G),
    shape('M27 44H37V51H27Z', G),
    ...grip(51, 67),
    circle(32, 70.5, 3.5, G),
  ]),
  'armas/garrote': diag([
    shape('M27.5 54H36.5V67H27.5Z', B),
    stroke('M27.5 58H36.5M27.5 62H36.5', O, 1.25),
    circle(32, 69.5, 3.5, WOOD),
    shape('M32 -8C41.5 -8 44 4 43 18L36.5 55H27.5L21 18C20 4 22.5 -8 32 -8Z', WOOD),
    shape('M32 -8C22.5 -8 20 4 21 18L27.5 55H32Z', WOOD_L, noStroke),
    shape('M32 -8C41.5 -8 44 4 43 18L36.5 55H27.5L21 18C20 4 22.5 -8 32 -8Z', 'none'),
    shape('M22.5 26H41.5L40.5 32H23.5Z', B),
    ...[[27, 4], [37, 6], [32, 14], [26.5, 19], [38, 19]].map(([x, y]) => circle(x, y, 2.2, GL, thin)),
  ]),
  'armas/arco-corto': diag(bow(
    'M14 9C15 6 18 5 21 7C33 15 37.5 24 37.5 32C37.5 40 33 49 21 57C18 59 15 58 14 55',
    14, 9, 55, [34.5, 26],
  )),
  'armas/arco-largo': diag([
    ...bow('M22 -6C34 6 38.5 19 38.5 32C38.5 45 34 58 22 70', 22, -6, 70, [35.5, 26]),
    circle(22, -6, 2.5, G, thin),
    circle(22, 70, 2.5, G, thin),
  ]),
  'armas/baculo': diag([
    ...grip(14, 68),
    shape('M29 68H35L33.5 73H30.5Z', G),
    shape('M32 -9L37.5 1L32 11L26.5 1Z', CRYSTAL),
    shape('M32 -9L26.5 1L32 11Z', CRYSTAL_L, noStroke),
    shape('M32 -9L37.5 1L32 11L26.5 1Z', 'none'),
    shape('M23 -1C21 9 25.5 16 32 16C38.5 16 43 9 41 -1L37 4C37 9 35 12 32 12C29 12 27 9 27 4Z', G),
    sparkle(43, -6, 4),
    sparkle(19, 8, 3),
  ]),

  // ── Secciones ──
  // Trofeo
  rankings: [
    line('M18.5 14C9 13 8 27 20.5 29', G, 3.5),
    line('M45.5 14C55 13 56 27 43.5 29', G, 3.5),
    shape('M28.5 37H35.5L37 46H27Z', GD),
    shape('M17 7H47V21C47 31.5 40.5 38 32 38C23.5 38 17 31.5 17 21Z', G),
    shape('M21 10H27V22C27 28 29 32 32 34.5C25.5 33.5 21 28.5 21 21Z', GL, noStroke),
    shape('M17 7H47V21C47 31.5 40.5 38 32 38C23.5 38 17 31.5 17 21Z', 'none'),
    shape('M15 5H49V10H15Z', GD),
    shape(star(32, 21, 5, 8, 3.5), B, thin),
    lit('M20 46H44V53H20Z', 'M20 46H32V53H20Z'),
    lit('M15 53H49V60H15Z', 'M15 53H32V60H15Z'),
    shape('M27 48H37V51H27Z', G, ' stroke-width="1.25"'),
    sparkle(54, 40, 3.5),
    sparkle(9, 38, 3),
  ],
  // Balanza
  comparar: [
    stroke('M9 18L3 38M9 18L15 38', GL, 1.5),
    stroke('M55 14L49 34M55 14L61 34', GL, 1.5),
    lit('M1.5 38H16.5C16.5 44 13 47.5 9 47.5C5 47.5 1.5 44 1.5 38Z', 'M1.5 38H9V47.5C5 47.5 1.5 44 1.5 38Z'),
    lit('M47.5 34H62.5C62.5 40 59 43.5 55 43.5C51 43.5 47.5 40 47.5 34Z', 'M47.5 34H55V43.5C51 43.5 47.5 40 47.5 34Z'),
    shape('M29.5 12H34.5V54H29.5Z', GD),
    line('M9 18L55 14', G, 3),
    circle(32, 16, 3.5, GL, thin),
    circle(32, 8, 3.5, G),
    shape('M17 53H47L44.5 60H19.5Z', G),
    shape('M22 49H42V53H22Z', B),
  ],
};

const dir = fileURLToPath(new URL('../public/icons/', import.meta.url));
for (const [name, parts] of Object.entries(ICONS)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" stroke="${O}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">${parts.join('')}</svg>\n`;
  mkdirSync(dirname(dir + name), { recursive: true });
  writeFileSync(dir + name + '.svg', svg);
}
console.log(`${Object.keys(ICONS).length} íconos generados en public/icons/`);
