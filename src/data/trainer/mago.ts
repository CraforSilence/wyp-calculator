import type { Discipline, Localized, PowerEffect } from './types';
import { EF, buff, debuff, dano, contra } from './effects';

/** Disciplinas de la clase Mago: las comparten Conjurador y Brujo. */

const INT_EXTRA: Localized = { es: '+1 de daño por punto de inteligencia a partir de', en: '+1 damage per intelligence point above' };
const SIN_OTRA_MAGNIFICACION: PowerEffect = contra({ es: 'No se combina con otra magnificación', en: 'Cannot be combined with another magnification' });

export const MENTAL: Discipline = {
  id: 'mental',
  nombre: { es: 'Mental', en: 'Mental' },
  poderes: [
    {
      id: 'misil-arcano', tipo: 'directo',
      nombre: { es: 'Misil arcano', en: 'Arcane Missile' },
      descripcion: { es: 'Una bola de luz que le hace daño de fuego al objetivo.', en: 'A glowing ball that deals fire damage to the target.' },
      mana: [50, 70, 90, 110, 130], recarga: 5, invocacion: 1, recargaGlobal: 'muy-corta', rango: 25,
      efectos: [dano(EF.danoFuego, ['80-90', '175-190', '270-300', '370-400', '460-550'])],
    },
    {
      id: 'plaga-de-insectos', tipo: 'constante',
      nombre: { es: 'Plaga de insectos', en: 'Beetle Swarm' },
      descripcion: { es: 'Un enjambre rodea al objetivo: no puede atacar y recibe daño cada segundo.', en: 'A swarm surrounds the target: they cannot attack and take damage every second.' },
      mana: [80, 100, 120, 140, 160], duracion: [5, 6, 7, 8, 9], recarga: 40, invocacion: 2, recargaGlobal: 'normal', rango: 25,
      efectos: [dano({ es: 'Daño punzante por segundo', en: 'Piercing damage per second' }, ['20-30', '30-55', '40-80', '50-105', '60-130']), debuff({ es: 'No puede atacar', en: 'Cannot attack' })],
    },
    {
      id: 'llamarada', tipo: 'directo',
      nombre: { es: 'Llamarada', en: 'Blaze' },
      descripcion: { es: 'Fuego que sale de tus manos y quema a todos los que tenés cerca.', en: 'Fire bursts from your hands and burns everyone close to you.' },
      mana: [75, 90, 105, 120, 135], recarga: 10, invocacion: 1, recargaGlobal: 'muy-corta', area: 6,
      efectos: [dano(EF.danoFuego, ['120-160', '240-290', '360-420', '480-550', '600-680'])],
    },
    {
      id: 'empuje-mental', tipo: 'constante',
      nombre: { es: 'Empuje mental', en: 'Mind Push' },
      descripcion: { es: 'Una onda mental que frena a los enemigos del área.', en: 'A mental wave that slows enemies in the area.' },
      mana: [90, 105, 120, 135, 150], duracion: [4, 5, 6, 7, 8], recarga: 15, invocacion: 0.5, recargaGlobal: 'corta', area: 10,
      efectos: [debuff(EF.velMovimiento, ['-25%', '-30%', '-35%', '-40%', '-50%'])],
    },
    {
      id: 'hiedra-espinosa', tipo: 'constante',
      nombre: { es: 'Hiedra espinosa', en: 'Pricking Ivy' },
      descripcion: { es: 'Una hiedra con espinas atrapa al enemigo en el lugar.', en: 'A thorny ivy traps the enemy in place.' },
      mana: [150, 175, 200, 225, 250], duracion: [3, 4, 5, 6, 7], recarga: 30, invocacion: 1, recargaGlobal: 'corta', rango: 25,
      efectos: [dano(EF.danoPunzante, ['100-200', '225-325', '350-450', '475-575', '600-700']), debuff(EF.inmovilizar)],
    },
    {
      id: 'dominio-de-la-voluntad', tipo: 'constante',
      nombre: { es: 'Dominio de la voluntad', en: 'Will Domain' },
      descripcion: { es: 'Doblegás la voluntad del enemigo y lo tirás al suelo.', en: 'You bend the enemy’s will and knock them down.' },
      mana: [200, 225, 250, 275, 300], duracion: [2, 3, 4, 5, 6], recarga: 30, invocacion: 0.5, recargaGlobal: 'normal', rango: 12, bloqueable100: true,
      efectos: [debuff(EF.noquear)],
    },
    {
      id: 'silenciar', tipo: 'constante',
      nombre: { es: 'Silenciar', en: 'Silence' },
      descripcion: { es: 'El objetivo queda mudo y mareado: no puede usar poderes.', en: 'The target is muted and dizzy: they cannot use powers.' },
      mana: [150, 175, 200, 225, 250], duracion: [3, 4, 5, 6, 7], recarga: 40, invocacion: 1, recargaGlobal: 'corta', rango: 25, bloqueable100: true,
      efectos: [debuff(EF.marear)],
    },
    {
      id: 'muro-de-agujas', tipo: 'constante',
      nombre: { es: 'Muro de agujas', en: 'Splinter Wall' },
      descripcion: { es: 'Un muro de púas a tu alrededor que daña a quien te ataque cuerpo a cuerpo.', en: 'A wall of spikes around you that damages anyone attacking you in melee.' },
      mana: [125, 140, 155, 170, 185], duracion: 10, recarga: 90, invocacion: 1, recargaGlobal: 'muy-corta', area: 10,
      efectos: [dano({ es: 'Daño punzante por segundo', en: 'Piercing damage per second' }, ['50-70', '65-90', '85-110', '100-120', '120-150'])],
    },
    {
      id: 'maestro-del-tiempo', tipo: 'constante',
      nombre: { es: 'Maestro del tiempo', en: 'Time Master' },
      descripcion: { es: 'Frenás el tiempo alrededor: los enemigos cercanos se mueven, atacan e invocan más lento.', en: 'You slow time around you: nearby enemies move, attack and cast slower.' },
      mana: [230, 260, 290, 320, 350], duracion: 10, recarga: 120, invocacion: 2, recargaGlobal: 'muy-corta', area: 10,
      efectos: [
        debuff(EF.velMovimiento, ['-10%', '-20%', '-30%', '-40%', '-50%']),
        debuff(EF.velAtaque, ['-10%', '-20%', '-30%', '-40%', '-50%']),
        debuff(EF.velInvocacion, ['-10%', '-20%', '-30%', '-40%', '-50%']),
      ],
    },
    {
      id: 'masa-devoradora-de-sultar', tipo: 'constante',
      nombre: { es: 'Masa devoradora de Sultar', en: 'Sultar’s Devouring Mass' },
      descripcion: { es: 'Una niebla ilusoria que lastima al objetivo cada segundo y le corta la curación.', en: 'An illusory fog that hurts the target every second and cuts their healing.' },
      mana: [340, 380, 420, 460, 500], duracion: 12, recarga: 120, invocacion: 2, recargaGlobal: 'muy-corta', rango: 25,
      efectos: [
        dano({ es: 'Daño cortante, aplastante y punzante por segundo (cada uno)', en: 'Slashing, blunt and piercing damage per second (each)' }, ['33', '42', '50', '58', '70']),
        debuff(EF.regenSalud, ['-15%', '-30%', '-45%', '-60%', '-100%']),
        debuff(EF.bonusCuracion, ['-25%', '-35%', '-50%', '-70%', '-100%']),
      ],
    },
  ],
};

