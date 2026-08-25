
Daño

//---------------------------------------
// Constantes que afectan a las fórmulas
//---------------------------------------

// Bonus de Atributo (BA). Primero se toma en cuenta la subclase, y si no hay subclase presente, usa la clase.
attribute_bonus =

Bárbaro: (STR - 20) * 2.0
Guerrero: (STR - 20) * 1.5
Tirador: (DXT - 20) * 1.5
Arquero: (DXT) - 20) * 1
Brujo: (INT - 20) * 1.75
Mago: (INT - 20) * 1.3

//------------------------------
// PASO 1. Obtener Daño de Arma
//------------------------------

// a. Obtener el daño mínimo y máximo del daño nominal del arma (visto en el tooltip del arma). Aquí también se agrega todo daño de modificadores "Daño [tipo] +X" (tal como Esgrimes Precisos, por ejemplo).
total_damage_min = sum(weapon_damage[type].min)
total_damage_max = sum(weapon_damage[type].max)

// b. Aplicar el Daño de Arma por Tipo % que se ve en los poderes como "Daño  +%".
weapon_damage[type].min += weapon_damage[type].min / 100 * weapon_percent_bonus[type]
weapon_damage[type].max += weapon_damage[type].max / 100 * weapon_percent_bonus[type]

//-------------------------
// PASO 2. Factor de Bonus
//-------------------------

// a. Obtener el daño extra. Este se compone del Bonus de Atributo (BA) y del Bonus de Calidad-Material-Tipo (BCMT, que se ven en el tooltip como (+X)).
extra_damage_per_type[type] = attribute_bonus + BCMT

// b. El daño extra necesita ser calculado en relación a cada tipo individual de daño, así de esta forma se distribuye proporcionalmente.
extra_damage_per_type[type] = extra_damage_per_type[type] * (weapon_damage[type].max / total_damage_max)

//-------------------------------
// PASO 3. Obtener el daño final
//-------------------------------

// a. Iterar por todos los tipos de daño (Cortante, Punzante, Aplastante, Fuego, Hielo, Electricidad), haciendo aleatoria la diferencia entre el mínimo y el máximo.
resulting_damage[type] = weapon_damage[type].min + random(weapon_damage[type].max - weapon_damage[type].min)

// b. Aplicar el modificador Daño de Arma %, encontrado mayormente en poderes como "Daño de Arma +%" y aplica a todos los tipos de daño.
resulting_damage[type] += resulting_damage[type] / 100 * weapon_damage_percent

// c. Agregar el daño extra por tipo de daño
resulting_damage[type] += extra_damage_per_type[type]

// d. Agregar los modificadores Bonus de Daño, ambos no porcentual y porcentual. Estos pueden ser encontrados en los poderes como "Bonus de Daño +X" o "Bonus de Daño +%".
resulting_damage[type] = (resulting_damage[type] + damage_bonus) * (1 + (damage_bonus_percent / 100))

// e. Sumar todos los tipos de daño y agregar los "Bonus de Daño [tipo] +X" (que se encuentran mayormente en las gemas mágicas engarzadas en los items). Es considerado como "daño especial" y será absorbido sólo por la armadura con un procedimiento aparte y casi al final del cálculo de reducción de daño.
resulting_damage[type] = sum(resulting_damage[type]) + sum(special_damage[type])

// f. Redondear el daño resultante
resulting_damage[type] = floor(resulting_damage[type])

//-------------------------------------------
// Obtener los datos de la Hoja de Personaje
//-------------------------------------------

Para obtener el daño potencial que se muestra en la Hoja de Personaje, sólo reemplazar el daño inicial en el punto 3.a directamente con el mínimo, continuar calculando hasta obtener el daño resultante mínimo y luego repetir desde el punto 3.a de nuevo con el máximo.

//-------------------
// Daño: Caso de Uso
//-------------------

Espada Ancestral de Dos Manos de Magnanita (Arcana)

1.a)
total_damage_min = 323
total_damage_max = 351

1.b)
weapon_damage[slashing].min = 323
weapon_damage[slashing].max = 351

Agregar pasiva Atlético +10% Daño Cortante:

weapon_damage[slashing].min += 323 / 100 * 10 = 355.3
weapon_damage[slashing].max += 351 / 100 * 10 = 386.1

