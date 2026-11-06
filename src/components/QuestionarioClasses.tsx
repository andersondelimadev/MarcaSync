"use client";

import type { RespostasQuestionario } from "@/lib/classes-tipos";
import {
  LIMITE_EXTRA,
  perguntasVisiveis,
  validarRespostas,
  type Pergunta,
} from "@/lib/questionario-classes";

interface QuestionarioClassesProps {
  respostas: RespostasQuestionario;
  onRespostas: (r: RespostasQuestionario) => void;
}

function Opcoes({
  pergunta,
  marcadas,
  onMudar,
}: {
  pergunta: Pergunta;
  marcadas: string[];
  onMudar: (opcaoId: string) => void;
}) {
  const grupos = pergunta.opcoes.some((o) => o.grupo)
    ? (["Produtos", "Serviços"] as const)
    : ([undefined] as const);
  return (
    <>
      {grupos.map((grupo) => {
        const opcoes = pergunta.opcoes.filter((o) => (grupo ? o.grupo === grupo : true));
        if (opcoes.length === 0) return null;
        return (
          <div key={grupo ?? "unico"} style={{ marginBottom: 10 }}>
            {grupo && <div className="q-grupo">{grupo}</div>}
            <div className="chips">
              {opcoes.map((o) => (
                <label key={o.id} className={`chip${marcadas.includes(o.id) ? " on" : ""}`}>
                  <input
                    type={pergunta.multipla ? "checkbox" : "radio"}
                    name={`q-${pergunta.id}`}
                    checked={marcadas.includes(o.id)}
                    onChange={() => onMudar(o.id)}
                  />
                  <span>{o.rotulo}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

/**
 * O questionário curto que aponta as classes de Nice do negócio. Aparece na própria consulta,
 * antes do resultado, e todas as perguntas são opcionais. As respostas moram no componente de
 * cima; o servidor confere tudo de novo (`validarRespostas`).
 */
export default function QuestionarioClasses({ respostas, onRespostas }: QuestionarioClassesProps) {
  function mudarOpcao(pergunta: Pergunta, opcaoId: string) {
    const atuais = respostas.escolhas[pergunta.id] ?? [];
    const novas = atuais.includes(opcaoId)
      ? atuais.filter((x) => x !== opcaoId)
      : pergunta.multipla
        ? [...atuais, opcaoId]
        : [opcaoId];
    const escolhas = { ...respostas.escolhas, [pergunta.id]: novas };
    if (novas.length === 0) delete escolhas[pergunta.id];
    // Pergunta que deixa de aparecer perde a resposta (validarRespostas faz essa limpeza).
    onRespostas(validarRespostas({ escolhas, extra: respostas.extra }) ?? respostas);
  }

  return (
    <div className="questionario" aria-labelledby="questionario-titulo">
      <h3 id="questionario-titulo" style={{ marginBottom: 4 }}>
        Perguntas rápidas para achar as classes certas
      </h3>
      <p style={{ fontSize: 13, color: "var(--ink-dim)", marginBottom: 14 }}>
        O INPI separa tudo que se vende em 45 classes, e a marca só vale na classe em que foi
        registrada. Um negócio pode cair em mais de uma. Responda o que souber (leva 1 minuto, e
        todas são opcionais): quanto mais você disser, mais certeiras as classes.
      </p>
      {perguntasVisiveis(respostas.escolhas).map((p) => (
        <fieldset key={p.id} className="q-pergunta">
          <legend>{p.titulo}</legend>
          {p.ajuda && <p className="q-ajuda">{p.ajuda}</p>}
          <Opcoes
            pergunta={p}
            marcadas={respostas.escolhas[p.id] ?? []}
            onMudar={(opcaoId) => mudarOpcao(p, opcaoId)}
          />
        </fieldset>
      ))}
      <div className="field q-pergunta" style={{ marginBottom: 0 }}>
        <label htmlFor="q-extra">Quer acrescentar algo? (opcional)</label>
        <p className="q-ajuda">
          Outros produtos ou serviços, planos para o futuro… Escreva do seu jeito.
        </p>
        <textarea
          id="q-extra"
          rows={2}
          maxLength={LIMITE_EXTRA}
          value={respostas.extra}
          onChange={(e) => onRespostas({ ...respostas, extra: e.target.value })}
          placeholder="Ex.: também quero vender camisetas e dar cursos de confeitaria."
        />
      </div>
    </div>
  );
}
