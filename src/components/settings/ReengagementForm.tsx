"use client";

import { useState } from "react";

import Toggle from "@/components/ui/Toggle";
import Spinner from "@/components/ui/Spinner";
import { AiSettings } from "@/types/ai-settings.types";

interface Props {
  settings: AiSettings;
  onToggle: (data: Partial<AiSettings>) => void;
  onSave: (data: Partial<AiSettings>) => void;
  isSaving: boolean;
}

export default function ReengagementForm({ settings, onToggle, onSave, isSaving }: Props) {
  const re = settings.reengagement ?? { enabled: false, inactivityDays: 30 };
  const [days, setDays] = useState<number>(re.inactivityDays);
  const isDirty = days !== re.inactivityDays;

  function handleSaveDays() {
    if (!isDirty) return;
    onSave({ reengagement: { ...re, inactivityDays: days } });
  }

  return (
    <div className="flex flex-col gap-5">
      <Toggle
        checked={re.enabled}
        onChange={(checked) =>
          onToggle({ reengagement: { ...re, enabled: checked } })
        }
        label="Reativar clientes que sumiram"
        description="O assistente envia um email carinhoso para clientes que não compram há algum tempo, convidando-os a voltar."
      />

      {re.enabled && (
        <div className="flex flex-col gap-1.5">
          <label className="text-textLight text-sm font-medium">
            Quantos dias sem comprar para o assistente entrar em contato?
          </label>
          <p className="text-darkText text-xs">
            Se um cliente não comprar nesse período, o assistente envia um email para trazê-lo de volta.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={7}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-28 bg-container border border-border rounded-lg px-4 py-2.5
                text-white focus:outline-none focus:border-primaryStroke text-sm transition-colors"
            />
            <span className="text-darkText text-sm">dias sem comprar</span>
            {isDirty && (
              <button
                onClick={handleSaveDays}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white
                  bg-primary hover:bg-primaryHover rounded-lg transition-colors disabled:opacity-60"
              >
                {isSaving ? <Spinner size="sm" /> : "Salvar"}
              </button>
            )}
          </div>
          <p className="text-darkText text-xs">Recomendamos entre 30 e 60 dias.</p>
        </div>
      )}
    </div>
  );
}
