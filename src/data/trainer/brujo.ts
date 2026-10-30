import type { Discipline, SubclassTrainer } from './types';
import { EF, buff, debuff, dano } from './effects';
import { DISCIPLINAS_MAGO } from './mago';

export const ARCANIA: Discipline = {
  id: 'arcania',
  nombre: { es: 'Arcania', en: 'Arcania' },
  poderes: [
    {
      id: 'estalagmita', tipo: 'directo',
      nombre: { es: 'Estalagmita', en: 'Stalagmite' },
      descripcion: { es: 'Una roca filosa sale del suelo bajo el objetivo: daño punzante y de hielo.', en: 'A sharp rock bursts from the ground under the target: piercing and ice damage.' },
      mana: [90, 120, 150, 180, 210], recarga: 25, invocacion: 1, recargaGlobal: 'muy-corta', rango: 25,
      efectos: [dano(EF.danoPunzante, ['100', '150', '200', '250', '400']), dano(EF.danoHielo, ['100', '150', '200', '250', '400'])],
    },
    {
      id: 'lentitud', tipo: 'constante',
      nombre: { es: 'Lentitud', en: 'Slow' },
      descripcion: { es: 'El enemigo se mueve más lento.', en: 'The enemy moves slower.' },
      mana: [60, 100, 140, 180, 250], duracion: 30, recarga: 60, invocacion: 1, recargaGlobal: 'muy-corta', rango: 25,
      efectos: [debuff(EF.velMovimiento, ['-10%', '-12%', '-15%', '-17%', '-20%'])],
    },
    {
      id: 'petrificar-manos', tipo: 'constante',
      nombre: { es: 'Petrificar manos', en: 'Petrify Hands' },
      descripcion: { es: 'Las manos del enemigo se endurecen: ataca más lento y hace menos críticos.', en: 'The enemy’s hands stiffen: slower attacks and fewer criticals.' },
      mana: [130, 160, 190, 220, 250], duracion: [15, 20, 25, 30, 35], recarga: 60, invocacion: 1.5, recargaGlobal: 'muy-corta', rango: 25,
      efectos: [debuff(EF.critico, ['-15%', '-20%', '-25%', '-30%', '-35%']), debuff(EF.velAtaque, ['-5%', '-10%', '-15%', '-20%', '-25%'])],
    },
    {
      id: 'pereza', tipo: 'constante',
      nombre: { es: 'Pereza', en: 'Laziness' },
      descripcion: { es: 'El enemigo pierde las ganas de pelear: pega mucho menos y más lento.', en: 'The enemy loses the will to fight: hits much softer and slower.' },
      mana: [170, 190, 210, 230, 250], duracion: [12, 14, 16, 18, 20], recarga: 45, invocacion: 2, recargaGlobal: 'muy-corta', rango: 25, bloqueable100: true,
      efectos: [debuff(EF.bonusDanoArma, ['-30%', '-40%', '-50%', '-60%', '-70%']), debuff(EF.velAtaque, '-10%')],
    },
    {
      id: 'meteorito', tipo: 'constante',
      nombre: { es: 'Meteorito', en: 'Meteor' },
      descripcion: { es: 'Una roca en llamas cae sobre el enemigo y lo marea.', en: 'A flaming rock falls on the enemy and dizzies them.' },
      mana: [140, 160, 180, 200, 220], duracion: [3, 4, 5, 6, 7], recarga: 15, invocacion: 2, recargaGlobal: 'normal', rango: 30,
      efectos: [
        dano(EF.danoAplastante, ['150-200', '200-250', '250-300', '300-350', '350-400']),
        dano(EF.danoFuego, ['150-200', '200-250', '250-300', '300-350', '350-400']),
        debuff(EF.marear),
      ],
    },
    {
      id: 'muro-de-viento', tipo: 'constante',
      nombre: { es: 'Muro de viento', en: 'Wind Wall' },
      descripcion: { es: 'Un muro de viento a tu alrededor que reduce el daño a distancia.', en: 'A wall of wind around you that reduces ranged damage.' },
      mana: [160, 185, 210, 235, 260], duracion: [20, 22, 24, 26, 30], recarga: 60, invocacion: 0.5, recargaGlobal: 'muy-corta',
      efectos: [buff(EF.danoRangoRecibido, ['-5%', '-10%', '-15%', '-20%', '-25%'])],
    },
    {
      id: 'estallido-de-cristales', tipo: 'directo',
      nombre: { es: 'Estallido de cristales', en: 'Crystal Blast' },
      descripcion: { es: 'Cristales filosos que dañan a todos los enemigos del área.', en: 'Sharp crystals that damage every enemy in the area.' },
      mana: [100, 125, 150, 175, 200], recarga: 20, invocacion: 1, recargaGlobal: 'corta', area: 6,
      efectos: [dano(EF.danoPunzante, ['220-255', '350-470', '475-635', '600-800', '850-1150'])],
    },
    {
      id: 'fragilidad', tipo: 'constante',
      nombre: { es: 'Fragilidad', en: 'Fragility' },
      descripcion: { es: 'El objetivo queda más vulnerable al daño físico.', en: 'The target becomes more vulnerable to physical damage.' },
      mana: [80, 110, 140, 170, 200], duracion: 60, recarga: 60, invocacion: 1, recargaGlobal: 'muy-corta', rango: 30, bloqueable100: true,
      efectos: [debuff(EF.resFisico, ['-5%', '-15%', '-25%', '-35%', '-50%'])],
    },
    {
      id: 'puno-de-golem', tipo: 'directo',
      nombre: { es: 'Puño de gólem', en: 'Golem Fist' },
      descripcion: { es: 'Un gólem ilusorio cae del cielo sobre el objetivo.', en: 'An illusory golem falls from the sky onto the target.' },
      mana: [130, 180, 225, 280, 320], recarga: 60, invocacion: 2, recargaGlobal: 'corta', rango: 25,
      efectos: [dano(EF.danoPuro, ['200', '250', '300', '350', '650'])],
    },
    {
      id: 'terror-de-sultar', tipo: 'constante',
      nombre: { es: 'Terror de Sultar', en: 'Sultar’s Terror' },
      descripcion: { es: 'Una calavera gigante aterra a los enemigos del área: los daña y los tira al suelo.', en: 'A giant skull terrifies enemies in the area: damages them and knocks them down.' },
      mana: [400, 425, 450, 475, 500], duracion: [2, 3, 4, 5, 6], recarga: 180, invocacion: 3, recargaGlobal: 'larga', rango: 30, area: 10,
      efectos: [
        dano({ es: 'Daño cortante, aplastante y punzante (cada uno)', en: 'Slashing, blunt and piercing damage (each)' }, ['70-100', '115-160', '160-225', '205-285', '250-350']),
        debuff(EF.noquear),
      ],
    },
  ],
};

