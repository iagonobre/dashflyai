"use client";

import { useState } from "react";
import {
  CheckmarkCircle01Icon,
  Clock01Icon,
  Mail01Icon,
  Settings01Icon,
  Copy01Icon,
  RefreshIcon,
  ArrowRight01Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";

import Spinner from "@/components/ui/Spinner";
import { ForwardingStatus } from "@/hooks/useAiSettings";

interface Props {
  inboundAddress: string;
  status: ForwardingStatus;
  provider: "gmail" | "microsoft" | "manual" | null;
  configuredAt: string | null;
  verificationSentAt?: string | null;
  providerVerificationSubject?: string | null;
  providerVerificationBody?: string | null;
  providerVerificationHtml?: string | null;
  onOAuthConnect: (provider: "gmail" | "microsoft") => void;
  onStartVerification: () => void;
  isConnecting?: boolean;
  isSendingVerification?: boolean;
}

const PROVIDER_GUIDES: {
  id: string;
  label: string;
  steps: string[];
  note?: string;
}[] = [
  {
    id: "zoho",
    label: "Zoho Mail",
    steps: [
      "Acesse o Zoho Mail e clique no ícone de Configurações (engrenagem)",
      "Vá em Mail Accounts",
      "Role até a seção Forwards e clique em Adicionar",
      "Cole o endereço Dashfly e confirme o código enviado para ele",
    ],
    note: "O Zoho envia um código de verificação — aguarde o email de confirmação.",
  },
  {
    id: "godaddy",
    label: "GoDaddy",
    steps: [
      "Acesse o painel Email & Office do GoDaddy",
      "Selecione o usuário desejado e clique em Gerenciar",
      "Clique em Encaminhamento (Forwarding)",
      "Em 'Encaminhar email para', cole o endereço Dashfly e salve",
    ],
    note: "Se encaminhamento externo estiver bloqueado, peça ao admin para ativá-lo em Admin > Email Forwarding.",
  },
  {
    id: "titan",
    label: "Titan Email",
    steps: [
      "Acesse o Titan webmail e clique no ícone de Configurações (engrenagem)",
      "Vá em Preferências > Encaminhamento",
      "Clique em Adicionar na seção 'Encaminhar emails para'",
      "Cole o endereço Dashfly e confirme o código de segurança enviado",
    ],
    note: "O Titan permite no máximo 3 endereços de encaminhamento por caixa.",
  },
  {
    id: "hostinger",
    label: "Hostinger",
    steps: [
      "Acesse o hPanel e vá em Emails",
      "Clique em Gerenciar ao lado do domínio",
      "Clique em Forwarders > Criar Forwarder",
      "Selecione a caixa de origem, cole o endereço Dashfly e salve",
    ],
  },
  {
    id: "locaweb",
    label: "Locaweb",
    steps: [
      "Acesse o painel da Locaweb e vá em Hospedagem > Sites e emails",
      "Selecione o domínio e clique em Gerenciador de DNS",
      "Acesse Configurações de Email > Redirecionamentos",
      "Adicione um redirecionamento apontando para o endereço Dashfly",
    ],
  },
  {
    id: "registro",
    label: "Registro.br",
    steps: [
      "Acesse sua conta no Registro.br e clique no domínio",
      "Vá em Editar Zona > Modo Avançado",
      "Acesse o painel de email do seu provedor vinculado ao domínio",
      "Adicione o endereço Dashfly como destino de encaminhamento",
    ],
    note: "O Registro.br gerencia o DNS, mas o encaminhamento é configurado no painel do provedor de email contratado.",
  },
  {
    id: "outro",
    label: "Outro",
    steps: [
      "Acesse as configurações do seu provedor de email",
      "Procure por Encaminhamento, Forwarding ou Redirecionamento",
      "Adicione o endereço Dashfly como destino e confirme",
    ],
  },
];

function copyText(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("Copiado!");
}

function minutesSince(isoDate: string): number {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 60_000);
}

