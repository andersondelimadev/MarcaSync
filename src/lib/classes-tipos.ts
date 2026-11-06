/** Tipos das classes sugeridas: só tipos, para a tela importar sem trazer o catálogo do INPI. */

/** Uma classe de Nice que combina com o negócio da pessoa. */
export interface ClasseSugerida {
  /** "30", "35"… (1 a 45). */
  classe: string;
  /** Título curto da classe, como na lista de escolha do formulário. */
  titulo: string;
  /** "provavel": o negócio cai nela com folga; "possivel": pode ser que caia, vale confirmar. */
  nivel: "provavel" | "possivel";
  /** Por que a classe foi sugerida, em linguagem de gente ("você marcou…", "combina com…"). */
  motivos: string[];
  /** Até 3 itens da lista oficial do INPI nessa classe que combinam com o que a pessoa descreveu. */
  exemplos: string[];
}

/** O que a pessoa respondeu no questionário (todas as respostas são opcionais). */
export interface RespostasQuestionario {
  /** Para cada pergunta, os ids das opções marcadas. */
  escolhas: Record<string, string[]>;
  /** Texto livre ("planos futuros", "outros produtos…"), no máximo 300 caracteres. */
  extra: string;
}

export const RESPOSTAS_VAZIAS: RespostasQuestionario = { escolhas: {}, extra: "" };
