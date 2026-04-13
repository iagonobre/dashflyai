"use client";

import { Delete01Icon, MailBlock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import { UnsubscribeRecord, UnsubscribeScope } from "@/types/automation.types";

const scopeLabel: Record<UnsubscribeScope, string> = {
  ALL:          "Todos os emails",
  CART:         "Carrinho abandonado",
  REENGAGEMENT: "Reengajamento",
};

interface Props {
  records: UnsubscribeRecord[] | undefined;
  loading: boolean;
  onRemove: (email: string) => void;
  isRemoving: boolean;
}

export default function UnsubscribeTable({ records, loading, onRemove, isRemoving }: Props) {
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);

  function handleConfirm() {
    if (!confirmEmail) return;
    onRemove(confirmEmail);
    setConfirmEmail(null);
  }

  return (
    <>
      <div className="bg-container border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-white font-medium text-sm">Emails descadastrados</h2>
          <p className="text-darkText text-xs mt-0.5">
            Clientes que optaram por não receber automações.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col divide-y divide-border">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                <div className="h-4 w-48 bg-border/40 rounded animate-pulse" />
                <div className="h-5 w-28 bg-border/30 rounded-full animate-pulse" />
                <div className="h-4 w-24 bg-border/20 rounded animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        ) : !records?.length ? (
          <EmptyState
            icon={MailBlock01Icon}
            title="Nenhum descadastro"
            description="Clientes que se descadastrarem das automações aparecerão aqui."
          />
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {records.map((r) => (
              <div key={r.id} className="px-5 py-4 flex items-center gap-4">
                <p className="text-textLight text-sm truncate flex-1">{r.customerEmail}</p>
                <Badge variant="default">{scopeLabel[r.scope]}</Badge>
                <span className="text-darkText text-xs whitespace-nowrap max-md:hidden">
                  {format(new Date(r.unsubscribedAt), "dd MMM yyyy", { locale: ptBR })}
                </span>
                <button
                  onClick={() => setConfirmEmail(r.customerEmail)}
                  className="text-darkText hover:text-redAlert transition-colors shrink-0"
                  title="Remover da blacklist"
                >
                  <HugeiconsIcon icon={Delete01Icon} size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmação */}
      <Modal
        open={!!confirmEmail}
        onClose={() => setConfirmEmail(null)}
        title="Remover da blacklist"
      >
        <p className="text-darkText text-sm mb-6">
          Tem certeza que deseja remover{" "}
          <span className="text-white font-medium">{confirmEmail}</span> da blacklist?
          Esse cliente poderá receber automações novamente.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setConfirmEmail(null)}
            className="px-4 py-2 text-sm text-darkText border border-border rounded-lg
              bg-container hover:bg-containerHover transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isRemoving}
            className="px-4 py-2 text-sm text-white bg-primary hover:bg-primaryHover
              rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {isRemoving ? <Spinner size="sm" /> : "Confirmar"}
          </button>
        </div>
      </Modal>
    </>
  );
}
