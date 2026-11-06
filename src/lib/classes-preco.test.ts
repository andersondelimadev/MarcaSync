import { describe, expect, it } from "vitest";
import { MAX_CLASSES, SETUP_CENTAVOS, contarClasses, listarClasses, totalDoPedido } from "./planos";
import { valorDoPacote } from "./pacotes";

describe("listarClasses", () => {
  it("lê uma lista separada por vírgula, sem repetir", () => {
    expect(listarClasses("30,35")).toEqual(["30", "35"]);
    expect(listarClasses("30,30,35")).toEqual(["30", "35"]);
    expect(listarClasses(["09", "42"])).toEqual(["9", "42"]);
  });

  it("recusa o que não é classe de Nice", () => {
    expect(listarClasses("0")).toEqual([]);
    expect(listarClasses("46")).toEqual([]);
    expect(listarClasses("30,abc")).toEqual([]);
    expect(listarClasses("")).toEqual([]);
    expect(listarClasses(null)).toEqual([]);
    expect(listarClasses(30)).toEqual([]);
  });

  it(`aceita no máximo ${MAX_CLASSES} classes`, () => {
    expect(listarClasses("1,2,3,4,5")).toHaveLength(5);
    expect(listarClasses("1,2,3,4,5,6")).toEqual([]);
  });
});

describe("contarClasses e totalDoPedido", () => {
  it("conta pelo menos 1 classe", () => {
    expect(contarClasses(null)).toBe(1);
    expect(contarClasses("30")).toBe(1);
    expect(contarClasses("30,35,43")).toBe(3);
  });

  it("cobra o serviço e a taxa do INPI de cada classe", () => {
    const gru = 44_000;
    expect(totalDoPedido(gru, 1)).toBe(SETUP_CENTAVOS + gru);
    expect(totalDoPedido(gru, 2)).toBe(2 * (SETUP_CENTAVOS + gru));
    expect(totalDoPedido(gru, 3)).toBe(3 * (SETUP_CENTAVOS + gru));
    expect(totalDoPedido(gru, 0)).toBe(SETUP_CENTAVOS + gru);
    expect(valorDoPacote(gru, 2)).toBe(totalDoPedido(gru, 2));
  });

  it("duas classes com desconto de 50% dão R$ 1.878", () => {
    expect(totalDoPedido(44_000, 2)).toBe(187_800);
  });
});
