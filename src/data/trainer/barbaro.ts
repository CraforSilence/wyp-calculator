import type { Discipline, SubclassTrainer } from './types';
import { EF, buff, debuff, dano, contra } from './effects';
import { DISCIPLINAS_GUERRERO } from './guerrero';

export const GRITOS_DE_GUERRA: Discipline = {
  id: 'gritos-de-guerra',
  nombre: { es: 'Gritos de guerra', en: 'Warcries' },
  poderes: [
    {
      id: 'coloso', tipo: 'constante',
      nombre: { es: 'Coloso', en: 'Colossus' },
      descripcion: { es: 'Una furia que te da mucha fuerza a cambio de parte de tu salud.', en: 'A rage that gives you a lot of strength at the cost of some health.' },
      mana: [50, 80, 110, 130, 150], duracion: 40, recarga: 60, invocacion: 0, recargaGlobal: 'corta',
      efectos: [buff(EF.fuerza, ['+10%', '+20%', '+30%', '+40%', '+50%']), contra(EF.salud, '-10%')],
    },
    {
      id: 'frenesi', tipo: 'constante',
      nombre: { es: 'Frenesí', en: 'Frenzy' },
      descripcion: { es: 'En pleno frenesí sentís menos los golpes: resistencia al daño físico.', en: 'In a frenzy you feel the hits less: physical damage resistance.' },
      mana: [65, 80, 95, 110, 125], duracion: 80, recarga: 90, invocacion: 0, recargaGlobal: 'corta',
      efectos: [buff(EF.resFisico, ['+5%', '+8%', '+12%', '+16%', '+20%'])],
    },
    {
      id: 'corten-sus-cabezas', tipo: 'constante',
      nombre: { es: '¡¡Corten sus cabezas!!', en: 'Off With Their Heads!!' },
      descripcion: { es: 'Un grito que les sube el daño a los aliados de alrededor.', en: 'A shout that raises the damage of the allies around you.' },
      mana: [100, 115, 130, 145, 160], duracion: 60, recarga: 60, invocacion: 0, recargaGlobal: 'muy-corta', area: 10,
      efectos: [buff(EF.bonusDanoArma, ['+5%', '+7%', '+9%', '+12%', '+15%'])],
    },
    {
      id: 'sed-de-sangre', tipo: 'constante',
      nombre: { es: 'Sed de sangre', en: 'Thirst for Blood' },
      descripcion: {
        es: 'Atacás más rápido y cada golpe que entra suma daño. Se termina al pasar el tiempo o al conectar 5 golpes (los evadidos y bloqueados no cuentan).',
        en: 'You attack faster and every hit that lands adds damage. Ends when time runs out or after 5 landed hits (evaded and blocked ones do not count).',
      },
      mana: [80, 120, 160, 200, 240], duracion: 45, recarga: 60, invocacion: 0.5, recargaGlobal: 'corta',
      efectos: [
        buff(EF.velAtaque, ['+5%', '+6%', '+7%', '+8%', '+10%']),
        buff({ es: 'Daño por golpe acumulable (dos manos)', en: 'Stacking damage per hit (two-handed)' }, ['+10', '+20', '+30', '+40', '+50']),
        buff({ es: 'Velocidad de ataque por golpe (duales)', en: 'Attack speed per hit (dual wield)' }, ['+5%', '+7%', '+9%', '+11%', '+15%']),
      ],
    },
    {
      id: 'rugido-desafiante', tipo: 'constante',
      nombre: { es: 'Rugido desafiante', en: 'Challenging Roar' },
      descripcion: { es: 'Invocás más rápido. En nivel 5 además resistís el próximo efecto de control.', en: 'You cast faster. At level 5 you also resist the next crowd control effect.' },
      mana: [65, 80, 95, 110, 125], duracion: 20, recarga: 120, invocacion: 0, recargaGlobal: 'corta',
      efectos: [
        buff(EF.velInvocacion, ['+10%', '+15%', '+20%', '+25%', '+30%']),
        buff(EF.resControl, ['—', '—', '—', '—', { es: 'sí', en: 'yes' }]),
      ],
    },
    {
      id: 'bramido-ensordecedor', tipo: 'constante',
      nombre: { es: 'Bramido ensordecedor', en: 'Deafening Roar' },
      descripcion: { es: 'Un rugido que aturde a quien alcanza.', en: 'A roar that stuns whoever it reaches.' },
      mana: [100, 130, 160, 190, 220], duracion: [4, 5, 6, 7, 8], recarga: 40, invocacion: 0.5, recargaGlobal: 'normal', intervaloArma: true,
      efectos: [debuff(EF.aturdir)],
    },
    {
      id: 'berserk', tipo: 'constante',
      nombre: { es: 'Berserk', en: 'Berserk' },
      descripcion: { es: 'Mucho más daño, pero te olvidás de esquivar.', en: 'Much more damage, but you forget to dodge.' },
      mana: [100, 130, 160, 180, 200], duracion: 90, recarga: 50, invocacion: 0, recargaGlobal: 'corta',
      efectos: [
        buff(EF.bonusDanoArma, ['+20%', '+28%', '+36%', '+42%', '+50%']),
        buff({ es: 'Velocidad de ataque (duales)', en: 'Attack speed (dual wield)' }, ['—', '—', '—', '—', '+10%']),
        contra(EF.evasion, '-100%'),
      ],
    },
    {
      id: 'fuerza-sobrecogedora', tipo: 'pasivo',
      nombre: { es: 'Fuerza sobrecogedora', en: 'Overwhelming Strength' },
      descripcion: { es: 'Más daño en todos tus ataques, siempre.', en: 'More damage on all your attacks, always on.' },
      efectos: [buff(EF.bonusDanoArma, ['+5%', '+7%', '+9%', '+12%', '+15%'])],
    },
    {
      id: 'retorno', tipo: 'constante',
      nombre: { es: 'Retorno', en: 'Spring' },
      descripcion: { es: 'Corrés más rápido hacia el enemigo y te entra menos daño a distancia.', en: 'You run faster toward the enemy and take less ranged damage.' },
      mana: [100, 120, 140, 160, 180], duracion: 10, recarga: 30, invocacion: 0, recargaGlobal: 'muy-corta',
      efectos: [buff(EF.velMovimiento, ['+10%', '+15%', '+20%', '+25%', '+30%']), buff(EF.danoRangoRecibido, ['-15%', '-15%', '-15%', '-30%', '-30%'])],
    },
    {
      id: 'desquiciamiento', tipo: 'constante',
      nombre: { es: 'Desquiciamiento', en: 'Unstoppable Madness' },
      descripcion: { es: 'Por unos segundos casi nada te controla.', en: 'For a few seconds almost nothing can control you.' },
      mana: [220, 240, 260, 300, 340], duracion: [5, 6, 7, 8, 10], recarga: 40, invocacion: 0, recargaGlobal: 'muy-corta',
      efectos: [
        buff(EF.resAturdir, ['+75%', '+80%', '+85%', '+90%', '+100%']),
        buff(EF.resMareo, ['+75%', '+80%', '+85%', '+90%', '+100%']),
        buff(EF.resNoqueo, ['+75%', '+80%', '+85%', '+90%', '+100%']),
        buff(EF.resParalisis, ['+75%', '+80%', '+85%', '+90%', '+100%']),
        buff(EF.resInmovilizar, ['+75%', '+80%', '+85%', '+90%', '+100%']),
        buff({ es: 'Resistir "no puede atacar"', en: 'Resist "cannot attack"' }, ['+75%', '+80%', '+85%', '+90%', '+100%']),
      ],
    },
  ],
};

