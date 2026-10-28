import { expect, type Locator, type Page } from '@playwright/test';

/** Pasos del Build, con el nombre que muestra su pestaña. */
export const STEPS = {
  personaje: 'Personaje',
  arma: 'Arma y Joyería',
  armadura: 'Armadura',
  simulacion: 'Simulación',
} as const;

/** Un `<select>` nativo reconocido por el texto de su opción vacía ("Elegir arma para cargar..."). */
export function selectByPlaceholder(scope: Page | Locator, placeholder: string): Locator {
  return scope.locator('select').filter({ has: scope.locator('option', { hasText: placeholder }) });
}

/** Avanza al paso siguiente con el botón "Continuar con …" del pie. */
export async function continueTo(page: Page, step: string) {
  await page.getByRole('button', { name: `Continuar con ${step}` }).click();
  await expect(page.getByRole('button', { name: step, exact: false }).first()).toBeVisible();
}

/** El panel fijo de la derecha del paso actual ("Daño por golpe" o "Estado de armadura"). */
export function sidePanel(page: Page): Locator {
  return page.locator('aside');
}

/** Elige una opción en un IconSelect (combobox propio, no un `<select>`). */
export async function chooseInCombobox(combobox: Locator, option: string) {
  await combobox.click();
  await combobox.page().getByRole('option', { name: option, exact: true }).click();
}

/** La tarjeta de una joya del Build ("Anillo 1", "Anillo 2", "Amuleto"). */
export function jewelryCard(page: Page, slot: 'Anillo 1' | 'Anillo 2' | 'Amuleto'): Locator {
  return page
    .getByRole('heading', { name: new RegExp(`^${slot}`) })
    .locator('xpath=ancestor::div[contains(@class,"rounded-lg")][1]');
}

/** Agrega un bonus a una joya del Build. */
export async function addJewelryBonus(page: Page, slot: 'Anillo 1' | 'Anillo 2' | 'Amuleto', bonus: string, value: number) {
  const card = jewelryCard(page, slot);
  await card.getByRole('button', { name: /Agregar bonus/ }).click();
  await chooseInCombobox(card.getByRole('combobox').last(), bonus);
  await card.getByRole('spinbutton').last().fill(String(value));
}
