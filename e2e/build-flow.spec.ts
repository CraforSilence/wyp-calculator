import { test, expect, type Page } from '@playwright/test';
import { STEPS, selectByPlaceholder, continueTo, sidePanel, addJewelryBonus } from './helpers';

// Flujo principal del Build: Personaje → Arma y Joyería → Armadura → Simulación.
// Cada test arranca con el navegador limpio (sin localStorage), así que parte del personaje por defecto.
// Los números esperados salen del motor con ese personaje: si cambian las fórmulas, hay que actualizarlos.

const WEAPON = '[G] Martillo de Magnas';
const ARMOR_SET = 'Set de Magnanitas de Caballero';

async function chooseCaballero(page: Page) {
  await page.goto('/build');
  await page.getByRole('button', { name: /Guerrero/ }).click();
  await page.getByRole('button', { name: 'Caballero', exact: true }).click();
}

async function loadWeapon(page: Page) {
  await selectByPlaceholder(page, 'Elegir arma para cargar...').selectOption({ label: WEAPON });
  await expect(page.getByText('✓ cargada')).toBeVisible();
}

async function loadArmor(page: Page) {
  await selectByPlaceholder(page, 'Elegir set para cargar...').selectOption({ label: ARMOR_SET });
}

test.describe('Build', () => {
  test('flujo completo: personaje → arma y joyería → armadura → simulación', async ({ page }) => {
    // 1. Personaje
    await chooseCaballero(page);
    await expect(page.getByRole('button', { name: 'Caballero', exact: true })).toHaveClass(/border-amber-500/);

    // 2. Arma: el panel arranca vacío y muestra el daño al precargar
    await continueTo(page, STEPS.arma);
    const panel = sidePanel(page);
    await expect(panel).toContainText('Cargá un arma');
    await loadWeapon(page);
    await expect(panel).toContainText('Martillo de Magnas');
    await expect(panel).toContainText('390 – 425');
    await expect(panel).toContainText('225.6');

    // Joyería: Fuerza +10 sube el daño
    await addJewelryBonus(page, 'Anillo 1', 'Fuerza', 10);
    await expect(panel).toContainText('Joyería aplicada');
    await expect(panel).toContainText('Fuerza +10');
    await expect(panel).toContainText('405 – 440');
    await expect(panel).toContainText('233.9');

    // 3. Armadura: set precargado y su estado en el panel
    await continueTo(page, STEPS.armadura);
    await loadArmor(page);
    const armorPanel = sidePanel(page);
    await expect(armorPanel).toContainText('6 piezas');
    await expect(armorPanel).toContainText('Prot. física media');
    await expect(armorPanel).toContainText('333');
    await expect(armorPanel).toContainText('480');

    // 4. Simulación ofensiva contra un enemigo con armadura
    await continueTo(page, STEPS.simulacion);
    const presets = page.getByLabel('Cargar set');
    await presets.selectOption({ index: 1 });
    await expect(page.getByText(/Armadura Enemiga \([1-9]\d* piezas\)/)).toBeVisible();
    await page.getByRole('button', { name: /Simular 10 golpes tuyos/ }).click();
    await expect(page.getByRole('heading', { name: /Resultado: daño que le hacés a un .* con tu Martillo de Magnas/ })).toBeVisible();
    await expect(page.getByTestId('sim-hit')).toHaveCount(10);

    // Simulación defensiva: un arma enemiga contra tu armadura
    await page.getByRole('button', { name: /¿Cuánto daño te hacen\?/ }).click();
    await selectByPlaceholder(page, 'Elegir arma...').selectOption({ index: 1 });
    await page.getByRole('button', { name: /Simular 10 golpes del enemigo/ }).click();
    await expect(page.getByRole('heading', { name: /Resultado: daño que recibís/ })).toBeVisible();
    await expect(page.getByTestId('sim-hit')).toHaveCount(10);
  });

  test('el build se conserva al recargar la página', async ({ page }) => {
    await chooseCaballero(page);
    await continueTo(page, STEPS.arma);
    await loadWeapon(page);
    await addJewelryBonus(page, 'Anillo 1', 'Fuerza', 10);
    await expect(sidePanel(page)).toContainText('405 – 440');

    await page.reload();
    // Sigue en el mismo paso, con el arma y la joyería
    await expect(page.getByText('✓ cargada')).toBeVisible();
    await expect(sidePanel(page)).toContainText('Martillo de Magnas');
    await expect(sidePanel(page)).toContainText('405 – 440');
  });

  test('sin arma, la simulación avisa y lleva al paso del arma', async ({ page }) => {
    await page.goto('/build');
    await page.getByRole('button', { name: STEPS.simulacion }).first().click();
    await expect(page.getByText('Para simular tu daño necesitás cargar un arma.')).toBeVisible();
    await page.getByRole('button', { name: 'Cargar arma →' }).click();
    await expect(selectByPlaceholder(page, 'Elegir arma para cargar...')).toBeVisible();
  });

  test('sin armadura, la simulación defensiva avisa y lleva al paso de armadura', async ({ page }) => {
    await page.goto('/build');
    await page.getByRole('button', { name: STEPS.simulacion }).first().click();
    await page.getByRole('button', { name: /¿Cuánto daño te hacen\?/ }).click();
    await expect(page.getByText('Para probar un arma enemiga contra vos necesitás cargar tu armadura.')).toBeVisible();
    await page.getByRole('button', { name: 'Cargar armadura →' }).click();
    await expect(selectByPlaceholder(page, 'Elegir set para cargar...')).toBeVisible();
  });

  test('Bárbaro en modo Duales edita dos armas', async ({ page }) => {
    await page.goto('/build');
    await page.getByRole('button', { name: /Guerrero/ }).click();
    await page.getByRole('button', { name: 'Bárbaro', exact: true }).click();
    await continueTo(page, STEPS.arma);
    await page.getByRole('button', { name: 'Duales', exact: true }).click();
    await expect(page.getByRole('button', { name: /Arma Principal/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Arma Secundaria/ })).toBeVisible();
    await expect(selectByPlaceholder(page, 'Elegir arma para cargar...')).toHaveCount(2);
  });
});
