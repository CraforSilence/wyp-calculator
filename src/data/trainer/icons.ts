import type { PowerBadge, PowerBg, PowerGlyph, PowerIconSpec } from '@/components/icons/PowerIcons';

/** Ícono de cada poder y disciplina, por id. Los que faltan muestran las iniciales. */
const i = (bg: PowerBg, glyph: PowerGlyph, badge?: PowerBadge): PowerIconSpec => ({ bg, glyph, ...(badge ? { badge } : {}) });

export const DISCIPLINE_ICONS: Record<string, PowerIconSpec> = {
  // Guerrero
  'armas-cortantes': i('ataque', 'cortante'),
  'armas-aplastantes': i('ataque', 'aplastante'),
  'armas-punzantes': i('ataque', 'punzante'),
  tacticas: i('apoyo', 'concentracion'),
  // Caballero
  vanguardia: i('defensa', 'bandera'),
  escudos: i('defensa', 'escudo'),
  'caballero-wm': i('apoyo', 'w'),
  // Bárbaro
  'gritos-de-guerra': i('apoyo', 'grito'),
  'armas-a-dos-manos': i('ataque', 'hacha'),
  'barbaro-wm': i('apoyo', 'w'),
  // Arquero
  'arcos-cortos': i('ataque', 'arco'),
  'arcos-largos': i('ataque', 'punzante'),
  trucos: i('control', 'abrojo'),
  evasion: i('defensa', 'viento'),
  // Cazador
  exploracion: i('apoyo', 'concentracion'),
  mascotas: i('curacion', 'pata'),
  'cazador-wm': i('apoyo', 'w'),
  // Tirador
  'maestria-en-flechas': i('magia', 'punzante'),
  'maestria-en-punteria': i('ataque', 'area'),
  'tirador-wm': i('apoyo', 'w'),
  // Mago
  mental: i('control', 'espiral'),
  'control-de-mana': i('magia', 'mana'),
  'maestria-en-baculos': i('magia', 'orbe'),
  encantamientos: i('apoyo', 'inteligencia'),
  // Conjurador
  vida: i('curacion', 'curacion'),
  invocacion: i('control', 'demonio'),
  hechiceria: i('defensa', 'resistMagico'),
  'conjurador-wm': i('apoyo', 'w'),
  // Brujo
  arcania: i('magia', 'cristal'),
  nigromancia: i('control', 'calavera'),
  elementos: i('ataque', 'fuego'),
  'brujo-wm': i('apoyo', 'w'),
};

