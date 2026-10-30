import type { Discipline, SubclassTrainer } from './types';
import { EF, buff, debuff, contra } from './effects';
import { DISCIPLINAS_MAGO } from './mago';

const SI = { es: 'sí', en: 'yes' };

export const VIDA: Discipline = {
  id: 'vida',
  nombre: { es: 'Vida', en: 'Life' },
  poderes: [
    {
      id: 'curar-aliado', tipo: 'directo',
      nombre: { es: 'Curar aliado', en: 'Heal Ally' },
      descripcion: { es: 'Cura a un aliado.', en: 'Heals an ally.' },
      mana: [50, 70, 95, 120, 145], recarga: 5, invocacion: 0.5, recargaGlobal: 'muy-corta', rango: 25,
      efectos: [buff(EF.salud, ['+100', '+250', '+400', '+550', '+700']), buff({ es: 'Salud extra (% del máximo)', en: 'Extra health (% of max)' }, ['+1%', '+2%', '+3%', '+4%', '+5%'])],
    },
    {
      id: 'curarse', tipo: 'directo',
      nombre: { es: 'Curarse', en: 'Heal Self' },
      descripcion: { es: 'Te curás a vos.', en: 'Heals yourself.' },
      mana: [70, 90, 110, 130, 150], recarga: 15, invocacion: 1, recargaGlobal: 'corta',
      efectos: [buff(EF.salud, ['+200', '+300', '+400', '+500', '+600'])],
    },
    {
      id: 'revivir', tipo: 'constante',
      nombre: { es: 'Revivir', en: 'Resurrect' },
      descripcion: { es: 'Revive a un aliado. Desde nivel 2 vuelve con algo de maná y desde nivel 4 con unos segundos de santuario.', en: 'Brings an ally back to life. From level 2 they return with some mana, and from level 4 with a few seconds of sanctuary.' },
      mana: [400, 430, 460, 490, 520], recarga: 120, invocacion: 6, recargaGlobal: 'muy-corta', rango: 8,
      efectos: [
        buff(EF.salud, ['+200', '+800', '+1400', '+1400', '+2000']),
        buff(EF.mana, ['—', '+30%', '+30%', '+30%', '+30%']),
        buff({ es: 'Santuario (s)', en: 'Sanctuary (s)' }, ['—', '—', '—', '3', '8']),
      ],
    },
    {
      id: 'regenerar-aliado', tipo: 'constante',
      nombre: { es: 'Regenerar aliado', en: 'Regenerate Ally' },
      descripcion: { es: 'Cura a un aliado de a poco.', en: 'Heals an ally over time.' },
      mana: [70, 90, 110, 130, 150], duracion: 30, recarga: 20, invocacion: 0.5, recargaGlobal: 'muy-corta', rango: 25,
      efectos: [buff(EF.saludPorTick, ['+10', '+21', '+32', '+43', '+55'])],
    },
    {
      id: 'regenerarse', tipo: 'constante',
      nombre: { es: 'Regenerarse', en: 'Regenerate Self' },
      descripcion: { es: 'Te curás de a poco.', en: 'Heals yourself over time.' },
      mana: [70, 90, 110, 130, 150], duracion: 30, recarga: 30, invocacion: 1, recargaGlobal: 'corta',
      efectos: [buff(EF.saludPorTick, ['+20', '+25', '+30', '+35', '+40'])],
    },
    {
      id: 'intervencion-divina', tipo: 'constante',
      nombre: { es: 'Intervención divina', en: 'Divine Intervention' },
      descripcion: { es: 'El aliado queda inmune a maldiciones, hechizos y encantamientos que lo debiliten. Los poderes de daño le siguen entrando.', en: 'The ally becomes immune to curses, spells and enchantments that weaken them. Damaging powers still get through.' },
      mana: [75, 100, 125, 150, 175], duracion: [10, 20, 35, 50, 70], recarga: 110, invocacion: 1, recargaGlobal: 'muy-corta', rango: 25,
      efectos: [buff({ es: 'Inmune a poderes que no hacen daño', en: 'Immune to non-damaging powers' })],
    },
    {
      id: 'salvador', tipo: 'directo',
      nombre: { es: 'Salvador', en: 'Life Savior' },
      descripcion: { es: 'Una curación grande, en porcentaje de la salud del aliado.', en: 'A big heal, as a percentage of the ally’s health.' },
      mana: [240, 280, 320, 360, 400], recarga: 60, invocacion: 1.5, recargaGlobal: 'muy-corta', rango: 20,
      efectos: [buff(EF.salud, ['+20%', '+30%', '+40%', '+50%', '+60%'])],
    },
    {
      id: 'regeneracion-mayor', tipo: 'constante',
      nombre: { es: 'Regeneración mayor', en: 'Greater Regeneration' },
      descripcion: { es: 'Cura de golpe y después de a poco a todos los aliados que tenés cerca.', en: 'Heals every nearby ally at once and then over time.' },
      mana: [320, 360, 400, 440, 480], duracion: 30, recarga: 180, invocacion: 1.5, recargaGlobal: 'muy-corta', area: 10,
      efectos: [buff({ es: 'Salud al instante', en: 'Instant health' }, ['+50', '+75', '+100', '+125', '+150']), buff(EF.saludPorTick, ['+10', '+15', '+20', '+25', '+30'])],
    },
    {
      id: 'curacion-mayor', tipo: 'directo',
      nombre: { es: 'Curación mayor', en: 'Greater Healing' },
      descripcion: { es: 'Cura a todos los aliados que están cerca del objetivo.', en: 'Heals every ally near the target.' },
      mana: [340, 380, 420, 460, 500], recarga: 120, invocacion: 1.5, recargaGlobal: 'corta', rango: 20, area: 6,
      efectos: [buff(EF.salud, ['+150-200', '+250-300', '+350-400', '+450-500', '+550-600'])],
    },
    {
      id: 'revivir-en-masa', tipo: 'constante',
      nombre: { es: 'Revivir en masa', en: 'Mass Resurrection' },
      descripcion: { es: 'Revive a los aliados que tenés cerca; vuelven algo mareados. En nivel 5 vuelven con 8 segundos de santuario.', en: 'Revives nearby allies; they come back a bit dazed. At level 5 they return with 8 seconds of sanctuary.' },
      mana: [500, 600, 700, 800, 900], recarga: 300, invocacion: 5, recargaGlobal: 'muy-larga', area: 6,
      efectos: [buff(EF.salud, ['+500', '+600', '+700', '+800', '+1000']), buff({ es: 'Santuario (s)', en: 'Sanctuary (s)' }, ['—', '—', '—', '—', '8'])],
    },
  ],
};

