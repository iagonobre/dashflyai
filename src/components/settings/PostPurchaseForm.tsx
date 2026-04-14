"use client";

import Toggle from "@/components/ui/Toggle";
import { AiSettings } from "@/types/ai-settings.types";

interface Props {
  settings: AiSettings;
  onToggle: (data: Partial<AiSettings>) => void;
  spfNotVerified?: boolean;
}

export default function PostPurchaseForm({ settings, onToggle, spfNotVerified = false }: Props) {
  const pp = settings.postPurchase ?? { enabled: false, sendOrderConfirmation: false, sendTrackingEmail: false, upsellEnabled: false };

  function update(patch: Partial<typeof pp>) {
    onToggle({ postPurchase: { ...pp, ...patch } });
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      <div className="py-4 first:pt-0">
        <Toggle
          checked={pp.enabled}
          onChange={(checked) => update({ enabled: checked })}
          label="Ativar emails pós-compra"
          description="O assistente envia emails automáticos para o cliente depois que ele comprar na sua loja."
          warning={spfNotVerified ? "Domínio não verificado" : undefined}
          disabled={spfNotVerified}
        />
      </div>

      {pp.enabled && (
        <>
          <div className="py-4">
            <Toggle
              checked={pp.sendOrderConfirmation}
              onChange={(checked) => update({ sendOrderConfirmation: checked })}
              label="Confirmação do pedido"
              description='Envia um "Seu pedido foi confirmado!" assim que a compra é realizada.'
            />
          </div>
          <div className="py-4">
            <Toggle
              checked={pp.sendTrackingEmail}
              onChange={(checked) => update({ sendTrackingEmail: checked })}
              label="Aviso de envio com rastreio"
              description="Quando o pedido é despachado, o cliente recebe um email com o link para acompanhar a entrega."
            />
          </div>
          <div className="py-4 last:pb-0">
            <Toggle
              checked={pp.upsellEnabled}
              onChange={(checked) => update({ upsellEnabled: checked })}
              label="Sugerir produtos relacionados"
              description="Após a compra, o assistente sugere produtos complementares que podem interessar o cliente."
            />
          </div>
        </>
      )}
    </div>
  );
}
