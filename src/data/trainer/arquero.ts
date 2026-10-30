import type { Discipline } from './types';
import { EF, buff, debuff, dano, contra } from './effects';

/** Disciplinas de la clase Arquero: las comparten Cazador y Tirador. */

export const ARCOS_CORTOS: Discipline = {
  id: 'arcos-cortos',
  nombre: { es: 'Arcos cortos', en: 'Short Bows' },
  poderes: [
    {
      id: 'disparo-dual', tipo: 'directo',
      nombre: { es: 'Disparo dual', en: 'Dual Shot' },
      descripcion: { es: 'Dos flechas a la vez, con daño cortante extra.', en: 'Two arrows at once, with extra slashing damage.' },
      mana: [40, 60, 80, 95, 110], recarga: 7, invocacion: 0.5, recargaGlobal: 'corta',
      efectos: [dano(EF.danoAtaque, ['+100%', '+105%', '+110%', '+115%', '+120%']), dano(EF.danoCortante, ['50', '75', '100', '125', '150'])],
    },
    {
      id: 'disparo-rapido', tipo: 'constante',
      nombre: { es: 'Disparo rápido', en: 'Rapid Shot' },
      descripcion: { es: 'Disparás más seguido, pero con menos puntería para los críticos.', en: 'You shoot more often, but with worse aim for criticals.' },
      mana: [60, 85, 110, 135, 160], duracion: [10, 15, 20, 25, 30], recarga: 60, invocacion: 0, recargaGlobal: 'muy-corta',
      efectos: [buff(EF.velAtaque, '+25%'), contra(EF.critico, '-50%')],
    },
    {
      id: 'flecha-paralizadora', tipo: 'constante',
      nombre: { es: 'Flecha paralizadora', en: 'Grounding Arrow' },
      descripcion: { es: 'Una flecha a los pies que deja al enemigo clavado en el lugar.', en: 'An arrow to the feet that roots the enemy in place.' },
      mana: [95, 120, 145, 170, 195], duracion: [1, 2, 3, 4, 5], recarga: 40, invocacion: 0.5, recargaGlobal: 'corta', rango: 20,
      efectos: [dano(EF.danoAtaque, ['+80%', '+90%', '+100%', '+110%', '+120%']), debuff(EF.inmovilizar)],
    },
    {
      id: 'ligereza', tipo: 'pasivo',
      nombre: { es: 'Ligereza', en: 'Lightness' },
      descripcion: { es: 'Más destreza, siempre.', en: 'More dexterity, always on.' },
      efectos: [buff(EF.destreza, ['+5', '+7', '+9', '+12', '+15'])],
    },
    {
      id: 'meditacion', tipo: 'constante',
      nombre: { es: 'Meditación', en: 'Meditation' },
      descripcion: { es: 'Un rato de calma que te da más concentración.', en: 'A moment of calm that gives you more concentration.' },
      mana: [50, 75, 100, 125, 150], duracion: [50, 60, 70, 80, 90], recarga: 120, invocacion: 0, recargaGlobal: 'muy-corta',
      efectos: [buff(EF.concentracion, ['+10', '+15', '+20', '+25', '+30'])],
    },
    {
      id: 'adaptabilidad', tipo: 'constante',
      nombre: { es: 'Adaptabilidad', en: 'Adaptability' },
      descripcion: { es: 'Unos segundos con muchísima chance de crítico.', en: 'A few seconds with a huge critical chance.' },
      mana: [180, 220, 260, 290, 330], duracion: [4, 6, 8, 10, 12], recarga: 80, invocacion: 0, recargaGlobal: 'muy-corta',
      efectos: [buff(EF.critico, '+200%')],
    },
    {
      id: 'desgarrar', tipo: 'constante',
      nombre: { es: 'Desgarrar', en: 'Tear Apart' },
      descripcion: { es: 'Una flecha que deja al enemigo sangrando un rato.', en: 'An arrow that leaves the enemy bleeding for a while.' },
      mana: [130, 160, 190, 220, 250], duracion: [8, 9, 10, 11, 12], recarga: 30, invocacion: 1, recargaGlobal: 'corta',
      efectos: [dano(EF.danoEnElTiempo, ['20', '30', '40', '50', '60'])],
    },
    {
      id: 'duelista', tipo: 'pasivo',
      nombre: { es: 'Duelista', en: 'Duelist' },
      descripcion: { es: 'Más chance de crítico, siempre.', en: 'More critical chance, always on.' },
      efectos: [buff(EF.critico, ['+10%', '+13%', '+16%', '+20%', '+25%'])],
    },
    {
      id: 'ralentizar', tipo: 'constante',
      nombre: { es: 'Ralentizar', en: 'Hinder' },
      descripcion: { es: 'Los enemigos del área se mueven más lento y pegan menos.', en: 'Enemies in the area move slower and hit softer.' },
      mana: [75, 125, 175, 225, 275], duracion: 30, recarga: 60, invocacion: 1, recargaGlobal: 'corta', area: 6,
      efectos: [debuff(EF.bonusDanoArma, ['-2%', '-4%', '-6%', '-8%', '-10%']), debuff(EF.velMovimiento, ['-5%', '-7%', '-9%', '-12%', '-15%'])],
    },
    {
      id: 'tiro-de-repeticion', tipo: 'directo',
      nombre: { es: 'Tiro de repetición', en: 'Repetition Shot' },
      descripcion: { es: 'Una ráfaga de flechas en un arco de 75° frente a vos.', en: 'A volley of arrows in a 75° arc in front of you.' },
      mana: [340, 380, 420, 460, 500], recarga: 180, invocacion: 1.5, recargaGlobal: 'normal', rango: 10,
      efectos: [dano(EF.danoAtaque, '+100%'), dano(EF.danoPunzante, ['300', '400', '500', '600', '700'])],
    },
  ],
};

