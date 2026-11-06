/**
 * Descobre em quais classes de Nice o negócio da pessoa cai: de 1 a 5 classes, não uma só.
 *
 * Três fontes de pontos, somadas por classe:
 *   1. Palavras do dia a dia ligadas a cada classe (tabela `PALAVRAS`), 4 pontos cada, até 10.
 *   2. Termos da lista oficial do INPI (os mesmos do formulário do pedido): quanto mais rara a
 *      palavra entre as classes, mais ela diz, até 5 pontos.
 *   3. As respostas do questionário (`questionario-classes.ts`), que pesam mais porque a pessoa
 *      disse com todas as letras.
 *
 * Quem sobra depende só dos pontos: só entra na lista a classe com pelo menos 4 pontos e pelo menos
 * 35% dos pontos da primeira. Se só uma passa, a lista tem uma classe; se passam quatro, quatro
 * (no máximo cinco). É uma sugestão para a pessoa confirmar: o INPI decide, e a lista oficial
 * (tela do e-Marcas) é a palavra final.
 *
 * Este arquivo usa o catálogo inteiro (milhares de termos): fica no servidor.
 */
import dados from "../data/termos-preaprovados.json";
import { CLASSES_NICE } from "./classes-nice";
import type { ClasseSugerida, RespostasQuestionario } from "./classes-tipos";
import { pesosDasRespostas } from "./questionario-classes";
import { normalizarTermo } from "./termo";

const CLASSES = dados.classes as Record<string, string[]>;

export const MAX_CLASSES_SUGERIDAS = 5;
const PONTOS_MINIMOS = 4;
const FRACAO_DO_TOPO = 0.35;
const PONTOS_PROVAVEL = 8;
/** Uma palavra forte sozinha já alcança o mínimo para a classe entrar na lista. */
const PESO_PALAVRA = 4;

/**
 * Palavras que indicam cada classe. Escritas sem acento e como "começo de palavra" ("confeit" pega
 * confeitaria e confeiteiro); com "=" na frente, só a palavra inteira ("=app"). Com espaço, é uma
 * expressão. Com ":1" no fim, é pista fraca (1 ponto em vez de 4).
 */
