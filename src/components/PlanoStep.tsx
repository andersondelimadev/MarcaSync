"use client";

import { useRef, useState } from "react";
import GarantiaDevolucao from "./GarantiaDevolucao";
import TrackView from "./TrackView";
import { track } from "@/lib/track";
import { formatarWhatsapp, whatsappValido } from "@/lib/whatsapp";
import {
  MONITORAMENTO_CENTAVOS,
  SETUP_CENTAVOS,
  fmtReais,
  fmtReaisCurto,
  totalDoPedido,
} from "@/lib/planos";
import { GRU_DESCONTO_PCT, calcularGru } from "@/lib/gru";

interface PlanoStepProps {
  nomeCliente: string;
  whatsapp: string;
  onNomeChange: (v: string) => void;
  onWhatsappChange: (v: string) => void;
  /** Gravando o processo no banco: segura os botões. */
  salvando: boolean;
  monitoramento: boolean;
  onToggleMonitoramento: () => void;
  /** Cliente quer registrar: abre o formulário com os dados do pedido. */
  onConfirmar: () => void;
  /** Cliente prefere conversar antes de preencher os dados. */
  onFalarPrimeiro: () => void;
  /** Link wa.me já com o plano escolhido; null se o número não estiver configurado. */
  whatsappHref: string | null;
  /** As classes marcadas no resultado: cada uma é um protocolo, cobrado no mesmo pagamento. */
  classes: string[];
}

const ERRO_WHATSAPP =
  "Informe um celular com DDD válido, por exemplo (85) 91234-5678. Telefone fixo não tem WhatsApp.";