export const ARCOS_LARGOS: Discipline = {
  id: 'arcos-largos',
  nombre: { es: 'Arcos largos', en: 'Long Bows' },
  poderes: [
    {
      id: 'penetra-escudos', tipo: 'directo',
      nombre: { es: 'Penetra escudos', en: 'Shield Piercing' },
      descripcion: { es: 'Una flecha tan fuerte que atraviesa las defensas.', en: 'An arrow so strong it cuts through defenses.' },
      mana: [45, 70, 90, 110, 130], recarga: 10, invocacion: 0.5, recargaGlobal: 'corta', bloqueable100: true,
      efectos: [dano(EF.danoAtaque, ['100%', '105%', '110%', '120%', '135%'])],
    },
    {
      id: 'tiro-parabolico', tipo: 'constante',
      nombre: { es: 'Tiro parabólico', en: 'Parabolic Shot' },
      descripcion: { es: 'Disparás más lejos.', en: 'You shoot farther.' },
      mana: [60, 75, 90, 105, 120], duracion: [15, 18, 21, 25, 30], recarga: 40, invocacion: 0, recargaGlobal: 'muy-corta',
      efectos: [buff(EF.rangoAtaque, ['+20%', '+21%', '+22%', '+23%', '+25%'])],
    },
    {
      id: 'maniobrabilidad', tipo: 'constante',
      nombre: { es: 'Maniobrabilidad', en: 'Maneuver' },
      descripcion: { es: 'Leés la pelea y ganás destreza por un rato.', en: 'You read the fight and gain dexterity for a while.' },
      mana: [100, 130, 160, 190, 220], duracion: 40, recarga: 120, invocacion: 0, recargaGlobal: 'corta',
      efectos: [buff(EF.destreza, ['+10', '+15', '+20', '+25', '+30'])],
    },
    {
      id: 'ojo-de-aguila', tipo: 'constante',
      nombre: { es: 'Ojo de águila', en: 'Eagle’s Eye' },
      descripcion: { es: 'Apuntás mejor: a los enemigos les cuesta más esquivarte.', en: 'Better aim: enemies have a harder time evading you.' },
      mana: [90, 110, 130, 150, 170], duracion: 120, recarga: 120, invocacion: 0, recargaGlobal: 'corta',
      efectos: [debuff(EF.evasion, ['-10%', '-15%', '-20%', '-25%', '-35%'])],
    },
    {
      id: 'tiro-al-blanco', tipo: 'constante',
      nombre: { es: 'Tiro al blanco', en: 'Point Shot' },
      descripcion: { es: 'Buscás los huecos de la armadura: mucho más crítico, pero menos alcance.', en: 'You look for gaps in the armor: far more critical chance, but less range.' },
      mana: [115, 140, 165, 190, 215], duracion: 20, recarga: 45, invocacion: 0, recargaGlobal: 'corta',
      efectos: [buff(EF.critico, ['+130%', '+140%', '+150%', '+160%', '+180%']), contra(EF.rangoAtaque, ['-30%', '-25%', '-20%', '-10%', '0%'])],
    },
    {
      id: 'omnipresencia', tipo: 'pasivo',
      nombre: { es: 'Omnipresencia', en: 'Omnipresent' },
      descripcion: { es: 'Más concentración, siempre.', en: 'More concentration, always on.' },
      efectos: [buff(EF.concentracion, ['+5', '+7', '+9', '+12', '+15'])],
    },
    {
      id: 'despedazar-arco', tipo: 'constante',
      nombre: { es: 'Despedazar', en: 'Break Apart' },
      descripcion: { es: 'Una flecha que desgarra: daño por segundo y menos constitución.', en: 'A tearing arrow: damage per second and lower constitution.' },
      mana: [150, 175, 200, 225, 250], duracion: 15, recarga: 40, invocacion: 1.5, recargaGlobal: 'corta',
      efectos: [dano(EF.danoPuroPorSegundo, ['8-12', '12-18', '13-20', '31-40', '40-50']), debuff(EF.constitucion, '-20')],
    },
    {
      id: 'especialista', tipo: 'pasivo',
      nombre: { es: 'Especialista', en: 'Specialist' },
      descripcion: { es: 'Más daño con el arma, siempre.', en: 'More weapon damage, always on.' },
      efectos: [buff(EF.bonusDanoArma, ['+2%', '+4%', '+6%', '+8%', '+10%'])],
    },
    {
      id: 'ofuscar', tipo: 'constante',
      nombre: { es: 'Ofuscar', en: 'Obfuscate' },
      descripcion: { es: 'Le nublás la vista al enemigo: pierde concentración, invoca más lento y es más fácil de controlar.', en: 'You cloud the enemy’s vision: less concentration, slower casting and easier to control.' },
      mana: [150, 175, 200, 225, 250], duracion: 30, recarga: 45, invocacion: 1, recargaGlobal: 'corta',
      efectos: [
        debuff(EF.concentracion, ['-15%', '-20%', '-25%', '-30%', '-35%']),
        debuff(EF.velInvocacion, ['-10%', '-15%', '-20%', '-25%', '-30%']),
        debuff(EF.resInmovilizar, ['-10%', '-10%', '-15%', '-15%', '-20%']),
        debuff(EF.resMareo, ['-10%', '-10%', '-15%', '-15%', '-20%']),
      ],
    },
    {
      id: 'lluvia-de-proyectiles', tipo: 'directo',
      nombre: { es: 'Lluvia de proyectiles', en: 'Projectile Rain' },
      descripcion: { es: 'Una lluvia de flechas sobre un área.', en: 'A rain of arrows over an area.' },
      mana: [320, 340, 360, 380, 400], recarga: 180, invocacion: 3, recargaGlobal: 'corta', area: 10,
      efectos: [dano(EF.danoAtaque, '100%'), dano(EF.danoPunzante, ['100', '225', '350', '475', '600'])],
    },
  ],
};

