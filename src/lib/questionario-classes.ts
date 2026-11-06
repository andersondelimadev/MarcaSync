/**
 * O questionário curto que afina as classes de Nice: cada opção marcada soma pontos a uma ou mais
 * classes. Não depende do catálogo do INPI, por isso a tela pode importar este arquivo.
 *
 * Os pesos são de 2 a 8. Uma opção que descreve o negócio de frente (ex.: "Cosméticos…") vale 8 na
 * classe principal; o que é só provável (ex.: "faz entrega") vale 5 ou 6; um reforço fraco vale 2 ou 3.
 */
import type { RespostasQuestionario } from "./classes-tipos";

export interface OpcaoPergunta {
  id: string;
  rotulo: string;
  /** classe → pontos que esta opção soma. */
  classes: Record<string, number>;
  /** Para agrupar as opções na tela. */
  grupo?: "Produtos" | "Serviços";
}

export interface Pergunta {
  id: string;
  titulo: string;
  ajuda?: string;
  /** true: pode marcar várias; false: marca uma só (ou nenhuma). */
  multipla: boolean;
  opcoes: OpcaoPergunta[];
  /** A pergunta só aparece quando isto devolve true (as respostas dadas até agora). */
  mostrarSe?: (escolhas: Record<string, string[]>) => boolean;
}

export const LIMITE_EXTRA = 300;

