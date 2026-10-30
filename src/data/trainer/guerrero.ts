import type { Discipline } from './types';
import { EF, buff, debuff, dano } from './effects';

/** Disciplinas de la clase Guerrero: las comparten Caballero y Bárbaro. */

export const ARMAS_CORTANTES: Discipline = {
  id: 'armas-cortantes',
  nombre: { es: 'Armas cortantes', en: 'Slashing Weapons' },
  poderes: [
    {
      id: 'carga', tipo: 'directo',
      nombre: { es: 'Carga', en: 'Charge' },
      descripcion: { es: 'Golpe con el arma que suma daño cortante extra.', en: 'Weapon strike that adds extra slashing damage.' },
      mana: [40, 65, 90, 110, 130], recarga: 6, invocacion: 0, recargaGlobal: 'normal', intervaloArma: true,
      efectos: [dano(EF.danoAtaque, '100%'), dano(EF.danoCortante, ['30-50', '50-80', '90-130', '120-150', '150-200'])],
    },
    {
      id: 'esgrimes-precisos', tipo: 'constante',
      nombre: { es: 'Esgrimes precisos', en: 'Accurate Swings' },
      descripcion: { es: 'Mientras dura, tus golpes hacen más daño cortante.', en: 'While active, your hits deal more slashing damage.' },
      mana: [60, 80, 100, 120, 140], duracion: 90, recarga: 120, invocacion: 0, recargaGlobal: 'corta',
      efectos: [buff(EF.danoCortante, ['+15', '+30', '+45', '+60', '+75'])],
    },
    {
      id: 'incapacitar', tipo: 'constante',
      nombre: { es: 'Incapacitar', en: 'Disable Limb' },
      descripcion: { es: 'Golpe a las piernas que frena al enemigo.', en: 'A hit to the legs that slows the enemy down.' },
      mana: [84, 111, 138, 165, 192], duracion: 30, recarga: 30, invocacion: 0, recargaGlobal: 'muy-corta', intervaloArma: true, bloqueable100: true,
      efectos: [debuff(EF.velMovimiento, ['-10%', '-15%', '-20%', '-26%', '-33%'])],
    },
    {
      id: 'atletico', tipo: 'pasivo',
      nombre: { es: 'Atlético', en: 'Athletic' },
      descripcion: { es: 'Mejora el daño cortante y te devuelve maná con cada golpe.', en: 'Raises slashing damage and gives mana back on every hit.' },
      efectos: [buff(EF.danoCortante, ['+2%', '+4%', '+6%', '+8%', '+10%']), buff(EF.manaPorGolpe, ['+4', '+4', '+6', '+6', '+10'])],
    },
    {
      id: 'cruz-del-sur', tipo: 'directo',
      nombre: { es: 'Cruz del sur', en: 'South Cross' },
      descripcion: { es: 'Dos cortes en cruz con daño extra.', en: 'Two cross-shaped cuts with bonus damage.' },
      mana: [120, 140, 160, 180, 200], recarga: 10, invocacion: 0, recargaGlobal: 'normal', intervaloArma: true,
      efectos: [dano(EF.danoAtaque, '100%'), dano(EF.danoAtaqueBonus, ['+20/25%', '+30/35%', '+40/45%', '+50/55%', '+60/65%'])],
    },
    {
      id: 'choque', tipo: 'constante',
      nombre: { es: 'Choque', en: 'Crash' },
      descripcion: { es: 'Embestida que deja al enemigo sin evasión y más fácil de aturdir.', en: 'A heavy blow that strips the enemy of evasion and makes them easier to stun.' },
      mana: [60, 90, 120, 150, 180], duracion: [15, 20, 25, 30, 35], recarga: 50, invocacion: 0, recargaGlobal: 'normal', intervaloArma: true, resistible100: true,
      efectos: [dano(EF.danoAtaque, '110%'), debuff(EF.evasion, ['-50%', '-60%', '-70%', '-80%', '-100%']), debuff(EF.resAturdir, ['-10%', '-15%', '-20%', '-25%', '-30%'])],
    },
    {
      id: 'arrasador', tipo: 'directo',
      nombre: { es: 'Arrasador', en: 'Devastate' },
      descripcion: { es: 'Barrido en arco que golpea a todos los enemigos de adelante.', en: 'An arc sweep that hits every enemy in front of you.' },
      mana: [140, 170, 200, 230, 260], recarga: 70, invocacion: 1.5, recargaGlobal: 'normal', intervaloArma: true,
      efectos: [dano(EF.danoAtaque, ['60%', '75%', '90%', '105%', '120%']), dano(EF.danoCortante, ['120', '140', '160', '180', '200'])],
    },
    {
      id: 'piel-de-hierro', tipo: 'pasivo',
      nombre: { es: 'Piel de hierro', en: 'Iron Skin' },
      descripcion: { es: 'Resistencia permanente al daño aplastante.', en: 'Permanent resistance to blunt damage.' },
      efectos: [buff(EF.resAplastante, ['+5%', '+6%', '+7%', '+8%', '+10%'])],
    },
    {
      id: 'ataque-fatal', tipo: 'constante',
      nombre: { es: 'Ataque fatal', en: 'Fatal Strike' },
      descripcion: { es: 'Corte en la frente que le baja la protección al enemigo.', en: 'A cut to the forehead that lowers the enemy’s protection.' },
      mana: [198, 219, 240, 261, 282], duracion: 40, recarga: 80, invocacion: 0, recargaGlobal: 'normal', intervaloArma: true,
      efectos: [dano(EF.danoAtaque, '100%'), debuff(EF.proteccion, ['-10%', '-20%', '-30%', '-40%', '-50%'])],
    },
    {
      id: 'tifon', tipo: 'constante',
      nombre: { es: 'Tifón', en: 'Typhoon' },
      descripcion: { es: 'Giro de 360° que daña y derriba a todos los que tenés alrededor.', en: 'A 360° spin that damages and knocks down everyone around you.' },
      mana: [380, 410, 440, 470, 500], duracion: [1, 2, 3, 4, 5], recarga: 180, invocacion: 1.5, recargaGlobal: 'normal', area: 6, intervaloArma: true,
      efectos: [dano(EF.danoAtaque, ['80%', '90%', '100%', '120%', '150%']), dano(EF.danoCortante, ['50', '100', '150', '200', '250']), debuff(EF.noquear)],
    },
  ],
};