export const NIGROMANCIA: Discipline = {
  id: 'nigromancia',
  nombre: { es: 'Nigromancia', en: 'Necromancy' },
  poderes: [
    {
      id: 'vampirismo', tipo: 'directo',
      nombre: { es: 'Vampirismo', en: 'Vampirism' },
      descripcion: { es: 'Le robás salud al objetivo y te la sumás, sin pasarte de tu máximo ni de la que él tenga.', en: 'You drain health from the target into yourself, up to your max and up to what they have.' },
      mana: [80, 110, 140, 170, 200], recarga: 30, invocacion: 1, recargaGlobal: 'muy-corta', rango: 20,
      efectos: [buff(EF.drenarSalud, ['90-120', '180-240', '270-360', '360-480', '450-600'])],
    },
    {
      id: 'oscuridad', tipo: 'constante',
      nombre: { es: 'Oscuridad', en: 'Darkness' },
      descripcion: { es: 'Nadie le puede tirar poderes positivos al objetivo.', en: 'Nobody can cast positive powers on the target.' },
      mana: [160, 180, 200, 220, 240], duracion: [7, 9, 11, 15, 20], recarga: 50, invocacion: 2, recargaGlobal: 'muy-corta', rango: 20,
      efectos: [debuff({ es: 'Bloquea poderes positivos', en: 'Blocks positive powers' })],
    },
    {
      id: 'enfurecer', tipo: 'constante',
      nombre: { es: 'Enfurecer', en: 'Infuriate' },
      descripcion: { es: 'El objetivo se enoja sin darse cuenta y baja la guardia.', en: 'The target gets angry without noticing and lowers their guard.' },
      mana: [80, 100, 120, 140, 160], duracion: 30, recarga: 30, invocacion: 1.5, recargaGlobal: 'muy-corta', rango: 25, bloqueable100: true,
      efectos: [debuff(EF.proteccion, ['-30%', '-35%', '-40%', '-45%', '-50%']), debuff(EF.concentracion, ['-10', '-15', '-20', '-25', '-30'])],
    },
    {
      id: 'absorcion-vital', tipo: 'pasivo',
      nombre: { es: 'Absorción vital', en: 'Vitality Absorption' },
      descripcion: { es: 'Parte del daño que hacés vuelve a vos como salud, siempre.', en: 'Part of the damage you deal comes back to you as health, always on.' },
      efectos: [buff({ es: 'Robo de vida', en: 'Life drain' }, ['+2%', '+4%', '+6%', '+8%', '+10%'])],
    },
    {
      id: 'guardias-sadicos', tipo: 'constante',
      nombre: { es: 'Guardias sádicos', en: 'Sadistic Guards' },
      descripcion: { es: 'Almas errantes rodean a la víctima: queda sin resistencia al aturdimiento ni al derribo.', en: 'Wandering souls surround the victim: no resistance to stun or knockdown.' },
      mana: [140, 155, 160, 175, 190], duracion: [4, 8, 12, 16, 20], recarga: 90, invocacion: 1, recargaGlobal: 'muy-corta', rango: 25, bloqueable100: true, resistible100: true,
      efectos: [debuff(EF.resNoqueo, '-100%'), debuff(EF.resAturdir, '-100%')],
    },
    {
      id: 'sirvientes-sadicos', tipo: 'constante',
      nombre: { es: 'Sirvientes sádicos', en: 'Sadistic Servants' },
      descripcion: { es: 'Almas errantes atacan a un enemigo y le roban maná.', en: 'Wandering souls attack an enemy and drain their mana.' },
      duracion: 30, recarga: 45, invocacion: 1, recargaGlobal: 'corta', rango: 25,
      efectos: [debuff({ es: 'Maná que le roban', en: 'Mana drained' }, ['5', '10', '15', '20', '25'])],
    },
    {
      id: 'guardian-de-almas', tipo: 'constante',
      nombre: { es: 'Guardián de almas', en: 'Soulkeeper' },
      descripcion: { es: 'Debilita al objetivo y le roba salud cada segundo. No funciona contra monstruos.', en: 'Weakens the target and drains their health every second. Does not work on monsters.' },
      mana: [240, 280, 320, 360, 400], duracion: 30, recarga: 60, invocacion: 2, recargaGlobal: 'corta', rango: 25,
      efectos: [buff({ es: 'Salud robada por segundo', en: 'Health drained per second' }, ['+40', '+55', '+70', '+85', '+100']), debuff(EF.fuerza, ['-5', '-7', '-9', '-12', '-15'])],
    },
    {
      id: 'cremacion', tipo: 'constante',
      nombre: { es: 'Cremación', en: 'Cremation' },
      descripcion: { es: 'Incinera el cadáver de un enemigo y lo manda al altar de resurrección.', en: 'Burns an enemy’s corpse and sends them to the resurrection altar.' },
      mana: [200, 225, 250, 275, 300], duracion: 5, recarga: 80, invocacion: 4, recargaGlobal: 'muy-corta', rango: 2, bloqueable100: true, resistible100: true,
      efectos: [debuff({ es: 'Chance de cremar', en: 'Cremation chance' }, ['15%', '40%', '65%', '85%', '100%'])],
    },
    {
      id: 'poseer-invocacion', tipo: 'directo',
      nombre: { es: 'Poseer invocación', en: 'Possess Summoning' },
      descripcion: { es: 'Podés quedarte con una invocación enemiga hasta que la maten.', en: 'You may take control of an enemy summon until it is killed.' },
      mana: [300, 325, 350, 375, 400], recarga: 60, invocacion: 4, recargaGlobal: 'normal', rango: 20,
      efectos: [buff({ es: 'Chance de poseerla', en: 'Possession chance' }, ['40%', '55%', '70%', '85%', '100%'])],
    },
    {
      id: 'maestro-de-la-destruccion', tipo: 'aura',
      nombre: { es: 'Maestro de la destrucción', en: 'Master of Doom' },
      descripcion: { es: 'Un aura oscura que quiebra la voluntad de los enemigos cercanos: pierden constitución y pueden quedar mareados.', en: 'A dark aura that breaks nearby enemies’ will: they lose constitution and may be dizzied.' },
      mana: [520, 540, 560, 580, 600], duracion: 30, recarga: 180, invocacion: 2.5, recargaGlobal: 'muy-corta', area: 10,
      efectos: [debuff({ es: 'Chance de marear', en: 'Dizzy chance' }, ['20%', '40%', '60%', '80%', '100%']), debuff(EF.constitucion, ['-10', '-15', '-20', '-25', '-30'])],
    },
  ],
};