export const QUESTIONARIO: Pergunta[] = [
  {
    id: "negocio",
    titulo: "O que o seu negócio vende ou faz?",
    ajuda: "Marque tudo que vale, inclusive o que você ainda vai começar a fazer.",
    multipla: true,
    opcoes: [
      { id: "comida", grupo: "Produtos", rotulo: "Alimentos, doces, salgados e padaria", classes: { "30": 7, "29": 4 } },
      { id: "bebida_sem_alcool", grupo: "Produtos", rotulo: "Cervejas e bebidas sem álcool (sucos, água, refrigerantes)", classes: { "32": 8 } },
      { id: "bebida_alcool", grupo: "Produtos", rotulo: "Vinhos, cachaça, destilados e outras bebidas alcoólicas", classes: { "33": 8 } },
      { id: "roupa", grupo: "Produtos", rotulo: "Roupas, calçados e acessórios de moda", classes: { "25": 8, "18": 2, "14": 2 } },
      { id: "bolsas", grupo: "Produtos", rotulo: "Bolsas, mochilas, carteiras e artigos de couro", classes: { "18": 8 } },
      { id: "joias", grupo: "Produtos", rotulo: "Joias, bijuterias e relógios", classes: { "14": 8 } },
      { id: "cosmeticos", grupo: "Produtos", rotulo: "Cosméticos, perfumes e produtos de higiene e limpeza", classes: { "3": 8 } },
      { id: "saude_produto", grupo: "Produtos", rotulo: "Medicamentos, suplementos e produtos de saúde", classes: { "5": 8 } },
      { id: "aparelho_medico", grupo: "Produtos", rotulo: "Aparelhos e instrumentos médicos ou odontológicos", classes: { "10": 8 } },
      { id: "eletronicos", grupo: "Produtos", rotulo: "Aparelhos eletrônicos, celulares e acessórios de informática", classes: { "9": 8 } },
      { id: "casa", grupo: "Produtos", rotulo: "Móveis, decoração e utensílios de casa", classes: { "20": 6, "21": 5, "24": 2 } },
      { id: "cama_mesa", grupo: "Produtos", rotulo: "Cama, mesa, banho e tecidos", classes: { "24": 8 } },
      { id: "materiais", grupo: "Produtos", rotulo: "Materiais de construção, tintas e acabamentos", classes: { "19": 6, "2": 5, "6": 3 } },
      { id: "industria", grupo: "Produtos", rotulo: "Máquinas, ferramentas e equipamentos", classes: { "7": 6, "8": 5 } },
      { id: "veiculos", grupo: "Produtos", rotulo: "Veículos, peças e acessórios automotivos", classes: { "12": 8 } },
      { id: "agro", grupo: "Produtos", rotulo: "Plantas, flores, sementes, ração ou produtos do campo", classes: { "31": 8 } },
      { id: "brinquedos", grupo: "Produtos", rotulo: "Brinquedos, jogos e artigos esportivos", classes: { "28": 8 } },
      { id: "papelaria", grupo: "Produtos", rotulo: "Papelaria, livros, impressos e material de escritório", classes: { "16": 8 } },
      { id: "musica_produto", grupo: "Produtos", rotulo: "Instrumentos musicais", classes: { "15": 8 } },
      { id: "quimicos", grupo: "Produtos", rotulo: "Produtos químicos, combustíveis, velas ou lubrificantes", classes: { "1": 5, "4": 5 } },
      { id: "restaurante", grupo: "Serviços", rotulo: "Restaurante, lanchonete, café, bar ou hospedagem", classes: { "43": 8 } },
      { id: "clinica", grupo: "Serviços", rotulo: "Clínica, consultório, salão de beleza, estética ou massagem", classes: { "44": 8 } },
      { id: "pet", grupo: "Serviços", rotulo: "Pet: banho e tosa, veterinário ou ração", classes: { "44": 5, "31": 4 } },
      { id: "tecnologia", grupo: "Serviços", rotulo: "Software, aplicativo, site ou plataforma", classes: { "42": 6, "9": 6 } },
      { id: "telecom", grupo: "Serviços", rotulo: "Internet, telefonia, rádio ou TV", classes: { "38": 8 } },
      { id: "construcao_obra", grupo: "Serviços", rotulo: "Construção, reforma, reparos e instalações", classes: { "37": 8 } },
      { id: "transporte", grupo: "Serviços", rotulo: "Transporte, entrega, mudança, viagens e turismo", classes: { "39": 8 } },
      { id: "educacao", grupo: "Serviços", rotulo: "Cursos, aulas, treinamentos, esportes ou academia", classes: { "41": 8 } },
      { id: "eventos", grupo: "Serviços", rotulo: "Eventos, festas, shows, fotografia e entretenimento", classes: { "41": 7 } },
      { id: "marketing", grupo: "Serviços", rotulo: "Marketing, publicidade, consultoria ou gestão de negócios", classes: { "35": 8 } },
      { id: "financeiro", grupo: "Serviços", rotulo: "Finanças, seguros ou imóveis", classes: { "36": 8 } },
      { id: "juridico", grupo: "Serviços", rotulo: "Serviços jurídicos, de segurança ou cuidados pessoais", classes: { "45": 8 } },
      { id: "musica_servico", grupo: "Serviços", rotulo: "Produção musical ou audiovisual", classes: { "41": 6, "9": 2 } },
      { id: "personalizacao", grupo: "Serviços", rotulo: "Gráfica, estamparia, personalização ou confecção sob encomenda", classes: { "40": 8 } },
    ],
  },
  {
    id: "comida_tipo",
    titulo: "Que tipo de alimento?",
    ajuda: "O INPI separa os alimentos em classes diferentes.",
    multipla: true,
    mostrarSe: (e) => (e.negocio ?? []).includes("comida"),
    opcoes: [
      { id: "doces_paes", rotulo: "Doces, bolos, pães, massas, biscoitos, café ou chocolate", classes: { "30": 5 } },
      { id: "carnes_laticinios", rotulo: "Carnes, peixes, queijos, ovos, frutas e legumes processados ou em conserva", classes: { "29": 6 } },
      { id: "in_natura", rotulo: "Frutas, grãos e verduras frescas (sem processar)", classes: { "31": 6 } },
    ],
  },
  {
    id: "forma",
    titulo: "Como funciona o seu negócio?",
    multipla: true,
    opcoes: [
      { id: "fabrico", rotulo: "Eu fabrico ou produzo o que vendo", classes: {} },
      { id: "revendo", rotulo: "Eu compro e revendo (loja física ou online)", classes: { "35": 7 } },
      { id: "presto", rotulo: "Eu presto serviços", classes: {} },
    ],
  },
  {
    id: "canal",
    titulo: "Onde você vende?",
    multipla: true,
    opcoes: [
      { id: "online", rotulo: "Loja virtual, Instagram ou marketplace", classes: { "35": 5 } },
      { id: "loja_fisica", rotulo: "Loja física própria", classes: { "35": 3 } },
      { id: "encomenda", rotulo: "Só sob encomenda ou no atacado", classes: {} },
    ],
  },
  {
    id: "tecnologia_tipo",
    titulo: "Que tipo de tecnologia?",
    multipla: true,
    mostrarSe: (e) => (e.negocio ?? []).includes("tecnologia"),
    opcoes: [
      { id: "app_baixavel", rotulo: "Aplicativo ou programa que o cliente baixa", classes: { "9": 7 } },
      { id: "sistema_online", rotulo: "Sistema ou site que o cliente usa pela internet", classes: { "42": 7 } },
      { id: "desenvolvo", rotulo: "Desenvolvo sistemas, sites ou apps para outras empresas", classes: { "42": 8 } },
      { id: "jogo", rotulo: "Jogos digitais", classes: { "9": 6, "41": 5 } },
    ],
  },
  {
    id: "tambem",
    titulo: "O seu negócio também…",
    ajuda: "Marque só o que a marca vai de fato oferecer.",
    multipla: true,
    opcoes: [
      { id: "entrega", rotulo: "Faz entrega ou transporte para o cliente", classes: { "39": 5 } },
      { id: "espaco", rotulo: "Atende o cliente no seu espaço (mesas, balcão, hospedagem)", classes: { "43": 6 } },
      { id: "cursos", rotulo: "Dá cursos, aulas ou workshops", classes: { "41": 6 } },
      { id: "reparos", rotulo: "Faz manutenção, instalação ou reparos", classes: { "37": 6 } },
      { id: "consultoria", rotulo: "Faz consultoria ou treinamento para empresas", classes: { "35": 5, "41": 3 } },
      { id: "conteudo", rotulo: "Cria conteúdo (vídeos, podcast, blog, livros)", classes: { "41": 5 } },
    ],
  },
];

