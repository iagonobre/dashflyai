import {
  Mail01Icon,
  RobotIcon,
  ShoppingCart01Icon,
  UserLove01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { AutomationStats } from "@/types/automation.types";

interface Props {
  stats: AutomationStats | undefined;
  loading: boolean;
}

const cards = [
  { key: "conversationsMonth",   label: "Conversas no mês",     icon: Mail01Icon },
  { key: "emailsProcessedMonth", label: "Emails processados",    icon: Mail01Icon },
  { key: "automationJobsMonth",  label: "Automações disparadas", icon: RobotIcon },
] as const;

function SkeletonCard() {
  return (
    <div className="bg-container border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 bg-border/40 rounded animate-pulse" />
        <div className="w-8 h-8 rounded-lg bg-border/30 animate-pulse" />
      </div>
      <div className="h-8 w-16 bg-border/40 rounded animate-pulse" />
    </div>
  );
}

export default function AutomationStatsCards({ stats, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map(({ key, label, icon }) => (
        <div key={key} className="bg-container border border-border rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-darkText text-sm">{label}</span>
            <div className="w-8 h-8 rounded-lg bg-secondaryContainer flex items-center justify-center">
              <HugeiconsIcon icon={icon} size={17} className="text-darkText" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-white">
            {stats?.[key] ?? 0}
          </p>
        </div>
      ))}
    </div>
  );
}