const PALAVRAS: Record<string, string[]> = {
  "1": ["quimic", "fertiliz", "adubo", "resina", "solvente", "reagente", "agroquimic", "=cola", "defensivo agricola"],
  "2": ["tinta", "verniz", "=laca", "corante", "pigmento", "esmalte sintetico"],
  "3": ["cosmetic", "perfum", "maquiag", "shampoo", "condicionador", "sabonete", "hidratante", "desodorante", "skincare", "dermocosmet", "detergente", "amaciante", "sabao", "=batom", "esmalte", "produto de limpeza", "produtos de limpeza", "higiene:1", "beleza:1", "creme:1", "limpez:1"],
  "4": ["=vela", "combustivel", "lubrificante", "graxa", "biodiesel", "etanol", "gasolina", "parafina", "=carvao", "lenha", "oleo industrial"],
  "5": ["medicament", "farmac", "suplement", "vitamina", "remedio", "vacina", "homeopat", "fitoterap", "probiotic", "curativo", "repelente", "nutraceutic", "colageno", "fralda", "absorvente", "saude:1"],
  "6": ["metal", "=aco", "aluminio", "ferragem", "cadeado", "=arame", "parafuso", "serralheria:1", "portao", "grade:1"],
  "7": ["maquina", "gerador", "compressor", "betoneira", "motor", "=bomba", "impressora 3d", "equipamento industrial", "ferramenta eletrica", "industrial:1"],
  "8": ["ferramenta", "talher", "=faca", "alicate", "martelo", "tesoura", "navalha", "chave de fenda", "=lamina"],
  "9": ["software", "aplicativo", "=app", "=apps", "programa de computador", "celular", "smartphone", "eletronic", "computador", "notebook", "=fone", "fones", "camera", "=drone", "=game", "=games", "jogo digital", "=tablet", "carregador", "oculos", "e-book", "ebook", "download", "informatica", "tecnologia:1", "plataforma:1", "sistema:1", "digital:1"],
  "10": ["aparelho medico", "equipamento medico", "protese", "ortopedic", "estetoscopio", "seringa", "mamadeira", "preservativo", "odontologic", "cirurgic", "instrumento medico", "instrumentos medicos"],
  "11": ["luminaria", "lampada", "iluminacao", "ar condicionado", "climatiz", "ventilador", "aquecedor", "=fogao", "geladeira", "refrigerador", "=freezer", "chuveiro", "churrasqueira", "purificador", "filtro de agua", "=led"],
  "12": ["veicul", "=carro", "carros", "=moto", "motos", "motocicleta", "bicicleta", "caminhao", "onibus", "automovel", "=pneu", "pneus", "autopeca", "=bike", "bikes", "patinete", "embarcac", "=barco", "trailer", "automotiv"],
  "13": ["=arma", "armas", "municao", "fogos de artificio", "pirotecn", "explosiv"],
  "14": ["=joia", "joias", "bijuteria", "relogio", "semijoia", "=anel", "aneis", "=colar", "colares", "=brinco", "brincos", "pulseira", "diamante", "=ouro", "=prata", "gema:1"],
  "15": ["instrumento musical", "instrumentos musicais", "violao", "guitarra", "=piano", "violino", "=flauta", "ukulele", "afinador"],
  "16": ["papel", "papelaria", "caderno", "=livro", "livros", "revista", "impresso", "=agenda", "=caneta", "canetas", "adesivo", "material escolar", "=poster", "convite", "sacola de papel", "embalagem de papel", "cartao de visita", "fotografia impressa", "grafica:1"],
  "17": ["borracha", "plastic", "isolante", "mangueira", "vedacao", "fibra de vidro"],
  "18": ["couro", "=bolsa", "bolsas", "mochila", "=mala", "malas", "carteira", "guarda-chuva", "sombrinha", "coleira", "arreio", "necessaire", "pasta executiva"],
  "19": ["cimento", "tijolo", "=telha", "telhas", "ceramica", "marmore", "granito", "azulejo", "gesso", "drywall", "asfalto", "madeira serrada", "material de construcao", "materiais de construcao", "piso:1"],
  "20": ["=movel", "moveis", "mobiliario", "=cadeira", "cadeiras", "=sofa", "colchao", "armario", "estante", "=espelho", "persiana", "travesseiro", "decoracao", "moldura", "=cama", "=mesa", "mesas"],
  "21": ["utensilio", "=panela", "panelas", "=louca", "porcelana", "=copo", "copos", "garrafa termica", "garrafa", "=vaso", "vasos", "vassoura", "esponja", "marmita", "escova de dente", "=pote", "potes", "cozinha:1", "casa:1"],
  "22": ["=corda", "cordas", "tenda", "=lona", "lonas", "toldo", "barraca", "=saco", "sacos", "barbante"],
  "23": ["linha de costura", "fio texti", "novelo", "croche:1"],
  "24": ["tecido", "toalha", "lencol", "cobertor", "=cortina", "cortinas", "roupa de cama", "enxoval", "edredom", "=manta", "mantas", "pano de prato", "cama mesa e banho", "banho:1"],
  "25": ["=roupa", "roupas", "vestuario", "=moda", "camiseta", "=calca", "calcas", "vestido", "calcado", "sapato", "=tenis", "sandalia", "=bone", "bones", "jaqueta", "lingerie", "biquini", "uniforme", "pijama", "=meia", "meias", "cueca", "chinelo", "camisa", "=blusa", "=saia", "=short", "shorts", "casaco", "moletom", "moda fitness", "boutique", "fantasia:1"],
  "26": ["=renda", "rendas", "bordado", "=botao", "botoes", "=ziper", "=fita", "fitas", "aviamento", "mega hair", "peruca"],
  "27": ["tapete", "carpete", "capacho", "grama sintetica", "papel de parede", "revestimento de piso"],
  "28": ["brinquedo", "=boneca", "bonecas", "pelucia", "artigo esportivo", "artigos esportivos", "=bola", "bolas", "jogo de tabuleiro", "=skate", "=patins", "raquete", "halter", "quebra-cabeca", "equipamento de academia", "pesca:1", "jogos:1", "esporte:1"],
  "29": ["=carne", "carnes", "=frango", "=peixe", "peixes", "=leite", "=queijo", "queijos", "iogurte", "=manteiga", "=ovo", "ovos", "embutido", "linguica", "presunto", "conserva", "=geleia", "azeite", "hamburguer", "polpa de fruta", "castanha", "legume", "frios", "laticinio", "alimento processado", "alimentos processados", "salgadinho:1", "alimento:1", "alimentos:1", "organico:1", "comida:1"],
  "30": ["=cafe", "cafes", "=cha", "chas", "acucar", "=bolo", "bolos", "=doce", "doces", "confeit", "padaria", "=pao", "paes", "biscoito", "bolacha", "chocolate", "sorvete", "=massa", "massas", "pizza", "sanduiche", "tempero", "=molho", "molhos", "farinha", "cereal", "granola", "=mel", "salgado", "pastel", "coxinha", "pipoca", "sobremesa", "doceria", "brigadeiro", "tapioca", "=acai", "cookie", "torta", "brownie", "cupcake", "panetone", "=gelo", "comida:1"],
  "31": ["=planta", "plantas", "=flor", "flores", "semente", "=muda", "mudas", "hortalic", "=grao", "graos", "=racao", "animal vivo", "gramado", "=arvore", "arvores", "in natura", "fruta fresca", "frutas frescas", "verdura", "agricola", "agropecuar", "agro:1", "pet:1"],
  "32": ["bebida", "=suco", "sucos", "refrigerante", "=agua", "agua mineral", "cerveja", "=chope", "energetico", "isotonico", "kombucha", "smoothie", "limonada", "xarope para bebida", "cervejaria artesanal", "=drink:1"],
  "33": ["=vinho", "vinhos", "cachaca", "whisky", "=vodka", "=gin", "=licor", "licores", "espumante", "destilado", "bebida alcoolica", "bebidas alcoolicas", "caipirinha", "=rum", "tequila", "aguardente", "=sidra", "=sake", "adega"],
  "34": ["tabaco", "cigarro", "charuto", "=fumo", "narguile", "cigarro eletronico", "isqueiro", "tabacaria"],
  "35": ["publicidade", "marketing", "consultoria", "assessoria", "gestao", "comercio", "=loja", "lojas", "varejo", "atacado", "e-commerce", "ecommerce", "loja virtual", "franquia", "importacao", "exportacao", "agenciamento", "contabilidade", "recursos humanos", "recrutamento", "leilao", "representacao comercial", "marketplace", "distribuidora", "agencia de publicidade", "administracao", "revenda", "revender", "vender produtos", "negocios:1", "venda:1", "vendas:1"],
  "36": ["=seguro", "seguros", "financeir", "=banco", "investimento", "credito", "emprestimo", "cambio", "corretor", "imobiliaria", "=imovel", "imoveis", "consorcio", "cripto", "fintech", "previdencia", "financiamento", "condominio", "pagamento:1", "aluguel:1"],
  "37": ["construcao", "reforma", "=obra", "obras", "instalacao", "reparo", "manutencao", "conserto", "encanador", "eletricista", "oficina", "mecanica", "dedetizacao", "lava rapido", "lavanderia", "alvenaria", "telhado", "pavimentacao", "assistencia tecnica", "limpeza de edificio", "pintura:1"],
  "38": ["telecomunicac", "telefonia", "provedor de internet", "internet", "=radio", "transmissao", "=chat", "streaming", "videoconferencia", "fibra optica", "podcast", "mensageria"],
  "39": ["transport", "logistica", "entrega", "=frete", "mudanca", "=viagem", "viagens", "turismo", "agencia de viagem", "passeio", "excursao", "guincho", "=taxi", "motorista", "armazenagem", "=delivery", "motoboy", "courier", "aluguel de carro", "visita guiada", "cruzeiro", "ambulancia", "estacionamento:1"],
  "40": ["impressao", "corte a laser", "usinagem", "sob medida", "personaliza", "confeccao", "reciclagem", "soldagem", "gravacao", "serigrafia", "sublimacao", "encadernacao", "marcenaria", "estamparia", "revelacao", "tratamento de agua", "curtume", "grafica:1", "costura:1", "sob encomenda:1"],
  "41": ["=curso", "cursos", "=aula", "aulas", "=escola", "ensino", "treinamento", "educacao", "faculdade", "academia", "fitness", "=esporte", "esportes", "personal trainer", "=evento", "eventos", "=festa", "festas", "=show", "shows", "entretenimento", "fotografia", "filmagem", "producao audiovisual", "=musica", "cinema", "teatro", "museu", "editora", "workshop", "mentoria", "coaching", "idiomas", "competicao", "boate", "organizacao de eventos", "ingresso", "treino:1"],
  "42": ["software", "desenvolvimento de sistema", "desenvolvimento de software", "programacao", "hospedagem de site", "aplicativo", "=app", "=apps", "plataforma", "web design", "design grafico", "design de interiores", "arquitetura", "engenharia", "pesquisa cientifica", "laboratorio", "ciberseguranca", "=nuvem", "=cloud", "=saas", "inteligencia artificial", "consultoria em ti", "analise de dados", "desenho industrial", "urbanismo", "=site", "=sites", "tecnologia:1", "sistema:1", "=design:1"],
  "43": ["restaurante", "lanchonete", "=bar", "bares", "cafeteria", "pizzaria", "hamburgueria", "=hotel", "hoteis", "pousada", "hostel", "buffet", "catering", "marmitaria", "sorveteria", "food truck", "hospedagem", "alojamento", "churrascaria", "acaiteria", "casa de cha", "cervejaria", "creche", "refeicao", "refeicoes", "comida:1"],
  "44": ["clinica", "=medico", "medicos", "dentista", "odontologia", "psicolog", "fisioterap", "nutricion", "estetica", "=salao", "cabeleireir", "barbearia", "manicure", "massagem", "=spa", "veterinari", "banho e tosa", "=tosa", "jardinagem", "paisagismo", "tatuagem", "depilacao", "terapia", "hospital", "enfermagem", "acupuntura", "podologia", "bem-estar", "cuidador", "fonoaudiologia", "saude:1", "beleza:1"],
  "45": ["advocacia", "advogado", "juridic", "seguranca", "vigilancia", "detetive", "casamento", "funeraria", "=baba", "cerimonial", "namoro", "licenciamento", "rede social", "mediacao", "despachante", "assistencia social", "propriedade intelectual", "registro de marca", "passeador de cao", "passeador de caes", "pet sitter", "cuidador de animais"],
};

