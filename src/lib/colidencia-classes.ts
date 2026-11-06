/**
 * Recalcula, no navegador, o que depende das classes que a pessoa escolheu: quais marcas parecidas
 * são "do mesmo ramo" e o nível de colisão. É a mesma conta do servidor (`calcularColidencia`),
 * sem refazer a busca no INPI.
 */
import type { ColidenciaResultado } from "./colidencia";
import { mesmaAreaEmAlguma } from "./classes";
import { CLASSES_NICE } from "./classes-nice";
import { calcularRisco } from "./risco-area";

export function aplicarClasses(
  colidencia: ColidenciaResultado,
  escolhidas: string[]
): ColidenciaResultado {
  const confianca = escolhidas.length > 0 ? "alta" : "baixa";
  const matches = colidencia.matches.map((m) => ({
    ...m,
    mesmaArea: mesmaAreaEmAlguma(m.classe, escolhidas, confianca),
  }));
  const primeira = escolhidas[0];
  return {
    ...colidencia,
    matches,
    top: matches[0] ?? null,
    risco: calcularRisco(matches),
    classesEscolhidas: escolhidas,
    ncl: primeira
      ? { code: primeira, label: CLASSES_NICE[primeira] ?? colidencia.ncl.label, confidence: "alta" }
      : { ...colidencia.ncl, confidence: "baixa" },
  };
}