export const ARMAS_APLASTANTES: Discipline = {
  id: 'armas-aplastantes',
  nombre: { es: 'Armas aplastantes', en: 'Blunt Weapons' },
  poderes: [
    {
      id: 'impacto-vigoroso', tipo: 'directo',
      nombre: { es: 'Impacto vigoroso', en: 'Forceful Blow' },
      descripcion: { es: 'Golpe fuerte que suma daño aplastante extra.', en: 'A strong blow that adds extra blunt damage.' },
      mana: [40, 65, 90, 110, 130], recarga: 6, invocacion: 0, recargaGlobal: 'normal', intervaloArma: true,
      efectos: [dano(EF.danoAtaque, '100%'), dano(EF.danoAplastante, ['40-60', '60-100', '100-140', '140-180', '180-240'])],
    },
    {
      id: 'impactos-brutales', tipo: 'constante',
      nombre: { es: 'Impactos brutales', en: 'Brutal Impacts' },
      descripcion: { es: 'Mientras dura, tus golpes hacen más daño aplastante.', en: 'While active, your hits deal more blunt damage.' },
      mana: [60, 80, 100, 120, 140], duracion: 90, recarga: 120, invocacion: 0, recargaGlobal: 'corta',
      efectos: [buff(EF.danoAplastante, ['+15', '+30', '+45', '+60', '+75'])],
    },
    {
      id: 'rompe-costillas', tipo: 'constante',
      nombre: { es: 'Rompe costillas', en: 'Ribs Breaker' },
      descripcion: { es: 'Golpe a las costillas que deja al enemigo sin aire y clavado en el lugar.', en: 'A blow to the ribs that knocks the wind out of the enemy and roots them.' },
      mana: [90, 100, 110, 120, 130], duracion: [4, 5, 6, 7, 8], recarga: 40, invocacion: 0, recargaGlobal: 'normal', intervaloArma: true,
      efectos: [dano(EF.danoAplastante, ['100-120', '150-170', '210-230', '275-295', '350-370']), debuff(EF.inmovilizar)],
    },
    {
      id: 'anatomia-letal', tipo: 'pasivo',
      nombre: { es: 'Anatomía letal', en: 'Lethal Anatomy' },
      descripcion: { es: 'Más daño aplastante de forma permanente.', en: 'Permanently more blunt damage.' },
      efectos: [buff(EF.danoAplastante, ['+3%', '+6%', '+9%', '+12%', '+15%'])],
    },
    {
      id: 'triturador', tipo: 'constante',
      nombre: { es: 'Triturador', en: 'Crushing' },
      descripcion: { es: 'Golpe que quiebra huesos y le baja la constitución al enemigo.', en: 'A bone-breaking blow that lowers the enemy’s constitution.' },
      mana: [102, 128, 154, 180, 206], duracion: [10, 14, 18, 23, 30], recarga: 60, invocacion: 0, recargaGlobal: 'normal', intervaloArma: true,
      efectos: [dano(EF.danoAtaque, '+100%'), debuff(EF.constitucion, ['-5', '-10', '-15', '-20', '-25'])],
    },
    {
      id: 'ejecucion', tipo: 'constante',
      nombre: { es: 'Ejecución', en: 'Execution' },
      descripcion: { es: 'Durante un rato tus golpes son mucho más propensos a ser críticos.', en: 'For a while your hits are far more likely to be critical.' },
      mana: [180, 220, 260, 290, 330], duracion: [10, 12, 14, 16, 20], recarga: 200, invocacion: 0, recargaGlobal: 'normal',
      efectos: [buff(EF.critico, ['+100%', '+175%', '+250%', '+375%', '+500%'])],
    },
    {
      id: 'aplasta-mentes', tipo: 'directo',
      nombre: { es: 'Aplasta mentes', en: 'Mind Squasher' },
      descripcion: { es: 'Golpe que puede quitarle al enemigo poderes positivos activos. Requiere arma aplastante.', en: 'A blow that may strip active positive powers from the enemy. Needs a blunt weapon.' },
      mana: [100, 125, 150, 175, 200], recarga: 100, invocacion: 0, recargaGlobal: 'normal', intervaloArma: true,
      efectos: [dano(EF.danoAtaque, '+100%'), debuff(EF.disiparPositivos, ['1', '1', '1', '2', '2']), debuff(EF.chanceDisipar, ['15%', '30%', '45%', '70%', '100%'])],
    },
    {
      id: 'temple-de-acero', tipo: 'pasivo',
      nombre: { es: 'Temple de acero', en: 'Steel Temper' },
      descripcion: { es: 'Resistencia permanente al daño punzante.', en: 'Permanent resistance to piercing damage.' },
      efectos: [buff(EF.resPunzante, ['+5%', '+6%', '+7%', '+8%', '+10%'])],
    },
    {
      id: 'rompe-quijadas', tipo: 'constante',
      nombre: { es: 'Rompe quijadas', en: 'Jaw Breaker' },
      descripcion: { es: 'Golpe a la mandíbula que marea al enemigo.', en: 'A blow to the jaw that leaves the enemy dizzy.' },
      mana: [120, 150, 180, 210, 240], duracion: [2, 3, 4, 5, 6], recarga: 40, invocacion: 0, recargaGlobal: 'normal', intervaloArma: true,
      efectos: [dano(EF.danoAtaque, '+100%'), debuff(EF.marear)],
    },
    {
      id: 'golpe-de-trueno', tipo: 'constante',
      nombre: { es: 'Golpe de trueno', en: 'Thunder Strike' },
      descripcion: { es: 'Golpe al suelo que daña y aturde a todos los que tenés alrededor.', en: 'A strike to the ground that damages and stuns everyone around you.' },
      mana: [380, 410, 440, 470, 500], duracion: [1, 2, 3, 4, 5], recarga: 180, invocacion: 1.5, recargaGlobal: 'normal', area: 6, intervaloArma: true,
      efectos: [dano(EF.danoAtaque, ['80%', '90%', '100%', '120%', '150%']), dano(EF.danoAplastante, ['50', '100', '150', '200', '250']), debuff(EF.aturdir)],
    },
  ],
};

