import { OFFICIAL_BASE } from '@/lib/war';

// Íconos de reliquias de la página oficial servidos desde nuestro dominio, así la CSP sigue
// con img-src 'self'. Solo acepta ?reliquia=79167 → includes/data_resources/res_79167.png
export async function GET(req: Request) {
  const reliquia = new URL(req.url).searchParams.get('reliquia');
  if (!reliquia || !/^\d{1,8}$/.test(reliquia)) return new Response('Bad request', { status: 400 });

  const maxAge = 86400;
  const res = await fetch(`${OFFICIAL_BASE}/includes/data_resources/res_${reliquia}.png`, { next: { revalidate: maxAge } });
  if (!res.ok) return new Response('Not found', { status: 502 });
  return new Response(res.body, {
    headers: {
      'content-type': res.headers.get('content-type') ?? 'image/png',
      'cache-control': `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
    },
  });
}