export const CONTROL_DE_MANA: Discipline = {
  id: 'control-de-mana',
  nombre: { es: 'Control de maná', en: 'Mana Control' },
  poderes: [
    {
      id: 'barrera-de-energia', tipo: 'constante',
      nombre: { es: 'Barrera de energía', en: 'Energy Barrier' },
      descripcion: { es: 'Una barrera mágica que absorbe parte del daño que recibís.', en: 'A magic barrier that soaks part of the damage you take.' },
      mana: [100, 140, 180, 220, 260], duracion: 120, recarga: 40, invocacion: 1, recargaGlobal: 'muy-corta',
      efectos: [buff(EF.barrera, ['+100', '+250', '+700', '+1000', '+1400'])],
    },
    {
      id: 'ignicion-de-mana', tipo: 'constante',
      nombre: { es: 'Ignición de maná', en: 'Mana Burn' },
      descripcion: { es: 'Quema el maná del enemigo y lo convierte en daño que no se puede resistir.', en: 'Burns the enemy’s mana and turns it into damage that cannot be resisted.' },
      mana: [70, 100, 130, 160, 190], duracion: 15, recarga: 50, invocacion: 1, recargaGlobal: 'corta', rango: 25,
      efectos: [debuff(EF.manaADano, ['5-10', '10-15', '15-25', '25-35', '35-50'])],
    },
    {
      id: 'union-sinergica', tipo: 'directo',
      nombre: { es: 'Unión sinérgica', en: 'Synergy Bond' },
      descripcion: { es: 'Le pasás parte de tu maná a un aliado.', en: 'You give part of your mana to an ally.' },
      mana: [150, 250, 400, 550, 750], recarga: 3, invocacion: 0.5, recargaGlobal: 'muy-corta', rango: 25,
      efectos: [buff({ es: 'Maná para el aliado', en: 'Mana for the ally' }, ['+150', '+250', '+400', '+550', '+750'])],
    },
    {
      id: 'sangre-de-dragon', tipo: 'pasivo',
      nombre: { es: 'Sangre de dragón', en: 'Dragon’s Blood' },
      descripcion: { es: 'Más inteligencia, siempre.', en: 'More intelligence, always on.' },
      efectos: [buff(EF.inteligencia, ['+5', '+7', '+9', '+12', '+15'])],
    },
    {
      id: 'prestamo-de-energia', tipo: 'directo',
      nombre: { es: 'Préstamo de energía', en: 'Energy Borrow' },
      descripcion: { es: 'Le robás maná al enemigo y lo sumás al tuyo.', en: 'You steal mana from the enemy and add it to yours.' },
      recarga: 60, invocacion: 1, recargaGlobal: 'corta', rango: 25,
      efectos: [debuff({ es: 'Maná que le robás', en: 'Mana drained' }, ['10%', '15%', '20%', '25%', '35%'])],
    },
    {
      id: 'sacrificio-ambicioso', tipo: 'directo',
      nombre: { es: 'Sacrificio ambicioso', en: 'Ambitious Sacrifice' },
      descripcion: { es: 'Cambiás salud por maná.', en: 'You trade health for mana.' },
      recarga: 25, invocacion: 1, recargaGlobal: 'muy-corta',
      efectos: [buff(EF.mana, ['+300', '+450', '+600', '+750', '+900']), contra(EF.salud, ['-150', '-225', '-300', '-375', '-450'])],
    },
    {
      id: 'devocion-arcana', tipo: 'constante',
      nombre: { es: 'Devoción arcana', en: 'Arcane Devotion' },
      descripcion: { es: 'La magia fluye sola: invocás mucho más rápido.', en: 'Magic flows freely: you cast much faster.' },
      mana: [115, 130, 145, 160, 175], duracion: 60, recarga: 60, invocacion: 0, recargaGlobal: 'muy-corta',
      efectos: [buff(EF.velInvocacion, ['+15%', '+30%', '+45%', '+65%', '+100%'])],
    },
    {
      id: 'laguna-de-mana', tipo: 'pasivo',
      nombre: { es: 'Laguna de maná', en: 'Mana Pool' },
      descripcion: { es: 'Más maná máximo, siempre.', en: 'More maximum mana, always on.' },
      efectos: [buff(EF.mana, ['+100', '+200', '+300', '+400', '+500'])],
    },
    {
      id: 'comunion-de-mana', tipo: 'aura',
      nombre: { es: 'Comunión de maná', en: 'Mana Communion' },
      descripcion: { es: 'Una zona donde los aliados recuperan maná.', en: 'A zone where allies recover mana.' },
      mana: [440, 480, 520, 560, 600], duracion: 60, recarga: 120, invocacion: 1, recargaGlobal: 'muy-corta', area: 6,
      efectos: [buff(EF.regenMana, ['+5', '+7', '+9', '+12', '+15'])],
    },
    {
      id: 'pilon-de-mana', tipo: 'aura',
      nombre: { es: 'Pilón de maná', en: 'Mana Pylon' },
      descripcion: {
        es: 'Aura que les va cargando una barrera a los aliados cercanos, hasta 2500 puntos. Si se alejan, la pierden entera. No te afecta a vos.',
        en: 'An aura that keeps charging a barrier on nearby allies, up to 2500 points. Allies who leave lose it all. Does not affect you.',
      },
      mana: [460, 480, 520, 560, 600], duracion: 60, recarga: 180, invocacion: 1.5, recargaGlobal: 'muy-corta', area: 10,
      efectos: [buff(EF.barrera, ['+25', '+30', '+35', '+40', '+50'])],
    },
  ],
};

