import { defineConfig, devices } from '@playwright/test';

// Pruebas de punta a punta. Levantan `npm run dev` (o reusan el que ya esté corriendo).
const PORT = Number(process.env.PORT ?? 3000);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    // La app elige el idioma según el navegador: se fija en español para que los textos coincidan.
    locale: 'es-AR',
    viewport: { width: 1280, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], locale: 'es-AR', viewport: { width: 1280, height: 900 } } },
  ],
  webServer: {
    command: 'npm run dev',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
