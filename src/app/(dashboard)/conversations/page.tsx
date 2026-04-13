"use client";

import { Mail01Icon } from "@hugeicons/core-free-icons";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { useConversations } from "@/hooks/useConversations";
import ConversationRow from "@/components/conversations/ConversationRow";
import EmptyState from "@/components/ui/EmptyState";
import { ConversationStatus } from "@/types/conversation.types";
import { cn } from "@/lib/utils";

const tabs: { label: string; value: ConversationStatus | "all" }[] = [
  { label: "Todas",    value: "all" },
  { label: "Pendente", value: "pending_manual_review" },
  { label: "Enviado",  value: "sent" },
  { label: "Aprovado", value: "approved" },
  { label: "Rejeitado",value: "rejected" },
  { label: "Blacklist",value: "blacklist" },
];

function ConversationsContent() {
  const { storeId } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeTab = (searchParams.get("status") ?? "all") as ConversationStatus | "all";
  const statusFilter = activeTab === "all" ? undefined : activeTab;

  const { data: conversations, isLoading } = useConversations(storeId, statusFilter);

  function setTab(value: ConversationStatus | "all") {
    const params = new URLSearchParams();
    if (value !== "all") params.set("status", value);
    router.replace(`/conversations${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Título */}
      <div>
        <h1 className="text-white text-2xl font-semibold">Conversas</h1>
        <p className="text-darkText text-sm mt-1">
          Emails recebidos e processados pelo Dashfly AI.
        </p>
      </div>

      {/* Card com tabs + lista */}
      <div className="bg-container border border-border rounded-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-4 border-b border-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setTab(tab.value)}
              className={cn(
                "px-3 py-2 text-sm rounded-t-lg border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.value
                  ? "text-white border-primary"
                  : "text-darkText border-transparent hover:text-textHover"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="flex flex-col divide-y divide-border">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-border/30 animate-pulse shrink-0" />
                <div className="h-4 w-40 bg-border/40 rounded animate-pulse" />
                <div className="h-4 flex-1 bg-border/30 rounded animate-pulse" />
                <div className="h-5 w-20 bg-border/20 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        ) : !conversations?.length ? (
          <EmptyState
            icon={Mail01Icon}
            title="Nenhuma conversa encontrada"
            description="Quando seus clientes enviarem emails, eles aparecerão aqui."
          />
        ) : (
          <div className="flex flex-col">
            {conversations.map((conv) => (
              <ConversationRow key={conv.id} conversation={conv} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConversationsPage() {
  return (
    <Suspense>
      <ConversationsContent />
    </Suspense>
  );
}
