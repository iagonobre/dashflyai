import {
  ShieldAlert,
  Mail01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

import Badge from "@/components/ui/Badge";
import { EmailConversation, ConversationStatus } from "@/types/conversation.types";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  ConversationStatus,
  { label: string; variant: "pending" | "sent" | "rejected" | "blacklist" | "approved" | "default" }
> = {
  pending_manual_review: { label: "Pendente",  variant: "pending" },
  approved:              { label: "Aprovado",  variant: "approved" },
  sent:                  { label: "Enviado",   variant: "sent" },
  rejected:              { label: "Rejeitado", variant: "rejected" },
  blacklist:             { label: "Blacklist", variant: "blacklist" },
};

interface ConversationRowProps {
  conversation: EmailConversation;
}

export default function ConversationRow({ conversation: conv }: ConversationRowProps) {
  const status = statusConfig[conv.status];

  return (
    <Link
      href={`/conversations/${conv.id}`}
      className={cn(
        "flex items-center gap-4 px-5 py-4 hover:bg-containerHover transition-colors border-b border-border last:border-0",
        conv.blacklistTriggered && "bg-redAlert/5 hover:bg-redAlert/8"
      )}
    >
      {/* Ícone */}
      <div className="w-8 h-8 rounded-lg bg-secondaryContainer border border-border flex items-center justify-center shrink-0">
        <HugeiconsIcon
          icon={conv.blacklistTriggered ? ShieldAlert : Mail01Icon}
          size={16}
          className={conv.blacklistTriggered ? "text-redAlert" : "text-darkText"}
        />
      </div>

      {/* Email do cliente */}
      <p className="text-textLight text-sm truncate w-44 shrink-0">
        {conv.customerEmail}
      </p>

      {/* Assunto */}
      <p className="text-darkText text-sm truncate flex-1">{conv.subject}</p>

      {/* Badges + tempo */}
      <div className="flex items-center gap-2 shrink-0">
        {conv.blacklistTriggered && (
          <Badge variant="blacklist">
            <HugeiconsIcon icon={ShieldAlert} size={11} />
            Blacklist
          </Badge>
        )}
        <Badge variant={status.variant}>{status.label}</Badge>
        <span className="text-darkText text-xs flex items-center gap-1 max-md:hidden">
          <HugeiconsIcon icon={Clock01Icon} size={12} />
          {formatDistanceToNow(new Date(conv.createdAt), {
            addSuffix: true,
            locale: ptBR,
          })}
        </span>
      </div>
    </Link>
  );
}
