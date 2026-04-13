"use client";

import { RobotIcon } from "@hugeicons/core-free-icons";

import { useAuth } from "@/contexts/AuthContext";
import {
  useAutomationStats,
  useUnsubscribes,
  useRemoveUnsubscribe,
  useDisputeDrafts,
  useUpdateDisputeDraft,
  useDismissDisputeDraft,
} from "@/hooks/useAutomations";
import AutomationStatsCards from "@/components/automations/AutomationStatsCards";
import UnsubscribeTable from "@/components/automations/UnsubscribeTable";
import DisputeDraftCard from "@/components/automations/DisputeDraftCard";
import EmptyState from "@/components/ui/EmptyState";

export default function AutomationsPage() {
  const { storeId } = useAuth();

  const { data: stats, isLoading: loadingStats } = useAutomationStats(storeId);
  const { data: unsubscribes, isLoading: loadingUnsub } = useUnsubscribes(storeId);
  const { data: disputes, isLoading: loadingDisputes } = useDisputeDrafts(storeId);

  const removeUnsub = useRemoveUnsubscribe(storeId);
  const updateDraft = useUpdateDisputeDraft();
  const dismissDraft = useDismissDisputeDraft();

  return (
    <div className="p-6 flex flex-col gap-8">
      {/* Título */}
      <div>
        <h1 className="text-white text-2xl font-semibold">Automações</h1>
        <p className="text-darkText text-sm mt-1">
          Métricas de disparo, descadastros e alertas de disputa.
        </p>
      </div>

      {/* Cards de métricas */}
      <AutomationStatsCards stats={stats} loading={loadingStats} />

      {/* Disputas */}
      <section className="bg-container border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-white font-medium text-sm">Disputas (Chargebacks)</h2>
          <p className="text-darkText text-xs mt-0.5">
            Rascunhos de contestação gerados pela Dashfly AI para sua revisão.
          </p>
        </div>

        {loadingDisputes ? (
          <div className="p-4 flex flex-col gap-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-52 bg-background border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !disputes?.length ? (
          <EmptyState
            icon={RobotIcon}
            title="Nenhuma disputa aberta"
            description="Quando houver chargebacks, a Dashfly AI gerará rascunhos de contestação aqui."
          />
        ) : (
          <div className="p-4 flex flex-col gap-3">
            {disputes.map((d) => (
              <DisputeDraftCard
                key={d.id}
                draft={d}
                onUpdate={(id, content) => updateDraft.mutate({ id, content })}
                onDismiss={(id, status) => dismissDraft.mutate({ id, status })}
                isUpdating={updateDraft.isPending}
                isDismissing={dismissDraft.isPending}
              />
            ))}
          </div>
        )}
      </section>

      {/* Descadastros */}
      <section>
        <UnsubscribeTable
          records={unsubscribes}
          loading={loadingUnsub}
          onRemove={(email) => removeUnsub.mutate(email)}
          isRemoving={removeUnsub.isPending}
        />
      </section>
    </div>
  );
}
