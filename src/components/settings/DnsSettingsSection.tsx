"use client";

import {
  Copy01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";

import Spinner from "@/components/ui/Spinner";
import { InboundEmail } from "@/hooks/useAiSettings";

function DnsRecord({
  label,
  type,
  name,
  value,
  verified,
  warning,
}: {
  label: string;
  type: string;
  name: string;
  value: string;
  verified?: boolean | null;
  warning?: string;
}) {
  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header do registro */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <p className="text-textLight text-sm font-medium">{label}</p>
        {verified === true && (
          <span className="flex items-center gap-1 text-greenAlert text-xs">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} />
            Verificado
          </span>
        )}
        {verified === false && (
          <span className="flex items-center gap-1 text-darkText text-xs">
            <HugeiconsIcon icon={Clock01Icon} size={12} />
            Pendente
          </span>
        )}
      </div>

      {/* Campos */}
      <div className="px-4 py-3 flex flex-col gap-2.5">
        <div className="flex items-center gap-3">
          <span className="text-darkText text-xs w-12 shrink-0">Tipo</span>
          <span className="text-textLight text-xs font-mono font-semibold">{type}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-darkText text-xs w-12 shrink-0">Nome</span>
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="text-textLight text-xs font-mono truncate">{name}</span>
            <button
              onClick={() => copy(name)}
              className="text-darkText hover:text-textLight transition-colors shrink-0"
              title="Copiar"
            >
              <HugeiconsIcon icon={Copy01Icon} size={12} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-darkText text-xs w-12 shrink-0">Valor</span>
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="text-textLight text-xs font-mono truncate">{value}</span>
            <button
              onClick={() => copy(value)}
              className="text-darkText hover:text-textLight transition-colors shrink-0"
              title="Copiar"
            >
              <HugeiconsIcon icon={Copy01Icon} size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Aviso inline */}
      {warning && (
        <div className="px-4 py-2.5 border-t border-border">
          <p className="text-darkText text-xs leading-relaxed">{warning}</p>
        </div>
      )}
    </div>
  );
}

interface Props {
  emails?: InboundEmail[];
  onVerifyDns?: () => void;
  isVerifying?: boolean;
}

export default function DnsSettingsSection({
  emails = [],
  onVerifyDns,
  isVerifying = false,
}: Props) {
  const anyEmail = emails[0];
  const spfVerified = anyEmail?.spfVerified ?? null;
  const dkimVerified = anyEmail?.dkimVerified ?? null;
  const checkedAt = anyEmail?.dnsCheckedAt ?? null;
  const allVerified = spfVerified && dkimVerified;

  return (
    <div className="flex flex-col gap-6">

      {/* Intro + status */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-textLight text-sm leading-relaxed">
            Adicione estes registros no painel do seu domínio para que os emails do assistente
            não caiam no spam.{" "}
            <span className="text-darkText">Seus registros MX não precisam ser alterados.</span>
          </p>
          {checkedAt && (
            <p className="text-darkText text-sm mt-0.5">
              Última verificação: {new Date(checkedAt).toLocaleString("pt-BR")}
            </p>
          )}
        </div>
        {onVerifyDns && (
          <button
            onClick={onVerifyDns}
            disabled={isVerifying}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
              text-white bg-primary hover:bg-primaryHover rounded-lg transition-colors
              disabled:opacity-60"
          >
            {isVerifying ? (
              <Spinner size="sm" />
            ) : (
              <>
                <HugeiconsIcon icon={RefreshIcon} size={13} />
                Verificar
              </>
            )}
          </button>
        )}
      </div>

      {/* Status pills quando há emails */}
      {emails.length > 0 && (
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border
            ${spfVerified
              ? "text-greenAlert border-greenAlert/30 bg-greenAlert/5"
              : "text-lightPrimary border-primary/30 bg-primary/5"
            }`}>
            <HugeiconsIcon
              icon={spfVerified ? CheckmarkCircle01Icon : Clock01Icon}
              size={12}
            />
            SPF
          </span>
          <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border
            ${dkimVerified
              ? "text-greenAlert border-greenAlert/30 bg-greenAlert/5"
              : "text-lightPrimary border-primary/30 bg-primary/5"
            }`}>
            <HugeiconsIcon
              icon={dkimVerified ? CheckmarkCircle01Icon : Clock01Icon}
              size={12}
            />
            DKIM
          </span>
          {allVerified && (
            <span className="text-greenAlert text-xs">· Domínio autenticado</span>
          )}
        </div>
      )}

      {/* Registros */}
      <div className="flex flex-col gap-3">
        <DnsRecord
          label="SPF"
          type="TXT"
          name="@"
          value="v=spf1 include:sendgrid.net ~all"
          verified={spfVerified || null}
          warning="Se já houver um registro SPF no seu domínio (começa com v=spf1), não crie um segundo — edite o existente e adicione include:sendgrid.net antes do ~all."
        />

        <DnsRecord
          label="DKIM"
          type="CNAME"
          name="s1._domainkey"
          value="s1.domainkey.sendgrid.net"
          verified={dkimVerified || null}
        />
      </div>

      {/* Rodapé */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <p className="text-darkText text-xs">
          Propagação pode levar até 24h após adicionar os registros.
        </p>
        <a
          href="https://dashfly.com.br/help"
          target="_blank"
          rel="noopener noreferrer"
          className="text-darkText text-xs hover:text-textLight transition-colors whitespace-nowrap"
        >
          Precisa de ajuda? →
        </a>
      </div>
    </div>
  );
}
