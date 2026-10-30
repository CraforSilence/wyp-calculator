import type { Discipline, SubclassTrainer } from './types';
import { EF, buff, debuff, dano, contra } from './effects';
import { DISCIPLINAS_ARQUERO } from './arquero';

export const EXPLORACION: Discipline = {
  id: 'exploracion',
  nombre: { es: 'Exploración', en: 'Scouting' },
  poderes: [
    {
      id: 'flecha-enredadora', tipo: 'constante',
      nombre: { es: 'Flecha enredadora', en: 'Ensnaring Arrow' },
      descripcion: { es: 'Una flecha rápida a las piernas que daña y frena al enemigo.', en: 'A quick arrow to the legs that damages and slows the enemy.' },
      mana: [100, 125, 150, 175, 200], duracion: 7, recarga: 8, invocacion: 0.5, recargaGlobal: 'corta',
      efectos: [
        dano(EF.danoAtaque, ['60%', '70%', '80%', '90%', '100%']),
        dano(EF.danoPunzante, ['50', '90', '120', '160', '200']),
        debuff(EF.velMovimiento, ['-5%', '-7%', '-9%', '-12%', '-15%']),
      ],
    },
    {
      id: 'sentencia-a-muerte', tipo: 'constante',
      nombre: { es: 'Sentencia a muerte', en: 'Death Sentence' },
      descripcion: { es: 'Marcás a un enemigo: los golpes cuerpo a cuerpo le hacen más daño.', en: 'You mark an enemy: melee hits deal more damage to them.' },
      mana: [50, 80, 110, 140, 170], duracion: 30, recarga: 30, invocacion: 1, recargaGlobal: 'corta', rango: 25,
      efectos: [debuff({ es: 'Daño cuerpo a cuerpo recibido', en: 'Melee damage taken' }, ['+5%', '+8%', '+12%', '+16%', '+20%'])],
    },
    {
      id: 'vigilancia-enemiga', tipo: 'directo',
      nombre: { es: 'Vigilancia enemiga', en: 'Enemy Surveillance' },
      descripcion: { es: 'Detecta enemigos alrededor. Se puede usar camuflado.', en: 'Detects enemies around you. Can be used while camouflaged.' },
      mana: [100, 120, 140, 160, 180], recarga: 20, invocacion: 1.5, recargaGlobal: 'corta',
      efectos: [buff({ es: 'Alcance de detección (m)', en: 'Detection range (m)' }, ['150', '200', '250', '300', '400'])],
    },
    {
      id: 'espiritu-salvaje', tipo: 'pasivo',
      nombre: { es: 'Espíritu salvaje', en: 'Wild Spirit' },
      descripcion: { es: 'Te movés un poco más rápido, siempre.', en: 'You move a bit faster, always on.' },
      efectos: [buff(EF.velMovimiento, ['+2%', '+3%', '+4%', '+5%', '+7%'])],
    },
    {
      id: 'camuflaje', tipo: 'constante',
      nombre: { es: 'Camuflaje', en: 'Camouflage' },
      descripcion: {
        es: 'Te volvés invisible y tu primer ataque hace daño extra. Perdés el control de tu mascota y no podés usar Confundir hasta 5 segundos después.',
        en: 'You turn invisible and your first attack deals extra damage. You lose control of your pet and cannot use Confuse until 5 seconds after.',
      },
      mana: [300, 325, 350, 375, 400], duracion: [20, 30, 45, 60, 80], recarga: 120, invocacion: 4.5, recargaGlobal: 'corta',
      efectos: [buff(EF.invisibilidad), dano({ es: 'Daño punzante del primer ataque', en: 'First attack piercing damage' }, ['50', '80', '120', '170', '250'])],
    },
    {
      id: 'ligereza-heredada', tipo: 'aura',
      nombre: { es: 'Ligereza heredada', en: 'Inherited Lightness' },
      descripcion: { es: 'Aura que les da destreza y regeneración de maná a los aliados cercanos.', en: 'An aura that gives nearby allies dexterity and mana regeneration.' },
      mana: [150, 200, 250, 300, 350], duracion: 60, recarga: 90, invocacion: 1, recargaGlobal: 'muy-corta', rango: 6,
      efectos: [buff(EF.destreza, ['+3', '+6', '+9', '+12', '+15']), buff(EF.regenMana, ['+5%', '+10%', '+20%', '+30%', '+50%'])],
    },
    {
      id: 'sangre-fria', tipo: 'constante',
      nombre: { es: 'Sangre fría', en: 'Cold Blood' },
      descripcion: { es: 'Unos segundos de muchísimo más daño.', en: 'A few seconds of much higher damage.' },
      mana: [180, 210, 240, 270, 300], duracion: 6, recarga: 60, invocacion: 0, recargaGlobal: 'muy-corta',
      efectos: [buff(EF.bonusDanoArma, ['+50%', '+70%', '+90%', '+110%', '+130%'])],
    },
    {
      id: 'revelar', tipo: 'constante',
      nombre: { es: 'Revelar', en: 'Reveal' },
      descripcion: { es: 'Una flecha en llamas que deja ver a los enemigos escondidos en un arco de 75° y les corta Camuflaje y Entorno acechador.', en: 'A flaming arrow that exposes hidden enemies in a 75° arc and cancels their Camouflage and Stalker Surroundings.' },
      mana: [200, 225, 250, 275, 300], duracion: [15, 20, 25, 35, 50], recarga: 20, invocacion: 1, recargaGlobal: 'corta', rango: 25, intervaloArma: true,
      efectos: [debuff({ es: 'Descubre enemigos ocultos', en: 'Reveals hidden enemies' })],
    },
    {
      id: 'confundir', tipo: 'constante',
      nombre: { es: 'Confundir', en: 'Confuse' },
      descripcion: { es: 'El enemigo solo puede usar poderes que hagan daño directo.', en: 'The enemy can only use powers that deal direct damage.' },
      mana: [120, 140, 160, 180, 200], duracion: [8, 10, 12, 15, 20], recarga: 70, invocacion: 1, recargaGlobal: 'corta', rango: 25, bloqueable100: true,
      efectos: [debuff({ es: 'No puede usar poderes que no hagan daño', en: 'Cannot use non-damaging powers' })],
    },
    {
      id: 'entorno-acechador', tipo: 'constante',
      nombre: { es: 'Entorno acechador', en: 'Stalker Surroundings' },
      descripcion: {
        es: 'Vos y los aliados cercanos se vuelven invisibles pero se mueven más lento. Se corta al alejarse del cazador, atacar o usar objetos.',
        en: 'You and nearby allies turn invisible but move slower. Ends when moving away from the hunter, attacking or using objects.',
      },
      mana: [440, 480, 520, 560, 600], duracion: [60, 120, 180, 240, 300], recarga: 360, invocacion: 5, recargaGlobal: 'corta', area: 10,
      efectos: [buff({ es: 'Aliados invisibles además de vos', en: 'Allies made invisible besides you' }, ['1', '2', '3', '4', '5']), contra(EF.velMovimiento, '-40%')],
    },
  ],
};

