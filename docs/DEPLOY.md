# Deploy Manual a Vercel

## Requisitos previos

- Node.js instalado
- Estar logueado en Vercel CLI (`npx vercel login` si es la primera vez)

## Deploy a produccion

Desde la carpeta del proyecto (`regnum-calc/`):

```bash
npx vercel --prod
```

El comando sube los archivos, buildea en los servidores de Vercel, y queda live en `wypcalculator.vercel.app`.

## Flujo completo (codigo + deploy)

```bash
# 1. Deploy a Vercel
npx vercel --prod

# 2. Commit de los cambios
git add <archivos>
git commit -m "feat: descripcion del cambio"

# 3. Push a GitHub
git push origin master
```

## Preview (opcional)

Para ver un preview antes de ir a produccion:

```bash
npx vercel
```

Esto genera una URL temporal de preview sin afectar produccion.

## Notas

- Vercel y GitHub son independientes, se puede hacer uno sin el otro
- El build tarda ~30-40 segundos
- URL de produccion: https://wypcalculator.vercel.app
- Proyecto en Vercel: `wypcalculator` (cuenta `danu-projects`)
- Repo en GitHub: `CraforSilence/wyp-calculator`
