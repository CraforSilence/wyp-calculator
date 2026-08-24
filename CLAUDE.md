@AGENTS.md

# W&P Calculator - Project Rules

## Deploy workflow

El proyecto tiene el hosting en Vercel y el código en GitHub en cuentas distintas.
No están vinculados, así que el flujo es **manual**:

1. **Deploy a Vercel**: `npx vercel --prod` (desde regnum-calc/)
2. **Commit**: crear commits descriptivos con los cambios
3. **Push a GitHub**: `git push origin master`

- **Vercel**: proyecto `wypcalculator` en cuenta `danu-projects`
- **GitHub**: repo `CraforSilence/wyp-calculator`
- **GitHub auth**: usar `gh auth switch -u CraforSilence` si es necesario
- **Remote**: `https://CraforSilence@github.com/CraforSilence/wyp-calculator.git`

## Convenciones de commits

- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `style:` cambios visuales/UI
- `chore:` mantenimiento, assets, config
- `rebrand:` cambios de nombre/identidad