export const MASCOTAS: Discipline = {
  id: 'mascotas',
  nombre: { es: 'Mascotas', en: 'Pets' },
  poderes: [
    {
      id: 'dominio-natural', tipo: 'directo',
      nombre: { es: 'Dominio natural', en: 'Natural Dominance' },
      descripcion: { es: 'Intentás domar a una criatura para que sea tu mascota.', en: 'You try to tame a creature to make it your pet.' },
      mana: [150, 225, 300, 350, 400], recarga: 25, invocacion: 8, recargaGlobal: 'corta', rango: 20,
      efectos: [buff({ es: 'Doma criaturas hasta nivel', en: 'Tames creatures up to level' }, ['12', '24', '36', '48', '60'])],
    },
    {
      id: 'curar-mascota', tipo: 'directo',
      nombre: { es: 'Curar mascota', en: 'Heal Pet' },
      descripcion: { es: 'Le devolvés salud a tu mascota.', en: 'Restores health to your pet.' },
      mana: [50, 75, 110, 150, 200], recarga: 60, invocacion: 0, recargaGlobal: 'corta', resistible100: true,
      efectos: [buff(EF.saludMascota, ['+250', '+350', '+600', '+1000', '+1400'])],
    },
    {
      id: 'defensa-salvaje', tipo: 'constante',
      nombre: { es: 'Defensa salvaje', en: 'Wild Defense' },
      descripcion: { es: 'Parte del daño que recibís lo absorbe tu mascota.', en: 'Part of the damage you take goes to your pet.' },
      mana: [75, 100, 125, 150, 175], duracion: 30, invocacion: 1, recargaGlobal: 'corta', intervaloArma: true,
      efectos: [buff({ es: 'Daño que pasa a la mascota', en: 'Damage redirected to the pet' }, ['5%', '10%', '15%', '20%', '30%'])],
    },
    {
      id: 'vista-prominente', tipo: 'activable',
      nombre: { es: 'Vista prominente', en: 'Prominent Sight' },
      descripcion: { es: 'Usás los ojos de tu mascota para ver más lejos; ella pega menos por distraerse. Se puede apagar.', en: 'You use your pet’s eyes to see farther; it hits softer while distracted. Can be turned off.' },
      mana: [60, 75, 90, 105, 120], recarga: 20, invocacion: 0, recargaGlobal: 'muy-corta',
      efectos: [buff(EF.rangoAtaque, ['+5%', '+8%', '+12%', '+17%', '+30%']), contra({ es: 'Daño de la mascota', en: 'Pet damage' }, '-25%')],
    },
    {
      id: 'adiestramiento', tipo: 'pasivo',
      nombre: { es: 'Adiestramiento', en: 'Training' },
      descripcion: { es: 'Tu mascota tiene más salud, siempre.', en: 'Your pet has more health, always on.' },
      efectos: [buff(EF.saludMascota, ['+30%', '+45%', '+60%', '+75%', '+100%'])],
    },
    {
      id: 'revivir-mascota', tipo: 'directo',
      nombre: { es: 'Revivir mascota', en: 'Revive Pet' },
      descripcion: { es: 'Revivís a tu mascota. Hay que esperar un rato después de que muera o de conectarte, y se corta si te atacan mientras lo invocás.', en: 'Brings your pet back to life. You must wait a while after it dies or after logging in, and it is interrupted if you are attacked while casting.' },
      mana: [320, 340, 360, 380, 400], recarga: 60, invocacion: 5, recargaGlobal: 'corta',
      efectos: [buff({ es: 'Salud con la que vuelve', en: 'Health it returns with' }, ['20%', '40%', '60%', '80%', '100%'])],
    },
    {
      id: 'colera-bestial', tipo: 'directo',
      nombre: { es: 'Cólera bestial', en: 'Bestial Wrath' },
      descripcion: { es: 'Tu mascota entra en furia: pega más fuerte pero deja de esquivar.', en: 'Your pet goes into a rage: it hits harder but stops dodging.' },
      mana: [200, 225, 250, 275, 300], duracion: 60, recarga: 60, invocacion: 1.5, recargaGlobal: 'corta',
      efectos: [buff({ es: 'Daño de la mascota', en: 'Pet damage' }, ['+10%', '+20%', '+30%', '+40%', '+50%']), contra({ es: 'Evasión de la mascota', en: 'Pet evasion' }, '-100%')],
    },
    {
      id: 'armadura-natural', tipo: 'pasivo',
      nombre: { es: 'Armadura natural', en: 'Natural Armor' },
      descripcion: { es: 'Tu mascota tiene más protección, siempre.', en: 'Your pet has more protection, always on.' },
      efectos: [buff({ es: 'Protección de la mascota', en: 'Pet protection' }, ['+10%', '+15%', '+20%', '+25%', '+30%'])],
    },
    {
      id: 'furia-natural', tipo: 'directo',
      nombre: { es: 'Furia natural', en: 'Nature’s Fury' },
      descripcion: { es: 'Tu mascota provoca una explosión alrededor que daña y derriba 3 segundos.', en: 'Your pet sets off an explosion around it that damages and knocks down for 3 seconds.' },
      mana: [120, 210, 300, 390, 480], recarga: 180, invocacion: 2, recargaGlobal: 'corta', area: 10, intervaloArma: true,
      efectos: [dano(EF.danoPunzante, ['175', '280', '410', '555', '750']), dano(EF.danoFuego, ['125', '200', '290', '395', '500']), debuff(EF.noquear)],
    },
    {
      id: 'coraza-de-la-bestia', tipo: 'constante',
      nombre: { es: 'Coraza de la bestia', en: 'Skin of the Beast' },
      descripcion: { es: 'A tu mascota le entra mucho menos daño por un rato.', en: 'Your pet takes much less damage for a while.' },
      mana: [225, 250, 275, 300, 325], duracion: 15, recarga: 60, invocacion: 0, recargaGlobal: 'muy-corta',
      efectos: [buff({ es: 'Resistencia al daño de la mascota', en: 'Pet damage resistance' }, ['+40%', '+50%', '+60%', '+70%', '+80%'])],
    },
  ],
};

