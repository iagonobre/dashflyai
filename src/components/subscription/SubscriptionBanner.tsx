"use client";

import Link from "next/link";
import { AlertCircleIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiStoreSubscription } from "@/types/subscription.types";

interface Props {
  subscription: AiStoreSubscription | null | undefined;
}

export default function SubscriptionBanner({ subscription }: Props) {
  const isOverdue = subscription?.status === "OVERDUE";
  const isCanceled = subscription?.status === "CANCELED";
  const hasNoSubscription = !subscription;

  if (!isOverdue && !isCanceled && !hasNoSubscription) return null;

  const overdue = {
    bg: "bg-yellowAlert/8 border-yellowAlert/30",
    iconBg: "bg-yellowAlert/10 border-yellowAlert/20",
    iconColor: "text-yellowAlert",
    title: "Pagamento em atraso",
    description:
      "Sua assinatura do Dashfly AI está com pagamento pendente. O assistente foi pausado até a regularização.",
    cta: "Regularizar agora",
  };

  const noSub = {
    bg: "bg-redAlert/8 border-redAlert/30",
    iconBg: "bg-redAlert/10 border-redAlert/20",
    iconColor: "text-redAlert",
    title: isCanceled ? "Assinatura cancelada" : "Sem plano ativo",
    description: isCanceled
      ? "Você cancelou sua assinatura do Dashfly AI. Assine novamente para reativar o assistente."
      : "O Dashfly AI não possui um plano ativo. Escolha um plano para ativar o assistente.",
    cta: isCanceled ? "Reativar assinatura" : "Ver planos",
  };

  const config = isOverdue ? overdue : noSub;

  return (
    <div
      className={`${config.bg} border rounded-xl px-5 py-4
        flex items-center justify-between gap-4`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div
          className={`w-9 h-9 rounded-lg ${config.iconBg} border
            flex items-center justify-center shrink-0`}
        >
          <HugeiconsIcon
            icon={AlertCircleIcon}
            size={18}
            className={config.iconColor}
          />
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold">{config.title}</p>
          <p className="text-darkText text-xs mt-0.5 leading-relaxed">
            {config.description}
          </p>
        </div>
      </div>
      <Link
        href="/subscription"
        className={`shrink-0 flex items-center gap-1.5 text-sm font-medium
          hover:text-white transition-colors whitespace-nowrap
          ${isOverdue ? "text-yellowAlert" : "text-redAlert"}`}
      >
        {config.cta}
        <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
      </Link>
    </div>
  );
}
