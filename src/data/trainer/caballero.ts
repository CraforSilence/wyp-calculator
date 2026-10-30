import type { Discipline, SubclassTrainer } from './types';
import { EF, buff, debuff, dano, contra } from './effects';
import { DISCIPLINAS_GUERRERO } from './guerrero';

export const VANGUARDIA: Discipline = {
  id: 'vanguardia',
  nombre: { es: 'Vanguardia', en: 'Vanguard' },
  poderes: [
    {
      id: 'retar', tipo: 'constante',
      nombre: { es: 'Retar', en: 'Challenge' },
      descripcion: { es: 'Provocás a un enemigo: pierde concentración y es más fácil de derribar.', en: 'You taunt an enemy: they lose focus and are easier to knock down.' },
      mana: [50, 75, 100, 125, 150], duracion: [5, 5, 10, 10, 15], recarga: 15, invocacion: 1, recargaGlobal: 'corta', rango: 25, bloqueable100: true,
      efectos: [debuff(EF.resNoqueo, ['-20%', '-40%', '-60%', '-80%', '-100%']), debuff(EF.concentracion, ['-10%', '-15%', '-20%', '-25%', '-30%'])],
    },
    {
      id: 'provocar', tipo: 'constante',
      nombre: { es: 'Provocar', en: 'Taunt' },
      descripcion: {
        es: 'Enfurece a un monstruo para que te ataque a vos, y le baja la protección y el daño. Una mascota o invocación provocada deja de obedecer a su dueño hasta que se termine el efecto o se lo disipen.',
        en: 'Enrages a monster so it attacks you, lowering its protection and damage. A taunted pet or summon stops obeying its owner until the effect ends or is dispelled.',
      },
      mana: [50, 65, 80, 95, 110], duracion: [20, 25, 30, 35, 40], recarga: 20, invocacion: 0.5, recargaGlobal: 'corta', rango: 25,
      efectos: [
        debuff(EF.agresividad, ['+150', '+300', '+500', '+1000', '+1500']),
        debuff(EF.proteccion, ['-20%', '-30%', '-40%', '-50%', '-60%']),
        debuff(EF.bonusDanoArma, ['-3%', '-5%', '-7%', '-10%', '-15%']),
      ],
    },
    {
      id: 'finta', tipo: 'constante',
      nombre: { es: 'Finta', en: 'Feint' },
      descripcion: { es: 'Un amague que descoloca al enemigo y lo tira al suelo.', en: 'A fake-out that throws the enemy off balance and onto the ground.' },
      mana: [70, 90, 110, 130, 150], duracion: [2, 3, 4, 5, 6], recarga: 35, invocacion: 0, recargaGlobal: 'normal', bloqueable100: true,
      efectos: [debuff(EF.noquear)],
    },
    {
      id: 'temple-de-protector', tipo: 'pasivo',
      nombre: { es: 'Temple de protector', en: 'Protector Temper' },
      descripcion: { es: 'Más constitución y resistencia a todo tipo de daño, siempre.', en: 'More constitution and resistance to every kind of damage, always on.' },
      efectos: [
        buff(EF.constitucion, ['+5', '+7', '+9', '+12', '+15']),
        buff(EF.resFisico, ['+2%', '+4%', '+6%', '+8%', '+10%']),
        buff(EF.resMagico, ['+2%', '+4%', '+6%', '+8%', '+10%']),
      ],
    },
    {
      id: 'instancia-ofensiva', tipo: 'activable',
      nombre: { es: 'Instancia ofensiva', en: 'Offensive Stance' },
      descripcion: { es: 'Postura de ataque: pegás más fuerte pero quedás casi sin defensa. Se puede apagar.', en: 'An attacking stance: you hit harder but are left almost defenseless. Can be turned off.' },
      recarga: 10, invocacion: 0.5, recargaGlobal: 'muy-corta',
      efectos: [buff(EF.bonusDanoArma, ['+5%', '+10%', '+15%', '+20%', '+25%']), contra(EF.proteccion, '-95%'), contra(EF.evasion, '-100%')],
    },
    {
      id: 'soporte-defensivo', tipo: 'constante',
      nombre: { es: 'Soporte defensivo', en: 'Defensive Support' },
      descripcion: { es: 'Resistís mucho mejor los efectos de control, a cambio de moverte un poco más lento.', en: 'You resist crowd control far better, at the cost of moving a bit slower.' },
      mana: [105, 120, 135, 150, 165], duracion: 40, recarga: 30, invocacion: 1.5, recargaGlobal: 'corta',
      efectos: [
        buff(EF.resAturdir, ['+25%', '+35%', '+45%', '+55%', '+65%']),
        buff(EF.resMareo, ['+25%', '+35%', '+45%', '+55%', '+65%']),
        buff(EF.resNoqueo, ['+25%', '+35%', '+45%', '+55%', '+65%']),
        buff(EF.resParalisis, ['+25%', '+35%', '+45%', '+55%', '+65%']),
        contra(EF.velMovimiento, '-10%'),
      ],
    },
    {
      id: 'piel-de-troll', tipo: 'constante',
      nombre: { es: 'Piel de troll', en: 'Troll’s Skin' },
      descripcion: { es: 'Salud extra durante varios minutos.', en: 'Extra health for several minutes.' },
      mana: [100, 130, 160, 190, 210], duracion: 240, recarga: 270, invocacion: 1, recargaGlobal: 'normal',
      efectos: [buff(EF.salud, ['+200', '+300', '+450', '+600', '+1000'])],
    },
    {
      id: 'furor-del-caballero', tipo: 'constante',
      nombre: { es: 'Furor del caballero', en: 'Knight’s Haste' },
      descripcion: { es: 'Un pique muy corto para llegar a tiempo a un aliado o alcanzar a un enemigo.', en: 'A very short sprint to reach an ally in time or catch an enemy.' },
      mana: [50, 80, 110, 140, 170], duracion: 4, recarga: 100, invocacion: 0, recargaGlobal: 'muy-corta',
      efectos: [buff(EF.velMovimiento, ['+5%', '+10%', '+15%', '+20%', '+50%'])],
    },
    {
      id: 'presencia-heroica', tipo: 'aura',
      nombre: { es: 'Presencia heroica', en: 'Heroic Presence' },
      descripcion: { es: 'Aura que les da protección a los aliados que tenés cerca.', en: 'An aura that grants protection to the allies near you.' },
      mana: [320, 340, 360, 380, 400], duracion: 60, recarga: 90, invocacion: 1.5, recargaGlobal: 'muy-corta', area: 6,
      efectos: [buff(EF.proteccion, ['+40%', '+50%', '+60%', '+70%', '+80%'])],
    },
    {
      id: 'ejercito-de-uno', tipo: 'constante',
      nombre: { es: 'Ejército de uno', en: 'Army of One' },
      descripcion: { es: 'Por unos segundos casi no te entra daño.', en: 'For a few seconds you take almost no damage.' },
      mana: [220, 240, 260, 280, 300], duracion: 20, recarga: 50, invocacion: 0.5, recargaGlobal: 'larga',
      efectos: [buff(EF.resFisico, ['+40%', '+50%', '+60%', '+70%', '+80%']), buff(EF.resMagico, ['+40%', '+50%', '+60%', '+70%', '+80%'])],
    },
  ],
};