2.a)
// Stats del personaje sin equipar el arma
89 DXT + Maestría de Guerra +15% = 102.35 DXT

attribute_bonus = (102.35 - 20) * 2 = 164.7

extra_damage_per_type[slashing] = (164.7 + 69) = 233.7

2.b)
extra_damage_per_type[slashing] = 233.7 * (386.1 / 351) = 257.07

3.a)
resulting_damage[slashing].min = 355.3
resulting_damage[slashing].max = 386.1

3.b)
resulting_damage[slashing].min += 355.3 / 100 * 0 = 355.3
resulting_damage[slashing].max += 386.1 / 100 * 0 = 386.1

3.c)
resulting_damage[slashing].min += 257.07 = 612.37
resulting_damage[slashing].max += 257.07 = 643.17

3.d)
Add Fulminating Active
resulting_damage[slashing].min = 612.37 * (1 + (50/100)) = 918.555
resulting_damage[slashing].max = 643.17 * (1 + (50/100)) = 964.755

3.e)
resulting_damage[slashing].min = 918.555 + 0 = 918.555
resulting_damage[slashing].max = 964.755 + 0 = 964.755

3.f)
resulting_damage[slashing].min = floor(918.555) = 918
resulting_damage[slashing].max = floor(964.755) = 964



Armadura y Resistencias

La Armadura es la primera reducción de daño, tomada como "protección". Esto deriva en "daño protegido", luego el jugador recibe el daño en su cuerpo y la "resistencia" reduce el "daño protegido".

//---------------------------------------
// Constantes que afectan a las fórmulas
//---------------------------------------

[Clase de Armadura]

// Estas no son tan diferentes entre subclases porque ellas se diferencian más a través de los poderes que del equipamiento. Pero esta excepción llegará a un fin, ya que la Clase de Armadura (CA) va a quedar oficializada y será tomada en cuenta para el balance.

Guerrero: 1.40
Arquero: 1.30
Mago: 1.20

Bárbaro: 1.40
Caballero: 1.40
Cazador: 1.30
Tirador: 1.35
Conjurador: 1.20
Brujo: 1.20

Por defecto: 1.30
Monstruos: 0.26

[Distribución del Item]

// Cada parte contribuye en diferentes porcentajes de los Puntos Base de Armadura (PBA) a los Puntos de Armadura (PA).

Torso: 28%
Cabeza: 24%
Piernas: 20%
Brazos: 16%
Guanteletes: 12%
Escudo: 25%
Mano derecha: 20%

Pechera: Torso
Túnica: Torso, Brazos, Piernas
Casco/Sombrero: Cabeza
Perneras: Piernas
Hombreras: Brazos
Guanteletes: Guanteletes
Escudo: Escudo
Brazalete: Mano derecha

[Factores de Calidad de Protección]

Muy Mala: 0.2
Mala: 0.35
Normal: 0.5
Buena: 0.65
Muy Buena: 0.8

//----------------------------
// PASO 1. Obtener Protección
//----------------------------

// a. Protección por tipo de daño (tipo). Calculado de la PBA ("Armadura: X", como se muestra en el tooltip) fraccionado por el porcentaje de la parte de armadura y cómo contribuye a la armadura total (Distribución de Item) y afectada por el Factor de Protección (FP).
protection[type] = ceil(armor_base_points * (item_distribution / 100) * protection_factor)

// b. Agregar el Bonus de Calidad-Material-Tipo (BCMT) a todos los tipos de daño. Este valor es encontrado luego del PBA mostrado como "(+X)"
protection[type] += BCMT

// c. Agregar el bonus porcentual que es específico a cada tipo de daño. Esto se usa en raras ocasiones o no se usa.
protection[type] += protection[type] * {Bonus de Protección a (Tipo) %} / 100

// d. Agregar el bonus porcentual relacionado a todos los daños a la vez. Este modificador lo encuentran como "Protección: X%" en el tooltip.
protection[type] += protection[type] * {Bonus de Armadura %} / 100

// e. Multiplicar por la CA
protection[type] *= armor_class

//-------------------------------------
// PASO 2. Obtener Resistencias a Daño
//-------------------------------------

// a. Resistencia a Daño por tipo general. Estas son siempre porcentuales y sus tipos pueden ser Mágico o Físico.
general_resistance[general_type] = {Resistencia a Daño Físico/Mágico %}

