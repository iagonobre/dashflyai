"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import Spinner from "@/components/ui/Spinner";
import Toggle from "@/components/ui/Toggle";
import { AiSettings } from "@/types/ai-settings.types";

const schema = z.object({
  emailFromName: z.string(),
  emailSignature: z.string(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  settings: AiSettings;
  onSave: (data: Partial<AiSettings>) => void;
  onToggle: (data: Partial<AiSettings>) => void;
  isSaving: boolean;
}

export default function EmailSettingsForm({ settings, onSave, onToggle, isSaving }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      emailFromName: settings.emailFromName ?? "",
      emailSignature: settings.emailSignature ?? "",
    },
  });

  useEffect(() => {
    reset({
      emailFromName: settings.emailFromName ?? "",
      emailSignature: settings.emailSignature ?? "",
    });
  }, [settings, reset]);

  function onSubmit(data: FormData) {
    onSave({
      emailFromName: data.emailFromName || null,
      emailSignature: data.emailSignature || null,
    });
    toast.success("Configurações de email salvas!");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Toggles */}
      <div className="flex flex-col divide-y divide-border">
        <div className="py-4 first:pt-0">
          <Toggle
            checked={settings.emailResponseActive}
            onChange={(checked) => onToggle({ emailResponseActive: checked })}
            label="Responder emails automaticamente"
            description="O assistente lê os emails dos seus clientes e responde sozinho, sem precisar da sua intervenção."
          />
        </div>
        <div className="py-4">
          <Toggle
            checked={settings.emailRequireApproval}
            onChange={(checked) => onToggle({ emailRequireApproval: checked })}
            label="Revisar antes de enviar"
            description="Você revisa e aprova cada resposta antes que ela seja enviada ao cliente. Recomendado para quem está começando."
          />
        </div>
        <div className="py-4">
          <Toggle
            checked={settings.autoDetectLanguage}
            onChange={(checked) => onToggle({ autoDetectLanguage: checked })}
            label="Responder no idioma do cliente"
            description="Se um cliente escrever em inglês, o assistente responde em inglês. Funciona com os principais idiomas."
          />
        </div>
      </div>

      {/* Nome do remetente */}
      <div className="flex flex-col gap-1.5">
        <label className="text-textLight text-sm font-medium">Nome do remetente</label>
        <input
          {...register("emailFromName")}
          placeholder="Ex: Suporte Loja X"
          className="bg-container border border-border rounded-lg px-4 py-2.5 text-white
            placeholder:text-darkText focus:outline-none focus:border-primaryStroke
            text-sm transition-colors"
        />
      </div>

      {/* Assinatura */}
      <div className="flex flex-col gap-1.5">
        <label className="text-textLight text-sm font-medium">Assinatura do email</label>
        <textarea
          {...register("emailSignature")}
          rows={3}
          placeholder="Ex: Att, Equipe de suporte | suporte@loja.com.br"
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
