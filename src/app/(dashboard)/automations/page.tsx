"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  useAutomationStats,
  useUnsubscribes,
  useRemoveUnsubscribe,
} from "@/hooks/useAutomations";
import AutomationStatsCards from "@/components/automations/AutomationStatsCards";
import UnsubscribeTable from "@/components/automations/UnsubscribeTable";

export default function AutomationsPage() {
  const { storeId } = useAuth();

  const { data: stats, isLoading: loadingStats } = useAutomationStats(storeId);
  const { data: unsubscribes, isLoading: loadingUnsub } = useUnsubscribes(storeId);
  const removeUnsub = useRemoveUnsubscribe(storeId);

  return (
    <div className="p-6 flex flex-col gap-8">
      {/* Título */}
      <div>
        <h1 className="text-white text-2xl font-semibold">Automações</h1>
        <p className="text-darkText text-sm mt-1">
          Métricas de disparo e descadastros.
        </p>
      </div>

      {/* Cards de métricas */}
      <AutomationStatsCards stats={stats} loading={loadingStats} />

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