export const INVOCACION: Discipline = {
  id: 'invocacion',
  nombre: { es: 'Invocación', en: 'Summon' },
  poderes: [
    {
      id: 'invocar-diablillos', tipo: 'constante',
      nombre: { es: 'Invocar diablillos', en: 'Summon Imps' },
      descripcion: { es: 'Diablillos que atacan a tu objetivo.', en: 'Imps that attack your target.' },
      mana: [50, 75, 100, 120, 140], duracion: 13, recarga: 60, invocacion: 1.5, recargaGlobal: 'normal',
      efectos: [buff({ es: 'Diablillos', en: 'Imps' }, ['2', '4', '6', '8', '10'])],
    },
    {
      id: 'lazo-extraplanar', tipo: 'constante',
      nombre: { es: 'Lazo extraplanar', en: 'Extraplanar Bond' },
      descripcion: { es: 'Te unís a tu invocación y ella recibe parte del daño que te hacen. No se combina con Espejo del karma.', en: 'You bond with your summon and it takes part of the damage dealt to you. Cannot be combined with Karma Mirror.' },
      mana: [40, 55, 70, 85, 100], duracion: 45, recarga: 60, invocacion: 0.5, recargaGlobal: 'muy-corta',
      efectos: [buff({ es: 'Daño que pasa a la invocación', en: 'Damage redirected to the summon' }, ['10%', '20%', '30%', '40%', '50%'])],
    },
    {
      id: 'invocar-demonio', tipo: 'constante',
      nombre: { es: 'Invocar demonio', en: 'Summon Demon' },
      descripcion: { es: 'Un demonio que pelea a tu lado. En nivel 5 lo podés controlar.', en: 'A demon that fights by your side. At level 5 you can control it.' },
      mana: [90, 110, 130, 150, 200], duracion: [30, 35, 40, 45, 60], recarga: 50, invocacion: 3, recargaGlobal: 'normal',
      efectos: [buff({ es: 'Controlable', en: 'Controllable' }, ['—', '—', '—', '—', SI])],
    },
    {
      id: 'lazo-material', tipo: 'pasivo',
      nombre: { es: 'Lazo material', en: 'Material Bond' },
      descripcion: { es: 'Tus invocaciones tienen más salud, siempre.', en: 'Your summons have more health, always on.' },
      efectos: [buff(EF.saludInvocacion, ['+10%', '+15%', '+22%', '+30%', '+50%'])],
    },
    {
      id: 'invocar-zombis', tipo: 'constante',
      nombre: { es: 'Invocar zombis', en: 'Summon Zombies' },
      descripcion: { es: 'Zombis que atacan a tu objetivo.', en: 'Zombies that attack your target.' },
      mana: [140, 160, 180, 200, 220], duracion: 18, recarga: 60, invocacion: 2, recargaGlobal: 'larga',
      efectos: [buff({ es: 'Zombis', en: 'Zombies' }, ['1', '2', '3', '4', '5'])],
    },
    {
      id: 'furia-demoniaca', tipo: 'constante',
      nombre: { es: 'Furia demoníaca', en: 'Demonic Rage' },
      descripcion: { es: 'Tus invocaciones pegan más fuerte pero pierden casi toda la armadura.', en: 'Your summons hit harder but lose almost all their armor.' },
      mana: [200, 225, 250, 275, 300], duracion: 25, recarga: 60, invocacion: 1.5, recargaGlobal: 'corta', intervaloArma: true,
      efectos: [buff({ es: 'Daño de las invocaciones', en: 'Summon damage' }, ['+10%', '+20%', '+30%', '+40%', '+50%']), contra({ es: 'Protección de las invocaciones', en: 'Summon protection' }, '-75%')],
    },
    {
      id: 'invocar-golem', tipo: 'constante',
      nombre: { es: 'Invocar gólem', en: 'Summon Golem' },
      descripcion: { es: 'Un gólem que pelea a tu lado. Cada nivel trae uno más grande.', en: 'A golem that fights by your side. Each level brings a bigger one.' },
      mana: [300, 350, 400, 450, 500], duracion: 240, recarga: 120, invocacion: 10, recargaGlobal: 'normal',
      efectos: [buff({ es: 'Gólem', en: 'Golem' }, ['Tiny Stone Golem', 'Small Magma Golem', 'Crystal Golem', 'Large Fire Golem', 'Enormous Metal Golem'])],
    },
    {
      id: 'armadura-magica', tipo: 'pasivo',
      nombre: { es: 'Armadura mágica', en: 'Magical Armor' },
      descripcion: { es: 'Tus invocaciones tienen más protección, siempre.', en: 'Your summons have more protection, always on.' },
      efectos: [buff({ es: 'Protección de las invocaciones', en: 'Summon protection' }, ['+5%', '+10%', '+15%', '+20%', '+25%'])],
    },
    {
      id: 'bebedor-de-sangre', tipo: 'constante',
      nombre: { es: 'Bebedor de sangre', en: 'Blood Drinker' },
      descripcion: { es: 'Tu invocación se cura con parte del daño que hace.', en: 'Your summon heals for part of the damage it deals.' },
      mana: [400, 450, 500, 550, 600], duracion: 60, recarga: 180, invocacion: 4, recargaGlobal: 'muy-corta',
      efectos: [buff({ es: 'Robo de vida', en: 'Life drain' }, ['+20%', '+40%', '+60%', '+80%', '+100%'])],
    },
    {
      id: 'invocar-lich', tipo: 'constante',
      nombre: { es: 'Invocar lich', en: 'Summon Lich' },
      descripcion: { es: 'Un lich que pelea a tu lado. Desde nivel 4 lo podés controlar.', en: 'A lich that fights by your side. From level 4 you can control it.' },
      mana: [300, 350, 400, 450, 500], duracion: [40, 45, 50, 55, 70], recarga: 60, invocacion: 3, recargaGlobal: 'normal',
      efectos: [
        buff({ es: 'Lich', en: 'Lich' }, ['Old Lich', 'Lich Apprentice', 'Lich Necromancer', 'Lord Lich', 'Lich Shaman']),
        buff({ es: 'Controlable', en: 'Controllable' }, ['—', '—', '—', SI, SI]),
      ],
    },
  ],
};