export const TRUCOS: Discipline = {
  id: 'trucos',
  nombre: { es: 'Trucos', en: 'Tricks' },
  poderes: [
    {
      id: 'emboscada', tipo: 'constante',
      nombre: { es: 'Emboscada', en: 'Ambush' },
      descripcion: { es: 'Tomás por sorpresa al enemigo y lo tirás al suelo.', en: 'You catch the enemy by surprise and knock them down.' },
      mana: [50, 75, 95, 115, 130], duracion: [2, 3, 4, 5, 6], recarga: 30, invocacion: 0.5, recargaGlobal: 'normal', rango: 12, bloqueable100: true,
      efectos: [debuff(EF.noquear)],
    },
    {
      id: 'ataque-sorpresivo', tipo: 'constante',
      nombre: { es: 'Ataque sorpresivo', en: 'Sudden Strike' },
      descripcion: { es: 'Atacás con la guardia del enemigo baja y le bajás la protección.', en: 'You strike while the enemy is off guard and lower their protection.' },
      mana: [80, 90, 100, 110, 120], duracion: [20, 25, 30, 35, 40], recarga: 40, invocacion: 1, recargaGlobal: 'corta', rango: 25,
      efectos: [debuff(EF.proteccion, '-50%')],
    },
    {
      id: 'puno-aturdidor', tipo: 'constante',
      nombre: { es: 'Puño aturdidor', en: 'Stunning Fist' },
      descripcion: { es: 'Un puñetazo con la mano del arco que aturde.', en: 'A punch with your bow hand that stuns.' },
      mana: [120, 140, 160, 180, 200], duracion: [2, 3, 4, 5, 6], recarga: 45, invocacion: 0.5, recargaGlobal: 'corta',
      efectos: [dano(EF.danoAplastante, ['150-200', '225-300', '300-400', '375-500', '400-600']), debuff(EF.aturdir)],
    },
    {
      id: 'represalia', tipo: 'constante',
      nombre: { es: 'Represalia', en: 'Retaliation' },
      descripcion: { es: 'Le devolvés al atacante parte del próximo golpe que recibas. Se termina con ese golpe o al pasar el tiempo.', en: 'You return part of the next hit you take to the attacker. Ends with that hit or when time runs out.' },
      mana: [120, 140, 160, 180, 200], duracion: 15, recarga: 30, invocacion: 0, recargaGlobal: 'corta',
      efectos: [buff(EF.devuelveDano, ['+20%', '+35%', '+50%', '+75%', '+90%'])],
    },
    {
      id: 'toque-pegajoso', tipo: 'constante',
      nombre: { es: 'Toque pegajoso', en: 'Sticky Touch' },
      descripcion: { es: 'Una sustancia pegajosa que hace atacar más lento al enemigo.', en: 'A sticky substance that makes the enemy attack slower.' },
      mana: [70, 90, 110, 130, 150], duracion: 45, recarga: 45, invocacion: 1.5, recargaGlobal: 'corta', rango: 25,
      efectos: [debuff(EF.velAtaque, ['-10%', '-15%', '-20%', '-25%', '-30%'])],
    },
    {
      id: 'pelea-sucia', tipo: 'constante',
      nombre: { es: 'Pelea sucia', en: 'Dirty Fighting' },
      descripcion: { es: 'Pegás mucho más fuerte de cerca, a cambio de la mitad del alcance.', en: 'You hit much harder up close, at the cost of half your range.' },
      mana: [120, 140, 160, 180, 200], duracion: [10, 15, 20, 25, 30], recarga: 30, invocacion: 0, recargaGlobal: 'corta',
      efectos: [buff(EF.bonusDanoArma, '+30%'), contra(EF.rangoAtaque, '-50%')],
    },
    {
      id: 'fineza', tipo: 'constante',
      nombre: { es: 'Fineza', en: 'Finesse' },
      descripcion: { es: 'Amagues y fintas: el enemigo te pega muchos menos críticos.', en: 'Fakes and feints: the enemy lands far fewer criticals on you.' },
      mana: [70, 100, 130, 160, 190], duracion: [10, 15, 20, 25, 40], recarga: 40, invocacion: 1, recargaGlobal: 'corta',
      efectos: [debuff(EF.criticoRecibido, ['-10%', '-25%', '-40%', '-60%', '-90%'])],
    },
    {
      id: 'centinela', tipo: 'pasivo',
      nombre: { es: 'Centinela', en: 'Sentinel' },
      descripcion: { es: 'Sentidos afilados: más concentración y algo de destreza, siempre.', en: 'Sharp senses: more concentration and some dexterity, always on.' },
      efectos: [buff(EF.concentracion, ['+5', '+7', '+9', '+12', '+15']), buff(EF.destreza, ['+1', '+2', '+3', '+4', '+5'])],
    },
    {
      id: 'tiro-de-distraccion', tipo: 'constante',
      nombre: { es: 'Tiro de distracción', en: 'Distracting Shot' },
      descripcion: { es: 'Un disparo que distrae al enemigo y lo deja aturdido.', en: 'A shot that distracts the enemy and leaves them stunned.' },
      mana: [75, 100, 125, 150, 175], duracion: [5, 6, 7, 8, 10], recarga: 50, invocacion: 1, recargaGlobal: 'corta', rango: 25, bloqueable100: true,
      efectos: [debuff(EF.aturdir)],
    },
    {
      id: 'flecha-con-abrojos', tipo: 'constante',
      nombre: { es: 'Flecha con abrojos', en: 'Caltrop’s Arrow' },
      descripcion: { es: 'Desparrama abrojos en un área: los enemigos que la pisan se mueven más lento.', en: 'Scatters caltrops over an area: enemies who step on them move slower.' },
      mana: [330, 360, 390, 420, 450], duracion: 15, recarga: 180, invocacion: 1.5, recargaGlobal: 'corta', rango: 25, area: 10,
      efectos: [debuff(EF.velMovimiento, ['-10%', '-20%', '-30%', '-40%', '-50%'])],
    },
  ],
};