export default function PlanoStep({
  nomeCliente,
  whatsapp,
  onNomeChange,
  onWhatsappChange,
  salvando,
  monitoramento,
  onToggleMonitoramento,
  onConfirmar,
  onFalarPrimeiro,
  whatsappHref,
  classes,
}: PlanoStepProps) {
  const [erroContato, setErroContato] = useState<string | null>(null);
  // Só para mostrar o total: o desconto de verdade é conferido no pedido, pelos dados do titular.
  const [comDesconto, setComDesconto] = useState(true);
  const gru = calcularGru(comDesconto ? "microempresa" : "outra_empresa", false);
  const qtd = Math.max(1, classes.length);
  const totalHoje = totalDoPedido(gru.centavos, qtd);
  const porClasse = qtd > 1 ? ` (${qtd} classes × ${fmtReais(SETUP_CENTAVOS + gru.centavos)})` : "";
  const nomeRef = useRef<HTMLInputElement>(null);
  const whatsappRef = useRef<HTMLInputElement>(null);

  /** Antes de abrir o pedido (ou a conversa) precisamos saber quem é e como falar com a pessoa. */
  function contatoOk(): boolean {
    if (!nomeCliente.trim()) {
      setErroContato("Diga o seu nome para continuar.");
      nomeRef.current?.focus();
      return false;
    }
    if (!whatsappValido(whatsapp)) {
      setErroContato(ERRO_WHATSAPP);
      whatsappRef.current?.focus();
      return false;
    }
    setErroContato(null);
    return true;
  }

  return (
    <>
      <TrackView nome="plano_visto" />
      <div className="panel-head">
        <h2>Plano de registro</h2>
        <p className="help" style={{ maxWidth: "none" }}>
          O serviço do MarcaSync tem preço fechado: {fmtReais(SETUP_CENTAVOS)} por classe, sem
          orçamento e sem precisar falar com ninguém antes. Ele cobre a análise que você acabou de
          ver, a petição, a procuração e o protocolo do pedido no INPI (cada classe é um protocolo). A taxa oficial do INPI (GRU) é paga junto, no
          mesmo pagamento (Pix ou cartão), e o valor exato aparece antes de você confirmar. O
          monitoramento da RPI é opcional e você desliga quando quiser.
        </p>
      </div>

      <div className="helpbox" style={{ margin: "0 0 16px" }}>
        <h3>Para onde mandamos o andamento?</h3>
        <p style={{ fontSize: 13, color: "var(--ink-dim)", marginBottom: 10 }}>
          Só usamos para falar sobre o seu pedido: o pagamento, o protocolo e os prazos.
        </p>
        <div className="grid-2">
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="in-nome">Seu nome</label>
            <input
              ref={nomeRef}
              type="text"
              id="in-nome"
              autoComplete="name"
              value={nomeCliente}
              onChange={(e) => {
                onNomeChange(e.target.value);
                setErroContato(null);
              }}
              placeholder="Ex.: Ana Ramos"
              aria-describedby={erroContato ? "erro-contato" : undefined}
            />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="in-whatsapp">Seu WhatsApp</label>
            <input
              ref={whatsappRef}
              type="tel"
              inputMode="tel"
              id="in-whatsapp"
              autoComplete="tel-national"
              value={whatsapp}
              onChange={(e) => {
                onWhatsappChange(formatarWhatsapp(e.target.value));
                setErroContato(null);
              }}
              onBlur={() => {
                if (whatsapp.trim() && !whatsappValido(whatsapp)) setErroContato(ERRO_WHATSAPP);
              }}
              aria-invalid={erroContato === ERRO_WHATSAPP}
              placeholder="Ex.: (85) 91234-5678"
              aria-describedby={erroContato ? "erro-contato" : undefined}
            />
          </div>
        </div>
        {erroContato && (
          <p
            id="erro-contato"
            role="alert"
            style={{ fontSize: 13, color: "var(--risk)", marginTop: 8 }}
          >
            {erroContato}
          </p>
        )}
      </div>

      <div className="resumo-preco" aria-labelledby="resumo-preco-titulo">
        <h3 id="resumo-preco-titulo">Quanto você paga</h3>
        <fieldset className="resumo-escolha">
          <legend>Quem vai ser o titular da marca?</legend>
          <label className={`chip${comDesconto ? " on" : ""}`}>
            <input
              type="radio"
              name="titular-desconto"
              checked={comDesconto}
              onChange={() => setComDesconto(true)}
            />
            <span>Pessoa física, MEI, ME ou EPP</span>
          </label>
          <label className={`chip${!comDesconto ? " on" : ""}`}>
            <input
              type="radio"
              name="titular-desconto"
              checked={!comDesconto}
              onChange={() => setComDesconto(false)}
            />
            <span>Outra empresa</span>
          </label>
        </fieldset>
        <dl className="resumo-linhas">
          {qtd > 1 && (
            <div>
              <dt>Classes escolhidas</dt>
              <dd>
                {classes.map((c) => `NCL ${c}`).join(", ")} · {qtd} protocolos
              </dd>
            </div>
          )}
          <div>
            <dt>
              Serviço do MarcaSync
              {qtd > 1 ? `, ${qtd} × ${fmtReais(SETUP_CENTAVOS)}` : ""}
            </dt>
            <dd className="tab-nums">{fmtReais(SETUP_CENTAVOS * qtd)}</dd>
          </div>
          <div>
            <dt>
              Taxa do INPI (GRU)
              {qtd > 1 ? `, ${qtd} × ${fmtReais(gru.centavos)}` : ""}
              {gru.comDesconto ? ` — com ${GRU_DESCONTO_PCT}% de desconto` : ""}
            </dt>
            <dd className="tab-nums">{fmtReais(gru.centavos * qtd)}</dd>
          </div>
          <div className="resumo-total">
            <dt>Total hoje, no Pix ou cartão{qtd > 1 ? ", um pagamento só" : ""}</dt>
            <dd className="tab-nums">{fmtReais(totalHoje)}</dd>
          </div>
          {monitoramento ? (
            <div>
              <dt>Monitoramento da RPI, cobrado depois</dt>
              <dd className="tab-nums">{fmtReais(MONITORAMENTO_CENTAVOS)}/mês</dd>
            </div>
          ) : (
            <div>
              <dt>Monitoramento da RPI</dt>
              <dd>não contratado</dd>
            </div>
          )}
        </dl>
        <p className="resumo-nota">
          O total de hoje cobre o serviço e a taxa do INPI numa cobrança só.{" "}
          {monitoramento
            ? "O monitoramento só começa a ser cobrado a partir da publicação do pedido e você cancela quando quiser. "
            : "Você pode contratar o monitoramento aqui embaixo, quando quiser. "}
          O valor final é conferido no pedido, com os dados do titular, e sai igual ao que você vê
          antes de pagar.
        </p>
      </div>

      <div className="summary-strip">
        <div className="total">
          <div className="lbl">Total hoje{porClasse}</div>
          <div className="amt tab-nums">
            {fmtReais(totalHoje)}
            {monitoramento && (
              <span
                style={{
                  fontSize: 12.5,
                  color: "var(--ink-dim)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                }}
              >
                {" "}
                + {fmtReaisCurto(MONITORAMENTO_CENTAVOS)}/mês a partir da publicação
              </span>
            )}
          </div>
        </div>
        <button
          className="btn"
          disabled={salvando}
          onClick={() => {
            if (contatoOk()) onConfirmar();
          }}
        >
          {salvando ? "Salvando…" : "Quero registrar — informar os dados →"}
        </button>
      </div>
      <p className="sim-note">
        Preço do serviço fechado, sem orçamento. A taxa do INPI (GRU) é oficial, vai direto para o
        INPI e é mostrada antes de você confirmar — sem surpresa depois.{" "}
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!contatoOk()) {
                e.preventDefault();
                return;
              }
              track("whatsapp_clicado", { onde: "plano" });
              onFalarPrimeiro();
            }}
          >
            Prefere conversar antes? Fale comigo no WhatsApp.
          </a>
        ) : (
          <button
            type="button"
            className="btn ghost"
            disabled={salvando}
            onClick={() => {
              if (contatoOk()) onFalarPrimeiro();
            }}
          >
            Prefere conversar antes? Me chamem.
          </button>
        )}
      </p>

      <div className="plans" style={{ marginTop: 24 }}>
        <div className="plan-card">
          <h3>Setup — Análise e Protocolo</h3>
          <div className="price">
            {fmtReaisCurto(SETUP_CENTAVOS)} <small>por classe, pagamento único</small>
          </div>
          <ul>
            <li>Busca de anterioridade fonética</li>
            <li>Inferência e conferência da classe NCL</li>
            <li>Petição, guia (GRU) e procuração prontas</li>
            <li>Protocolo do pedido no INPI</li>
          </ul>
        </div>
        <div className="plan-card">
          <h3>Monitoramento RPI</h3>
          <div className="price">
            {fmtReaisCurto(MONITORAMENTO_CENTAVOS)} <small>por mês</small>
          </div>
          <ul>
            <li>Leitura da RPI automática do seu processo: toda semana enquanto o pedido é protocolado e examinado; depois que está tudo certo, todo mês</li>
            <li>Aviso de qualquer despacho publicado, inclusive oposição de terceiros</li>
            <li>Prazo estimado de manifestação quando houver oposição</li>
            <li>Aviso por WhatsApp, com explicação do que fazer</li>
          </ul>
          <div className="toggle-row">
            <label className="t" htmlFor="sw-monitoramento">
              Contratar monitoramento
            </label>
            <button
              id="sw-monitoramento"
              type="button"
              className={`switch ${monitoramento ? "on" : ""}`}
              role="switch"
              aria-checked={monitoramento}
              onClick={onToggleMonitoramento}
            />
          </div>
        </div>
      </div>

      <GarantiaDevolucao margem="0 0 16px" />
    </>
  );
}
