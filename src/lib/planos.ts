/**
 * Preços do produto, em centavos: fonte única para o que é cobrado, o que aparece no site
 * (landing, Plano, Termos) e o que vai na mensagem de WhatsApp. Os produtos do AbacatePay
 * (scripts/produtos-abacatepay.mjs) repetem estes números, e src/lib/precos.test.ts falha se
 * eles se afastarem: ao mudar um preço, mude lá também e rode o script de conferência.
 */
export const SETUP_CENTAVOS = 49_900;
export const MONITORAMENTO_CENTAVOS = 2_900;

/** O máximo de classes num pedido só (cada classe é um protocolo no INPI). */
export const MAX_CLASSES = 5;

/**
 * Lê uma lista de classes ("30,35") e devolve as classes válidas (1 a 45), sem repetir e no
 * máximo `MAX_CLASSES`. Texto fora do formato dá lista vazia.
 */
export function listarClasses(valor: unknown): string[] {
  if (typeof valor !== "string" && !Array.isArray(valor)) return [];
  const itens = typeof valor === "string" ? valor.split(",") : valor;
  const vistas = new Set<string>();
  for (const item of itens) {
    if (typeof item !== "string" || !/^\d{1,2}$/.test(item.trim())) return [];
    const n = Number(item);
    if (n < 1 || n > 45) return [];
    vistas.add(String(n));
  }
  return vistas.size <= MAX_CLASSES ? [...vistas] : [];
}

/** Quantas classes (protocolos) tem o pedido; no mínimo 1. */
export function contarClasses(valor: unknown): number {
  return Math.max(1, listarClasses(valor).length);
}

/**
 * O total do pagamento único: cada classe é um protocolo, com o seu serviço e a sua taxa do INPI.
 * O preço sai daqui, no servidor, e nunca do navegador.
 */
export function totalDoPedido(gruCentavos: number, classes = 1): number {
  return Math.max(1, classes) * (SETUP_CENTAVOS + gruCentavos);
}

/** "R$ 499" (sem os centavos quando são ",00"), para os textos de venda. */
export function fmtReaisCurto(centavos: number): string {
  return fmtReais(centavos).replace(/,00$/, "");
}

export function fmtReais(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