interface PalavraPreparada {
  chave: string;
  exata: boolean;
  frase: boolean;
  peso: number;
}

const PALAVRAS_PREPARADAS: Record<string, PalavraPreparada[]> = Object.fromEntries(
  Object.entries(PALAVRAS).map(([classe, lista]) => [
    classe,
    lista.map((bruto) => {
      const fraca = bruto.endsWith(":1");
      const sem = fraca ? bruto.slice(0, -2) : bruto;
      const exata = sem.startsWith("=");
      const texto = (exata ? sem.slice(1) : sem).trim();
      return { chave: texto, exata, frase: texto.includes(" "), peso: fraca ? 1 : PESO_PALAVRA };
    }),
  ])
);

// ---------------------------------------------------------------------------------------------

const PALAVRAS_SEM_VALOR = new Set(
  (
    "para com sem que uma uns umas por dos das nos nas aos como mais menos muito pouco entre sobre " +
    "sob desde ate seu sua seus suas nosso nossa meu minha esse essa isso este esta isto aqui onde " +
    "quando tambem ainda cada outro outra outros outras todo toda todos todas qualquer quero vendo " +
    "vender fazer fazem faco feito feita feitos feitas tipo tipos forma formas servico servicos produto " +
    "produtos marca empresa negocio loja clientes cliente pessoas pessoa area areas parte partes " +
    "geral uso usos tudo coisa coisas trabalho trabalhos"
  ).split(" ")
);