export default function ForwardingSetup({
  inboundAddress,
  status,
  provider,
  configuredAt,
  verificationSentAt,
  providerVerificationSubject,
  providerVerificationBody,
  providerVerificationHtml,
  onOAuthConnect,
  onStartVerification,
  isConnecting = false,
  isSendingVerification = false,
}: Props) {
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);

  const activeGuide = PROVIDER_GUIDES.find((g) => g.id === selectedGuide);

  const providerLabel =
    provider === "gmail"
      ? "Gmail / Google Workspace"
      : provider === "microsoft"
      ? "Outlook / Microsoft 365"
      : "Manual";

  // ── Configured ────────────────────────────────────────────────────────────
  if (status === "configured") {
    return (
      <div className="flex flex-col gap-6">
        {/* Intro */}
        <p className="text-textLight text-sm leading-relaxed">
          O email da sua loja está conectado e o assistente já consegue receber mensagens.
        </p>

        {/* Status pill */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full border
            text-greenAlert border-greenAlert/30 bg-greenAlert/5">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} />
            Encaminhamento ativo
          </span>
        </div>

        {/* Card de detalhes */}
        <div className="flex flex-col gap-3">
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
              <p className="text-textLight text-sm font-medium">Encaminhamento</p>
              <span className="flex items-center gap-1 text-greenAlert text-xs">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} />
                Verificado
              </span>
            </div>
            <div className="px-4 py-3 flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <span className="text-darkText text-sm w-16 shrink-0">Provedor</span>
                <span className="text-textLight text-sm">{providerLabel}</span>
              </div>
              {configuredAt && (
                <div className="flex items-center gap-3">
                  <span className="text-darkText text-sm w-16 shrink-0">Desde</span>
                  <span className="text-textLight text-sm">
                    {new Date(configuredAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="text-darkText text-sm w-16 shrink-0">Destino</span>
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="text-textLight text-sm font-mono truncate">{inboundAddress}</span>
                  <button
                    onClick={() => copyText(inboundAddress)}
                    className="text-darkText hover:text-textLight transition-colors shrink-0"
                    title="Copiar"
                  >
                    <HugeiconsIcon icon={Copy01Icon} size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Awaiting confirmation ─────────────────────────────────────────────────
  if (status === "awaiting_confirmation") {
    const isOAuth = provider === "gmail" || provider === "microsoft";
    const isTimeout = verificationSentAt ? minutesSince(verificationSentAt) >= 5 : false;

    return (
      <div className="flex flex-col gap-6">
        {/* Email de verificação do provedor (Zoho, GoDaddy, Titan, etc.) */}
        {providerVerificationSubject && (
          <div className="border border-yellowAlert/30 bg-yellowAlert/5 rounded-xl overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-yellowAlert/20">
              <HugeiconsIcon icon={AlertCircleIcon} size={14} className="text-yellowAlert shrink-0" />
              <p className="text-yellowAlert text-xs font-medium">Email de verificação recebido do seu provedor</p>
            </div>
            <div className="px-4 py-2.5 border-b border-yellowAlert/10">
              <p className="text-darkText text-[11px] uppercase tracking-wider mb-0.5">Assunto</p>
              <p className="text-textLight text-sm">{providerVerificationSubject}</p>
            </div>
            <div className="px-4 py-2.5">
              <p className="text-darkText text-[11px] uppercase tracking-wider mb-1.5">Conteúdo</p>
              {providerVerificationHtml ? (
                <iframe
                  srcDoc={providerVerificationHtml}
                  sandbox=""
                  className="w-full rounded-lg border border-yellowAlert/20 bg-white"
                  style={{ minHeight: 220 }}
                  onLoad={(e) => {
                    const iframe = e.currentTarget;
                    try {
                      iframe.style.height =
                        (iframe.contentDocument?.body?.scrollHeight ?? 220) + 32 + "px";
                    } catch {}
                  }}
                />
              ) : (
                <pre className="text-darkText text-xs leading-relaxed whitespace-pre-wrap font-sans bg-container rounded-lg p-3 border border-yellowAlert/10">
                  {providerVerificationBody}
                </pre>
              )}
            </div>
            <div className="px-4 py-2.5 border-t border-yellowAlert/10">
              <p className="text-darkText text-xs leading-relaxed">
                Leia o email acima, copie o código ou clique no link de verificação e siga as instruções do seu provedor.
              </p>
            </div>
          </div>
        )}

        {/* Intro */}
        <p className="text-textLight text-sm leading-relaxed">
          {isOAuth
            ? "O processo de autorização foi iniciado. Aguardando confirmação automática."
            : "Verificando se o encaminhamento está funcionando corretamente."}
        </p>

        {/* Status pill */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full border
            text-lightPrimary border-primary/30 bg-primary/5">
            <HugeiconsIcon icon={Clock01Icon} size={12} />
            Aguardando
          </span>
        </div>

        {/* Card de status */}
        <div className="flex flex-col gap-3">
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
              <p className="text-textLight text-sm font-medium">Encaminhamento</p>
              <span className="flex items-center gap-1 text-darkText text-xs">
                <HugeiconsIcon icon={Clock01Icon} size={12} />
                Pendente
              </span>
            </div>
            <div className="px-4 py-3 flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <span className="text-darkText text-sm w-16 shrink-0">Provedor</span>
                <span className="text-textLight text-sm">{providerLabel}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-darkText text-sm w-16 shrink-0">Destino</span>
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="text-textLight text-sm font-mono truncate">{inboundAddress}</span>
                  <button
                    onClick={() => copyText(inboundAddress)}
                    className="text-darkText hover:text-textLight transition-colors shrink-0"
                    title="Copiar"
                  >
                    <HugeiconsIcon icon={Copy01Icon} size={12} />
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-darkText text-sm w-16 shrink-0 mt-0.5">Info</span>
                <p className="text-darkText text-sm leading-relaxed">
                  {isOAuth
                    ? "A confirmação acontece automaticamente — nenhuma ação necessária."
                    : "A verificação ocorre automaticamente em até 2 minutos após o encaminhamento estar ativo."}
                </p>
              </div>
            </div>
            {!isOAuth && isTimeout && (
              <div className="px-4 py-2.5 border-t border-border flex items-center justify-between">
                <p className="text-darkText text-xs">Está demorando?</p>
                <button
                  onClick={onStartVerification}
                  disabled={isSendingVerification}
                  className="flex items-center gap-1.5 text-xs text-lightPrimary
                    hover:underline transition-colors disabled:opacity-60"
                >
                  {isSendingVerification ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      <HugeiconsIcon icon={RefreshIcon} size={12} />
                      Reenviar verificação
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Not configured ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* Intro */}
      <div className="flex flex-col gap-1">
        <p className="text-textLight text-sm leading-relaxed">
          Escolha como encaminhar os emails da sua loja para o assistente.{" "}
          <span className="text-darkText">Seus emails continuam chegando normalmente no seu provedor atual.</span>
        </p>
      </div>

      {/* Status pill */}
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full border
          text-lightPrimary border-primary/30 bg-primary/5">
          <HugeiconsIcon icon={Clock01Icon} size={12} />
          Não configurado
        </span>
      </div>

      {/* Cards de provedores */}
      <div className="flex flex-col gap-3">

        {/* Gmail */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Mail01Icon} size={13} className="text-lightPrimary" />
              <p className="text-textLight text-sm font-medium">Gmail / Google Workspace</p>
            </div>
            <button
              onClick={() => onOAuthConnect("gmail")}
              disabled={isConnecting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white
                bg-primary hover:bg-primaryHover rounded-md transition-colors disabled:opacity-60"
            >
              {isConnecting ? <Spinner size="sm" /> : "Conectar"}
            </button>
          </div>
          <div className="px-4 py-3 flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
              <span className="text-darkText text-sm w-16 shrink-0">Tipo</span>
              <span className="text-textLight text-sm">Autorização direta pela sua conta</span>
            </div>
          </div>
        </div>

        {/* Outlook */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Mail01Icon} size={13} className="text-lightPrimary" />
              <p className="text-textLight text-sm font-medium">Outlook / Microsoft 365</p>
            </div>
            <button
              onClick={() => onOAuthConnect("microsoft")}
              disabled={isConnecting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white
                bg-primary hover:bg-primaryHover rounded-md transition-colors disabled:opacity-60"
            >
              {isConnecting ? <Spinner size="sm" /> : "Conectar"}
            </button>
          </div>
          <div className="px-4 py-3 flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
              <span className="text-darkText text-sm w-16 shrink-0">Tipo</span>
              <span className="text-textLight text-sm">Autorização direta pela sua conta</span>
            </div>
          </div>
        </div>

        {/* Outro provedor */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
            <HugeiconsIcon icon={Settings01Icon} size={13} className="text-lightPrimary" />
            <p className="text-textLight text-sm font-medium">Outro provedor</p>
          </div>

          <div className="flex flex-col">
            {/* Endereço destino */}
            <div className="px-4 py-3 flex flex-col gap-1.5 border-b border-border">
              <span className="text-darkText text-xs">Endereço de destino:</span>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={inboundAddress}
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2
                    text-lightPrimary text-sm font-mono focus:outline-none cursor-default select-all"
                />
                <button
                  onClick={() => copyText(inboundAddress)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm border border-border
                    rounded-lg text-darkText hover:text-textLight hover:border-border/80 transition-colors shrink-0"
                >
                  <HugeiconsIcon icon={Copy01Icon} size={14} />
                  Copiar
                </button>
              </div>
            </div>

            {/* Seletor de provedor */}
            <div className="px-4 py-3 border-b border-border flex flex-col gap-2">
              <p className="text-darkText text-xs">Selecione seu provedor para ver o passo a passo:</p>
              <div className="flex flex-wrap gap-1.5">
                {PROVIDER_GUIDES.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGuide(selectedGuide === g.id ? null : g.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors border
                      ${selectedGuide === g.id
                        ? "bg-primary/15 border-primary/40 text-lightPrimary"
                        : "bg-container border-border text-darkText hover:text-textLight hover:border-border/80"
                      }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Passo a passo do provedor selecionado */}
            {activeGuide && (
              <div className="px-4 py-3 border-b border-border flex flex-col gap-2">
                <p className="text-textLight text-xs font-medium">{activeGuide.label}</p>
                <ol className="flex flex-col gap-1.5">
                  {activeGuide.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-lightPrimary text-xs font-mono shrink-0 mt-0.5 w-4">
                        {i + 1}.
                      </span>
                      <span className="text-darkText text-xs leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
                {activeGuide.note && (
                  <p className="text-yellowAlert/80 text-xs leading-relaxed mt-0.5">
                    ⚠ {activeGuide.note}
                  </p>
                )}
              </div>
            )}

            {/* Rodapé */}
            <div className="px-4 py-2.5 flex items-center justify-end">
              <button
                onClick={onStartVerification}
                disabled={isSendingVerification}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium
                  text-white bg-primary hover:bg-primaryHover rounded-md transition-colors
                  disabled:opacity-60"
              >
                {isSendingVerification ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    Já configurei — verificar
                    <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Rodapé */}
      <p className="text-darkText text-xs pt-1">
        Após configurar, a Dashfly detecta o encaminhamento automaticamente em até 2 minutos.
      </p>

    </div>
  );
}
