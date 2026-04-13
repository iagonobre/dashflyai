"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useAiPlans, useAiSubscription, useSubscribeAi, useCancelAiSubscription } from "@/hooks/useSubscription";
import PlanCard from "@/components/subscription/PlanCard";
import Spinner from "@/components/ui/Spinner";
import { CheckmarkCircle01Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function SubscriptionPage() {
  const { storeId } = useAuth();

  const { data: plans = [], isLoading: loadingPlans } = useAiPlans();
  const { data: subscription, isLoading: loadingSub } = useAiSubscription(storeId);
  const subscribe = useSubscribeAi(storeId);
  const cancel = useCancelAiSubscription(storeId);

  const isLoading = loadingPlans || loadingSub;

  function handleCancel() {
    if (!confirm("Tem certeza que deseja cancelar? O assistente será desativado ao fim do período.")) return;
    cancel.mutate();
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-semibold">Assinatura</h1>
        <p className="text-darkText text-sm mt-1">
          Gerencie seu plano do Dashfly AI.
        </p>
      </div>

      {/* Status atual - TRIAL */}
      {!loadingSub && subscription?.status === "TRIAL" && (
        <div className="bg-yellowAlert/8 border border-yellowAlert/20 rounded-xl px-5 py-4
          flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-yellowAlert/10 border border-yellowAlert/20
            flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={SparklesIcon} size={18} className="text-yellowAlert" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold">
              Trial ativo — {subscription.plan.name}
            </p>
            <p className="text-darkText text-xs mt-0.5">
              Trial termina{" "}
              {formatDistanceToNow(new Date(subscription.currentPeriodEnd), {
                addSuffix: true,
                locale: ptBR,
              })}
              {" "}— explore todos os recursos sem cobrança
            </p>
          </div>
        </div>
      )}

      {/* Status atual - ATIVO */}
      {!loadingSub && subscription?.status === "ACTIVE" && (
        <div className="bg-greenAlert/8 border border-greenAlert/20 rounded-xl px-5 py-4
          flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-greenAlert/10 border border-greenAlert/20
            flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={18} className="text-greenAlert" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold">
              Plano {subscription.plan.name} ativo
            </p>
            <p className="text-darkText text-xs mt-0.5">
              Próxima renovação{" "}
              {formatDistanceToNow(new Date(subscription.currentPeriodEnd), {
                addSuffix: true,
                locale: ptBR,
              })}
            </p>
          </div>
        </div>
      )}

      {/* Uso do mês */}
      {!loadingSub && subscription && (
        <div className="bg-container border border-border rounded-xl p-5">
          <p className="text-textLight text-sm font-semibold mb-4">Uso este mês</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <UsageStat
              label="Emails enviados"
              used={(subscription as any).emailsUsedThisMonth ?? 0}
              limit={subscription.plan.emailsPerMonthLimit}
            />
            <UsageStat
              label="Conversas"
              used={(subscription as any).conversationsUsedThisMonth ?? 0}
              limit={subscription.plan.conversationsPerMonth}
            />
            <UsageStat
              label="Jobs de automação"
              used={(subscription as any).automationJobsUsedThisMonth ?? 0}
              limit={subscription.plan.automationJobsPerMonth}
            />
          </div>
        </div>
      )}

      {/* Planos */}
      <div>
        <p className="text-textLight text-sm font-semibold mb-4">
          {subscription ? "Alterar plano" : "Escolha um plano"}
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="md" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                subscription={subscription}
                onSubscribe={(planId) => subscribe.mutate(planId)}
                onCancel={handleCancel}
                isSubscribing={subscribe.isPending}
                isCanceling={cancel.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Nota sobre cobrança */}
      <p className="text-darkText text-xs text-center leading-relaxed max-w-lg mx-auto">
        A cobrança é mensal e proporcional ao dia de assinatura — você paga apenas pelos dias restantes
        do ciclo atual. O cancelamento não gera reembolso e o assistente permanece ativo até o fim do período.
      </p>
    </div>
  );
}

function UsageStat({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const pct = Math.min((used / limit) * 100, 100);
  const isNearLimit = pct >= 80;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-darkText text-xs">{label}</p>
        <p className={`text-xs font-medium ${isNearLimit ? "text-yellowAlert" : "text-textLight"}`}>
          {used.toLocaleString("pt-BR")} / {limit.toLocaleString("pt-BR")}
        </p>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isNearLimit ? "bg-yellowAlert" : "bg-primary"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