export const CAZADOR_WM: Discipline = {
  id: 'cazador-wm',
  nombre: { es: 'Cazador WM', en: 'Hunter WM' },
  warmaster: true,
  poderes: [
    {
      id: 'concilio-de-guerra', tipo: 'pasivo',
      nombre: { es: 'Concilio de guerra', en: 'War Council' },
      descripcion: { es: 'Un idioma de guerra para hablar en secreto con otros Warmasters.', en: 'A war language to talk in secret with other Warmasters.' },
      efectos: [buff(EF.chatGuerra)],
    },
    {
      id: 'cuerno-del-viento', tipo: 'constante',
      nombre: { es: 'Cuerno del viento', en: 'Horn of the Wind' },
      descripcion: { es: 'Los aliados de alrededor corren más rápido. Hacen falta al menos 4 aliados cerca.', en: 'Allies around you run faster. Needs at least 4 allies nearby.' },
      mana: 100, duracion: 30, recarga: 60, invocacion: 0, recargaGlobal: 'muy-corta', area: 10,
      efectos: [buff(EF.velMovimiento, '+20%')],
    },
    {
      id: 'maestria-de-guerra', tipo: 'pasivo',
      nombre: { es: 'Maestría de guerra', en: 'Warmaster’s Might' },
      descripcion: { es: 'Más atributo principal de tu clase, siempre.', en: 'More of your class’s main attribute, always on.' },
      efectos: [buff(EF.atributoClase, '+15%')],
    },
    {
      id: 'lider-de-la-manada', tipo: 'constante',
      nombre: { es: 'Líder de la manada', en: 'Head of the Pack' },
      descripcion: { es: 'Más daño por un rato. Hace falta al menos 1 aliado cerca.', en: 'More damage for a while. Needs at least 1 ally nearby.' },
      mana: 250, duracion: 30, recarga: 120, invocacion: 0, recargaGlobal: 'muy-corta', area: 10,
      efectos: [buff(EF.bonusDanoArma, '+10%')],
    },
    {
      id: 'sangre-de-warmaster', tipo: 'pasivo',
      nombre: { es: 'Sangre de Warmaster', en: 'Warmaster Blood' },
      descripcion: { es: 'Salud máxima extra, siempre.', en: 'Extra maximum health, always on.' },
      efectos: [buff(EF.salud, '+500')],
    },
  ],
};

export const CAZADOR: SubclassTrainer = {
  subclase: 'Cazador',
  disciplinas: [...DISCIPLINAS_ARQUERO, EXPLORACION, MASCOTAS, CAZADOR_WM],
};