export const POWER_ICONS: Record<string, PowerIconSpec> = {
  // Armas cortantes
  carga: i('ataque', 'cortante'),
  'esgrimes-precisos': i('apoyo', 'cortante', 'arriba'),
  incapacitar: i('control', 'moveSpeed', 'abajo'),
  atletico: i('pasivo', 'cortante', 'mana'),
  'cruz-del-sur': i('ataque', 'espadasCruzadas'),
  choque: i('control', 'critChance', 'abajo'),
  arrasador: i('ataque', 'cortante', 'area'),
  'piel-de-hierro': i('pasivo', 'escudo', 'aplastante'),
  'ataque-fatal': i('control', 'gota', 'abajo'),
  tifon: i('ataque', 'giro'),

  // Armas aplastantes
  'impacto-vigoroso': i('ataque', 'aplastante'),
  'impactos-brutales': i('apoyo', 'aplastante', 'arriba'),
  'rompe-costillas': i('control', 'aplastante', 'cadena'),
  'anatomia-letal': i('pasivo', 'aplastante', 'arriba'),
  triturador: i('control', 'constitucion', 'abajo'),
  ejecucion: i('apoyo', 'critChance', 'arriba'),
  'aplasta-mentes': i('control', 'aplastante', 'no'),
  'temple-de-acero': i('pasivo', 'escudo', 'punzante'),
  'rompe-quijadas': i('control', 'aplastante', 'espiral'),
  'golpe-de-trueno': i('ataque', 'electrico', 'estrellas'),

  // Armas punzantes
  destripador: i('ataque', 'punzante'),
  'maniobras-agiles': i('apoyo', 'punzante', 'arriba'),
  balestra: i('control', 'punzante', 'cadena'),
  versatilidad: i('pasivo', 'punzante', 'vida'),
  riposte: i('ataque', 'espadasCruzadas', 'mana'),
  empalamiento: i('ataque', 'punzante', 'gota'),
  'perfora-cerebros': i('control', 'punzante', 'castSpeed'),
  flexibilidad: i('pasivo', 'escudo', 'cortante'),
  'estocada-multiple': i('ataque', 'punzante', 'area'),
  'golpe-relampago': i('ataque', 'electrico', 'espiral'),

  // Tácticas
  puntapie: i('control', 'moveSpeed', 'caida'),
  cautela: i('defensa', 'escudo', 'arriba'),
  degollador: i('ataque', 'calavera'),
  'defensa-marcial': i('pasivo', 'critChance', 'abajo'),
  'preparacion-rigurosa': i('defensa', 'figura', 'cadena'),
  reves: i('control', 'fuerza', 'espiral'),
  embestida: i('apoyo', 'moveSpeed', 'aplastante'),
  intimidar: i('control', 'grito', 'moveSpeed'),
  inhabilitar: i('control', 'bloqueo', 'abajo'),
  'reflejos-marciales': i('apoyo', 'critChance', 'escudo'),

  // Vanguardia
  retar: i('control', 'grito', 'abajo'),
  provocar: i('control', 'critDmg'),
  finta: i('control', 'caida'),
  'temple-de-protector': i('pasivo', 'constitucion', 'arriba'),
  'instancia-ofensiva': i('apoyo', 'espadasCruzadas', 'arriba'),
  'soporte-defensivo': i('defensa', 'escudo', 'espiral'),
  'piel-de-troll': i('defensa', 'vida', 'arriba'),
  'furor-del-caballero': i('apoyo', 'moveSpeed', 'arriba'),
  'presencia-heroica': i('defensa', 'escudo', 'area'),
  'ejercito-de-uno': i('defensa', 'figura', 'escudo'),

  // Escudos
  bloqueo: i('defensa', 'bloqueo'),
  avasallar: i('control', 'bloqueo', 'espiral'),
  'proteger-aliado': i('curacion', 'figura', 'no'),
  'bloqueo-preciso': i('defensa', 'bloqueo', 'arriba'),
  'instancia-defensiva': i('defensa', 'escudo', 'no'),
  'manto-etereo': i('defensa', 'resistMagico', 'figura'),
  'muro-protector': i('defensa', 'muro'),
  firmeza: i('pasivo', 'moveSpeed', 'escudo'),
  'escudo-estelar': i('defensa', 'resistMagico', 'area'),
  'barrera-deflectora': i('defensa', 'muro', 'punzante'),

  // Warmaster (compartidos entre subclases)
  'concilio-de-guerra': i('apoyo', 'w'),
  'maestria-de-guerra': i('pasivo', 'atributoClase'),
  'sangre-de-warmaster': i('pasivo', 'vida'),
  // Caballero WM
  'asistencia-del-paladin': i('defensa', 'figura', 'bloqueo'),
  bendecido: i('curacion', 'curacion'),

  // Gritos de guerra
  coloso: i('apoyo', 'fuerza', 'arriba'),
  frenesi: i('defensa', 'resistFisico', 'arriba'),
  'corten-sus-cabezas': i('apoyo', 'grito', 'espada'),
  'sed-de-sangre': i('apoyo', 'gota', 'attackSpeed'),
  'rugido-desafiante': i('apoyo', 'grito', 'castSpeed'),
  'bramido-ensordecedor': i('control', 'grito', 'estrellas'),
  berserk: i('ataque', 'critDmg', 'arriba'),
  'fuerza-sobrecogedora': i('pasivo', 'fuerza', 'arriba'),
  retorno: i('apoyo', 'moveSpeed', 'punzante'),
  desquiciamiento: i('defensa', 'figura', 'no'),

  // Armas a dos manos
  amenaza: i('apoyo', 'critDmg', 'area'),
  'golpe-espiritual': i('ataque', 'hacha', 'rango'),
  despedazar: i('ataque', 'hacha', 'mana'),
  'ataque-bestial': i('ataque', 'hacha', 'espiral'),
  alarido: i('control', 'grito', 'area'),
  'onda-expansiva': i('ataque', 'aplastante', 'area'),
  desestabilizador: i('control', 'hacha', 'abajo'),
  fulminante: i('ataque', 'hacha', 'arriba'),
  'manos-de-acero': i('pasivo', 'fuerza', 'rango'),
  'furia-de-la-tierra': i('ataque', 'roca', 'caida'),

  // Bárbaro WM
  'bandera-de-warmaster': i('curacion', 'bandera', 'vida'),
  'grito-heroico': i('control', 'grito', 'w'),

  // Arcos cortos
  'disparo-dual': i('ataque', 'arco'),
  'disparo-rapido': i('apoyo', 'arco', 'attackSpeed'),
  'flecha-paralizadora': i('control', 'punzante', 'cadena'),
  ligereza: i('pasivo', 'destreza', 'arriba'),
  meditacion: i('apoyo', 'concentracion', 'arriba'),
  adaptabilidad: i('apoyo', 'critChance', 'arriba'),
  desgarrar: i('ataque', 'punzante', 'gota'),
  duelista: i('pasivo', 'critChance', 'arriba'),
  ralentizar: i('control', 'moveSpeed', 'area'),
  'tiro-de-repeticion': i('ataque', 'arco', 'area'),

  // Arcos largos
  'penetra-escudos': i('ataque', 'punzante', 'escudo'),
  'tiro-parabolico': i('apoyo', 'rango', 'arriba'),
  maniobrabilidad: i('apoyo', 'destreza', 'arriba'),
  'ojo-de-aguila': i('apoyo', 'concentracion', 'punzante'),
  'tiro-al-blanco': i('apoyo', 'critChance', 'punzante'),
  omnipresencia: i('pasivo', 'concentracion', 'arriba'),
  'despedazar-arco': i('ataque', 'punzante', 'constitucion'),
  especialista: i('pasivo', 'weaponDmg'),
  ofuscar: i('control', 'concentracion', 'abajo'),
  'lluvia-de-proyectiles': i('ataque', 'punzante', 'area'),

  // Trucos
  emboscada: i('control', 'caida'),
  'ataque-sorpresivo': i('control', 'escudo', 'abajo'),
  'puno-aturdidor': i('control', 'fuerza', 'estrellas'),
  represalia: i('defensa', 'escudo', 'espadasCruzadas'),
  'toque-pegajoso': i('control', 'attackSpeed', 'abajo'),
  'pelea-sucia': i('ataque', 'fuerza', 'arriba'),
  fineza: i('defensa', 'critChance', 'abajo'),
  centinela: i('pasivo', 'concentracion', 'destreza'),
  'tiro-de-distraccion': i('control', 'punzante', 'estrellas'),
  'flecha-con-abrojos': i('control', 'abrojo', 'area'),

  // Evasión
  esquivar: i('defensa', 'viento', 'cadena'),
  movilidad: i('apoyo', 'moveSpeed', 'arriba'),
  'tacticas-evasivas': i('defensa', 'escudo', 'viento'),
  'reflejos-felinos': i('pasivo', 'viento', 'arriba'),
  acrobatico: i('defensa', 'resistFisico', 'viento'),
  'eludir-conjuros': i('defensa', 'resistMagico', 'viento'),
  escapista: i('defensa', 'viento'),
  astucia: i('pasivo', 'inteligencia', 'arriba'),
  'perfil-bajo': i('defensa', 'invisible', 'no'),
  'hijo-del-viento': i('defensa', 'viento', 'resistMagico'),

  // Exploración
  'flecha-enredadora': i('control', 'punzante', 'moveSpeed'),
  'sentencia-a-muerte': i('control', 'calavera', 'area'),
  'vigilancia-enemiga': i('apoyo', 'concentracion', 'area'),
  'espiritu-salvaje': i('pasivo', 'moveSpeed', 'arriba'),
  camuflaje: i('apoyo', 'invisible'),
  'ligereza-heredada': i('apoyo', 'destreza', 'area'),
  'sangre-fria': i('ataque', 'gota', 'arriba'),
  revelar: i('apoyo', 'concentracion', 'fuego'),
  confundir: i('control', 'espiral', 'no'),
  'entorno-acechador': i('apoyo', 'invisible', 'area'),

  // Mascotas
  'dominio-natural': i('apoyo', 'pata', 'cadena'),
  'curar-mascota': i('curacion', 'pata', 'curacion'),
  'defensa-salvaje': i('defensa', 'pata', 'escudo'),
  'vista-prominente': i('apoyo', 'pata', 'concentracion'),
  adiestramiento: i('pasivo', 'pata', 'vida'),
  'revivir-mascota': i('curacion', 'pata', 'arriba'),
  'colera-bestial': i('ataque', 'pata', 'critDmg'),
  'armadura-natural': i('pasivo', 'pata', 'escudo'),
  'furia-natural': i('ataque', 'pata', 'fuego'),
  'coraza-de-la-bestia': i('defensa', 'pata', 'resistFisico'),

  // Cazador WM
  'cuerno-del-viento': i('apoyo', 'cuerno', 'moveSpeed'),
  'lider-de-la-manada': i('apoyo', 'pata', 'arriba'),

  // Maestría en flechas
  'saetas-recargadas': i('magia', 'punzante', 'arriba'),
  'ola-invernal': i('control', 'hielo', 'punzante'),
  'rafaga-de-viento': i('control', 'viento', 'espiral'),
  'mordida-de-serpiente': i('ataque', 'punzante', 'gota'),
  'fuego-de-ignus': i('ataque', 'fuego', 'punzante'),
  'flecha-eterea': i('magia', 'punzante', 'resistMagico'),
  'explosion-de-agujas': i('ataque', 'cortante', 'area'),
  'proyectil-arcano': i('magia', 'orbe', 'punzante'),
  'lluvia-de-fuego': i('ataque', 'fuego', 'area'),
  'flecha-de-rayo': i('ataque', 'electrico', 'punzante'),

  // Maestría en puntería
  'vista-mortal': i('apoyo', 'concentracion', 'weaponDmg'),
  enfocar: i('apoyo', 'rango', 'concentracion'),
  'perforador-de-piel': i('control', 'escudo', 'punzante'),
  prevision: i('pasivo', 'rango', 'arriba'),
  'maldicion-del-ciclope': i('control', 'concentracion', 'no'),
  'ataque-letal': i('ataque', 'critDmg', 'punzante'),
  'posicion-estrategica': i('defensa', 'reduccionRango'),
  'ojo-entrenado': i('pasivo', 'concentracion', 'critChance'),
  'tiro-buscador': i('control', 'constitucion', 'punzante'),
  'mirada-de-halcon': i('apoyo', 'concentracion', 'attackSpeed'),

  // Tirador WM
  'flecha-de-fuego': i('curacion', 'fuego', 'hielo'),
  'instinto-asesino': i('apoyo', 'area', 'arriba'),

  // Mental
  'misil-arcano': i('ataque', 'orbe', 'fuego'),
  'plaga-de-insectos': i('control', 'insecto'),
  llamarada: i('ataque', 'fuego', 'area'),
  'empuje-mental': i('control', 'espiral', 'moveSpeed'),
  'hiedra-espinosa': i('control', 'hiedra'),
  'dominio-de-la-voluntad': i('control', 'espiral', 'caida'),
  silenciar: i('control', 'grito', 'no'),
  'muro-de-agujas': i('defensa', 'muro', 'punzante'),
  'maestro-del-tiempo': i('control', 'castSpeed', 'area'),
  'masa-devoradora-de-sultar': i('ataque', 'luna', 'gota'),

  // Control de maná
  'barrera-de-energia': i('defensa', 'orbe', 'escudo'),
  'ignicion-de-mana': i('ataque', 'mana', 'fuego'),
  'union-sinergica': i('magia', 'mana', 'figura'),
  'sangre-de-dragon': i('pasivo', 'inteligencia', 'arriba'),
  'prestamo-de-energia': i('magia', 'mana', 'abajo'),
  'sacrificio-ambicioso': i('magia', 'mana', 'vida'),
  'devocion-arcana': i('magia', 'castSpeed', 'arriba'),
  'laguna-de-mana': i('pasivo', 'mana', 'arriba'),
  'comunion-de-mana': i('magia', 'mana', 'area'),
  'pilon-de-mana': i('defensa', 'orbe', 'area'),

  // Maestría en báculos
  'magnificacion-de-fuego': i('magia', 'fuego', 'arriba'),
  'aceleracion-arcana': i('magia', 'attackSpeed', 'arriba'),
  'proyeccion-arcana': i('magia', 'rango', 'arriba'),
  'magia-de-combate': i('pasivo', 'orbe', 'arriba'),
  'campo-estatico': i('control', 'electrico', 'area'),
  'magnificacion-de-hielo': i('magia', 'hielo', 'arriba'),
  'cupula-de-proteccion': i('defensa', 'cupula'),
  'control-metabolico': i('magia', 'orbe', 'critDmg'),
  'magnificacion-de-electricidad': i('magia', 'electrico', 'arriba'),
  'furia-de-evendim': i('ataque', 'mana', 'area'),

  // Encantamientos
  maldicion: i('control', 'luna', 'abajo'),
  'destreza-felina': i('apoyo', 'destreza', 'figura'),
  ceguera: i('control', 'concentracion', 'no'),
  bendicion: i('apoyo', 'atributoClase', 'figura'),
  'fuerza-de-oso': i('apoyo', 'fuerza', 'figura'),
  'bendecir-arma': i('apoyo', 'espada', 'arriba'),
  'disipar-magia': i('curacion', 'resistMagico', 'figura'),
  'astucia-de-zorro': i('apoyo', 'inteligencia', 'figura'),
  torpeza: i('control', 'atributoClase', 'abajo'),
  'disipar-magia-en-masa': i('curacion', 'resistMagico', 'area'),

  // Vida
  'curar-aliado': i('curacion', 'curacion', 'figura'),
  curarse: i('curacion', 'curacion'),
  revivir: i('curacion', 'figura', 'arriba'),
  'regenerar-aliado': i('curacion', 'vida', 'figura'),
  regenerarse: i('curacion', 'vida', 'castSpeed'),
  'intervencion-divina': i('defensa', 'figura', 'atributoClase'),
  salvador: i('curacion', 'curacion', 'arriba'),
  'regeneracion-mayor': i('curacion', 'vida', 'area'),
  'curacion-mayor': i('curacion', 'curacion', 'area'),
  'revivir-en-masa': i('curacion', 'figura', 'area'),

  // Invocación
  'invocar-diablillos': i('control', 'demonio', 'area'),
  'lazo-extraplanar': i('defensa', 'demonio', 'cadena'),
  'invocar-demonio': i('control', 'demonio'),
  'lazo-material': i('pasivo', 'demonio', 'vida'),
  'invocar-zombis': i('control', 'mano'),
  'furia-demoniaca': i('ataque', 'demonio', 'critDmg'),
  'invocar-golem': i('control', 'roca'),
  'armadura-magica': i('pasivo', 'demonio', 'escudo'),
  'bebedor-de-sangre': i('curacion', 'demonio', 'gota'),
  'invocar-lich': i('control', 'calavera', 'orbe'),

  // Hechicería
  'armadura-de-energia': i('defensa', 'escudo', 'orbe'),
  'silueta-cambiante': i('defensa', 'invisible', 'abajo'),
  'escudar-companero': i('defensa', 'escudo', 'figura'),
  'mente-en-blanco': i('defensa', 'espiral', 'no'),
  'espejo-del-karma': i('defensa', 'escudo', 'espadasCruzadas'),
  'barrera-magica': i('defensa', 'resistMagico'),
  'muralla-material': i('defensa', 'resistFisico'),
  santuario: i('defensa', 'cupula', 'figura'),
  introspectiva: i('pasivo', 'castSpeed', 'arriba'),
  'piel-de-acero': i('defensa', 'resistFisico', 'arriba'),

  // Conjurador WM
  'portal-defensivo': i('magia', 'portal', 'escudo'),
  'proteccion-divina': i('curacion', 'escudo', 'curacion'),

  // Arcania
  estalagmita: i('ataque', 'cristal', 'hielo'),
  lentitud: i('control', 'moveSpeed', 'abajo'),
  'petrificar-manos': i('control', 'mano', 'abajo'),
  pereza: i('control', 'weaponDmg', 'abajo'),
  meteorito: i('ataque', 'meteoro'),
  'muro-de-viento': i('defensa', 'viento', 'reduccionRango'),
  'estallido-de-cristales': i('ataque', 'cristal', 'area'),
  fragilidad: i('control', 'resistFisico', 'abajo'),
  'puno-de-golem': i('ataque', 'roca', 'fuerza'),
  'terror-de-sultar': i('ataque', 'calavera', 'caida'),

  // Nigromancia
  vampirismo: i('ataque', 'gota', 'vida'),
  oscuridad: i('control', 'luna', 'no'),
  enfurecer: i('control', 'critDmg', 'abajo'),
  'absorcion-vital': i('pasivo', 'gota', 'vida'),
  'guardias-sadicos': i('control', 'calavera', 'estrellas'),
  'sirvientes-sadicos': i('control', 'calavera', 'mana'),
  'guardian-de-almas': i('ataque', 'calavera', 'vida'),
  cremacion: i('ataque', 'calavera', 'fuego'),
  'poseer-invocacion': i('control', 'demonio', 'espiral'),
  'maestro-de-la-destruccion': i('control', 'luna', 'area'),

  // Elementos
  'bola-de-fuego': i('ataque', 'fuego', 'critChance'),
  'explosion-de-hielo': i('ataque', 'hielo', 'moveSpeed'),
  relampago: i('ataque', 'electrico'),
  'comunion-elemental': i('pasivo', 'resistMagico', 'fuego'),
  paralizar: i('control', 'hielo', 'cadena'),
  'tormenta-helada': i('control', 'hielo', 'estrellas'),
  'exposicion-a-los-elementos': i('control', 'resistMagico', 'abajo'),
  'explosion-de-magma': i('ataque', 'meteoro', 'fuego'),
  tornado: i('control', 'tornado'),
  'invocar-rayos': i('ataque', 'electrico', 'area'),

  // Brujo WM
  'portal-ofensivo': i('magia', 'portal', 'espada'),
  'hiedra-espinosa-en-masa': i('control', 'hiedra', 'area'),
};