const POR_ID = new Map(QUESTIONARIO.map((p) => [p.id, p]));

/** As perguntas que valem mostrar agora, dadas as respostas até aqui. */
export function perguntasVisiveis(escolhas: Record<string, string[]>): Pergunta[] {
  return QUESTIONARIO.filter((p) => !p.mostrarSe || p.mostrarSe(escolhas));
}

/**
 * Confere o que veio do navegador: só ids que existem, sem repetição, só em perguntas que estão
 * visíveis, uma opção só nas perguntas de escolha única e o texto livre cortado. Devolve null se o
 * formato for outro (objeto inválido). Nunca confia no que chegou.
 */
export function validarRespostas(entrada: unknown): RespostasQuestionario | null {
  if (entrada === null || typeof entrada !== "object" || Array.isArray(entrada)) return null;
  const bruto = entrada as { escolhas?: unknown; extra?: unknown };
  const escolhasBrutas =
    bruto.escolhas && typeof bruto.escolhas === "object" && !Array.isArray(bruto.escolhas)
      ? (bruto.escolhas as Record<string, unknown>)
      : {};
  const escolhas: Record<string, string[]> = {};
  for (const [perguntaId, lista] of Object.entries(escolhasBrutas)) {
    const pergunta = POR_ID.get(perguntaId);
    if (!pergunta || !Array.isArray(lista)) continue;
    const validas = new Set(pergunta.opcoes.map((o) => o.id));
    const ids = [...new Set(lista.filter((x): x is string => typeof x === "string" && validas.has(x)))];
    if (ids.length === 0) continue;
    escolhas[perguntaId] = pergunta.multipla ? ids : ids.slice(0, 1);
  }
  // Pergunta escondida não conta: se a pessoa desmarcou "alimentos", a resposta do tipo de alimento cai.
  for (const p of QUESTIONARIO) {
    if (p.mostrarSe && !p.mostrarSe(escolhas)) delete escolhas[p.id];
  }
  const extra =
    typeof bruto.extra === "string"
      ? bruto.extra.replace(/\p{Cc}/gu, " ").replace(/\s+/g, " ").trim().slice(0, LIMITE_EXTRA)
      : "";
  return { escolhas, extra };
}

export interface PesosDasRespostas {
  /** classe → pontos somados. */
  pesos: Map<string, number>;
  /** classe → os rótulos das opções marcadas que contribuíram. */
  porque: Map<string, string[]>;
}

/** Soma os pontos das opções marcadas (as respostas devem ter passado por `validarRespostas`). */
export function pesosDasRespostas(respostas: RespostasQuestionario): PesosDasRespostas {
  const pesos = new Map<string, number>();
  const porque = new Map<string, string[]>();
  for (const pergunta of perguntasVisiveis(respostas.escolhas)) {
    for (const opcaoId of respostas.escolhas[pergunta.id] ?? []) {
      const opcao = pergunta.opcoes.find((o) => o.id === opcaoId);
      if (!opcao) continue;
      for (const [classe, pontos] of Object.entries(opcao.classes)) {
        pesos.set(classe, (pesos.get(classe) ?? 0) + pontos);
        porque.set(classe, [...(porque.get(classe) ?? []), opcao.rotulo]);
      }
    }
  }
  return { pesos, porque };
}

/** A pessoa respondeu alguma coisa? */
export function temRespostas(r: RespostasQuestionario): boolean {
  return r.extra.trim().length > 0 || Object.values(r.escolhas).some((l) => l.length > 0);
}
