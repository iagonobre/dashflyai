"use client";

import { useState } from "react";

import Toggle from "@/components/ui/Toggle";
import Spinner from "@/components/ui/Spinner";
import { AiSettings } from "@/types/ai-settings.types";

interface Props {
  settings: AiSettings;
  onSave: (data: Partial<AiSettings>) => void;
  isSaving: boolean;
}

const DEFAULT_DELAY = {
  enabled: false,
  mode: "fixed" as const,
  fixedMinutes: 5,
  minMinutes: 2,
  maxMinutes: 10,
};

export default function ReplyDelayForm({ settings, onSave, isSaving }: Props) {
  const saved = settings.replyDelay ?? DEFAULT_DELAY;

  const [enabled, setEnabled] = useState(saved.enabled);
  const [mode, setMode] = useState<"fixed" | "random">(saved.mode);
  const [fixedMinutes, setFixedMinutes] = useState(saved.fixedMinutes);
  const [minMinutes, setMinMinutes] = useState(saved.minMinutes);
  const [maxMinutes, setMaxMinutes] = useState(saved.maxMinutes);

  const current = { enabled, mode, fixedMinutes, minMinutes, maxMinutes };
  const isDirty = JSON.stringify(current) !== JSON.stringify(saved);

  function handleToggle(checked: boolean) {
    setEnabled(checked);
    onSave({ replyDelay: { ...current, enabled: checked } });
  }

  function handleSave() {
    if (!isDirty) return;
    onSave({ replyDelay: current });
  }

  return (
    <div className="flex flex-col gap-5">
      <Toggle
        checked={enabled}
        onChange={handleToggle}
        label="Delay antes de responder"
        description="O assistente aguarda um tempo antes de enviar a resposta, tornando a interação mais natural."
      />

      {enabled && (
        <div className="flex flex-col gap-4">
          {/* Modo */}
          <div className="flex gap-3">
            <button
              onClick={() => setMode("fixed")}
              className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors
                ${mode === "fixed"
                  ? "bg-primary/20 border-primaryStroke/50 text-lightPrimary"
                  : "bg-background border-border text-darkText hover:text-white"
                }`}
            >
              Tempo fixo
            </button>
            <button
              onClick={() => setMode("random")}
              className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors
                ${mode === "random"
                  ? "bg-primary/20 border-primaryStroke/50 text-lightPrimary"
                  : "bg-background border-border text-darkText hover:text-white"
                }`}
            >
              Aleatório
            </button>
          </div>

          {/* Tempo fixo */}
          {mode === "fixed" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-textLight text-sm font-medium">
                Aguardar antes de responder
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={fixedMinutes}
                  onChange={(e) => setFixedMinutes(Number(e.target.value))}
                  className="w-28 bg-container border border-border rounded-lg px-4 py-2.5
                    text-white focus:outline-none focus:border-primaryStroke text-sm transition-colors"
                />
                <span className="text-darkText text-sm">minutos</span>
              </div>
            </div>
          )}

          {/* Tempo aleatório */}
          {mode === "random" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-textLight text-sm font-medium">
                Intervalo aleatório
              </label>
              <p className="text-darkText text-xs">
                O assistente escolhe um tempo aleatório dentro do intervalo definido a cada resposta.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-darkText text-sm">Entre</span>
                <input
                  type="number"
                  min={1}
                  value={minMinutes}
                  onChange={(e) => setMinMinutes(Number(e.target.value))}
                  className="w-24 bg-container border border-border rounded-lg px-4 py-2.5
                    text-white focus:outline-none focus:border-primaryStroke text-sm transition-colors"
                />
                <span className="text-darkText text-sm">e</span>
                <input
                  type="number"
                  min={1}
                  value={maxMinutes}
                  onChange={(e) => setMaxMinutes(Number(e.target.value))}
                  className="w-24 bg-container border border-border rounded-lg px-4 py-2.5
                    text-white focus:outline-none focus:border-primaryStroke text-sm transition-colors"
                />
                <span className="text-darkText text-sm">minutos</span>
              </div>
            </div>
          )}

          {isDirty && (
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white
                  bg-primary hover:bg-primaryHover rounded-lg transition-colors disabled:opacity-60"
              >
                {isSaving ? <Spinner size="sm" /> : "Salvar"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