export const ELEMENTOS: Discipline = {
  id: 'elementos',
  nombre: { es: 'Elementos', en: 'Elements' },
  poderes: [
    {
      id: 'bola-de-fuego', tipo: 'directo',
      nombre: { es: 'Bola de fuego', en: 'Fire Ball' },
      descripcion: { es: 'Una esfera de fuego que daña a todos en la zona del impacto.', en: 'A sphere of fire that damages everyone in the impact area.' },
      mana: [125, 140, 155, 170, 185], recarga: 15, invocacion: 1.5, recargaGlobal: 'corta', rango: 25, area: 6,
      efectos: [dano(EF.danoFuego, ['110-160', '245-320', '380-480', '515-640', '650-800'])],
    },
    {
      id: 'explosion-de-hielo', tipo: 'constante',
      nombre: { es: 'Explosión de hielo', en: 'Ice Blast' },
      descripcion: { es: 'Una ráfaga de hielo que daña y frena 2 segundos.', en: 'An ice burst that damages and slows for 2 seconds.' },
      mana: [125, 140, 155, 170, 185], duracion: 10, recarga: 20, invocacion: 1, recargaGlobal: 'muy-corta', rango: 25,
      efectos: [dano(EF.danoHielo, ['70-100', '90-120', '100-140', '130-160', '170-200']), debuff(EF.velMovimiento, ['-5%', '-10%', '-15%', '-25%', '-40%'])],
    },
    {
      id: 'relampago', tipo: 'constante',
      nombre: { es: 'Relámpago', en: 'Lightning' },
      descripcion: { es: 'Una descarga eléctrica sobre el objetivo.', en: 'An electric burst on the target.' },
      mana: [125, 140, 155, 170, 185], duracion: 5, recarga: 20, invocacion: 2, recargaGlobal: 'muy-corta', rango: 25,
      efectos: [dano(EF.danoRayo, ['80', '120', '160', '200', '240'])],
    },
    {
      id: 'comunion-elemental', tipo: 'pasivo',
      nombre: { es: 'Comunión elemental', en: 'Elemental Conjunction' },
      descripcion: { es: 'Resistencia al fuego, al hielo y a la electricidad, siempre.', en: 'Resistance to fire, ice and lightning, always on.' },
      efectos: [buff({ es: 'Resistencia al fuego, hielo y electricidad (cada una)', en: 'Fire, ice and lightning resistance (each)' }, ['+5%', '+7%', '+9%', '+12%', '+15%'])],
    },
    {
      id: 'paralizar', tipo: 'constante',
      nombre: { es: 'Paralizar', en: 'Freeze' },
      descripcion: { es: 'El objetivo queda congelado: no puede atacar ni ser atacado.', en: 'The target is frozen: cannot attack or be attacked.' },
      mana: [100, 130, 160, 190, 220], duracion: [3, 4, 5, 6, 7], recarga: 30, invocacion: 1.5, recargaGlobal: 'corta', rango: 25,
      efectos: [debuff(EF.congelar)],
    },
    {
      id: 'tormenta-helada', tipo: 'constante',
      nombre: { es: 'Tormenta helada', en: 'Frozen Storm' },
      descripcion: { es: 'Una tormenta que daña y aturde a los enemigos del área.', en: 'A storm that damages and stuns enemies in the area.' },
      mana: [180, 210, 240, 270, 300], duracion: [6, 7, 8, 9, 10], recarga: 120, invocacion: 2, recargaGlobal: 'normal', rango: 25, area: 6,
      efectos: [dano(EF.danoHielo, ['40', '50', '60', '70', '80']), debuff(EF.aturdir)],
    },
    {
      id: 'exposicion-a-los-elementos', tipo: 'constante',
      nombre: { es: 'Exposición a los elementos', en: 'Element Exposure' },
      descripcion: { es: 'El objetivo queda vulnerable al fuego, al hielo, a la electricidad y a la magia en general.', en: 'The target becomes vulnerable to fire, ice, lightning and magic in general.' },
      mana: [120, 140, 160, 180, 200], duracion: 30, recarga: 30, invocacion: 1, recargaGlobal: 'muy-corta', rango: 25, bloqueable100: true,
      efectos: [
        debuff({ es: 'Protección contra fuego, hielo y electricidad (cada una)', en: 'Fire, ice and lightning protection (each)' }, ['-20%', '-25%', '-30%', '-35%', '-40%']),
        debuff(EF.resMagico, ['-10%', '-15%', '-23%', '-34%', '-50%']),
      ],
    },
    {
      id: 'explosion-de-magma', tipo: 'constante',
      nombre: { es: 'Explosión de magma', en: 'Magma Blast' },
      descripcion: { es: 'Una bola de magma: daño de fuego al impacto y después por segundo.', en: 'A magma ball: fire damage on impact and then every second.' },
      mana: [250, 280, 310, 340, 370], duracion: 15, recarga: 45, invocacion: 2, recargaGlobal: 'corta', rango: 30,
      efectos: [dano(EF.danoFuego, ['200-240', '260-330', '350-430', '450-540', '580-680']), dano({ es: 'Daño de fuego por segundo', en: 'Fire damage per second' }, ['25', '30', '35', '45', '60'])],
    },
    {
      id: 'tornado', tipo: 'constante',
      nombre: { es: 'Tornado', en: 'Twister' },
      descripcion: { es: 'Un remolino que atrapa y daña a los enemigos del área.', en: 'A whirlwind that traps and damages enemies in the area.' },
      mana: [290, 320, 350, 380, 410], duracion: [5, 6, 7, 8, 9], recarga: 60, invocacion: 3, recargaGlobal: 'normal', rango: 25, area: 6,
      efectos: [dano(EF.danoAplastante, ['20-30', '40-57', '60-85', '80-110', '110-140']), debuff(EF.inmovilizar)],
    },
    {
      id: 'invocar-rayos', tipo: 'constante',
      nombre: { es: 'Invocar rayos', en: 'Summon Lightning' },
      descripcion: { es: 'Rayos que caen sobre todos los enemigos del área y les bajan la fuerza.', en: 'Lightning bolts strike every enemy in the area and lower their strength.' },
      mana: [440, 480, 520, 560, 600], duracion: 10, recarga: 180, invocacion: 2, recargaGlobal: 'corta', area: 10,
      efectos: [dano(EF.danoRayo, ['40-80', '70-120', '100-160', '130-200', '160-240']), debuff(EF.fuerza, '-10%')],
    },
  ],
};

