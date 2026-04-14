"use client";

import { useState } from "react";
import {
  Add01Icon,
  Delete01Icon,
  Copy01Icon,
  Mail01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import Spinner from "@/components/ui/Spinner";
import ForwardingSetup from "@/components/settings/ForwardingSetup";
import { InboundEmail } from "@/hooks/useAiSettings";

const schema = z.object({
  label: z.string().min(1, "Dê um nome para identificar este email"),
  fromAddress: z.string().email("Informe um email válido"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  emails: InboundEmail[];
  loading: boolean;
  onAdd: (data: { label: string; fromAddress: string }) => void;
  onDelete: (id: string) => void;
  isAdding: boolean;
  isDeleting: boolean;
  defaultFormOpen?: boolean;
  onForwardingOAuth?: (id: string, provider: "gmail" | "microsoft") => void;
  onForwardingStartVerification?: (id: string) => void;
  isForwardingConnecting?: boolean;
  isSendingVerification?: boolean;
  maxEmails?: number;
  hideForwardingStatus?: boolean;
}


function ForwardingStatusBadge({
  status,
  provider,
}: {
  status: string | null;
  provider: string | null;
}) {
  if (status === "configured") {
    return (
      <span className="flex items-center gap-1 text-greenAlert text-xs">
        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={11} />
        Encaminhamento ativo
      </span>
    );
  }
  if (status === "awaiting_confirmation") {
    const label =
      provider === "gmail" || provider === "microsoft"
        ? "Aguardando confirmação do Google"
        : "Verificando encaminhamento...";
    return (
      <span className="flex items-center gap-1 text-yellowAlert text-xs">
        <HugeiconsIcon icon={Clock01Icon} size={11} />
        {label}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-yellowAlert text-xs">
      <HugeiconsIcon icon={AlertCircleIcon} size={11} />
      Encaminhamento não configurado
    </span>
  );
}

export default function InboundEmailsManager({
  emails,
  loading,
  onAdd,
  onDelete,
  isAdding,
  isDeleting,
  defaultFormOpen = false,
  onForwardingOAuth,
  onForwardingStartVerification,
  isForwardingConnecting = false,
  isSendingVerification = false,
  maxEmails = 1,
  hideForwardingStatus = false,
}: Props) {
  const [showForm, setShowForm] = useState(defaultFormOpen);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  function onSubmit(data: FormData) {
    onAdd(data);
    reset();
    setShowForm(false);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Estado vazio */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-16 bg-container border border-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : emails.length === 0 && !showForm ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20
            flex items-center justify-center">
            <HugeiconsIcon icon={Mail01Icon} size={20} className="text-lightPrimary" />
          </div>
          <div>
            <p className="text-textLight text-sm font-medium">Nenhum email conectado</p>
            <p className="text-darkText text-sm mt-0.5">
              Conecte o email da sua loja para o assistente começar a responder seus clientes.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
              bg-primary hover:bg-primaryHover rounded-lg transition-colors"
          >
            <HugeiconsIcon icon={Add01Icon} size={15} />
            Conectar meu email
          </button>
        </div>
      ) : (
        <>
          {/* Lista de emails configurados */}
          {emails.length > 0 && (
            <div className="flex flex-col gap-2">
              {emails.map((email) => (
                <div key={email.id} className="border border-border rounded-xl overflow-hidden">
                  {/* Email row */}
                  <div className="bg-container px-4 py-3 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5
                        ${email.forwardingStatus === "configured"
                          ? "bg-greenAlert/10 border border-greenAlert/20"
                          : "bg-yellowAlert/10 border border-yellowAlert/20"
                        }`}>
                        <HugeiconsIcon
                          icon={email.forwardingStatus === "configured" ? CheckmarkCircle01Icon : AlertCircleIcon}
                          size={14}
                          className={email.forwardingStatus === "configured" ? "text-greenAlert" : "text-yellowAlert"}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium">{email.label}</p>
                        <p className="text-darkText text-xs mt-0.5">
                          <span className="text-textLight">{email.fromAddress}</span>
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <p className="text-darkText text-xs truncate max-w-48">
                            Endereço Dashfly: {email.inboundAddress}
                          </p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(email.inboundAddress);
                              toast.success("Endereço copiado!");
                            }}
                            className="text-darkText hover:text-lightPrimary transition-colors shrink-0"
                            title="Copiar endereço Dashfly"
                          >
                            <HugeiconsIcon icon={Copy01Icon} size={12} />
                          </button>
                        </div>
                        {!hideForwardingStatus && (
                          <div className="mt-1.5">
                            <ForwardingStatusBadge
                              status={email.forwardingStatus}
                              provider={email.forwardingProvider}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 mt-0.5">
                      <button
                        onClick={() => onDelete(email.id)}
                        disabled={isDeleting}
                        className="text-darkText hover:text-redAlert transition-colors"
                        title="Remover"
                      >
                        {isDeleting ? (
                          <Spinner size="sm" />
                        ) : (
                          <HugeiconsIcon icon={Delete01Icon} size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Forwarding setup — always visible when not configured */}
                  {onForwardingOAuth && email.forwardingStatus !== "configured" && (
                    <div className="border-t border-border px-4 py-4 bg-background">
                      <ForwardingSetup
                        inboundAddress={email.inboundAddress}
                        status={email.forwardingStatus}
                        provider={email.forwardingProvider}
                        configuredAt={email.forwardingConfiguredAt}
                        verificationSentAt={email.forwardingVerificationSentAt}
                        providerVerificationSubject={email.providerVerificationSubject}
                        providerVerificationBody={email.providerVerificationBody}
                        providerVerificationHtml={email.providerVerificationHtml}
                        onOAuthConnect={(provider) => onForwardingOAuth(email.id, provider)}
                        onStartVerification={() => onForwardingStartVerification?.(email.id)}
                        isConnecting={isForwardingConnecting}
                        isSendingVerification={isSendingVerification}
                      />
                    </div>
                  )}
                </div>
              ))}

              {emails.length < maxEmails && (
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-2 text-sm text-darkText hover:text-white
                    transition-colors self-start"
                >
                  <HugeiconsIcon icon={Add01Icon} size={14} />
                  Adicionar outro email
                </button>
              )}
            </div>
          )}

          {/* Formulário de adição */}
          {showForm && (
            <form onSubmit={handleSubmit(onSubmit)}
              className="bg-background border border-border rounded-lg p-4 flex flex-col gap-3">
              <p className="text-textLight text-sm font-medium">Conectar email</p>
              <div className="flex flex-col gap-1.5">
                <label className="text-darkText text-sm">
                  Como você quer chamar este email? (uso interno)
                </label>
                <input
                  {...register("label")}
                  placeholder="Ex: Suporte, Atendimento, SAC..."
                  className="w-full bg-container border border-border rounded-lg px-4 py-2.5
                    text-white placeholder:text-darkText focus:outline-none focus:border-primaryStroke
                    text-sm transition-colors"
                />
                {errors.label && (
                  <p className="text-redAlert text-xs">{errors.label.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-darkText text-sm">
                  Email que seus clientes usam para falar com você
                </label>
                <input
                  {...register("fromAddress")}
                  placeholder="contato@sujaloja.com.br"
                  className="w-full bg-container border border-border rounded-lg px-4 py-2.5
                    text-white placeholder:text-darkText focus:outline-none focus:border-primaryStroke
                    text-sm transition-colors"
                />
                {errors.fromAddress && (
                  <p className="text-redAlert text-xs">{errors.fromAddress.message}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primaryHover
                    rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {isAdding ? <Spinner size="sm" /> : "Conectar"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); reset(); }}
                  className="px-4 py-2 text-sm text-darkText border border-border rounded-lg
                    bg-container hover:bg-containerHover transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </>
      )}

    </div>
  );
}
