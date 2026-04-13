"use client";

import {
  CheckmarkCircle01Icon,
  Cancel01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import Spinner from "@/components/ui/Spinner";
import { AiPlan, AiStoreSubscription } from "@/types/subscription.types";
import { cn } from "@/lib/utils";

interface Props {
  plan: AiPlan;
  subscription: AiStoreSubscription | null | undefined;
  onSubscribe: (planId: string) => void;
  onCancel: () => void;
  isSubscribing: boolean;
  isCanceling: boolean;
}

const featureLines = (plan: AiPlan) => [
  {
    label: "Resposta de email automática",
    enabled: plan.emailResponseEnabled,
  },
  {
    label: "Automações (carrinho, pós-compra, reengajamento)",
    enabled: plan.automationsEnabled,
  },
  {
    label: "Alertas de chargeback",
    enabled: plan.disputeAlertsEnabled,
  },
  {
    label: "Integração Dashfly Analytics",
    enabled: plan.dashflyIntegrationEnabled,
  },
  {
    label: `Até ${plan.emailsPerMonthLimit.toLocaleString("pt-BR")} emails por mês`,
    enabled: true,
  },
  {
    label: `Até ${plan.conversationsPerMonth.toLocaleString("pt-BR")} conversas por mês`,
    enabled: true,
  },
  {
    label: `Até ${plan.automationJobsPerMonth.toLocaleString("pt-BR")} envios de automação por mês`,
    enabled: plan.automationsEnabled,
  },
  {
    label: `Até ${plan.maxCartAttempts} tentativas de recuperação de carrinho`,
    enabled: plan.automationsEnabled,
  },
];

export default function PlanCard({
  plan,
  subscription,
  onSubscribe,
  onCancel,
  isSubscribing,
  isCanceling,
}: Props) {
  const isCurrentPlan = subscription?.plan?.id === plan.id;
  const isTrial = isCurrentPlan && subscription?.status === "TRIAL";
  const isActive = isCurrentPlan && (subscription?.status === "ACTIVE" || subscription?.status === "TRIAL");
  const isOverdue = isCurrentPlan && subscription?.status === "OVERDUE";

  return (
    <div
      className={cn(
        "bg-container border rounded-2xl p-6 flex flex-col gap-5 relative",
        isActive && !isTrial ? "border-primaryStroke" : isTrial ? "border-yellowAlert/50" : "border-border"
      )}
    >
      {isActive && (
        <div className="absolute -top-3 left-5">
          <span className={`text-white text-xs font-semibold px-3 py-1 rounded-full ${isTrial ? "bg-yellowAlert" : "bg-primary"}`}>
            {isTrial ? "Trial ativo" : "Plano atual"}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primaryStroke/30
              flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={SparklesIcon} size={14} className="text-lightPrimary" />
            </div>
            <p className="text-white font-semibold">{plan.name}</p>
          </div>
          <p className="text-darkText text-xs">{plan.slug}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-white text-2xl font-bold">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(plan.price)}
          </p>
          <p className="text-darkText text-xs">por mês</p>
        </div>
      </div>

      {/* Features */}
      <div className="flex flex-col gap-2">
        {featureLines(plan).map((f) => (
          <div key={f.label} className="flex items-start gap-2">
            <HugeiconsIcon
              icon={f.enabled ? CheckmarkCircle01Icon : Cancel01Icon}
              size={14}
              className={cn(
                "shrink-0 mt-0.5",
                f.enabled ? "text-greenAlert" : "text-border"
              )}
            />
            <p
              className={cn(
                "text-xs leading-relaxed",
                f.enabled ? "text-textLight" : "text-darkText/60"
              )}
            >
              {f.label}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-auto flex flex-col gap-2">
        {isActive || isOverdue ? (
          <>
            {isTrial && (
              <p className="text-yellowAlert text-xs text-center">
                Período de trial — explore todos os recursos sem cobrança
              </p>
            )}
            {isOverdue && (
              <p className="text-yellowAlert text-xs text-center">
                Pagamento pendente — regularize para continuar usando o assistente
              </p>
            )}
            <button
              onClick={onCancel}
              disabled={isCanceling}
              className="w-full py-2.5 text-sm font-medium text-darkText border border-border
                rounded-xl hover:border-redAlert hover:text-redAlert transition-colors
                flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isCanceling ? <Spinner size="sm" /> : "Cancelar assinatura"}
            </button>
          </>
        ) : (
          <button
            onClick={() => onSubscribe(plan.id)}
            disabled={isSubscribing}
            className="w-full py-2.5 text-sm font-medium text-white bg-primary
              hover:bg-primaryHover rounded-xl transition-colors flex items-center
              justify-center gap-2 disabled:opacity-60"
          >
            {isSubscribing ? <Spinner size="sm" /> : "Assinar este plano"}
          </button>
        )}
      </div>
    </div>
  );
}
