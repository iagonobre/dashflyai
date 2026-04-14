"use client";

import {
  ArrowLeft01Icon,
  ShieldAlert,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { use } from "react";
import Link from "next/link";

import { useAuth } from "@/contexts/AuthContext";
import {
  useConversation,
  useApproveConversation,
  useRejectConversation,
  useEditAndApprove,
} from "@/hooks/useConversations";
import MessageBubble from "@/components/conversations/MessageBubble";
import ApprovalActions from "@/components/conversations/ApprovalActions";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const statusLabel: Record<string, { label: string; variant: any }> = {
  PENDING_AI:            { label: "Processando", variant: "pending" },
  PENDING_MANUAL_REVIEW: { label: "Pendente",    variant: "pending" },
  APPROVED:              { label: "Aprovado",    variant: "approved" },
  REJECTED:              { label: "Rejeitado",   variant: "rejected" },
  SENT:                  { label: "Enviado",     variant: "sent" },
};

const FALLBACK_STATUS = { label: "Desconhecido", variant: "default" };

export default function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { storeId } = useAuth();
  const { data: conv, isLoading } = useConversation(storeId, id);

  const approve = useApproveConversation(storeId);
  const reject = useRejectConversation(storeId);
  const editAndApprove = useEditAndApprove(storeId);

  const isPending = conv?.status === "PENDING_MANUAL_REVIEW";
  const lastOutbound = conv?.messages
    ?.filter((m) => m.direction === "OUTBOUND")
    .at(-1);

  if (isLoading) {
    return (
      <div className="p-6 flex flex-col gap-4">
        <div className="h-6 w-48 bg-border/40 rounded animate-pulse" />
        <div className="h-96 bg-container border border-border rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!conv) {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-3 py-20">
        <HugeiconsIcon icon={Mail01Icon} size={28} className="text-darkText" />
        <p className="text-darkText">Conversa não encontrada.</p>
        <Link href="/conversations" className="text-primaryText text-sm hover:text-lightPrimaryText">
          Voltar para conversas
        </Link>
      </div>
    );
  }

  const status = statusLabel[conv.status] ?? FALLBACK_STATUS;

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Breadcrumb */}
      <Link
        href="/conversations"
        className="flex items-center gap-2 text-darkText hover:text-white transition-colors text-sm w-fit"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        Conversas
      </Link>

      {/* Card da conversa */}
      <div className="bg-container border border-border rounded-xl overflow-hidden flex flex-col">
        {/* Header da conversa */}
        <div
          className={cn(
            "px-5 py-4 border-b border-border flex items-start justify-between gap-4",
            conv.blacklistTriggered && "bg-redAlert/5"
          )}
        >
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-white font-medium text-sm truncate">{conv.subject}</p>
              <Badge variant={status.variant}>{status.label}</Badge>
              {conv.blacklistTriggered && (
                <Badge variant="blacklist">
                  <HugeiconsIcon icon={ShieldAlert} size={11} />
                  Blacklist
                </Badge>
              )}
            </div>
            <p className="text-darkText text-xs">{conv.customerEmail}</p>
          </div>
        </div>

        {/* Thread de mensagens */}
        <div className="flex flex-col gap-6 px-5 py-6">
          {conv.messages && conv.messages.length > 0 ? (
            conv.messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))
          ) : (
            <p className="text-darkText text-sm text-center py-8">
              Nenhuma mensagem nesta conversa.
            </p>
          )}
        </div>

        {/* Ações de aprovação */}
        {isPending && (
          <ApprovalActions
            conversationId={conv.id}
            blacklistTriggered={conv.blacklistTriggered}
            currentContent={lastOutbound?.content ?? ""}
            onApprove={() => approve.mutate(conv.id)}
            onReject={() => reject.mutate(conv.id)}
            onEditAndApprove={(content) =>
              editAndApprove.mutate({ id: conv.id, content })
            }
            isApproving={approve.isPending}
            isRejecting={reject.isPending}
            isEditingAndApproving={editAndApprove.isPending}
          />
        )}
      </div>
    </div>
  );
}