export const EVASION: Discipline = {
  id: 'evasion',
  nombre: { es: 'Evasión', en: 'Evasion' },
  poderes: [
    {
      id: 'esquivar', tipo: 'constante',
      nombre: { es: 'Esquivar', en: 'Dodge' },
      descripcion: { es: 'Mientras dura, resistís el próximo efecto de control.', en: 'While active, you shrug off the next crowd control effect.' },
      mana: [120, 140, 160, 180, 200], duracion: [2, 4, 6, 8, 10], recarga: 80, invocacion: 1, recargaGlobal: 'corta',
      efectos: [buff(EF.resControl)],
    },
    {
      id: 'movilidad', tipo: 'constante',
      nombre: { es: 'Movilidad', en: 'Mobility' },
      descripcion: { es: 'Corrés un poco más rápido.', en: 'You run a bit faster.' },
      mana: [130, 155, 180, 205, 230], duracion: 20, recarga: 60, invocacion: 0, recargaGlobal: 'corta',
      efectos: [buff(EF.velMovimiento, ['+2%', '+4%', '+6%', '+8%', '+10%'])],
    },
    {
      id: 'tacticas-evasivas', tipo: 'constante',
      nombre: { es: 'Tácticas evasivas', en: 'Evasive Tactics' },
      descripcion: { es: 'Disparás esquivando: más protección, a cambio de invocar un poco más lento.', en: 'You shoot while dodging: more protection, at the cost of slightly slower casting.' },
      mana: [70, 100, 130, 160, 190], duracion: 40, recarga: 60, invocacion: 0, recargaGlobal: 'corta',
      efectos: [buff(EF.proteccion, ['+20%', '+28%', '+36%', '+42%', '+50%']), contra(EF.velInvocacion, ['-8%', '-7%', '-7%', '-6%', '-5%'])],
    },
    {
      id: 'reflejos-felinos', tipo: 'pasivo',
      nombre: { es: 'Reflejos felinos', en: 'Cat Reflexes' },
      descripcion: { es: 'Más evasión, siempre.', en: 'More evasion, always on.' },
      efectos: [buff(EF.evasion, ['+5%', '+10%', '+15%', '+20%', '+25%'])],
    },
    {
      id: 'acrobatico', tipo: 'constante',
      nombre: { es: 'Acrobático', en: 'Acrobatic' },
      descripcion: { es: 'Con acrobacias, los golpes físicos te hacen menos daño.', en: 'Through acrobatics, physical hits deal less damage to you.' },
      mana: [50, 65, 80, 95, 110], duracion: [40, 45, 50, 55, 60], recarga: 80, invocacion: 0, recargaGlobal: 'corta',
      efectos: [buff(EF.resFisico, ['+5%', '+10%', '+15%', '+20%', '+25%'])],
    },
    {
      id: 'eludir-conjuros', tipo: 'constante',
      nombre: { es: 'Eludir conjuros', en: 'Spell Elude' },
      descripcion: { es: 'Te movés todo el tiempo y los conjuros te hacen menos daño.', en: 'You keep moving and spells deal less damage to you.' },
      mana: [150, 175, 200, 225, 250], duracion: [20, 25, 30, 35, 40], recarga: 80, invocacion: 0, recargaGlobal: 'corta',
      efectos: [buff(EF.resMagico, ['+5%', '+9%', '+14%', '+20%', '+30%'])],
    },
    {
      id: 'escapista', tipo: 'constante',
      nombre: { es: 'Escapista', en: 'Escapist' },
      descripcion: { es: 'Por unos segundos esquivás casi cualquier ataque.', en: 'For a few seconds you evade almost any attack.' },
      mana: [120, 150, 185, 215, 250], duracion: [3, 4, 5, 6, 8], recarga: 75, invocacion: 0, recargaGlobal: 'corta',
      efectos: [buff(EF.evasionAbsoluta, '100%')],
    },
    {
      id: 'astucia', tipo: 'pasivo',
      nombre: { es: 'Astucia', en: 'Wits' },
      descripcion: { es: 'Más inteligencia, siempre.', en: 'More intelligence, always on.' },
      efectos: [buff(EF.inteligencia, ['+5', '+7', '+9', '+12', '+15'])],
    },
    {
      id: 'perfil-bajo', tipo: 'constante',
      nombre: { es: 'Perfil bajo', en: 'Low Profile' },
      descripcion: { es: 'Nadie te puede atacar, pero vos tampoco. Te saca los efectos positivos que tengas.', en: 'Nobody can attack you, but you cannot attack either. Removes your positive effects.' },
      mana: [180, 200, 220, 240, 260], duracion: [4, 5, 6, 8, 10], recarga: 60, invocacion: 0.5, recargaGlobal: 'corta',
      efectos: [buff(EF.santuario), contra(EF.noAtacar)],
    },
    {
      id: 'hijo-del-viento', tipo: 'constante',
      nombre: { es: 'Hijo del viento', en: 'Son of the Wind' },
      descripcion: { es: 'Por unos segundos resistís casi cualquier poder. No se puede usar con Escapista activo.', en: 'For a few seconds you resist almost any power. Cannot be used while Escapist is active.' },
      mana: [150, 185, 225, 260, 300], duracion: [3, 4, 5, 6, 8], recarga: 50, invocacion: 0, recargaGlobal: 'corta',
      efectos: [buff(EF.resPoderesAbsoluta, '100%')],
    },
  ],
};

export const DISCIPLINAS_ARQUERO = [ARCOS_CORTOS, ARCOS_LARGOS, TRUCOS, EVASION];