export const ARMAS_A_DOS_MANOS: Discipline = {
  id: 'armas-a-dos-manos',
  nombre: { es: 'Armas a dos manos', en: 'Two Handed Mastery' },
  poderes: [
    {
      id: 'amenaza', tipo: 'constante',
      nombre: { es: 'Amenaza', en: 'Threat' },
      descripcion: { es: 'Intimidás a los que tenés cerca: tus críticos les pegan más fuerte.', en: 'You intimidate those nearby: your criticals hit them harder.' },
      mana: [100, 120, 140, 160, 180], duracion: [10, 14, 16, 18, 25], recarga: 60, invocacion: 0, recargaGlobal: 'corta',
      efectos: [buff(EF.danoCritico, ['+10%', '+13%', '+16%', '+20%', '+30%'])],
    },
    {
      id: 'golpe-espiritual', tipo: 'constante',
      nombre: { es: 'Golpe espiritual', en: 'Spiritual Blow' },
      descripcion: { es: 'Un golpe que llega más lejos que tu arma y desconcentra al enemigo.', en: 'A blow that reaches past your weapon’s range and breaks the enemy’s focus.' },
      mana: [80, 110, 140, 170, 200], duracion: 30, recarga: 30, invocacion: 0, recargaGlobal: 'normal', rango: 8, intervaloArma: true,
      efectos: [dano(EF.danoAtaque, ['+40%', '+55%', '+70%', '+85%', '+100%']), debuff(EF.concentracion, ['-15%', '-20%', '-25%', '-30%', '-35%'])],
    },
    {
      id: 'despedazar', tipo: 'directo',
      nombre: { es: 'Despedazar', en: 'Rend' },
      descripcion: { es: 'Un desgarro que le quita maná al enemigo.', en: 'A tearing blow that drains the enemy’s mana.' },
      mana: [120, 150, 180, 210, 240], recarga: 30, invocacion: 0.5, recargaGlobal: 'normal', intervaloArma: true,
      efectos: [dano(EF.danoAtaque, '+100%'), debuff(EF.mana, ['-20%', '-25%', '-30%', '-35%', '-40%'])],
    },
    {
      id: 'ataque-bestial', tipo: 'constante',
      nombre: { es: 'Ataque bestial', en: 'Beast Attack' },
      descripcion: { es: 'Un golpe brutal de mucho daño que puede marear al enemigo (50% de chance).', en: 'A brutal, heavy-damage blow that may dizzy the enemy (50% chance).' },
      mana: [160, 190, 220, 250, 280], duracion: [3, 4, 5, 6, 7], recarga: 45, invocacion: 0, recargaGlobal: 'normal', intervaloArma: true,
      efectos: [dano(EF.danoAtaque, ['+40/50%', '+65/75%', '+90/100%', '+115/125%', '+140/150%']), debuff(EF.marear)],
    },
    {
      id: 'alarido', tipo: 'constante',
      nombre: { es: 'Alarido', en: 'Howl' },
      descripcion: { es: 'Un aullido que marea a todos los enemigos de alrededor.', en: 'A howl that dizzies every enemy around you.' },
      mana: [150, 180, 210, 240, 270], duracion: [3, 4, 5, 6, 7], recarga: 60, invocacion: 0.5, recargaGlobal: 'normal', area: 6,
      efectos: [debuff(EF.marear)],
    },
    {
      id: 'onda-expansiva', tipo: 'directo',
      nombre: { es: 'Onda expansiva', en: 'Expansive Wave' },
      descripcion: { es: 'Una onda de energía en arco que golpea a todos los enemigos de adelante.', en: 'An energy wave in an arc that hits every enemy in front of you.' },
      mana: [200, 240, 280, 320, 360], recarga: 45, invocacion: 1.5, recargaGlobal: 'normal', intervaloArma: true,
      efectos: [dano(EF.danoAtaque, ['+20%', '+40%', '+60%', '+80%', '+100%']), dano(EF.danoAplastante, ['80-100', '130-160', '180-210', '230-260', '280-310'])],
    },
    {
      id: 'desestabilizador', tipo: 'constante',
      nombre: { es: 'Desestabilizador', en: 'Destabilize' },
      descripcion: { es: 'Le hacés perder el equilibrio al enemigo y esquiva menos.', en: 'You throw the enemy off balance so they evade less.' },
      mana: [65, 80, 95, 110, 125], duracion: 60, recarga: 15, invocacion: 0, recargaGlobal: 'normal', intervaloArma: true,
      efectos: [dano(EF.danoAtaque, '+100%'), debuff(EF.evasion, ['-10%', '-20%', '-30%', '-40%', '-50%'])],
    },
    {
      id: 'fulminante', tipo: 'constante',
      nombre: { es: 'Fulminante', en: 'Fulminating' },
      descripcion: { es: 'Muchísimo más daño durante un instante, pero sin poderes de área.', en: 'Far more damage for a brief moment, but no area powers.' },
      mana: [160, 180, 200, 220, 240], duracion: 5, recarga: 20, invocacion: 0.5, recargaGlobal: 'muy-larga',
      efectos: [buff(EF.bonusDanoArma, ['+10%', '+20%', '+30%', '+40%', '+50%']), contra({ es: 'No podés usar poderes de área', en: 'You cannot use area powers' })],
    },
    {
      id: 'manos-de-acero', tipo: 'pasivo',
      nombre: { es: 'Manos de acero', en: 'Hands of Steel' },
      descripcion: { es: 'Más alcance y más daño con tu arma, siempre.', en: 'More reach and more damage with your weapon, always on.' },
      efectos: [buff(EF.rangoAtaque, ['+5%', '+10%', '+15%', '+20%', '+25%']), buff(EF.bonusDanoArma, ['+10%', '+13%', '+16%', '+20%', '+30%'])],
    },
    {
      id: 'furia-de-la-tierra', tipo: 'constante',
      nombre: { es: 'Furia de la tierra', en: 'Rage of the Earth' },
      descripcion: { es: 'Un golpe al suelo que hace temblar la tierra: daña y derriba en un arco de 60°.', en: 'A blow to the ground that makes it shake: damages and knocks down in a 60° arc.' },
      mana: [190, 230, 270, 310, 350], duracion: [2, 3, 4, 5, 6], recarga: 90, invocacion: 0.5, recargaGlobal: 'normal', intervaloArma: true,
      efectos: [dano(EF.danoAtaque, ['100%', '105%', '110%', '115%', '125%']), debuff(EF.noquear)],
    },
  ],
};