export const BRUJO_WM: Discipline = {
  id: 'brujo-wm',
  nombre: { es: 'Brujo WM', en: 'Warlock WM' },
  warmaster: true,
  poderes: [
    {
      id: 'concilio-de-guerra', tipo: 'pasivo',
      nombre: { es: 'Concilio de guerra', en: 'War Council' },
      descripcion: { es: 'Un idioma de guerra para hablar en secreto con otros Warmasters.', en: 'A war language to talk in secret with other Warmasters.' },
      efectos: [buff(EF.chatGuerra)],
    },
    {
      id: 'portal-ofensivo', tipo: 'directo',
      nombre: { es: 'Portal ofensivo', en: 'Offensive Portal' },
      descripcion: { es: 'Abre un portal que lleva hasta 25 aliados a un punto disponible.', en: 'Opens a portal that takes up to 25 allies to an available location.' },
      mana: 100, duracion: 15, recarga: 1200, invocacion: 10, recargaGlobal: 'muy-corta',
      efectos: [buff({ es: 'Aliados que teletransporta', en: 'Allies teleported' }, '25')],
    },
    {
      id: 'maestria-de-guerra', tipo: 'pasivo',
      nombre: { es: 'Maestría de guerra', en: 'Warmaster’s Might' },
      descripcion: { es: 'Invocás más rápido y tenés más inteligencia, siempre.', en: 'You cast faster and have more intelligence, always on.' },
      efectos: [buff(EF.velInvocacion, '+15%'), buff(EF.inteligencia, '+5%')],
    },
    {
      id: 'hiedra-espinosa-en-masa', tipo: 'constante',
      nombre: { es: 'Hiedra espinosa en masa', en: 'Mass Pricking Ivy' },
      descripcion: { es: 'Una hiedra con espinas crece a tu alrededor: daña e inmoviliza a los enemigos cercanos.', en: 'A thorny ivy grows around you: damages and roots nearby enemies.' },
      mana: 500, duracion: 5, recarga: 90, invocacion: 0.5, recargaGlobal: 'corta', area: 10,
      efectos: [dano(EF.danoPunzante, '750'), debuff(EF.inmovilizar)],
    },
    {
      id: 'sangre-de-warmaster', tipo: 'pasivo',
      nombre: { es: 'Sangre de Warmaster', en: 'Warmaster Blood' },
      descripcion: { es: 'Salud máxima extra, siempre.', en: 'Extra maximum health, always on.' },
      efectos: [buff(EF.salud, '+550')],
    },
  ],
};

export const BRUJO: SubclassTrainer = {
  subclase: 'Brujo',
  disciplinas: [...DISCIPLINAS_MAGO, ARCANIA, NIGROMANCIA, ELEMENTOS, BRUJO_WM],
};
