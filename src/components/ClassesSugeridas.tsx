"use client";

import type { ColidenciaResultado } from "@/lib/colidencia";
import { aplicarClasses } from "@/lib/colidencia-classes";

interface ClassesSugeridasProps {
  colidencia: ColidenciaResultado;
  onColidenciaAtualizada: (c: ColidenciaResultado) => void;
  /** Volta à consulta, onde estão as perguntas, com as respostas guardadas. */
  onMudarRespostas: () => void;
}

/**
 * As classes de Nice que combinam com o negócio (de 1 a 5), já afinadas pelas respostas da
 * consulta. A pessoa marca as classes que quer proteger; o que depende delas (marcas "do mesmo
 * ramo" e o nível de colisão) é recalculado aqui mesmo, sem refazer a busca no INPI.
 */
export default function ClassesSugeridas({
  colidencia,
  onColidenciaAtualizada,
  onMudarRespostas,
}: ClassesSugeridasProps) {
  const { classesSugeridas, classesEscolhidas } = colidencia;

  function alternarClasse(classe: string) {
    const marcada = classesEscolhidas.includes(classe);
    // Sempre fica pelo menos uma: o pedido precisa de uma classe.
    if (marcada && classesEscolhidas.length === 1) return;
    const novas = classesSugeridas
      .map((c) => c.classe)
      .filter((c) => (c === classe ? !marcada : classesEscolhidas.includes(c)));
    onColidenciaAtualizada(aplicarClasses(colidencia, novas));
  }

  return (
    <section className="wave-section classes-sugeridas" aria-labelledby="classes-titulo">
      <h3 id="classes-titulo">
        {classesSugeridas.length === 1
          ? "A classe do seu negócio"
          : classesSugeridas.length > 1
            ? `As ${classesSugeridas.length} classes que combinam com o seu negócio`
            : "Em qual classe o seu negócio entra?"}
      </h3>
      <p className="sub">
        O INPI separa tudo que se vende em 45 classes, e a marca só vale na classe em que foi
        registrada. {classesSugeridas.length > 0 ? "Marque as classes que você quer proteger." : ""}
      </p>

      {classesSugeridas.length === 0 ? (
        <p style={{ fontSize: 13.5, marginBottom: 12 }}>
          Só pela descrição e pelas respostas não deu para saber a classe. Volte e responda as
          perguntas (ou descreva melhor o que a marca vende) que eu indico as classes certas.
        </p>
      ) : (
        <ul className="classe-lista">
          {classesSugeridas.map((c) => {
            const marcada = classesEscolhidas.includes(c.classe);
            return (
              <li key={c.classe} className={`classe-card${marcada ? " marcada" : ""}`}>
                <label>
                  <input
                    type="checkbox"
                    checked={marcada}
                    disabled={marcada && classesEscolhidas.length === 1}
                    onChange={() => alternarClasse(c.classe)}
                  />
                  <span>
                    <span className="classe-nome">
                      NCL {c.classe} — {c.titulo}
                    </span>{" "}
                    <span className={`pill ${c.nivel === "provavel" ? "safe" : "accent"}`}>
                      {c.nivel === "provavel" ? "Provável" : "Possível"}
                    </span>
                    {c.motivos.map((m) => (
                      <span key={m} className="classe-motivo">
                        {m}
                      </span>
                    ))}
                  </span>
                </label>
                {c.exemplos.length > 0 && (
                  <details className="classe-exemplos">
                    <summary>Exemplos da lista do INPI</summary>
                    <ul>
                      {c.exemplos.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {classesEscolhidas.length > 1 && (
        <p className="classe-aviso">
          Cada classe é um protocolo separado no INPI, com o seu serviço e a sua taxa. Você paga
          os {classesEscolhidas.length} de uma vez, num pagamento só, e o total aparece no passo
          seguinte. Desmarque as classes que não precisa agora.
        </p>
      )}

      <div style={{ marginTop: 12 }}>
        <button type="button" className="btn secondary" onClick={onMudarRespostas}>
          ← Mudar as respostas da consulta
        </button>
      </div>
    </section>
  );
}