export const HECHICERIA: Discipline = {
  id: 'hechiceria',
  nombre: { es: 'Hechicería', en: 'Sorcery' },
  poderes: [
    {
      id: 'armadura-de-energia', tipo: 'constante',
      nombre: { es: 'Armadura de energía', en: 'Force Armor' },
      descripcion: { es: 'Un campo de fuerza que te da protección.', en: 'A force field that gives you protection.' },
      mana: [60, 75, 90, 105, 120], duracion: 60, recarga: 70, invocacion: 2, recargaGlobal: 'corta',
      efectos: [buff(EF.proteccion, ['+10%', '+15%', '+20%', '+25%', '+30%'])],
    },
    {
      id: 'silueta-cambiante', tipo: 'constante',
      nombre: { es: 'Silueta cambiante', en: 'Shifting Silhouette' },
      descripcion: { es: 'La silueta del aliado se vuelve borrosa: le atacan e invocan más lento. En nivel 5 además recibe menos daño a distancia.', en: 'The ally’s silhouette blurs: enemies attack and cast slower against them. At level 5 they also take less ranged damage.' },
      mana: [220, 260, 300, 340, 380], duracion: 40, recarga: 80, invocacion: 2, recargaGlobal: 'muy-corta',
      efectos: [
        debuff(EF.velAtaque, ['-3%', '-6%', '-9%', '-12%', '-15%']),
        debuff(EF.velInvocacion, ['-3%', '-6%', '-9%', '-12%', '-15%']),
        buff(EF.danoRangoRecibido, ['—', '—', '—', '—', '-10%']),
      ],
    },
    {
      id: 'escudar-companero', tipo: 'constante',
      nombre: { es: 'Escudar compañero', en: 'Friendly Shielding' },
      descripcion: { es: 'Un campo de fuerza que le da protección a un aliado.', en: 'A force field that gives an ally protection.' },
      mana: [50, 65, 80, 95, 110], duracion: 60, recarga: 25, invocacion: 1.5, recargaGlobal: 'muy-corta', rango: 25,
      efectos: [buff(EF.proteccion, ['+10%', '+15%', '+20%', '+25%', '+30%'])],
    },
    {
      id: 'mente-en-blanco', tipo: 'activable',
      nombre: { es: 'Mente en blanco', en: 'Mind Blank' },
      descripcion: { es: 'Resistís mejor los efectos de control, pero no podés usar poderes de daño. Se puede apagar.', en: 'You resist crowd control better, but cannot use damage powers. Can be turned off.' },
      mana: [100, 130, 160, 190, 220], recarga: 60, invocacion: 1, recargaGlobal: 'muy-corta',
      efectos: [
        buff(EF.resAturdir, ['+20%', '+25%', '+30%', '+35%', '+40%']),
        buff(EF.resMareo, ['+20%', '+25%', '+30%', '+35%', '+40%']),
        buff(EF.resNoqueo, ['+20%', '+25%', '+30%', '+35%', '+40%']),
        buff(EF.resParalisis, ['+20%', '+25%', '+30%', '+35%', '+40%']),
        contra(EF.noPoderesDano),
      ],
    },
    {
      id: 'espejo-del-karma', tipo: 'constante',
      nombre: { es: 'Espejo del karma', en: 'Karma Mirror' },
      descripcion: { es: 'Le devolvés al atacante parte del daño que recibís. No se combina con Lazo extraplanar.', en: 'You reflect part of the damage you take back at the attacker. Cannot be combined with Extraplanar Bond.' },
      mana: [75, 90, 105, 120, 135], duracion: 30, recarga: 60, invocacion: 1, recargaGlobal: 'corta',
      efectos: [buff(EF.devuelveDano, ['+10%', '+15%', '+20%', '+25%', '+30%'])],
    },
    {
      id: 'barrera-magica', tipo: 'constante',
      nombre: { es: 'Barrera mágica', en: 'Magic Barrier' },
      descripcion: { es: 'El objetivo resiste mejor el daño mágico.', en: 'The target resists magical damage better.' },
      mana: [250, 275, 300, 325, 350], duracion: 120, recarga: 120, invocacion: 2, recargaGlobal: 'muy-corta', rango: 25,
      efectos: [buff(EF.resMagico, ['+10%', '+15%', '+20%', '+25%', '+30%'])],
    },
    {
      id: 'muralla-material', tipo: 'constante',
      nombre: { es: 'Muralla material', en: 'Material Wall' },
      descripcion: { es: 'El objetivo resiste mejor el daño físico.', en: 'The target resists physical damage better.' },
      mana: [250, 275, 300, 325, 350], duracion: 120, recarga: 120, invocacion: 2, recargaGlobal: 'muy-corta', rango: 25,
      efectos: [buff(EF.resFisico, ['+10%', '+15%', '+20%', '+25%', '+30%'])],
    },
    {
      id: 'santuario', tipo: 'constante',
      nombre: { es: 'Santuario', en: 'Sanctuary' },
      descripcion: { es: 'Nadie te puede atacar y vos tampoco, pero te podés mover. Te saca los efectos positivos que tengas.', en: 'Nobody can attack you and you cannot attack, but you can move. Removes your positive effects.' },
      mana: [230, 260, 290, 320, 350], duracion: [10, 12, 14, 17, 20], recarga: 70, invocacion: 1.5, recargaGlobal: 'muy-corta',
      efectos: [buff(EF.santuario), contra(EF.noAtacar)],
    },
    {
      id: 'introspectiva', tipo: 'pasivo',
      nombre: { es: 'Introspectiva', en: 'Insightful' },
      descripcion: { es: 'Los poderes que te tiran vos o tus aliados te duran más, siempre.', en: 'Powers cast on you by yourself or allies last longer, always on.' },
      efectos: [buff({ es: 'Duración de los poderes recibidos', en: 'Duration of received powers' }, ['+5%', '+7%', '+9%', '+12%', '+20%'])],
    },
    {
      id: 'piel-de-acero', tipo: 'constante',
      nombre: { es: 'Piel de acero', en: 'Steel Skin' },
      descripcion: { es: 'Un manto mágico que reduce muchísimo el daño físico.', en: 'A magic mantle that greatly reduces physical damage.' },
      mana: [340, 380, 420, 460, 500], duracion: [20, 25, 30, 35, 40], recarga: 180, invocacion: 1, recargaGlobal: 'corta',
      efectos: [buff(EF.resFisico, ['+50%', '+55%', '+60%', '+65%', '+70%'])],
    },
  ],
};