export const ESCUDOS: Discipline = {
  id: 'escudos',
  nombre: { es: 'Escudos', en: 'Shields' },
  poderes: [
    {
      id: 'bloqueo', tipo: 'constante',
      nombre: { es: 'Bloqueo', en: 'Block' },
      descripcion: { es: 'Mucha más chance de bloquear ataques y poderes con el escudo.', en: 'A much higher chance of blocking attacks and powers with your shield.' },
      mana: [60, 80, 100, 120, 140], duracion: [12, 15, 18, 21, 25], recarga: 50, invocacion: 0, recargaGlobal: 'muy-corta',
      efectos: [buff(EF.bloqueo, '+150%')],
    },
    {
      id: 'avasallar', tipo: 'constante',
      nombre: { es: 'Avasallar', en: 'Shield Bash' },
      descripcion: { es: 'Golpe con el escudo que daña y marea.', en: 'A shield strike that damages and dizzies.' },
      mana: [110, 135, 160, 175, 190], duracion: [3, 4, 5, 6, 7], recarga: 45, invocacion: 0, recargaGlobal: 'normal', rango: 2, intervaloArma: true,
      efectos: [dano(EF.danoAplastante, ['80-120', '160-210', '260-320', '380-460', '540-640']), debuff(EF.marear)],
    },
    {
      id: 'proteger-aliado', tipo: 'directo',
      nombre: { es: 'Proteger aliado', en: 'Protect Ally' },
      descripcion: { es: 'Le saca a un aliado los efectos de control y puede curarlo un poco.', en: 'Clears crowd control effects from an ally and may heal them a little.' },
      mana: [130, 150, 170, 190, 210], recarga: 30, invocacion: 0, recargaGlobal: 'corta', rango: 2,
      efectos: [
        buff(EF.disipaControl, [
          { es: 'congelamiento', en: 'freeze' },
          { es: 'congelamiento y aturdimiento', en: 'freeze and stun' },
          { es: 'congelamiento, inmovilización y aturdimiento', en: 'freeze, immobilize and stun' },
          { es: 'congelamiento, inmovilización, aturdimiento y derribo', en: 'freeze, immobilize, stun and knockdown' },
          { es: 'todos los poderes negativos', en: 'all negative powers' },
        ]),
        buff(EF.saludChance, ['+100 (30%)', '+110 (45%)', '+120 (60%)', '+130 (80%)', '+150 (100%)']),
      ],
    },
    {
      id: 'bloqueo-preciso', tipo: 'constante',
      nombre: { es: 'Bloqueo preciso', en: 'Precise Block' },
      descripcion: { es: 'Bloqueás absolutamente todo, pero no podés atacar y se corta si te movés.', en: 'You block absolutely everything, but cannot attack and it ends if you move.' },
      mana: [80, 100, 120, 140, 160], duracion: [4, 5, 6, 7, 9], recarga: 30, invocacion: 0, recargaGlobal: 'muy-corta',
      efectos: [buff(EF.bloqueoAbsoluto, '100%'), contra(EF.noAtacar), contra(EF.cortaAlMoverse)],
    },
    {
      id: 'instancia-defensiva', tipo: 'activable',
      nombre: { es: 'Instancia defensiva', en: 'Defensive Stance' },
      descripcion: { es: 'Postura de defensa: te entra menos daño pero casi no pegás. Se puede apagar.', en: 'A defensive stance: you take less damage but barely hit. Can be turned off.' },
      recarga: 10, invocacion: 0.5, recargaGlobal: 'muy-corta',
      efectos: [buff(EF.resDano, ['+20%', '+25%', '+30%', '+35%', '+40%']), contra(EF.bonusDanoArma, '-90%'), contra(EF.noPoderesDano)],
    },
    {
      id: 'manto-etereo', tipo: 'constante',
      nombre: { es: 'Manto etéreo', en: 'Ethereal Mantle' },
      descripcion: { es: 'Escudás a un aliado contra el daño físico y mágico.', en: 'You shield one ally against physical and magical damage.' },
      mana: [200, 230, 260, 290, 320], duracion: 60, recarga: 120, invocacion: 0.5, recargaGlobal: 'muy-corta', rango: 2,
      efectos: [buff(EF.resMagico, ['+10%', '+15%', '+20%', '+25%', '+30%']), buff(EF.resFisico, ['+10%', '+15%', '+20%', '+25%', '+30%'])],
    },
    {
      id: 'muro-protector', tipo: 'constante',
      nombre: { es: 'Muro protector', en: 'Shield Wall' },
      descripcion: { es: 'Los aliados de alrededor resisten mejor el daño físico.', en: 'Allies around you resist physical damage better.' },
      mana: [200, 225, 250, 275, 300], duracion: 10, recarga: 40, invocacion: 0, recargaGlobal: 'corta', area: 10,
      efectos: [buff(EF.resFisico, ['+10%', '+20%', '+30%', '+40%', '+50%'])],
    },
    {
      id: 'firmeza', tipo: 'pasivo',
      nombre: { es: 'Firmeza', en: 'Steadiness' },
      descripcion: { es: 'Te cuesta más caerte: resistencia permanente al derribo.', en: 'You are harder to put down: permanent knockdown resistance.' },
      efectos: [buff(EF.resNoqueo, ['+5%', '+10%', '+15%', '+20%', '+25%'])],
    },
    {
      id: 'escudo-estelar', tipo: 'constante',
      nombre: { es: 'Escudo estelar', en: 'Stars Shield' },
      descripcion: { es: 'Los aliados de alrededor resisten mejor el daño mágico. No se puede usar con Barrera deflectora activa.', en: 'Allies around you resist magical damage better. Cannot be used while Deflecting Barrier is active.' },
      mana: [200, 225, 250, 275, 300], duracion: 10, recarga: 40, invocacion: 0, recargaGlobal: 'corta', area: 10,
      efectos: [buff(EF.resMagico, ['+10%', '+20%', '+30%', '+40%', '+50%'])],
    },
    {
      id: 'barrera-deflectora', tipo: 'aura',
      nombre: { es: 'Barrera deflectora', en: 'Deflecting Barrier' },
      descripcion: { es: 'Aura que reduce el daño a distancia que reciben los aliados cercanos. No se puede usar con Escudo estelar activo.', en: 'An aura that cuts the ranged damage nearby allies take. Cannot be used while Stars Shield is active.' },
      mana: [250, 300, 350, 400, 450], duracion: 120, recarga: 180, invocacion: 1, recargaGlobal: 'corta', area: 6,
      efectos: [buff(EF.danoRangoRecibido, ['-10%', '-15%', '-20%', '-30%', '-40%'])],
    },
  ],
};

