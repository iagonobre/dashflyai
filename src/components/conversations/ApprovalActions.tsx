"use client";

import {
  CheckmarkCircle01Icon,
  CancelCircleIcon,
  Edit01Icon,
  ShieldAlert,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import Spinner from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

interface ApprovalActionsProps {
  conversationId: string;
  blacklistTriggered: boolean;
  currentContent: string;
  onApprove: () => void;
  onReject: () => void;
  onEditAndApprove: (content: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
  isEditingAndApproving: boolean;
}

export default function ApprovalActions({
  blacklistTriggered,
  currentContent,
  onApprove,
  onReject,
  onEditAndApprove,
  isApproving,
  isRejecting,
  isEditingAndApproving,
}: ApprovalActionsProps) {
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(currentContent);

  return (
    <div className="flex flex-col gap-4 p-5 bg-secondaryContainer border-t border-border">
      {/* Alerta de blacklist */}
      {blacklistTriggered && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-redAlert/8 border border-redAlert/30">
          <HugeiconsIcon icon={ShieldAlert} size={16} className="text-redAlert mt-0.5 shrink-0" />
          <p className="text-redAlert text-xs leading-relaxed">
            Este email acionou uma palavra da blacklist e foi retido para revisão manual.
            Verifique o conteúdo com atenção antes de aprovar.
          </p>
        </div>
      )}

      {/* Modo de edição */}
      {editMode ? (
        <div className="flex flex-col gap-3">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={6}
            className="w-full bg-container border border-border rounded-lg px-4 py-3 text-white
              text-sm placeholder:text-darkText focus:outline-none focus:border-primaryStroke
              resize-none transition-colors"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setEditMode(false)}
              className="px-4 py-2 text-sm text-darkText hover:text-white border border-border
                rounded-lg bg-container hover:bg-containerHover transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => onEditAndApprove(editedContent)}
              disabled={isEditingAndApproving}
              className="px-4 py-2 text-sm text-white bg-primary hover:bg-primaryHover
                rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {isEditingAndApproving ? (
                <Spinner size="sm" />
              ) : (
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={15} />
              )}
              Editar e enviar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          {/* Aprovar */}
          <button
            onClick={onApprove}
            disabled={isApproving || isRejecting}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              "bg-greenAlert/10 text-greenAlert border border-greenAlert/30",
              "hover:bg-greenAlert/20 disabled:opacity-60"
            )}
          >
            {isApproving ? <Spinner size="sm" /> : <HugeiconsIcon icon={CheckmarkCircle01Icon} size={15} />}
            Aprovar e enviar
          </button>

          {/* Editar */}
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
              bg-container text-darkText border border-border hover:bg-containerHover
              hover:text-white transition-colors"
          >
            <HugeiconsIcon icon={Edit01Icon} size={15} />
            Editar e enviar
          </button>

          {/* Rejeitar */}
          <button
            onClick={onReject}
            disabled={isRejecting || isApproving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
              bg-redAlert/10 text-redAlert border border-redAlert/30
              hover:bg-redAlert/20 transition-colors disabled:opacity-60"
          >
            {isRejecting ? <Spinner size="sm" /> : <HugeiconsIcon icon={CancelCircleIcon} size={15} />}
            Rejeitar
          </button>
        </div>
      )}
    </div>
  );
}
