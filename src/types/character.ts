export type Clase = 'Guerrero' | 'Arquero' | 'Mago';

export type Subclase =
  | 'Bárbaro' | 'Caballero'
  | 'Cazador' | 'Tirador'
  | 'Conjurador' | 'Brujo';

export type MainStat = 'STR' | 'DXT' | 'INT';

export interface CharacterProfile {
  clase: Clase;
  subclase: Subclase;
  stats: {
    STR: number;
    DXT: number;
    INT: number;
  };
  critBase: number;
  critMult: number;
}