export const CABALLERO_WM: Discipline = {
  id: 'caballero-wm',
  nombre: { es: 'Caballero WM', en: 'Knight WM' },
  warmaster: true,
  poderes: [
    {
      id: 'concilio-de-guerra', tipo: 'pasivo',
      nombre: { es: 'Concilio de guerra', en: 'War Council' },
      descripcion: { es: 'Un idioma de guerra para hablar en secreto con otros Warmasters.', en: 'A war language to talk in secret with other Warmasters.' },
      efectos: [buff(EF.chatGuerra)],
    },
    {
      id: 'asistencia-del-paladin', tipo: 'constante',
      nombre: { es: 'Asistencia del paladín', en: 'Paladin’s Aid' },
      descripcion: { es: 'Durante unos segundos recibís vos todos los ataques dirigidos a un aliado.', en: 'For a few seconds you take every attack aimed at an ally.' },
      mana: 200, duracion: 8, recarga: 50, invocacion: 0, recargaGlobal: 'muy-corta',
      efectos: [buff(EF.absorbeAtaques)],
    },
    {
      id: 'maestria-de-guerra', tipo: 'pasivo',
      nombre: { es: 'Maestría de guerra', en: 'Warmaster’s Might' },
      descripcion: { es: 'Más constitución, siempre.', en: 'More constitution, always on.' },
      efectos: [buff(EF.constitucionPct, '+15%')],
    },
    {
      id: 'bendecido', tipo: 'directo',
      nombre: { es: 'Bendecido', en: 'Blessed' },
      descripcion: { es: 'Te curás de golpe una buena cantidad de salud.', en: 'Instantly heals you for a good amount of health.' },
      mana: 250, recarga: 90, invocacion: 1, recargaGlobal: 'corta',
      efectos: [buff(EF.salud, '+400')],
    },
    {
      id: 'sangre-de-warmaster', tipo: 'pasivo',
      nombre: { es: 'Sangre de Warmaster', en: 'Warmaster Blood' },
      descripcion: { es: 'Salud máxima extra, siempre.', en: 'Extra maximum health, always on.' },
      efectos: [buff(EF.salud, '+350')],
    },
  ],
};

export const CABALLERO: SubclassTrainer = {
  subclase: 'Caballero',
  disciplinas: [...DISCIPLINAS_GUERRERO, VANGUARDIA, ESCUDOS, CABALLERO_WM],
};