export const CONJURADOR_WM: Discipline = {
  id: 'conjurador-wm',
  nombre: { es: 'Conjurador WM', en: 'Conjurer WM' },
  warmaster: true,
  poderes: [
    {
      id: 'concilio-de-guerra', tipo: 'pasivo',
      nombre: { es: 'Concilio de guerra', en: 'War Council' },
      descripcion: { es: 'Un idioma de guerra para hablar en secreto con otros Warmasters.', en: 'A war language to talk in secret with other Warmasters.' },
      efectos: [buff(EF.chatGuerra)],
    },
    {
      id: 'portal-defensivo', tipo: 'directo',
      nombre: { es: 'Portal defensivo', en: 'Defensive Portal' },
      descripcion: { es: 'Abre un portal que lleva hasta 25 aliados a un punto del reino.', en: 'Opens a portal that takes up to 25 allies to a location in the realm.' },
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
      id: 'proteccion-divina', tipo: 'constante',
      nombre: { es: 'Protección divina', en: 'Divine Protection' },
      descripcion: { es: 'Un aliado recibe más curación por un rato.', en: 'An ally receives more healing for a while.' },
      mana: 200, duracion: 60, recarga: 45, invocacion: 1, recargaGlobal: 'corta', rango: 20,
      efectos: [buff(EF.bonusCuracion, '+25%')],
    },
    {
      id: 'sangre-de-warmaster', tipo: 'pasivo',
      nombre: { es: 'Sangre de Warmaster', en: 'Warmaster Blood' },
      descripcion: { es: 'Salud máxima extra, siempre.', en: 'Extra maximum health, always on.' },
      efectos: [buff(EF.salud, '+700')],
    },
  ],
};

export const CONJURADOR: SubclassTrainer = {
  subclase: 'Conjurador',
  disciplinas: [...DISCIPLINAS_MAGO, VIDA, INVOCACION, HECHICERIA, CONJURADOR_WM],
};
