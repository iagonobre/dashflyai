"use client";

import { useState } from "react";
import {
  SparklesIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";

import StreamingText from "@/components/ui/StreamingText";
import Spinner from "@/components/ui/Spinner";
import { useStreamingContent } from "@/hooks/useStreamingContent";
import { AiSettings } from "@/types/ai-settings.types";

interface TextSectionProps {
  label: string;
  description: string;
  impactMessage: string;
  value: string | null;
  onSave: (text: string) => void;
  isSaving: boolean;
  streamEndpoint: string;
}

function TextSection({
  label,
  description,
  impactMessage,
  value,
  onSave,
  isSaving,
  streamEndpoint,
}: TextSectionProps) {
  const [localText, setLocalText] = useState(value ?? "");
  const [showEditor, setShowEditor] = useState(false);
  const [showHintInput, setShowHintInput] = useState(false);
  const [hint, setHint] = useState("");
  const { text: streamText, isStreaming, stream, reset } = useStreamingContent();

  const hasContent = localText.trim().length > 0;
  const displayText = isStreaming || streamText ? streamText : localText;
  const showEditorPanel = showEditor || isStreaming || (streamText && !hasContent);

  async function handleGenerate() {
    setShowEditor(true);
    setShowHintInput(false);
    await stream(streamEndpoint, undefined, hint.trim() ? { hint: hint.trim() } : undefined);
  }

  function handleClickGenerate() {
    if (showHintInput) {
      handleGenerate();
    } else {
      setShowHintInput(true);
    }
  }

  function handleAccept() {
    setLocalText(streamText);
    reset(streamText);
  }

  function handleSave() {
    onSave(displayText);
    toast.success(`${label} salva com sucesso!`);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header com status badge */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-textLight text-sm font-medium">{label}</p>
          <p className="text-darkText text-xs mt-0.5">{description}</p>
        </div>
        {hasContent ? (
          <span className="flex items-center gap-1 text-greenAlert text-xs whitespace-nowrap shrink-0 mt-0.5">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} />
            {localText.trim().length} caracteres
          </span>
        ) : (
          <span className="flex items-center gap-1 text-yellowAlert text-xs whitespace-nowrap shrink-0 mt-0.5">
            <HugeiconsIcon icon={AlertCircleIcon} size={12} />
            Não configurado
          </span>
        )}
      </div>

      {/* Estado vazio — destaque para configurar */}
      {!hasContent && !showEditorPanel && (
        <div className="border border-yellowAlert/20 bg-yellowAlert/5 rounded-xl px-4 py-3 flex flex-col gap-3">
          <p className="text-darkText text-xs leading-relaxed">{impactMessage}</p>

          {showHintInput && (
            <div className="flex flex-col gap-2">
              <p className="text-textLight text-xs font-medium">
                Conte um pouco sobre sua loja para a IA gerar algo mais preciso:
              </p>
              <textarea
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
                }}
                autoFocus
                rows={2}
                placeholder={`Ex: Minha loja vende ${label === "FAQ" ? "roupas femininas, aceito trocas em 30 dias pelo WhatsApp" : label.includes("Troca") ? "calçados esportivos, troco em até 7 dias, produto deve estar sem uso" : "para todo o Brasil via Correios, prazo de 5 a 10 dias úteis"}...`}
                className="w-full bg-container border border-border rounded-lg px-3 py-2 text-white
                  placeholder:text-darkText focus:outline-none focus:border-primaryStroke
                  text-sm resize-none transition-colors"
              />
              <p className="text-darkText text-xs">Opcional — deixe em branco para gerar com base no nome da loja.</p>
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleClickGenerate}
              disabled={isStreaming}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                bg-primary text-white hover:bg-primaryHover transition-colors disabled:opacity-60"
            >
              <HugeiconsIcon icon={SparklesIcon} size={15} />
              {showHintInput ? "Gerar agora" : "Gerar com IA"}
            </button>
            {!showHintInput && (
              <button
                onClick={() => setShowEditor(true)}
                className="text-darkText text-sm hover:text-textLight transition-colors"
              >
                Escrever manualmente
              </button>
            )}
            {showHintInput && (
              <button
                onClick={() => setShowHintInput(false)}
                className="text-darkText text-sm hover:text-textLight transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Editor — aparece quando tem conteúdo ou ao editar */}
      {(hasContent || showEditorPanel) && (
        <>
          <StreamingText
            value={displayText}
            onChange={(v) => {
              if (!isStreaming) {
                setLocalText(v);
                reset(v);
              }
            }}
            isStreaming={isStreaming}
            placeholder={`Escreva sua ${label.toLowerCase()} ou gere com IA...`}
          />

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleGenerate()}
              disabled={isStreaming}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg
                bg-primary/10 text-lightPrimary border border-primary/30
                hover:bg-primary/20 transition-colors disabled:opacity-60"
            >
              {isStreaming ? <Spinner size="sm" /> : <HugeiconsIcon icon={SparklesIcon} size={13} />}
              {isStreaming ? "Gerando..." : hasContent ? "Regenerar com IA" : "Gerar com IA"}
            </button>

            {streamText && !isStreaming && streamText !== localText && (
              <button
                onClick={handleAccept}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-container border border-border
                  text-darkText hover:bg-containerHover hover:text-white transition-colors"
              >
                Usar texto gerado
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving || isStreaming}
              className="ml-auto px-5 py-2 text-sm font-medium text-white bg-primary hover:bg-primaryHover
                rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {isSaving ? <Spinner size="sm" /> : "Salvar"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

interface Props {
  settings: AiSettings;
  storeId: string;
  onSave: (data: Partial<AiSettings>) => void;
  isSaving: boolean;
}

export default function CustomTextsForm({ settings, storeId, onSave, isSaving }: Props) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";

  const filledCount = [settings.exchangePolicy, settings.shippingPolicy, settings.faq].filter(
    (v) => v && v.trim().length > 0
  ).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header de impacto */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
        <p className="text-lightPrimary text-xs font-medium mb-1">
          {filledCount === 3
            ? "Contexto completo — respostas no máximo da qualidade"
            : `${filledCount} de 3 configuradas — adicione mais para respostas melhores`}
        </p>
        <p className="text-darkText text-xs leading-relaxed">
          Esses textos são injetados diretamente no prompt da IA e são o maior diferencial
          entre respostas genéricas e respostas precisas sobre sua loja.
        </p>
      </div>

      <div className="flex flex-col divide-y divide-border gap-0">
        <div className="pb-6">
          <TextSection
            label="Política de Troca"
            description="Como a loja lida com devoluções e trocas de produtos."
            impactMessage="Sem isso, o assistente não sabe suas condições de troca e devolução — pode dar informações erradas para seus clientes."
            value={settings.exchangePolicy}
            onSave={(text) => onSave({ exchangePolicy: text || null })}
            isSaving={isSaving}
            streamEndpoint={`${apiBase}/stores/${storeId}/ai-content/generate/exchange-policy`}
          />
        </div>

        <div className="py-6">
          <TextSection
            label="Política de Envio"
            description="Prazos, transportadoras e condições de frete da loja."
            impactMessage="Sem isso, o assistente não consegue responder sobre prazos de entrega e condições de frete da sua loja."
            value={settings.shippingPolicy}
            onSave={(text) => onSave({ shippingPolicy: text || null })}
            isSaving={isSaving}
            streamEndpoint={`${apiBase}/stores/${storeId}/ai-content/generate/shipping-policy`}
          />
        </div>

        <div className="pt-6">
          <TextSection
            label="FAQ"
            description="Perguntas frequentes que o assistente pode usar para responder clientes."
            impactMessage="Adicione as dúvidas mais comuns dos seus clientes para que o assistente responda com precisão em vez de improvisar."
            value={settings.faq}
            onSave={(text) => onSave({ faq: text || null })}
            isSaving={isSaving}
            streamEndpoint={`${apiBase}/stores/${storeId}/ai-content/generate/faq`}
          />
        </div>
      </div>
    </div>
  );
}
