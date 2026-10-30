import type { Discipline, SubclassTrainer } from './types';
import { EF, buff, debuff, dano, contra } from './effects';
import { DISCIPLINAS_ARQUERO } from './arquero';

export const MAESTRIA_EN_FLECHAS: Discipline = {
  id: 'maestria-en-flechas',
  nombre: { es: 'Maestría en flechas', en: 'Arrow Mastery' },
  poderes: [
    {
      id: 'saetas-recargadas', tipo: 'activable',
      nombre: { es: 'Saetas recargadas', en: 'Recharged Arrows' },
      descripcion: { es: 'Cargás tus flechas con tu energía: el ataque básico pega más, pero cada flecha te cuesta salud y maná. Se puede apagar.', en: 'You charge your arrows with your own energy: basic attacks hit harder, but each arrow costs health and mana. Can be turned off.' },
      mana: [40, 55, 70, 85, 100], recarga: 15, invocacion: 0, recargaGlobal: 'corta',
      efectos: [
        buff(EF.bonusDanoArma, ['+20%', '+25%', '+30%', '+35%', '+40%']),
        contra({ es: 'Salud por flecha', en: 'Health per arrow' }, ['-10', '-15', '-20', '-25', '-30']),
        contra({ es: 'Maná por flecha', en: 'Mana per arrow' }, ['-20', '-25', '-30', '-35', '-40']),
      ],
    },
    {
      id: 'ola-invernal', tipo: 'constante',
      nombre: { es: 'Ola invernal', en: 'Winter Stroke' },
      descripcion: { es: 'Una ráfaga de hielo que daña y congela al enemigo.', en: 'An ice burst that damages and freezes the enemy.' },
      mana: [80, 110, 140, 170, 200], duracion: [3, 4, 5, 6, 7], recarga: 40, invocacion: 0.5, recargaGlobal: 'corta', rango: 30,
      efectos: [dano(EF.danoHielo, ['60', '170', '280', '390', '500']), debuff(EF.congelar)],
    },
    {
      id: 'rafaga-de-viento', tipo: 'constante',
      nombre: { es: 'Ráfaga de viento', en: 'Burst of Wind' },
      descripcion: { es: 'Un golpe de viento que marea al enemigo.', en: 'A gust of wind that dizzies the enemy.' },
      mana: [130, 160, 190, 220, 250], duracion: [2, 3, 4, 5, 6], recarga: 40, invocacion: 0.5, recargaGlobal: 'corta',
      efectos: [debuff(EF.marear)],
    },
    {
      id: 'mordida-de-serpiente', tipo: 'constante',
      nombre: { es: 'Mordida de serpiente', en: 'Serpent Bite' },
      descripcion: { es: 'Una flecha envenenada: daño al impacto y después por segundo.', en: 'A poisoned arrow: damage on impact and then every second.' },
      mana: [70, 90, 110, 130, 150], duracion: 10, recarga: 45, invocacion: 0.5, recargaGlobal: 'corta',
      efectos: [dano(EF.danoPunzante, ['100', '200', '300', '400', '500']), dano({ es: 'Daño punzante por segundo', en: 'Piercing damage per second' }, ['60', '70', '90', '110', '130'])],
    },
    {
      id: 'fuego-de-ignus', tipo: 'directo',
      nombre: { es: 'Fuego de Ignus', en: 'Ignus Scorch' },
      descripcion: { es: 'Una flecha de fuego que quema y frena a todos en un arco de 40°.', en: 'A fire arrow that burns and slows everyone in a 40° arc.' },
      mana: [70, 100, 130, 160, 190], duracion: [3, 4, 5, 6, 7], recarga: 20, invocacion: 0, recargaGlobal: 'corta', rango: 20,
      efectos: [dano(EF.danoFuego, ['80-120', '190-240', '300-360', '410-480', '520-600']), debuff(EF.velMovimiento, ['-10%', '-12%', '-14%', '-18%', '-25%'])],
    },
    {
      id: 'flecha-eterea', tipo: 'directo',
      nombre: { es: 'Flecha etérea', en: 'Ethereal Arrow' },
      descripcion: { es: 'Una flecha incorpórea que ignora las protecciones del objetivo.', en: 'An incorporeal arrow that ignores the target’s protections.' },
      mana: [75, 110, 145, 180, 215], recarga: 40, invocacion: 1, recargaGlobal: 'corta',
      efectos: [dano(EF.danoPuro, ['100', '225', '350', '475', '600'])],
    },
    {
      id: 'explosion-de-agujas', tipo: 'directo',
      nombre: { es: 'Explosión de agujas', en: 'Needle Blast' },
      descripcion: { es: 'Una flecha que estalla en astillas: daño cortante en un arco de 45°.', en: 'An arrow that bursts into splinters: slashing damage in a 45° arc.' },
      mana: [250, 275, 300, 325, 350], recarga: 25, invocacion: 1, recargaGlobal: 'corta', area: 10,
      efectos: [dano(EF.danoAtaque, '+100%'), dano(EF.danoCortante, ['90-120', '180-230', '270-340', '360-450', '450-560'])],
    },
    {
      id: 'proyectil-arcano', tipo: 'directo',
      nombre: { es: 'Proyectil arcano', en: 'Arcana Strike' },
      descripcion: { es: 'Una flecha que hace daño de fuego, hielo y rayo a la vez.', en: 'An arrow that deals fire, ice and lightning damage at once.' },
      mana: [200, 235, 270, 305, 340], recarga: 25, invocacion: 0.5, recargaGlobal: 'corta',
      efectos: [
        dano(EF.danoFuego, ['45', '95', '150', '195', '250']),
        dano(EF.danoHielo, ['45', '95', '150', '195', '250']),
        dano(EF.danoRayo, ['45', '95', '150', '195', '250']),
      ],
    },
    {
      id: 'lluvia-de-fuego', tipo: 'directo',
      nombre: { es: 'Lluvia de fuego', en: 'Fire Rain' },
      descripcion: { es: 'Una flecha que explota en el aire y cae como lluvia de fuego sobre un área.', en: 'An arrow that bursts in the sky and falls as a rain of fire over an area.' },
      mana: [280, 310, 340, 370, 400], recarga: 30, invocacion: 2, recargaGlobal: 'corta', area: 6,
      efectos: [dano(EF.danoAtaque, '+100%'), dano(EF.danoFuego, ['250-300', '300-350', '350-400', '400-450', '500-600'])],
    },
    {
      id: 'flecha-de-rayo', tipo: 'constante',
      nombre: { es: 'Flecha de rayo', en: 'Lightning Arrow' },
      descripcion: { es: 'Una flecha eléctrica que daña y frena al objetivo y a los que lo rodean.', en: 'An electric arrow that damages and slows the target and everyone around it.' },
      mana: [260, 290, 320, 350, 380], duracion: [5, 7, 9, 11, 15], recarga: 180, invocacion: 2, recargaGlobal: 'corta', area: 10,
      efectos: [dano(EF.danoRayo, ['150-250', '250-350', '350-450', '450-550', '550-650']), debuff(EF.velMovimiento, '-15%')],
    },
  ],
};

