"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import Spinner from "@/components/ui/Spinner";
import { AiSettings } from "@/types/ai-settings.types";

const schema = z.object({
  assistantName: z.string().min(1, "Nome obrigatório"),
  language: z.enum(["PT", "EN"]),
  tone: z.enum(["friendly", "formal", "casual"]),
  personality: z.string(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  settings: AiSettings;
  onSave: (data: Partial<AiSettings>) => void;
  isSaving: boolean;
}

const languageOptions = [
  { value: "PT", label: "Português (PT)" },
  { value: "EN", label: "English (EN)" },
];

const toneOptions = [
  { value: "friendly", label: "Amigável" },
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
];

export default function AssistantIdentityForm({ settings, onSave, isSaving }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      assistantName: settings.assistantName,
      language: settings.language,
      tone: settings.tone,
      personality: settings.personality ?? "",
    },
  });

  useEffect(() => {
    reset({
      assistantName: settings.assistantName,
      language: settings.language,
      tone: settings.tone,
      personality: settings.personality ?? "",
    });
  }, [settings, reset]);

  function onSubmit(data: FormData) {
    onSave({
      assistantName: data.assistantName,
      language: data.language,
      tone: data.tone,
      personality: data.personality || null,
    });
    toast.success("Identidade salva com sucesso!");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Nome do assistente */}
      <div className="flex flex-col gap-1.5">
        <label className="text-textLight text-sm font-medium">Nome do assistente</label>
        <input
          {...register("assistantName")}
          placeholder="Ex: Sofia, Max, Aria..."
          className="bg-container border border-border rounded-lg px-4 py-2.5 text-white
            placeholder:text-darkText focus:outline-none focus:border-primaryStroke
            text-sm transition-colors"
        />
        {errors.assistantName && (
          <p className="text-redAlert text-xs">{errors.assistantName.message}</p>
        )}
      </div>

      {/* Idioma */}
      <div className="flex flex-col gap-1.5">
        <label className="text-textLight text-sm font-medium">Idioma padrão</label>
        <select
          {...register("language")}
          className="bg-container border border-border rounded-lg px-4 py-2.5 text-white
            focus:outline-none focus:border-primaryStroke text-sm transition-colors appearance-none"
        >
          {languageOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-container">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tom de voz */}
      <div className="flex flex-col gap-1.5">
        <label className="text-textLight text-sm font-medium">Tom de voz</label>
        <select
          {...register("tone")}
          className="bg-container border border-border rounded-lg px-4 py-2.5 text-white
            focus:outline-none focus:border-primaryStroke text-sm transition-colors appearance-none"
        >
          {toneOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-container">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Personalidade */}
      <div className="flex flex-col gap-1.5">
        <label className="text-textLight text-sm font-medium">Personalidade</label>
        <p className="text-darkText text-xs">
          Descreva como o assistente deve se comportar e se apresentar ao cliente.
        </p>
        <textarea
          {...register("personality")}
          rows={4}
          placeholder="Ex: Sou Sofia, assistente virtual da Loja X. Sou simpática, prestativa e sempre respondo com empatia..."
          className="bg-container border border-border rounded-lg px-4 py-3 text-white
            placeholder:text-darkText focus:outline-none focus:border-primaryStroke
            text-sm resize-none transition-colors"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving || !isDirty}
          className="px-5 py-2 text-sm font-medium text-white bg-primary hover:bg-primaryHover
            rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          {isSaving ? <Spinner size="sm" /> : "Salvar"}
        </button>
      </div>
    </form>
  );
}