export const BARBARO_WM: Discipline = {
  id: 'barbaro-wm',
  nombre: { es: 'Bárbaro WM', en: 'Barbarian WM' },
  warmaster: true,
  poderes: [
    {
      id: 'concilio-de-guerra', tipo: 'pasivo',
      nombre: { es: 'Concilio de guerra', en: 'War Council' },
      descripcion: { es: 'Un idioma de guerra para hablar en secreto con otros Warmasters.', en: 'A war language to talk in secret with other Warmasters.' },
      efectos: [buff(EF.chatGuerra)],
    },
    {
      id: 'bandera-de-warmaster', tipo: 'directo',
      nombre: { es: 'Bandera de Warmaster', en: 'Warmaster Beacon' },
      descripcion: { es: 'Clavás una bandera: los aliados que la usan ganan salud máxima.', en: 'You plant a beacon: allies who use it gain maximum health.' },
      mana: 150, duracion: 60, recarga: 600, invocacion: 0.3, recargaGlobal: 'muy-corta',
      efectos: [buff({ es: 'Salud de los aliados', en: 'Allies’ health' }, '+2000')],
    },
    {
      id: 'maestria-de-guerra', tipo: 'pasivo',
      nombre: { es: 'Maestría de guerra', en: 'Warmaster’s Might' },
      descripcion: { es: 'Más atributo principal de tu clase, siempre.', en: 'More of your class’s main attribute, always on.' },
      efectos: [buff(EF.atributoClase, '+15%')],
    },
    {
      id: 'grito-heroico', tipo: 'constante',
      nombre: { es: 'Grito heroico', en: 'Heroic Shout' },
      descripcion: { es: 'Un grito que frena a todos los enemigos de alrededor.', en: 'A shout that slows every enemy around you.' },
      mana: 150, duracion: 5, recarga: 30, invocacion: 0.5, recargaGlobal: 'normal', area: 6,
      efectos: [debuff(EF.velMovimiento, '-25%')],
    },
    {
      id: 'sangre-de-warmaster', tipo: 'pasivo',
      nombre: { es: 'Sangre de Warmaster', en: 'Warmaster Blood' },
      descripcion: { es: 'Salud máxima extra, siempre.', en: 'Extra maximum health, always on.' },
      efectos: [buff(EF.salud, '+300')],
    },
  ],
};

export const BARBARO: SubclassTrainer = {
  subclase: 'Bárbaro',
  disciplinas: [...DISCIPLINAS_GUERRERO, GRITOS_DE_GUERRA, ARMAS_A_DOS_MANOS, BARBARO_WM],
};
