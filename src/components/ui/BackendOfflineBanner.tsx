"use client";

import { WifiOff01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { useAuth } from "@/contexts/AuthContext";

export default function BackendOfflineBanner() {
  const { backendOffline } = useAuth();

  if (!backendOffline) return null;

  return (
    <div className="bg-redAlert/10 border-b border-redAlert/30 px-6 py-3 flex items-center gap-3">
      <div className="w-7 h-7 rounded-lg bg-redAlert/20 flex items-center justify-center shrink-0">
        <HugeiconsIcon icon={WifiOff01Icon} size={15} className="text-redAlert" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-redAlert text-sm font-medium">
          Servidor indisponível
        </p>
        <p className="text-darkText text-xs">
          Não foi possível conectar ao servidor. Algumas funcionalidades podem não responder.
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="shrink-0 px-3 py-1.5 text-xs font-medium text-redAlert border border-redAlert/40
          rounded-lg hover:bg-redAlert/10 transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  );
}
