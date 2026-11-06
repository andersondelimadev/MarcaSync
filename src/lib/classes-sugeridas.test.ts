import { describe, expect, it } from "vitest";
import { classesPadrao, sugerirClasses, MAX_CLASSES_SUGERIDAS } from "./classes-sugeridas";
import { RESPOSTAS_VAZIAS } from "./classes-tipos";
import { LIMITE_EXTRA, temRespostas, validarRespostas } from "./questionario-classes";

describe("sugerirClasses", () => {
  it("padaria cai numa classe só", () => {
    const r = sugerirClasses("padaria de bolos e pães");
    expect(r.length).toBeGreaterThanOrEqual(1);
    expect(r[0]?.classe).toBe("30");
  });

  it("descrição sem pista e sem respostas não adivinha classe", () => {
    expect(sugerirClasses("meu negócio")).toEqual([]);
    expect(sugerirClasses("")).toEqual([]);
  });

  it("as respostas do questionário acrescentam classes", () => {
    const sozinha = sugerirClasses("padaria").map((c) => c.classe);
    const comRespostas = sugerirClasses("padaria", {
      escolhas: { negocio: ["comida", "restaurante"] },
      extra: "",
    }).map((c) => c.classe);
    expect(comRespostas).toContain("30");
    expect(comRespostas).toContain("43");
    expect(sozinha).not.toContain("43");
  });

  it("nunca passa do máximo e vem da mais para a menos provável", () => {
    const r = sugerirClasses("roupas, joias, cosméticos, software, restaurante, cursos, transporte", {
      escolhas: { negocio: ["roupa", "joias", "cosmeticos", "tecnologia", "restaurante", "educacao"] },
      extra: "",
    });
    expect(r.length).toBeLessThanOrEqual(MAX_CLASSES_SUGERIDAS);
    expect(new Set(r.map((c) => c.classe)).size).toBe(r.length);
  });

  it("uma classe só é sempre 'provável' e vira o padrão", () => {
    const r = sugerirClasses("padaria");
    if (r.length === 1) expect(r[0]?.nivel).toBe("provavel");
    expect(classesPadrao(r).length).toBeGreaterThanOrEqual(1);
  });

  it("classesPadrao de lista vazia é vazia", () => {
    expect(classesPadrao([])).toEqual([]);
  });
});

describe("validarRespostas", () => {
  it("recusa o que não é objeto", () => {
    expect(validarRespostas(null)).toBeNull();
    expect(validarRespostas("x")).toBeNull();
    expect(validarRespostas([])).toBeNull();
  });

  it("descarta perguntas, opções e tipos que não existem", () => {
    const r = validarRespostas({
      escolhas: { negocio: ["comida", "comida", "inventada", 7], inventada: ["x"], forma: "nao-lista" },
      extra: 5,
    });
    expect(r?.escolhas).toEqual({ negocio: ["comida"] });
    expect(r?.extra).toBe("");
  });

  it("limpa e corta o texto livre", () => {
    const r = validarRespostas({ escolhas: {}, extra: `  ${"a".repeat(LIMITE_EXTRA + 50)}\n\t` });
    expect(r?.extra).toHaveLength(LIMITE_EXTRA);
  });

  it("temRespostas só vale se houver algo", () => {
    expect(temRespostas(RESPOSTAS_VAZIAS)).toBe(false);
    expect(temRespostas({ escolhas: {}, extra: "  " })).toBe(false);
    expect(temRespostas({ escolhas: { negocio: ["comida"] }, extra: "" })).toBe(true);
    expect(temRespostas({ escolhas: {}, extra: "camisetas" })).toBe(true);
  });
});
