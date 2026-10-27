/**
 * Correcciones de texto en español para claves que tambien son datos guardados (tipos de
 * bonus de armas, joyas y armaduras, velocidades, etc.). La clave no se puede cambiar sin romper
 * lo que ya esta en localStorage o en codigos compartidos, asi que solo se corrige lo que se muestra.
 */
export const ES: Record<string, string> = {
  'Baculo': 'Báculo',
  'Chance de critico %': 'Chance de crítico %',
  'Concentracion': 'Concentración',
  'Constitucion': 'Constitución',
  'Dano Aplastante': 'Daño Aplastante',
  'Dano Cortante': 'Daño Cortante',
  'Dano Eléctrico': 'Daño Eléctrico',
  'Dano Fuego': 'Daño Fuego',
  'Dano Hielo': 'Daño Hielo',
  'Dano Punzante': 'Daño Punzante',
  'Dano critico %': 'Daño crítico %',
  'Rapida': 'Rápida',
  'Vel ataque %': 'Vel. ataque %',
  'raw:': 'bruto:',
};