export const ARMAS_PUNZANTES: Discipline = {
  id: 'armas-punzantes',
  nombre: { es: 'Armas punzantes', en: 'Piercing Weapons' },
  poderes: [
    {
      id: 'destripador', tipo: 'directo',
      nombre: { es: 'Destripador', en: 'Gutting' },
      descripcion: { es: 'El arma se clava y desgarra, sumando daño punzante extra.', en: 'The weapon digs in and tears, adding extra piercing damage.' },
      mana: [40, 65, 90, 110, 130], recarga: 6, invocacion: 0, recargaGlobal: 'normal', intervaloArma: true,
      efectos: [dano(EF.danoAtaque, '100%'), dano(EF.danoPunzante, ['40', '70', '110', '140', '175'])],
    },
    {
      id: 'maniobras-agiles', tipo: 'constante',
      nombre: { es: 'Maniobras ágiles', en: 'Agile Maneuvers' },
      descripcion: { es: 'Mientras dura, tus golpes hacen más daño punzante.', en: 'While active, your hits deal more piercing damage.' },
      mana: [60, 80, 100, 120, 140], duracion: 90, recarga: 120, invocacion: 0, recargaGlobal: 'corta',
      efectos: [buff(EF.danoPunzante, ['+15', '+30', '+45', '+60', '+75'])],
    },
    {
      id: 'balestra', tipo: 'constante',
      nombre: { es: 'Balestra', en: 'Balestra' },
      descripcion: { es: 'Ataque rápido que se adelanta al enemigo y lo deja inmóvil.', en: 'A swift attack that beats the enemy to the punch and roots them.' },
      mana: [100, 120, 140, 160, 180], duracion: [2, 3, 4, 5, 6], recarga: 40, invocacion: 0, recargaGlobal: 'normal', intervaloArma: true,
      efectos: [dano(EF.danoPunzante, ['90-110', '140-160', '200-220', '265-285', '340-360']), debuff(EF.inmovilizar)],
    },
    {
      id: 'versatilidad', tipo: 'pasivo',
      nombre: { es: 'Versatilidad', en: 'Versatility' },
      descripcion: { es: 'Mejora el daño punzante y te cura un poco con cada golpe.', en: 'Raises piercing damage and heals you a bit on every hit.' },
      efectos: [buff(EF.danoPunzante, ['+2%', '+4%', '+6%', '+8%', '+10%']), buff(EF.saludPorGolpe, ['+4', '+4', '+6', '+6', '+10'])],
    },
    {
      id: 'riposte', tipo: 'directo',
      nombre: { es: 'Riposte', en: 'Riposte' },
      descripcion: { es: 'Contraataque que aprovecha un error del enemigo y le convierte maná en daño.', en: 'A counterattack that punishes an enemy mistake and turns their mana into damage.' },
      mana: [80, 95, 110, 125, 140], recarga: 30, invocacion: 0.5, recargaGlobal: 'normal', intervaloArma: true,
      efectos: [dano(EF.danoAtaque, ['+120%', '+130%', '+140%', '+150%', '+170%']), debuff(EF.manaADano, ['100', '150', '200', '250', '350'])],
    },
    {
      id: 'empalamiento', tipo: 'constante',
      nombre: { es: 'Empalamiento', en: 'Impale' },
      descripcion: { es: 'Atraviesa al enemigo: daño en el tiempo y menos destreza.', en: 'Runs the enemy through: damage over time and lower dexterity.' },
      mana: [125, 150, 175, 200, 225], duracion: [12, 15, 17, 19, 21], recarga: 60, invocacion: 0.5, recargaGlobal: 'normal', rango: 8, intervaloArma: true,
      efectos: [
        dano(EF.danoAtaque, '+100%'),
        dano(EF.danoPunzante, ['80-100', '100-120', '120-150', '150-190', '190-220']),
        dano(EF.danoPunzanteTicks, '80-125'),
        debuff(EF.destreza, ['-15', '-19', '-23', '-27', '-35']),
      ],
    },
    {
      id: 'perfora-cerebros', tipo: 'constante',
      nombre: { es: 'Perfora cerebros', en: 'Brain Piercing' },
      descripcion: { es: 'Golpe a la cabeza que le corta la concentración al enemigo: invoca más lento y se cura menos.', en: 'A blow to the head that breaks the enemy’s focus: slower casting and weaker healing.' },
      mana: [120, 150, 180, 210, 250], duracion: [10, 12, 12, 15, 15], recarga: 10, invocacion: 0, recargaGlobal: 'normal', intervaloArma: true,
      efectos: [dano(EF.danoAtaque, '+100%'), debuff(EF.velInvocacion, ['-10%', '-15%', '-20%', '-25%', '-40%']), debuff(EF.bonusCuracion, ['-10%', '-20%', '-30%', '-40%', '-60%'])],
    },
    {
      id: 'flexibilidad', tipo: 'pasivo',
      nombre: { es: 'Flexibilidad', en: 'Bendable' },
      descripcion: { es: 'Resistencia permanente al daño cortante.', en: 'Permanent resistance to slashing damage.' },
      efectos: [buff(EF.resCortante, ['+5%', '+6%', '+7%', '+8%', '+10%'])],
    },
    {
      id: 'estocada-multiple', tipo: 'directo',
      nombre: { es: 'Estocada múltiple', en: 'Multiple Thrust' },
      descripcion: { es: 'Varias estocadas en arco que golpean a todos los enemigos de adelante.', en: 'A flurry of thrusts in an arc that hits every enemy in front of you.' },
      mana: [200, 230, 255, 280, 300], recarga: 70, invocacion: 1.5, recargaGlobal: 'normal', intervaloArma: true,
      efectos: [dano(EF.danoAtaque, ['+60%', '+75%', '+90%', '+105%', '+120%']), dano(EF.danoPunzante, ['120', '140', '160', '180', '200'])],
    },
    {
      id: 'golpe-relampago', tipo: 'directo',
      nombre: { es: 'Golpe relámpago', en: 'Lightning Strike' },
      descripcion: { es: 'Ataque de 360° que daña y marea a todos los que tenés alrededor.', en: 'A 360° strike that damages and dizzies everyone around you.' },
      mana: [380, 410, 440, 470, 500], duracion: [1, 2, 3, 4, 5], recarga: 180, invocacion: 1.5, recargaGlobal: 'normal', area: 6, intervaloArma: true,
      efectos: [dano(EF.danoAtaque, ['+80%', '+90%', '+100%', '+120%', '+150%']), dano(EF.danoPunzante, ['50', '100', '150', '200', '250']), debuff(EF.marear)],
    },
  ],
};

