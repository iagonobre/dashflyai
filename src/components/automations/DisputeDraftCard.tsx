"use client";

import {
  ShieldAlert,
  Edit01Icon,
  CheckmarkCircle01Icon,
  CancelCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import { DisputeDraft } from "@/types/automation.types";
import { cn } from "@/lib/utils";

const statusConfig = {
  pending_review: { label: "Aguardando revisão", variant: "pending" as const },
  submitted:      { label: "Submetida",          variant: "sent" as const },
  dismissed:      { label: "Descartada",         variant: "default" as const },
};

interface Props {
  draft: DisputeDraft;
  onUpdate: (id: string, content: string) => void;
  onDismiss: (id: string, status: "submitted" | "dismissed") => void;
  isUpdating: boolean;
  isDismissing: boolean;
}

export default function DisputeDraftCard({
  draft,
  onUpdate,
  onDismiss,
  isUpdating,
  isDismissing,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(draft.draftContent);
  const status = statusConfig[draft.status];
  const isPending = draft.status === "pending_review";

  return (
    <div
      className={cn(
        "bg-container border rounded-xl overflow-hidden",
        isPending ? "border-yellowAlert/30" : "border-border"
      )}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-redAlert/10 border border-redAlert/20 flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={ShieldAlert} size={16} className="text-redAlert" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">
              Pedido #{draft.orderNumber}
            </p>
            <p className="text-darkText text-xs mt-0.5">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(draft.amount)}
              {" · "}
              {format(new Date(draft.createdAt), "dd MMM yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      {/* Motivo */}
      <div className="px-5 pt-4">
        <p className="text-darkText text-xs uppercase tracking-wide font-medium mb-1">Motivo</p>
        <p className="text-textLight text-sm">{draft.reason}</p>
      </div>

      {/* Rascunho */}
      <div className="px-5 pt-4 pb-4">
        <p className="text-darkText text-xs uppercase tracking-wide font-medium mb-2">
          Rascunho de contestação
        </p>
        {editing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white
              text-sm focus:outline-none focus:border-primaryStroke resize-none transition-colors"
          />
        ) : (
          <p className="text-textLight text-sm leading-relaxed whitespace-pre-wrap bg-secondaryContainer
            rounded-lg px-4 py-3 border border-border">
            {content}
          </p>
        )}
      </div>

      {/* Ações — só para pending */}
      {isPending && (
        <div className="px-5 pb-5 flex items-center gap-2 flex-wrap">
          {editing ? (
            <>
              <button
                onClick={() => { onUpdate(draft.id, content); setEditing(false); }}
                disabled={isUpdating}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                  bg-primary hover:bg-primaryHover text-white transition-colors disabled:opacity-60"
              >
                {isUpdating ? <Spinner size="sm" /> : <HugeiconsIcon icon={CheckmarkCircle01Icon} size={15} />}
                Salvar rascunho
              </button>
              <button
                onClick={() => { setContent(draft.draftContent); setEditing(false); }}
                className="px-4 py-2 text-sm text-darkText border border-border rounded-lg
                  bg-container hover:bg-containerHover transition-colors"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                  bg-container text-darkText border border-border hover:bg-containerHover
                  hover:text-white transition-colors"
              >
                <HugeiconsIcon icon={Edit01Icon} size={15} />
                Editar
              </button>
              <button
                onClick={() => onDismiss(draft.id, "submitted")}
                disabled={isDismissing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                  bg-greenAlert/10 text-greenAlert border border-greenAlert/30
                  hover:bg-greenAlert/20 transition-colors disabled:opacity-60"
              >
                {isDismissing ? <Spinner size="sm" /> : <HugeiconsIcon icon={CheckmarkCircle01Icon} size={15} />}
                Marcar como submetida
              </button>
              <button
                onClick={() => onDismiss(draft.id, "dismissed")}
                disabled={isDismissing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                  bg-redAlert/10 text-redAlert border border-redAlert/30
                  hover:bg-redAlert/20 transition-colors disabled:opacity-60"
              >
                <HugeiconsIcon icon={CancelCircleIcon} size={15} />
                Descartar
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
