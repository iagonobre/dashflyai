"use client";

import { useState } from "react";
import { Add01Icon, Delete01Icon, AlertCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import Toggle from "@/components/ui/Toggle";
import Spinner from "@/components/ui/Spinner";
import { AiSettings, CartAttempt } from "@/types/ai-settings.types";

const MAX_ATTEMPTS = 5;

const toneOptions = [
  { value: "friendly", label: "Amigável" },
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
];

const VARIABLES = ["{{firstName}}", "{{cartUrl}}", "{{storeName}}", "{{discountCode}}"];

const defaultAttempt: CartAttempt = {
  enabled: true,
  delayHours: 1,
  tone: "friendly",
  useAiGenerated: true,
  customMessage: null,
  discountEnabled: false,
  discountPercent: null,
};

interface Props {
  settings: AiSettings;
  onSave: (data: Partial<AiSettings>) => void;
  isSaving: boolean;
  spfNotVerified?: boolean;
}

export default function CartAttemptsEditor({ settings, onSave, isSaving, spfNotVerified = false }: Props) {
  const cartSettings = settings.cartAbandonment ?? { enabled: false, attempts: [] };
  const [attempts, setAttempts] = useState<CartAttempt[]>(cartSettings.attempts ?? []);

  function updateAttempt(index: number, patch: Partial<CartAttempt>) {
    const updated = attempts.map((a, i) => (i === index ? { ...a, ...patch } : a));
    setAttempts(updated);
  }

  function removeAttempt(index: number) {
    setAttempts(attempts.filter((_, i) => i !== index));
  }

  function addAttempt() {
    if (attempts.length >= MAX_ATTEMPTS) return;
    setAttempts([...attempts, { ...defaultAttempt }]);
  }

  function handleSave() {
    onSave({
      cartAbandonment: {
        enabled: cartSettings.enabled,
        attempts,
      },
    });
  }

  const isDirty =
    JSON.stringify(attempts) !== JSON.stringify(cartSettings.attempts);

  return (
    <div className="flex flex-col gap-6">
      {/* Toggle de feature */}
      <Toggle
        checked={cartSettings.enabled}
        onChange={(checked) =>
          onSave({ cartAbandonment: { ...cartSettings, enabled: checked } })
        }
        label="Carrinho abandonado ativo"
        description="Envia sequência de emails para clientes que abandonaram o carrinho."
        warning={spfNotVerified ? "Domínio não verificado" : undefined}
        disabled={spfNotVerified}
      />

      {cartSettings.enabled && (
        <>
          {/* Aviso de variáveis */}
          <div className="bg-primary/10 border border-primaryStroke/30 rounded-lg px-4 py-3">
            <p className="text-lightPrimary text-xs font-medium mb-1.5">Variáveis disponíveis</p>
            <div className="flex flex-wrap gap-1.5">
              {VARIABLES.map((v) => (
                <code key={v} className="bg-primary/20 text-lightPrimary text-xs px-2 py-0.5 rounded">
                  {v}
                </code>
              ))}
            </div>
          </div>

          {/* Lista de tentativas */}
          <div className="flex flex-col gap-4">
            {attempts.map((attempt, index) => (
              <div
                key={index}
                className="bg-container border border-border rounded-xl overflow-hidden"
              >
                {/* Header da tentativa */}
                <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 border border-primaryStroke/30
                      flex items-center justify-center text-lightPrimary text-xs font-semibold shrink-0">
                      {index + 1}
                    </span>
                    <Toggle
                      checked={attempt.enabled}
                      onChange={(checked) => updateAttempt(index, { enabled: checked })}
                      label="Ativa"
                    />
                  </div>
                  <button
                    onClick={() => removeAttempt(index)}
                    className="text-darkText hover:text-redAlert transition-colors"
                    title="Remover tentativa"
                  >
                    <HugeiconsIcon icon={Delete01Icon} size={16} />
                  </button>
                </div>

                {/* Campos */}
                <div className="px-4 py-4 flex flex-col gap-4">
                  {/* Delay + Tom */}
                  <div className="flex gap-4 max-sm:flex-col">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="text-darkText text-xs font-medium uppercase tracking-wide">
                        Enviar após (horas)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={attempt.delayHours}
                        onChange={(e) => updateAttempt(index, { delayHours: Number(e.target.value) })}
                        className="bg-background border border-border rounded-lg px-4 py-2.5 text-white
                          focus:outline-none focus:border-primaryStroke text-sm transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="text-darkText text-xs font-medium uppercase tracking-wide">
                        Tom de voz
                      </label>
                      <select
                        value={attempt.tone}
                        onChange={(e) => updateAttempt(index, { tone: e.target.value })}
                        className="bg-background border border-border rounded-lg px-4 py-2.5 text-white
                          focus:outline-none focus:border-primaryStroke text-sm appearance-none"
                      >
                        {toneOptions.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-container">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Geração por IA vs. mensagem custom */}
                  <Toggle
                    checked={attempt.useAiGenerated}
                    onChange={(checked) => updateAttempt(index, { useAiGenerated: checked })}
                    label="Gerar com IA automaticamente"
                    description="O assistente escreve a mensagem com base no perfil do cliente."
                  />

                  {!attempt.useAiGenerated && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-darkText text-xs font-medium uppercase tracking-wide">
                        Mensagem customizada
                      </label>
                      <textarea
                        rows={4}
                        value={attempt.customMessage ?? ""}
                        onChange={(e) =>
                          updateAttempt(index, { customMessage: e.target.value || null })
                        }
                        placeholder="Olá, {{firstName}}! Você esqueceu algo no carrinho..."
                        className="bg-background border border-border rounded-lg px-4 py-3 text-white
                          placeholder:text-darkText focus:outline-none focus:border-primaryStroke
                          text-sm resize-none transition-colors"
                      />
                    </div>
                  )}

                  {/* Desconto */}
                  <div className="flex flex-col gap-3">
                    <Toggle
                      checked={attempt.discountEnabled}
                      onChange={(checked) =>
                        updateAttempt(index, {
                          discountEnabled: checked,
                          discountPercent: checked ? (attempt.discountPercent ?? 10) : null,
                        })
                      }
                      label="Incluir cupom de desconto"
                      description="Gera um código de desconto e inclui na mensagem automaticamente."
                    />
                    {attempt.discountEnabled && (
                      <div className="flex items-center gap-3 ml-0">
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={attempt.discountPercent ?? 10}
                          onChange={(e) =>
                            updateAttempt(index, { discountPercent: Number(e.target.value) })
                          }
                          className="w-24 bg-background border border-border rounded-lg px-4 py-2.5
                            text-white focus:outline-none focus:border-primaryStroke text-sm"
                        />
                        <span className="text-darkText text-sm">% de desconto</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Adicionar tentativa */}
          <div className="flex items-center justify-between">
            <button
              onClick={addAttempt}
              disabled={attempts.length >= MAX_ATTEMPTS}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                bg-container border border-border text-darkText hover:bg-containerHover
                hover:text-white transition-colors disabled:opacity-50"
            >
              <HugeiconsIcon icon={Add01Icon} size={15} />
              Adicionar tentativa
            </button>
            {attempts.length >= MAX_ATTEMPTS && (
              <div className="flex items-center gap-1.5 text-yellowAlert text-xs">
                <HugeiconsIcon icon={AlertCircleIcon} size={14} />
                Limite máximo de {MAX_ATTEMPTS} tentativas atingido
              </div>
            )}
          </div>

          {/* Salvar */}
          <div className="flex justify-end pt-2 border-t border-border">
            <button
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primaryHover
                rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {isSaving ? <Spinner size="sm" /> : "Salvar tentativas"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
