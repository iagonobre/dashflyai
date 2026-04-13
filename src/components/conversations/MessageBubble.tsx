import {
  Mail01Icon,
  RobotIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import Badge from "@/components/ui/Badge";
import { EmailMessage } from "@/types/conversation.types";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: EmailMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isOutbound = message.direction === "OUTBOUND";

  return (
    <div className={cn("flex flex-col gap-1", isOutbound ? "items-end" : "items-start")}>
      {/* Remetente */}
      <div className="flex items-center gap-1.5 px-1">
        <HugeiconsIcon
          icon={isOutbound ? RobotIcon : Mail01Icon}
          size={13}
          className={isOutbound ? "text-lightPrimary" : "text-darkText"}
        />
        <span className="text-xs text-darkText">
          {isOutbound ? "Dashfly AI" : "Cliente"}
        </span>
        <span className="text-darkText/50 text-[11px]">
          · {format(new Date(message.timestamp), "dd MMM, HH:mm", { locale: ptBR })}
        </span>
      </div>

      {/* Balão */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
          isOutbound
            ? "bg-primary/20 border border-primaryStroke/30 text-textLight rounded-tr-sm"
            : "bg-container border border-border text-textLight rounded-tl-sm"
        )}
      >
        {message.content}
      </div>

      {/* Métricas de entrega (só outbound) */}
      {isOutbound && (
        <div className="flex items-center gap-2 px-1 flex-wrap">
          {message.deliveryStatus === "DELIVERED" && (
            <span className="flex items-center gap-1 text-[11px] text-greenAlert/70">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={11} />
              Entregue
            </span>
          )}
          {message.deliveryStatus === "BOUNCED" && (
            <Badge variant="rejected">Bounce</Badge>
          )}
          {message.deliveryStatus === "DEFERRED" && (
            <Badge variant="warning">Adiado</Badge>
          )}
          {message.openCount > 0 && (
            <span className="text-[11px] text-darkText">
              {message.openCount}x aberto
            </span>
          )}
          {message.clickCount > 0 && (
            <span className="text-[11px] text-darkText">
              {message.clickCount}x clicado
            </span>
          )}
          {message.spamReported && (
            <Badge variant="rejected">
              <HugeiconsIcon icon={AlertCircleIcon} size={11} />
              Spam
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
