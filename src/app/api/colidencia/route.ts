import { NextResponse } from "next/server";
import { calcularColidencia } from "@/lib/colidencia";
import { barrarSeExceder } from "@/lib/limite-publico";
import { validarRespostas } from "@/lib/questionario-classes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/colidencia?marca=...&descricao=...[&q=<respostas do questionário, em JSON>]
 *
 * Busca de anterioridade unificada: tenta a base real do INPI primeiro,
 * cai pra demonstração de exemplo só se a busca real falhar de verdade —
 * ver `src/lib/colidencia.ts` para a regra completa. Sempre devolve 200
 * com um resultado válido (a própria função interna já trata os dois
 * caminhos), nunca propaga o erro cru da busca real pro cliente.
 */
export async function GET(request: Request) {
  const barrado = barrarSeExceder(request, "buscar");
  if (barrado) return barrado;

  const { searchParams } = new URL(request.url);
  const marca = searchParams.get("marca")?.trim();
  const descricao = searchParams.get("descricao")?.trim() ?? "";

  if (!marca) {
    return NextResponse.json({ error: "Informe ?marca=<nome da marca>." }, { status: 400 });
  }

  if (marca.length > 120 || descricao.length > 2000) {
    return NextResponse.json({ error: "Marca ou descrição grande demais." }, { status: 400 });
  }

  // As respostas do questionário de classes são opcionais; se vierem tortas, são ignoradas.
  const bruto = searchParams.get("q");
  let respostas;
  if (bruto) {
    if (bruto.length > 3000) {
      return NextResponse.json({ error: "Respostas grandes demais." }, { status: 400 });
    }
    try {
      respostas = validarRespostas(JSON.parse(bruto)) ?? undefined;
    } catch {
      respostas = undefined;
    }
  }

  const resultado = await calcularColidencia(marca, descricao, respostas);
  return NextResponse.json(resultado);
}
