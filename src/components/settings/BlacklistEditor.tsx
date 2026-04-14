"use client";

import { useState } from "react";
import { Add01Icon, CancelCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import Spinner from "@/components/ui/Spinner";
import { AiSettings } from "@/types/ai-settings.types";

interface Props {
  settings: AiSettings;
  onSave: (data: Partial<AiSettings>) => void;
  isSaving: boolean;
}

export default function BlacklistEditor({ settings, onSave, isSaving }: Props) {
  const [newWord, setNewWord] = useState("");

  const words = settings.emailSubjectBlacklist ?? [];

  function handleAdd() {
    const trimmed = newWord.trim().toLowerCase();
    if (!trimmed || words.includes(trimmed)) {
      setNewWord("");
      return;
    }
    onSave({ emailSubjectBlacklist: [...words, trimmed] });
    setNewWord("");
  }

  function handleRemove(word: string) {
    onSave({ emailSubjectBlacklist: words.filter((w) => w !== word) });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-darkText text-sm leading-relaxed">
          Quando um email do cliente mencionar alguma dessas palavras, o assistente{" "}
          <span className="text-yellowAlert font-medium">não responde automaticamente</span>{" "}
          — ele te avisa para você responder pessoalmente. Útil para assuntos delicados
          como reembolso, fraude ou reclamação.
        </p>
      </div>

      {/* Tags existentes */}
      {words.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {words.map((word) => (
            <span
              key={word}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-container
                border border-border text-textLight text-xs"
            >
              {word}
              <button
                onClick={() => handleRemove(word)}
                disabled={isSaving}
                className="text-darkText hover:text-redAlert transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <Spinner size="sm" />
                ) : (
                  <HugeiconsIcon icon={CancelCircleIcon} size={13} />
                )}
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input para adicionar */}
      <div className="flex gap-2">
        <input
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ex: reembolso, devolução, chargeback..."
          className="flex-1 bg-container border border-border rounded-lg px-4 py-2.5 text-white
            placeholder:text-darkText focus:outline-none focus:border-primaryStroke
            text-sm transition-colors"
        />
        <button
          onClick={handleAdd}
          disabled={isSaving || !newWord.trim()}
          className="px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primaryHover
            rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60 shrink-0"
        >
          <HugeiconsIcon icon={Add01Icon} size={15} />
          Adicionar
        </button>
      </div>
    </div>
  );
}