function tokens(texto: string): string[] {
  return normalizarTermo(texto)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** Tira o "s" do plural: bolos → bolo, doces → doce. Só serve para comparar com o catálogo. */
function raiz(t: string): string {
  return t.length > 3 && t.endsWith("s") ? t.slice(0, -1) : t;
}

interface IndiceCatalogo {
  /** palavra → (classe → quantos termos da classe têm a palavra). */
  porPalavra: Map<string, Map<string, number>>;
  /** palavra → em quantas classes aparece. */
  classesPorPalavra: Map<string, number>;
}

let indice: IndiceCatalogo | null = null;

function indiceDoCatalogo(): IndiceCatalogo {
  if (indice) return indice;
  const porPalavra = new Map<string, Map<string, number>>();
  for (const [classe, termos] of Object.entries(CLASSES)) {
    for (const termo of termos) {
      for (const palavra of new Set(tokens(termo).map(raiz))) {
        if (palavra.length < 4 || PALAVRAS_SEM_VALOR.has(palavra)) continue;
        let porClasse = porPalavra.get(palavra);
        if (!porClasse) porPalavra.set(palavra, (porClasse = new Map()));
        porClasse.set(classe, (porClasse.get(classe) ?? 0) + 1);
      }
    }
  }
  const classesPorPalavra = new Map<string, number>();
  for (const [palavra, porClasse] of porPalavra) classesPorPalavra.set(palavra, porClasse.size);
  indice = { porPalavra, classesPorPalavra };
  return indice;
}

// ---------------------------------------------------------------------------------------------

interface Parcial {
  palavras: number;
  catalogo: number;
  respostas: number;
  /** o que a pessoa escreveu que bateu (para explicar). */
  ditas: string[];
  /** palavras (raiz) do catálogo que bateram nesta classe. */
  tocadas: string[];
}

function textoDoUsuario(descricao: string, respostas?: RespostasQuestionario): string {
  return `${descricao ?? ""} ${respostas?.extra ?? ""}`.trim();
}

/** Palavras do dia a dia que a pessoa escreveu e que apontam para a classe. */
function pontuarPalavras(texto: string, classe: string): { pontos: number; ditas: string[] } {
  const normal = normalizarTermo(texto);
  const toks = tokens(texto);
  let pontos = 0;
  const ditas: string[] = [];
  for (const p of PALAVRAS_PREPARADAS[classe] ?? []) {
    const achou = p.frase
      ? normal.includes(p.chave)
      : p.exata
        ? toks.some((t) => t === p.chave)
        : toks.some((t) => t.startsWith(p.chave));
    if (achou) {
      pontos += p.peso;
      if (p.peso >= PESO_PALAVRA) ditas.push(p.chave);
    }
  }
  return { pontos: Math.min(10, pontos), ditas };
}

/** Palavras do texto que aparecem na lista oficial do INPI (quanto mais rara entre as classes, mais vale). */
function pontuarCatalogo(texto: string, parciais: Map<string, Parcial>): void {
  const { porPalavra, classesPorPalavra } = indiceDoCatalogo();
  for (const palavra of new Set(tokens(texto).map(raiz))) {
    if (palavra.length < 4 || PALAVRAS_SEM_VALOR.has(palavra)) continue;
    const porClasse = porPalavra.get(palavra);
    const espalhada = classesPorPalavra.get(palavra) ?? 0;
    if (!porClasse || espalhada === 0 || espalhada > 10) continue;
    // Palavra em 1 classe vale 2,2; em 5 classes, 0,6; em 10, 0,3.
    const raridade = Math.log(1 + 45 / (espalhada * 4));
    for (const [classe, quantos] of porClasse) {
      const parcial = parciais.get(classe);
      if (!parcial) continue;
      parcial.catalogo += raridade * Math.min(1, 0.5 + quantos / 6);
      parcial.tocadas.push(palavra);
    }
  }
}

function exemplosDoCatalogo(classe: string, palavras: string[]): string[] {
  if (palavras.length === 0) return [];
  const termos = CLASSES[classe] ?? [];
  const achados: Array<{ termo: string; pontos: number }> = [];
  for (const termo of termos) {
    const chaves = new Set(tokens(termo).map(raiz));
    const pontos = palavras.filter((p) => chaves.has(p)).length;
    if (pontos > 0) achados.push({ termo, pontos });
  }
  achados.sort((a, b) => b.pontos - a.pontos || a.termo.length - b.termo.length);
  return achados.slice(0, 3).map((a) => a.termo.replace(/\s*\[[^\]]*\]/g, "").trim());
}