// b. Resistencia a Daño por tipo. Estos son los tipos de daño individual.
resistance[type] = {Resistencia a Daño (Tipo) %}

//---------------------------
// PASO 3. Reducción de Daño
//---------------------------

// a. En el caso de múltiples tipos de daño, se calcula la influencia de cada uno en el total de daño generado para reducir el daño correctamente. También, obtener el daño mínimo, que puede ser de 4% a 8%. Esto aplica a cada daño individual.
protection_influence[type] = (100 / total_damage) * damage[type]
minimum_damage_percent = 4 + random(0,4)
minimum_damage[type] = damage[type] / 100 * minimum_damage_percent

// b. Reducir el daño por protección.
damage[type] -= protection[type] * (protection_influence / 100)

// c. Reducir el daño por tipo general de resistencia porcentual.
damage[type] -= damage[type] * general_resistance[general_type] / 100

// d. Reducir el daño por tipo individual porcentual.
damage[type] -= damage[type] * resistance[type] / 100

// e. Asegurarse que ya en este paso el daño por tipo no es menor al daño mínimo.
if damage[type] < minimum_damage[type] then damage[type] = minimum_damage[type]

// f. Reducir el daño especial que proviene de "Bonus de Daño (Type) +X" usualmente encontrado en gemas. Este daño sólo es reducido por la armadura dependiendo en el Factor de Protección y luego agregado al daño normal.
special_damage[type] = ceil(special_damage[type] - (special_damage[type] * PF[type]))

// g. Obtener el daño total sumando todos los tipos de daño y luego sumarle también el daño especial.
total_damage = sum(damage[type]) + sum(special_damage[type])

// h. Reducir el daño por puntos de barrera mágica. Usualmente, la barrera mágica afecta a todos los daños. También reducir el total que ya obtuvimos en el paso anterior.
damage[type] -= barrier_points[type]
total_barrier_points = sum(barrier_points[type])
total_damage -= total_barrier_points

// i. Aplicar la reducción por "Daño de Rango Recibido %" o "Daño Melee Recibido %", si corresponde. (Rango se toma como 3 metros o más).
reduced_damage = total_damage - (total_damage * (ranged_damage || melee_damage) / 100))

// j. Redondear el daño total reducido.
reduced_damage = ceil(reduced_damage)

//---------------------------------------
// Protección, Resistencias: Caso de Uso
//---------------------------------------

Armadura Warmaster de Bárbaro de Aleación de Acero (Artesano) - Tipo: Común - Recibiendo Daño: 410 Punzante y 15 Bonus de Daño de Fuego de una gema en el arma.

PBA: 235
FP[punzante]: Buena
FP[fuego]: Muy Mala
BCMT: 11

1.a,b,c,d,e)
Yelmo: (ceil(235 * (0.24) * 0.65) + 11) * 1.4 = 67.2
Torso: (ceil(235 * (0.28) * 0.65) + 11) * 1.4 = 75.6
Hombreras: (ceil(235 * (0.16) * 0.65) + 11) * 1.4 = 50.4
Guanteletes: (ceil(235 * (0.12) * 0.65) + 11) * 1.4 = 42
Perneras: (ceil(235 * (0.20) * 0.65) + 11) * 1.4 = 58.8

protection[punzante] = 294

2.a,b)
general_resistance[general_type] = 0

Agregar Pasiva Temple de Acero 10% Resistencia a Daño Punzante
resistance[punzante] = 10

3.a)
protection_influence[punzante] = 100 / 410 * 410 = 1
minimum_damage_percent = 4 + 0
minimum_damage[punzante] = 410 / 100 * 4 = 16.4

3.b)
damage[punzante] = 410
damage[punzante] -= 294 * (100/100) = 116

3.c)
damage[punzante] -= 116 * 0 / 100 = 116

3.d)
damage[punzante] -= 116 * 10 / 100 = 104.4

3.e)
116.4 > 16.4

3.f)
special_damage[fire] = special_damage[fire] - (special_damage[fire] * PF[fire]) = 15 - (15 * 0.2) = 12
damage[fire] = 12

3.g)
total_damage = 104.4 + 12 = 116.4

3.h)
damage[type] -= 0
total_barrier_points = 0
total_damage -= 0

3.i)
reduced_damage = 116.4 - (116.4 * 0 / 100) = 116.4

3.j)
reduced_damage = ceil(116.4) = 117
