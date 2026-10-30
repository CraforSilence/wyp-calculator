import { NextResponse } from 'next/server';
import { parseWarStatus, officialUrl, WORLDS, type World } from '@/lib/war';

// Lee la página oficial de estado de guerra y la devuelve como JSON. El navegador no la
// puede leer directo (no tiene CORS), por eso pasa por acá. El fetch y la respuesta se
// cachean 60 s para no pegarle a la oficial con cada visita.

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const world = (WORLDS as readonly string[]).includes(params.get('world') ?? '') ? (params.get('world') as World) : 'ra';
  const lang = params.get('lang') === 'en' ? 'en' : 'es';

  try {
    const res = await fetch(officialUrl(world, lang), {
      headers: { 'user-agent': 'WypForge (+https://wypforge.vercel.app)' },
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // La oficial está en ISO-8859-1
    const html = new TextDecoder('latin1').decode(await res.arrayBuffer());
    const status = parseWarStatus(html, world);
    return NextResponse.json(status, {
      headers: { 'cache-control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 502, headers: { 'cache-control': 'no-store' } },
    );
  }
}