export const TACTICAS: Discipline = {
  id: 'tacticas',
  nombre: { es: 'Tácticas', en: 'Tactics' },
  poderes: [
    {
      id: 'puntapie', tipo: 'constante',
      nombre: { es: 'Puntapié', en: 'Kick' },
      descripcion: { es: 'Una patada que tira al enemigo al suelo.', en: 'A kick that sends the enemy to the ground.' },
      mana: [70, 100, 130, 160, 200], duracion: [2, 3, 4, 5, 6], recarga: 35, invocacion: 0, recargaGlobal: 'normal',
      efectos: [dano(EF.danoAplastante, ['40-60', '80-120', '120-180', '160-240', '200-300']), debuff(EF.noquear)],
    },
    {
      id: 'cautela', tipo: 'constante',
      nombre: { es: 'Cautela', en: 'Caution' },
      descripcion: { es: 'Cerrás la guardia y ganás protección por un rato.', en: 'You tighten your guard and gain protection for a while.' },
      mana: [100, 120, 140, 160, 180], duracion: 60, recarga: 80, invocacion: 0, recargaGlobal: 'corta',
      efectos: [buff(EF.proteccion, ['+10%', '+15%', '+20%', '+25%', '+30%'])],
    },
    {
      id: 'degollador', tipo: 'constante',
      nombre: { es: 'Degollador', en: 'Throat Cutter' },
      descripcion: { es: 'Remata al enemigo en el acto si le queda poca salud.', en: 'Finishes the enemy on the spot if their health is low enough.' },
      mana: [100, 140, 180, 220, 260], recarga: 40, invocacion: 0, recargaGlobal: 'normal', intervaloArma: true,
      efectos: [debuff(EF.rematar, ['150', '275', '400', '525', '650'])],
    },
    {
      id: 'defensa-marcial', tipo: 'pasivo',
      nombre: { es: 'Defensa marcial', en: 'Martial Defense' },
      descripcion: { es: 'Te pegan menos críticos de forma permanente.', en: 'Permanently lowers the chance of being hit by criticals.' },
      efectos: [debuff(EF.criticoRecibido, ['-10%', '-20%', '-30%', '-50%', '-70%'])],
    },
    {
      id: 'preparacion-rigurosa', tipo: 'constante',
      nombre: { es: 'Preparación rigurosa', en: 'Rigorous Preparation' },
      descripcion: { es: 'Mientras dura, resistís el próximo efecto de control que te tiren.', en: 'While active, you shrug off the next crowd control effect.' },
      mana: [100, 120, 140, 160, 180], duracion: [3, 6, 9, 12, 15], recarga: 90, invocacion: 0, recargaGlobal: 'corta',
      efectos: [buff(EF.resControl)],
    },
    {
      id: 'reves', tipo: 'constante',
      nombre: { es: 'Revés', en: 'Back Slam' },
      descripcion: { es: 'Un golpe rápido a la cara que deja al enemigo más fácil de marear.', en: 'A quick slam to the face that makes the enemy easier to daze.' },
      mana: [120, 145, 170, 195, 220], duracion: 15, recarga: 30, invocacion: 0, recargaGlobal: 'corta', intervaloArma: true,
      efectos: [dano(EF.danoAplastante, ['160-200', '190-230', '220-260', '250-290', '280-320']), debuff(EF.resMareo, ['-10%', '-20%', '-30%', '-40%', '-50%'])],
    },
    {
      id: 'embestida', tipo: 'constante',
      nombre: { es: 'Embestida', en: 'Onslaught' },
      descripcion: { es: 'Los aliados cercanos corren más rápido hasta su primer golpe, que pega más fuerte.', en: 'Nearby allies run faster until their first hit, which lands harder.' },
      mana: [150, 190, 230, 270, 310], duracion: 14, recarga: 60, invocacion: 0, recargaGlobal: 'muy-corta', area: 6,
      efectos: [buff(EF.velMovimiento, ['+10%', '+15%', '+20%', '+25%', '+30%']), buff(EF.danoAplastante, ['+50', '+75', '+100', '+125', '+150'])],
    },
    {
      id: 'intimidar', tipo: 'constante',
      nombre: { es: 'Intimidar', en: 'Intimidate' },
      descripcion: { es: 'Un grito que frena al enemigo.', en: 'A shout that slows the enemy down.' },
      mana: [80, 90, 110, 130, 150], duracion: [6, 7, 8, 9, 10], recarga: 6, invocacion: 0, recargaGlobal: 'corta', rango: 12,
      efectos: [debuff(EF.velMovimiento, ['-6%', '-7%', '-9%', '-11%', '-15%'])],
    },
    {
      id: 'inhabilitar', tipo: 'constante',
      nombre: { es: 'Inhabilitar', en: 'Disabling' },
      descripcion: { es: 'Golpe a la pierna que le baja al enemigo la protección y el bloqueo.', en: 'A strike to the leg that lowers the enemy’s protection and block.' },
      mana: [200, 220, 240, 260, 280], duracion: 40, recarga: 60, invocacion: 0, recargaGlobal: 'normal', intervaloArma: true,
      efectos: [debuff(EF.proteccion, ['-40%', '-47%', '-54%', '-61%', '-68%']), debuff(EF.bloqueo, ['-40%', '-45%', '-50%', '-55%', '-60%'])],
    },
    {
      id: 'reflejos-marciales', tipo: 'constante',
      nombre: { es: 'Reflejos marciales', en: 'Martial Reflexes' },
      descripcion: { es: 'Muchísima más chance de crítico y algo de resistencia al aturdimiento.', en: 'Much higher critical chance plus some stun resistance.' },
      mana: [340, 380, 420, 460, 500], duracion: [30, 35, 40, 50, 70], recarga: 180, invocacion: 1.5, recargaGlobal: 'corta',
      efectos: [buff(EF.critico, ['+100%', '+200%', '+300%', '+400%', '+500%']), buff(EF.resAturdir, ['+5%', '+10%', '+15%', '+20%', '+25%'])],
    },
  ],
};

export const DISCIPLINAS_GUERRERO = [ARMAS_CORTANTES, ARMAS_APLASTANTES, ARMAS_PUNZANTES, TACTICAS];