export const MAESTRIA_EN_BACULOS: Discipline = {
  id: 'maestria-en-baculos',
  nombre: { es: 'Maestría en báculos', en: 'Staff Mastery' },
  poderes: [
    {
      id: 'magnificacion-de-fuego', tipo: 'activable',
      nombre: { es: 'Magnificación de fuego', en: 'Fire Magnification' },
      descripcion: { es: 'Tu báculo pega con fuego extra, que crece con tu inteligencia, a cambio de protección.', en: 'Your staff deals extra fire damage that grows with your intelligence, at the cost of protection.' },
      mana: [150, 180, 210, 240, 270], recarga: 60, invocacion: 1, recargaGlobal: 'corta',
      efectos: [buff(EF.danoFuego, ['+5', '+15', '+25', '+40', '+60']), buff(INT_EXTRA, ['80', '80', '80', '80', '70']), contra(EF.proteccion, ['-50%', '-50%', '-40%', '-40%', '-25%']), SIN_OTRA_MAGNIFICACION],
    },
    {
      id: 'aceleracion-arcana', tipo: 'constante',
      nombre: { es: 'Aceleración arcana', en: 'Arcane Acceleration' },
      descripcion: { es: 'Atacás más rápido con el báculo.', en: 'You attack faster with your staff.' },
      mana: [70, 85, 100, 115, 130], duracion: [20, 30, 40, 50, 60], recarga: 60, invocacion: 1, recargaGlobal: 'muy-corta',
      efectos: [buff(EF.velAtaque, '+25%')],
    },
    {
      id: 'proyeccion-arcana', tipo: 'constante',
      nombre: { es: 'Proyección arcana', en: 'Arcane Projection' },
      descripcion: { es: 'Tus ataques llegan más lejos.', en: 'Your attacks reach farther.' },
      mana: [60, 75, 90, 105, 120], duracion: [20, 30, 40, 50, 60], recarga: 80, invocacion: 1, recargaGlobal: 'muy-corta',
      efectos: [buff(EF.rangoAtaque, '+15%')],
    },
    {
      id: 'magia-de-combate', tipo: 'pasivo',
      nombre: { es: 'Magia de combate', en: 'Combat Magic' },
      descripcion: { es: 'Más daño con el báculo, siempre.', en: 'More staff damage, always on.' },
      efectos: [buff(EF.bonusDanoArma, ['+5%', '+7%', '+9%', '+12%', '+15%'])],
    },
    {
      id: 'campo-estatico', tipo: 'aura',
      nombre: { es: 'Campo estático', en: 'Static Field' },
      descripcion: { es: 'Un campo eléctrico que frena y daña a los enemigos que entran.', en: 'An electric field that slows and damages enemies who step in.' },
      mana: [40, 60, 80, 100, 120], duracion: 40, recarga: 60, invocacion: 0.5, recargaGlobal: 'muy-corta', area: 10,
      efectos: [dano({ es: 'Daño eléctrico por segundo', en: 'Lightning damage per second' }, ['40', '50', '60', '80', '100']), debuff(EF.velMovimiento, ['-10%', '-15%', '-20%', '-25%', '-30%'])],
    },
    {
      id: 'magnificacion-de-hielo', tipo: 'activable',
      nombre: { es: 'Magnificación de hielo', en: 'Ice Magnification' },
      descripcion: { es: 'Tu báculo pega con hielo extra, que crece con tu inteligencia, a cambio de protección.', en: 'Your staff deals extra ice damage that grows with your intelligence, at the cost of protection.' },
      mana: [150, 180, 210, 240, 270], recarga: 60, invocacion: 1, recargaGlobal: 'corta',
      efectos: [buff(EF.danoHielo, ['+5', '+15', '+25', '+40', '+60']), buff(INT_EXTRA, ['80', '80', '80', '80', '70']), contra(EF.proteccion, ['-50%', '-50%', '-40%', '-40%', '-25%']), SIN_OTRA_MAGNIFICACION],
    },
    {
      id: 'cupula-de-proteccion', tipo: 'constante',
      nombre: { es: 'Cúpula de protección', en: 'Protection Dome' },
      descripcion: { es: 'Los aliados bajo la cúpula resisten mejor el daño físico. No te afecta a vos.', en: 'Allies under the dome resist physical damage better. Does not affect you.' },
      mana: [160, 200, 240, 280, 320], duracion: 20, recarga: 90, invocacion: 3, recargaGlobal: 'muy-corta', area: 10,
      efectos: [buff(EF.resFisico, ['+4%', '+8%', '+12%', '+16%', '+20%'])],
    },
    {
      id: 'control-metabolico', tipo: 'constante',
      nombre: { es: 'Control metabólico', en: 'Metabolic Control' },
      descripcion: { es: 'Tus hechizos hacen más daño, a cambio de algo de protección.', en: 'Your spells deal more damage, at the cost of some protection.' },
      mana: [170, 190, 210, 230, 250], duracion: 60, recarga: 100, invocacion: 1, recargaGlobal: 'muy-corta',
      efectos: [buff(EF.danoHechizos, ['+5%', '+10%', '+15%', '+20%', '+30%']), contra(EF.proteccion, '-25%')],
    },
    {
      id: 'magnificacion-de-electricidad', tipo: 'activable',
      nombre: { es: 'Magnificación de electricidad', en: 'Lightning Magnification' },
      descripcion: { es: 'Tu báculo pega con electricidad extra, que crece con tu inteligencia, a cambio de protección.', en: 'Your staff deals extra lightning damage that grows with your intelligence, at the cost of protection.' },
      mana: [150, 180, 210, 240, 270], recarga: 60, invocacion: 1, recargaGlobal: 'corta',
      efectos: [buff(EF.danoRayo, ['+5', '+15', '+25', '+40', '+60']), buff(INT_EXTRA, ['80', '80', '80', '80', '70']), contra(EF.proteccion, ['-50%', '-50%', '-40%', '-40%', '-25%']), SIN_OTRA_MAGNIFICACION],
    },
    {
      id: 'furia-de-evendim', tipo: 'directo',
      nombre: { es: 'Furia de Evendim', en: 'Evendim’s Fury' },
      descripcion: { es: 'Una explosión que convierte el maná de los enemigos cercanos en daño.', en: 'An explosion that turns nearby enemies’ mana into damage.' },
      mana: [340, 380, 420, 460, 500], recarga: 180, invocacion: 2, recargaGlobal: 'muy-corta', area: 10,
      efectos: [debuff(EF.manaADano, ['125', '250', '375', '500', '650'])],
    },
  ],
};

