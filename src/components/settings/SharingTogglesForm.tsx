"use client";

import { AiSettings } from "@/types/ai-settings.types";
import Toggle from "@/components/ui/Toggle";

interface Props {
  settings: AiSettings;
  onToggle: (data: Partial<AiSettings>) => void;
}

const toggles: {
  key: keyof AiSettings;
  label: string;
  description: string;
}[] = [
  {
    key: "shareTrackingCode",
    label: "Onde está o pedido?",
    description:
      "Quando um cliente perguntar sobre a entrega, o assistente envia o link de rastreio para ele acompanhar.",
  },
  {
    key: "shareOrderDetails",
    label: "Detalhes do que foi comprado",
    description:
      "O assistente pode informar quais itens foram pedidos, quantidades e valor total.",
  },
  {
    key: "shareInventoryStatus",
    label: "Disponibilidade de produtos",
    description:
      "O assistente pode dizer se um produto está disponível ou fora de estoque.",
  },
  {
    key: "shareExchangePolicy",
    label: "Como funciona a troca ou devolução",
    description:
      "O assistente explica as regras de troca e devolução da sua loja quando o cliente perguntar.",
  },
  {
    key: "shareDeliveryTime",
    label: "Prazo de entrega",
    description:
      "O assistente informa a previsão de quando o pedido chegará ao cliente.",
  },
  {
    key: "shareProductPrices",
    label: "Preços dos produtos",
    description:
      "O assistente pode informar o preço de produtos quando o cliente perguntar.",
  },
];

export default function SharingTogglesForm({ settings, onToggle }: Props) {
  return (
    <div className="flex flex-col divide-y divide-border">
      <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 mb-2">
        <p className="text-lightPrimary text-xs font-medium mb-1">O que o assistente pode compartilhar</p>
        <p className="text-darkText text-xs leading-relaxed">
          Controle quais informações da sua loja o assistente está autorizado a revelar.
          Quando um item está desativado, o assistente ainda responde o cliente, mas sem mencionar aquela informação específica.
        </p>
      </div>
      {toggles.map(({ key, label, description }) => (
        <div key={key} className="py-4 first:pt-0 last:pb-0">
          <Toggle
            checked={settings[key] as boolean}
            onChange={(checked) => onToggle({ [key]: checked })}
            label={label}
            description={description}
          />
        </div>
      ))}
    </div>
  );
}
