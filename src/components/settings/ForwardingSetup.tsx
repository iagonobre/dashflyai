"use client";

import { useState } from "react";
import {
  CheckmarkCircle01Icon,
  Clock01Icon,
  Mail01Icon,
  Settings01Icon,
  Copy01Icon,
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
  onOAuthConnect: (provider: "gmail" | "microsoft") => void;
  onConfirmManual: () => void;
  isConnecting?: boolean;
  isConfirming?: boolean;
}

function copyText(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("Copiado!");
}

export default function ForwardingSetup({
  inboundAddress,
  status,
  provider,
  configuredAt,
  onOAuthConnect,
  onConfirmManual,
  isConnecting = false,
  isConfirming = false,
}: Props) {
  const [showManual, setShowManual] = useState(false);

  // ── Configured ────────────────────────────────────────────────────────────
  if (status === "configured") {
    const providerLabel =
      provider === "gmail"
        ? "Gmail / Google Workspace"
        : provider === "microsoft"
        ? "Outlook / Microsoft 365"
        : "Configuração manual";

    const dateLabel = configuredAt
      ? new Date(configuredAt).toLocaleDateString("pt-BR")
      : null;

    return (
      <div className="flex items-center gap-3 bg-greenAlert/10 border border-greenAlert/20 rounded-xl px-4 py-3">
        <div className="w-7 h-7 rounded-lg bg-greenAlert/20 flex items-center justify-center shrink-0">
          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={15} className="text-greenAlert" />
        </div>
        <div>
          <p className="text-greenAlert text-sm font-medium">Encaminhamento ativo</p>
          <p className="text-darkText text-xs">
            {providerLabel}
            {dateLabel && <span> · desde {dateLabel}</span>}
          </p>
        </div>
      </div>
    );
  }

  // ── Awaiting Gmail confirmation ───────────────────────────────────────────
  if (status === "awaiting_confirmation") {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 bg-yellowAlert/10 border border-yellowAlert/20 rounded-xl px-4 py-3">
          <div className="w-7 h-7 rounded-lg bg-yellowAlert/20 flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={Clock01Icon} size={15} className="text-yellowAlert" />
          </div>
          <div>
            <p className="text-yellowAlert text-sm font-medium">Quase lá — aguardando confirmação</p>
            <p className="text-darkText text-xs leading-relaxed">
              O Google enviou um email de confirmação para o endereço Dashfly.
              A confirmação acontece automaticamente — nenhuma ação necessária.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Not configured — provider selection ──────────────────────────────────
  return (
    <div className="flex flex-col gap-3">
      {/* Inbound address copy */}
      {inboundAddress && (
        <div className="bg-background border border-border rounded-xl px-4 py-3">
          <p className="text-darkText text-xs mb-1.5">Encaminhe todos os emails para:</p>
          <div className="flex items-center gap-2">
            <p className="text-lightPrimary text-sm font-mono flex-1 truncate">
              {inboundAddress}
            </p>
            <button
              onClick={() => copyText(inboundAddress)}
              className="text-darkText hover:text-lightPrimary transition-colors shrink-0"
              title="Copiar"
            >
              <HugeiconsIcon icon={Copy01Icon} size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Gmail */}
      <div className="border border-border rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-container border border-border flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={Mail01Icon} size={18} className="text-textLight" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">Gmail / Google Workspace</p>
            <p className="text-darkText text-xs">Configuração automática via OAuth</p>
          </div>
        </div>
        <button
          onClick={() => onOAuthConnect("gmail")}
          disabled={isConnecting}
          className="shrink-0 px-4 py-2 text-sm font-medium text-white bg-primary
            hover:bg-primaryHover rounded-lg transition-colors disabled:opacity-60
            flex items-center gap-2"
        >
          {isConnecting ? <Spinner size="sm" /> : "Conectar"}
        </button>
      </div>

      {/* Outlook */}
      <div className="border border-border rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-container border border-border flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={Mail01Icon} size={18} className="text-textLight" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">Outlook / Microsoft 365</p>
            <p className="text-darkText text-xs">Configuração automática via OAuth</p>
          </div>
        </div>
        <button
          onClick={() => onOAuthConnect("microsoft")}
          disabled={isConnecting}
          className="shrink-0 px-4 py-2 text-sm font-medium text-white bg-primary
            hover:bg-primaryHover rounded-lg transition-colors disabled:opacity-60
            flex items-center gap-2"
        >
          {isConnecting ? <Spinner size="sm" /> : "Conectar"}
        </button>
      </div>

      {/* Manual / outro provedor */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setShowManual((v) => !v)}
          className="w-full flex items-center justify-between gap-4 p-4 hover:bg-containerHover transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-container border border-border flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={Settings01Icon} size={18} className="text-textLight" />
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">Outro provedor</p>
              <p className="text-darkText text-xs">GoDaddy, Zoho, Titan, Registro.br, etc.</p>
            </div>
          </div>
          <HugeiconsIcon
            icon={AlertCircleIcon}
            size={15}
            className="text-darkText shrink-0"
          />
        </button>

        {showManual && (
          <div className="border-t border-border px-4 pb-4 pt-3 flex flex-col gap-3">
            <p className="text-darkText text-xs leading-relaxed">
              Acesse o painel do seu provedor de email, vá em encaminhamento (forwarding) e
              adicione o endereço abaixo como destino de todos os emails recebidos:
            </p>
            {inboundAddress && (
              <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
                <p className="text-lightPrimary text-xs font-mono flex-1 truncate">
                  {inboundAddress}
                </p>
                <button
                  onClick={() => copyText(inboundAddress)}
                  className="text-darkText hover:text-lightPrimary transition-colors shrink-0"
                >
                  <HugeiconsIcon icon={Copy01Icon} size={13} />
                </button>
              </div>
            )}
            <p className="text-darkText text-xs">
              Não sabe como fazer?{" "}
              <a
                href="https://dashfly.com.br/help"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lightPrimary hover:underline"
              >
                Fale com o suporte →
              </a>
            </p>
            <button
              onClick={onConfirmManual}
              disabled={isConfirming}
              className="self-start flex items-center gap-2 px-4 py-2 text-sm font-medium
                text-white bg-primary hover:bg-primaryHover rounded-lg transition-colors
                disabled:opacity-60"
            >
              {isConfirming ? <Spinner size="sm" /> : "Já configurei"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