/**
 * As classes que combinam com o negócio, da mais provável para a menos. Pode devolver uma lista
 * vazia (descrição sem nenhuma pista e sem respostas): nesse caso a tela pede o questionário.
 */
export function sugerirClasses(
  descricao: string,
  respostas?: RespostasQuestionario,
  maximo: number = MAX_CLASSES_SUGERIDAS
): ClasseSugerida[] {
  const texto = textoDoUsuario(descricao, respostas);
  const parciais = new Map<string, Parcial>();
  for (const classe of Object.keys(CLASSES_NICE)) {
    const { pontos, ditas } = pontuarPalavras(texto, classe);
    parciais.set(classe, { palavras: pontos, catalogo: 0, respostas: 0, ditas, tocadas: [] });
  }
  pontuarCatalogo(texto, parciais);

  const dasRespostas = respostas ? pesosDasRespostas(respostas) : null;
  if (dasRespostas) {
    for (const [classe, pontos] of dasRespostas.pesos) {
      const p = parciais.get(classe);
      if (p) p.respostas = pontos;
    }
  }

  const pontuadas = [...parciais.entries()]
    .map(([classe, p]) => ({ classe, p, total: p.palavras + Math.min(5, p.catalogo) + p.respostas }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total || Number(a.classe) - Number(b.classe));

  const topo = pontuadas[0];
  if (!topo || topo.total < PONTOS_MINIMOS) return [];
  const piso = Math.max(PONTOS_MINIMOS, topo.total * FRACAO_DO_TOPO);

  const entram = pontuadas.filter((x) => x.total >= piso).slice(0, Math.max(1, maximo));
  // Se só uma classe passou, ela é a resposta: não faz sentido chamá-la de "possível".
  const unica = entram.length === 1;
  return entram.map((x) => {
      const motivos: string[] = [];
      const marcadas = dasRespostas?.porque.get(x.classe) ?? [];
      for (const rotulo of marcadas.slice(0, 2)) motivos.push(`Você marcou: ${rotulo}`);
      const ditas = [...new Set(x.p.ditas)].slice(0, 4);
      if (ditas.length > 0) motivos.push(`Combina com o que você escreveu: ${ditas.join(", ")}`);
      const exemplos = exemplosDoCatalogo(x.classe, [...new Set(x.p.tocadas)]);
      if (motivos.length === 0 && exemplos.length > 0) motivos.push("Há itens da lista do INPI parecidos com a sua descrição");
      return {
        classe: x.classe,
        titulo: CLASSES_NICE[x.classe] ?? "",
        nivel: unica || (x.total >= PONTOS_PROVAVEL && x.total >= topo.total * 0.5) ? ("provavel" as const) : ("possivel" as const),
        motivos,
        exemplos,
      };
    });
}

/**
 * As classes marcadas no começo: as "prováveis"; se nenhuma for, só a primeira da lista (a pessoa
 * sempre começa com pelo menos uma). As "possíveis" aparecem na lista, desmarcadas.
 */
export function classesPadrao(sugeridas: ClasseSugerida[]): string[] {
  const provaveis = sugeridas.filter((c) => c.nivel === "provavel").map((c) => c.classe);
  if (provaveis.length > 0) return provaveis;
  const primeira = sugeridas[0];
  return primeira ? [primeira.classe] : [];
}