export const ENCANTAMIENTOS: Discipline = {
  id: 'encantamientos',
  nombre: { es: 'Encantamientos', en: 'Enchantments' },
  poderes: [
    {
      id: 'maldicion', tipo: 'constante',
      nombre: { es: 'Maldición', en: 'Curse' },
      descripcion: { es: 'El enemigo pega menos y hace menos críticos.', en: 'The enemy hits softer and lands fewer criticals.' },
      mana: [40, 60, 80, 100, 120], duracion: 60, recarga: 20, invocacion: 0.5, recargaGlobal: 'muy-corta', rango: 25, bloqueable100: true,
      efectos: [debuff(EF.bonusDanoArma, ['-2%', '-4%', '-6%', '-8%', '-10%']), debuff(EF.critico, ['-10%', '-15%', '-20%', '-25%', '-30%'])],
    },
    {
      id: 'destreza-felina', tipo: 'constante',
      nombre: { es: 'Destreza felina', en: 'Feline Dexterity' },
      descripcion: { es: 'Le das destreza a un aliado.', en: 'Gives an ally dexterity.' },
      mana: [65, 80, 95, 110, 125], duracion: 180, recarga: 5, invocacion: 1.5, recargaGlobal: 'muy-corta', rango: 20,
      efectos: [buff(EF.destreza, ['+5', '+7', '+9', '+12', '+15'])],
    },
    {
      id: 'ceguera', tipo: 'constante',
      nombre: { es: 'Ceguera', en: 'Blindness' },
      descripcion: { es: 'Un destello que enceguece al objetivo: falla mucho más y es más fácil de marear.', en: 'A flash that blinds the target: they miss far more and are easier to daze.' },
      mana: [120, 140, 160, 180, 200], duracion: [10, 15, 20, 25, 30], recarga: 60, invocacion: 0.5, recargaGlobal: 'muy-corta', rango: 25,
      efectos: [debuff({ es: 'Chance de fallar', en: 'Miss chance' }, '+50%'), debuff(EF.resMareo, ['-10%', '-15%', '-20%', '-25%', '-30%'])],
    },
    {
      id: 'bendicion', tipo: 'constante',
      nombre: { es: 'Bendición', en: 'Bless' },
      descripcion: { es: 'El aliado ataca e invoca más rápido.', en: 'The ally attacks and casts faster.' },
      mana: [40, 60, 80, 100, 120], duracion: [30, 60, 90, 120, 150], recarga: 15, invocacion: 1, recargaGlobal: 'muy-corta', rango: 20,
      efectos: [buff(EF.velAtaque, ['+5%', '+5%', '+7%', '+7%', '+10%']), buff(EF.velInvocacion, ['+5%', '+5%', '+7%', '+7%', '+10%'])],
    },
    {
      id: 'fuerza-de-oso', tipo: 'constante',
      nombre: { es: 'Fuerza de oso', en: 'Bear Strength' },
      descripcion: { es: 'Le das fuerza a un aliado.', en: 'Gives an ally strength.' },
      mana: [65, 80, 95, 110, 125], duracion: 180, recarga: 5, invocacion: 1.5, recargaGlobal: 'muy-corta', rango: 20,
      efectos: [buff(EF.fuerza, ['+5', '+7', '+9', '+12', '+15'])],
    },
    {
      id: 'bendecir-arma', tipo: 'constante',
      nombre: { es: 'Bendecir arma', en: 'Bless Weapon' },
      descripcion: { es: 'El arma de un aliado pega más.', en: 'An ally’s weapon hits harder.' },
      mana: [100, 125, 150, 175, 200], duracion: 180, recarga: 5, invocacion: 1, recargaGlobal: 'muy-corta', rango: 20,
      efectos: [buff(EF.bonusDanoArma, ['+5%', '+7%', '+9%', '+12%', '+15%'])],
    },
    {
      id: 'disipar-magia', tipo: 'directo',
      nombre: { es: 'Disipar magia', en: 'Dispel Magic' },
      descripcion: { es: 'Puede sacarte a vos o a un aliado los efectos negativos.', en: 'May remove negative effects from you or an ally.' },
      mana: [130, 150, 170, 190, 210], recarga: 15, invocacion: 0.5, recargaGlobal: 'muy-corta', rango: 25,
      efectos: [buff(EF.chanceDisiparNegativos, ['40%', '55%', '70%', '85%', '100%'])],
    },
    {
      id: 'astucia-de-zorro', tipo: 'constante',
      nombre: { es: 'Astucia de zorro', en: 'Fox Wits' },
      descripcion: { es: 'Le das inteligencia a un aliado.', en: 'Gives an ally intelligence.' },
      mana: [65, 80, 95, 110, 125], duracion: 180, recarga: 5, invocacion: 1.5, recargaGlobal: 'muy-corta', rango: 20,
      efectos: [buff(EF.inteligencia, ['+5', '+7', '+9', '+12', '+15'])],
    },
    {
      id: 'torpeza', tipo: 'constante',
      nombre: { es: 'Torpeza', en: 'Clumsiness' },
      descripcion: { es: 'El enemigo se vuelve torpe y lento: pierde atributo principal y velocidad.', en: 'The enemy turns clumsy and slow: loses main attribute and speed.' },
      mana: [230, 260, 290, 320, 350], duracion: 40, recarga: 60, invocacion: 1, recargaGlobal: 'muy-corta', rango: 20,
      efectos: [debuff(EF.atributoClase, ['-10%', '-15%', '-20%', '-25%', '-30%']), debuff(EF.velMovimiento, ['-5%', '-8%', '-11%', '-15%', '-20%'])],
    },
    {
      id: 'disipar-magia-en-masa', tipo: 'directo',
      nombre: { es: 'Disipar magia en masa', en: 'Mass Dispel Magic' },
      descripcion: { es: 'Puede sacarles los efectos negativos a todos los aliados del área.', en: 'May remove negative effects from every ally in the area.' },
      mana: [300, 340, 380, 420, 460], recarga: 120, invocacion: 1, recargaGlobal: 'muy-corta', rango: 25, area: 10,
      efectos: [buff(EF.chanceDisiparNegativos, ['20%', '40%', '60%', '80%', '100%'])],
    },
  ],
};

export const DISCIPLINAS_MAGO = [MENTAL, CONTROL_DE_MANA, MAESTRIA_EN_BACULOS, ENCANTAMIENTOS];
