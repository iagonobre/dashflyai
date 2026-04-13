"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckmarkCircle01Icon, AlertCircleIcon, Clock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

function ForwardingResult() {
  const params = useSearchParams();
  const status = params.get("status");
  const provider = params.get("provider");

  const providerName = provider === "gmail" ? "Gmail" : "Outlook";

  const isAwaitingConfirmation = status === "awaiting_confirmation";
  const isConfigured = status === "configured";
  const isError = !isAwaitingConfirmation && !isConfigured;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-container border border-border rounded-2xl p-8 flex flex-col items-center gap-6 text-center">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
            isError
              ? "bg-redAlert/10 border-redAlert/20"
              : isAwaitingConfirmation
              ? "bg-yellowAlert/10 border-yellowAlert/20"
              : "bg-greenAlert/10 border-greenAlert/20"
          }`}
        >
          <HugeiconsIcon
            icon={isError ? AlertCircleIcon : isAwaitingConfirmation ? Clock01Icon : CheckmarkCircle01Icon}
            size={32}
            className={
              isError
                ? "text-redAlert"
                : isAwaitingConfirmation
                ? "text-yellowAlert"
                : "text-greenAlert"
            }
          />
        </div>

        {isConfigured && (
          <div>
            <p className="text-white text-xl font-semibold">{providerName} configurado!</p>
            <p className="text-darkText text-sm mt-2 leading-relaxed">
              O encaminhamento foi ativado. Você já pode fechar esta aba e
              continuar o onboarding.
            </p>
          </div>
        )}

        {isAwaitingConfirmation && (
          <div>
            <p className="text-white text-xl font-semibold">Quase lá!</p>
            <p className="text-darkText text-sm mt-2 leading-relaxed">
              O Google enviou um email de confirmação para o endereço Dashfly.
              A confirmação acontece automaticamente — não é preciso fazer nada.
              Feche esta aba e continue o onboarding.
            </p>
          </div>
        )}

        {isError && (
          <div>
            <p className="text-white text-xl font-semibold">Erro na conexão</p>
            <p className="text-darkText text-sm mt-2 leading-relaxed">
              Não foi possível conectar o {providerName}. Feche esta aba, volte
              ao onboarding e tente novamente ou configure manualmente.
            </p>
          </div>
        )}

        <p className="text-darkText text-xs border border-border rounded-lg px-4 py-2">
          Feche esta aba para voltar ao onboarding
        </p>
      </div>
    </div>
  );
}

export default function ForwardingCallbackPage() {
  return (
    <Suspense>
      <ForwardingResult />
    </Suspense>
  );
}
