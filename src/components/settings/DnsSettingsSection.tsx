"use client";

import {
  Copy01Icon,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";

function DnsRecord({
  label,
  type,
  name,
  value,
  warning,
}: {
  label: string;
  type: string;
  name: string;
  value: string;
  warning?: string;
}) {
  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-textLight text-xs font-semibold">{label}</p>

      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[80px_1fr_1fr] text-[10px] text-darkText uppercase
          tracking-wider border-b border-border px-3 py-1.5 font-medium">
          <span>Tipo</span>
          <span>Nome</span>
          <span>Valor</span>
        </div>
        <div className="grid grid-cols-[80px_1fr_1fr] gap-2 px-3 py-2.5 items-center">
          <span className="text-lightPrimary text-xs font-mono font-semibold">{type}</span>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-textLight text-xs font-mono truncate">{name}</span>
            <button
              onClick={() => copy(name)}
              className="text-darkText hover:text-lightPrimary transition-colors shrink-0"
              title="Copiar nome"
            >
              <HugeiconsIcon icon={Copy01Icon} size={12} />
            </button>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-textLight text-xs font-mono truncate flex-1">{value}</span>
            <button
              onClick={() => copy(value)}
              className="text-darkText hover:text-lightPrimary transition-colors shrink-0"
              title="Copiar valor"
            >
              <HugeiconsIcon icon={Copy01Icon} size={12} />
            </button>
          </div>
        </div>
      </div>

      {warning && (
        <div className="flex items-start gap-2 bg-yellowAlert/5 border border-yellowAlert/20
          rounded-lg px-3 py-2">
          <HugeiconsIcon icon={AlertCircleIcon} size={13} className="text-yellowAlert shrink-0 mt-0.5" />
          <p className="text-darkText text-[11px] leading-relaxed">{warning}</p>
        </div>
      )}
    </div>
  );
}

export default function DnsSettingsSection() {
  return (
    <div className="flex flex-col gap-5">

      {/* Explicação */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">
        <p className="text-lightPrimary text-xs font-medium mb-1">
          O que são SPF e DKIM?
        </p>
        <p className="text-darkText text-xs leading-relaxed">
          São como uma <span className="text-textLight">assinatura digital</span> nos emails enviados
          pelo assistente. Sem eles, provedores como Gmail e Outlook podem classificar as respostas
          do seu assistente como spam — e seus clientes nunca as verão.
        </p>
      </div>

      {/* Aviso MX */}
      <div className="flex items-start gap-2.5 bg-greenAlert/5 border border-greenAlert/20 rounded-lg px-3 py-2.5">
        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={13} className="text-greenAlert shrink-0 mt-0.5" />
        <p className="text-darkText text-xs leading-relaxed">
          <span className="text-textLight font-medium">Seus registros MX não precisam ser alterados.</span>{" "}
          O Dashfly usa encaminhamento — seus emails continuam chegando normalmente no seu provedor atual.
          Você só precisa adicionar os dois registros abaixo.
        </p>
      </div>

      {/* Passo 1 */}
      <div className="flex flex-col gap-1.5">
        <p className="text-textLight text-sm font-medium">
          Passo 1 — Acesse o painel do seu domínio
        </p>
        <p className="text-darkText text-xs leading-relaxed">
          É o site onde você comprou ou gerencia seu domínio. Exemplos comuns:{" "}
          <span className="text-textLight">
            GoDaddy, Registro.br, Hostinger, Cloudflare, HostGator, Locaweb, UOL Host.
          </span>{" "}
          Procure por <span className="text-textLight">"Zona DNS"</span>,{" "}
          <span className="text-textLight">"Gerenciar DNS"</span> ou{" "}
          <span className="text-textLight">"Registros DNS"</span>.
        </p>
      </div>

      {/* Passo 2 */}
      <div className="flex flex-col gap-4">
        <p className="text-textLight text-sm font-medium">
          Passo 2 — Adicione estes dois registros
        </p>

        <DnsRecord
          label="1. SPF — permissão de envio"
          type="TXT"
          name="@"
          value="v=spf1 include:sendgrid.net ~all"
          warning="Atenção: se seu domínio já tiver um registro SPF (começa com v=spf1), não crie um segundo. Abra o existente e adicione include:sendgrid.net antes do ~all."
        />

        <DnsRecord
          label="2. DKIM — assinatura digital"
          type="CNAME"
          name="s1._domainkey"
          value="s1.domainkey.sendgrid.net"
        />
      </div>

      {/* Propagação */}
      <div className="bg-container border border-border rounded-lg px-4 py-3 flex items-start gap-2.5">
        <HugeiconsIcon icon={Clock01Icon} size={14} className="text-darkText shrink-0 mt-0.5" />
        <div>
          <p className="text-textLight text-xs font-medium mb-0.5">
            Pode levar até 24 horas para propagar
          </p>
          <p className="text-darkText text-xs leading-relaxed">
            Isso é normal e não depende do Dashfly — é o tempo que os servidores do mundo
            levam para reconhecer as novas configurações. Você já pode usar o assistente
            normalmente enquanto espera.
          </p>
        </div>
      </div>

      {/* Suporte */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-darkText text-xs">
          Nossa equipe configura isso para você em minutos.
        </p>
        <a
          href="https://dashfly.com.br/help"
          target="_blank"
          rel="noopener noreferrer"
          className="text-lightPrimary text-xs hover:underline transition-colors"
        >
          Falar com o suporte →
        </a>
      </div>
    </div>
  );
}