export const MAESTRIA_EN_PUNTERIA: Discipline = {
  id: 'maestria-en-punteria',
  nombre: { es: 'Maestría en puntería', en: 'Aiming Mastery' },
  poderes: [
    {
      id: 'vista-mortal', tipo: 'constante',
      nombre: { es: 'Vista mortal', en: 'Dead Eye' },
      descripcion: { es: 'Te tomás tu tiempo para apuntar: más daño, disparando un poco más lento.', en: 'You take your time to aim: more damage, shooting a bit slower.' },
      mana: [50, 80, 110, 140, 170], duracion: 20, recarga: 45, invocacion: 1, recargaGlobal: 'corta',
      efectos: [buff(EF.bonusDanoArma, ['+10%', '+14%', '+18%', '+24%', '+30%']), contra(EF.velAtaque, ['-4%', '-5%', '-6%', '-7%', '-8%'])],
    },
    {
      id: 'enfocar', tipo: 'constante',
      nombre: { es: 'Enfocar', en: 'Focus' },
      descripcion: { es: 'Más alcance a cambio de moverte más lento. No tiene límite de tiempo: se apaga a mano.', en: 'More range at the cost of moving slower. No time limit: you turn it off yourself.' },
      mana: [40, 80, 120, 160, 200], duracion: 30, recarga: 70, invocacion: 0, recargaGlobal: 'corta',
      efectos: [buff(EF.rangoAtaque, ['+2%', '+4%', '+6%', '+8%', '+10%']), contra(EF.velMovimiento, '-10%')],
    },
    {
      id: 'perforador-de-piel', tipo: 'constante',
      nombre: { es: 'Perforador de piel', en: 'Skin Piercer' },
      descripcion: { es: 'Le baja al enemigo las resistencias al daño físico y mágico que tenga subidas.', en: 'Lowers any physical and magical damage resistance the enemy has raised.' },
      mana: [150, 175, 200, 225, 250], duracion: [3, 3, 4, 4, 5], recarga: 60, invocacion: 0.5, recargaGlobal: 'corta', bloqueable100: true,
      efectos: [dano(EF.danoPunzante, ['30', '60', '100', '180', '300']), debuff({ es: 'Resistencia al daño físico y mágico', en: 'Physical and magical damage resistance' }, ['-10%', '-20%', '-30%', '-40%', '-50%'])],
    },
    {
      id: 'prevision', tipo: 'pasivo',
      nombre: { es: 'Previsión', en: 'Foresight' },
      descripcion: { es: 'Más alcance, siempre.', en: 'More range, always on.' },
      efectos: [buff(EF.rangoAtaque, ['+10%', '+12%', '+14%', '+17%', '+20%'])],
    },
    {
      id: 'maldicion-del-ciclope', tipo: 'constante',
      nombre: { es: 'Maldición del cíclope', en: 'Cyclops Curse' },
      descripcion: { es: 'Un tiro a los ojos: el enemigo pierde chance de crítico y alcance.', en: 'A shot to the eyes: the enemy loses critical chance and range.' },
      mana: [180, 205, 230, 255, 280], duracion: 30, recarga: 52, invocacion: 1, recargaGlobal: 'corta',
      efectos: [
        dano(EF.danoAtaque, '+125%'),
        debuff(EF.critico, ['-20%', '-30%', '-40%', '-50%', '-75%']),
        debuff(EF.rangoAtaque, ['-2%', '-4%', '-7%', '-10%', '-15%']),
      ],
    },
    {
      id: 'ataque-letal', tipo: 'directo',
      nombre: { es: 'Ataque letal', en: 'Lethal Strike' },
      descripcion: { es: 'Un tiro a los puntos débiles con daño extra y chance de pegar todavía más.', en: 'A shot to weak spots with bonus damage and a chance to hit even harder.' },
      mana: [185, 209, 233, 257, 281], recarga: 50, invocacion: 1.5, recargaGlobal: 'corta',
      efectos: [
        dano(EF.danoAtaque, '+100%'),
        dano({ es: 'Daño del arma extra', en: 'Extra weapon damage' }, ['20-50%', '36-66%', '50-82%', '65-99%', '80-115%']),
        dano({ es: 'Chance de +60% de daño', en: 'Chance of +60% damage' }, ['20%', '24%', '28%', '32%', '36%']),
      ],
    },
    {
      id: 'posicion-estrategica', tipo: 'constante',
      nombre: { es: 'Posición estratégica', en: 'Strategic Position' },
      descripcion: { es: 'Te ubicás mejor y te entra menos daño a distancia.', en: 'You position yourself better and take less ranged damage.' },
      mana: [120, 140, 160, 180, 200], duracion: 25, recarga: 50, invocacion: 1, recargaGlobal: 'corta',
      efectos: [buff(EF.danoRangoRecibido, ['-5%', '-7%', '-9%', '-12%', '-15%'])],
    },
    {
      id: 'ojo-entrenado', tipo: 'pasivo',
      nombre: { es: 'Ojo entrenado', en: 'Trained Eye' },
      descripcion: { es: 'Más chance de crítico, siempre.', en: 'More critical chance, always on.' },
      efectos: [buff(EF.critico, ['+10%', '+30%', '+50%', '+70%', '+100%'])],
    },
    {
      id: 'tiro-buscador', tipo: 'constante',
      nombre: { es: 'Tiro buscador', en: 'Seeking Strike' },
      descripcion: { es: 'La flecha busca un punto débil y le baja la constitución al enemigo.', en: 'The arrow seeks a weak spot and lowers the enemy’s constitution.' },
      mana: [255, 277, 299, 321, 343], duracion: [30, 33, 37, 42, 50], recarga: 50, invocacion: 1, recargaGlobal: 'corta',
      efectos: [debuff(EF.constitucion, ['-15', '-19', '-23', '-27', '-31'])],
    },
    {
      id: 'mirada-de-halcon', tipo: 'constante',
      nombre: { es: 'Mirada de halcón', en: 'Hawk’s Gaze' },
      descripcion: { es: 'Disparás más rápido y al enemigo le cuesta más esquivarte.', en: 'You shoot faster and the enemy has a harder time evading you.' },
      mana: [260, 290, 320, 350, 380], duracion: [40, 45, 50, 55, 60], recarga: 160, invocacion: 2, recargaGlobal: 'corta',
      efectos: [buff(EF.velAtaque, ['+5%', '+10%', '+15%', '+20%', '+25%']), debuff(EF.evasion, ['-10%', '-20%', '-30%', '-40%', '-50%'])],
    },
  ],
};

export const TIRADOR_WM: Discipline = {
  id: 'tirador-wm',
  nombre: { es: 'Tirador WM', en: 'Marksman WM' },
  warmaster: true,
  poderes: [
    {
      id: 'concilio-de-guerra', tipo: 'pasivo',
      nombre: { es: 'Concilio de guerra', en: 'War Council' },
      descripcion: { es: 'Un idioma de guerra para hablar en secreto con otros Warmasters.', en: 'A war language to talk in secret with other Warmasters.' },
      efectos: [buff(EF.chatGuerra)],
    },
    {
      id: 'flecha-de-fuego', tipo: 'directo',
      nombre: { es: 'Flecha de fuego', en: 'Fire Arrow' },
      descripcion: { es: 'Una flecha de fuego que descongela a un aliado.', en: 'A fire arrow that thaws a frozen ally.' },
      mana: 150, recarga: 30, invocacion: 0.5, recargaGlobal: 'muy-corta', rango: 20, bloqueable100: true, resistible100: true,
      efectos: [buff({ es: 'Quita el congelamiento', en: 'Removes freeze' })],
    },
    {
      id: 'maestria-de-guerra', tipo: 'pasivo',
      nombre: { es: 'Maestría de guerra', en: 'Warmaster’s Might' },
      descripcion: { es: 'Más atributo principal de tu clase, siempre.', en: 'More of your class’s main attribute, always on.' },
      efectos: [buff(EF.atributoClase, '+15%')],
    },
    {
      id: 'instinto-asesino', tipo: 'activable',
      nombre: { es: 'Instinto asesino', en: 'Killer Instinct' },
      descripcion: { es: 'Confianza absoluta: más alcance y el enemigo no te puede esquivar, pero te movés más lento.', en: 'Absolute confidence: more range and the enemy cannot evade you, but you move slower.' },
      mana: 150, duracion: 120, recarga: 15, invocacion: 0, recargaGlobal: 'corta', intervaloArma: true,
      efectos: [buff(EF.rangoAtaque, '+15%'), debuff(EF.evasion, '-100%'), contra(EF.velMovimiento, '-15%')],
    },
    {
      id: 'sangre-de-warmaster', tipo: 'pasivo',
      nombre: { es: 'Sangre de Warmaster', en: 'Warmaster Blood' },
      descripcion: { es: 'Salud máxima extra, siempre.', en: 'Extra maximum health, always on.' },
      efectos: [buff(EF.salud, '+300')],
    },
  ],
};

export const TIRADOR: SubclassTrainer = {
  subclase: 'Tirador',
  disciplinas: [...DISCIPLINAS_ARQUERO, MAESTRIA_EN_FLECHAS, MAESTRIA_EN_PUNTERIA, TIRADOR_WM],
};
