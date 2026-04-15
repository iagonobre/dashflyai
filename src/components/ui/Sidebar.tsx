"use client";

import {
  Home01Icon,
  Mail01Icon,
  Settings01Icon,
  RobotIcon,
  CreditCardIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { useHeaderConfig } from "@/contexts/HeaderConfigContext";
import { useAiSubscription } from "@/hooks/useSubscription";
import { useAutomationStats } from "@/hooks/useAutomations";

const menuItems = [
  { name: "Visão Geral", icon: Home01Icon, path: "/" },
  { name: "Conversas", icon: Mail01Icon, path: "/conversations" },
  { name: "Automações", icon: RobotIcon, path: "/automations" },
  { name: "Configurações", icon: Settings01Icon, path: "/settings" },
  { name: "Assinatura", icon: CreditCardIcon, path: "/subscription" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { openSidebar, setOpenSidebar } = useHeaderConfig();
  const { storeId } = useAuth();
  const { data: subscription } = useAiSubscription();
  const { data: stats } = useAutomationStats(storeId);

  const emailsUsed = stats?.emailsProcessedMonth ?? 0;
  const emailsLimit = subscription?.plan?.emailsPerMonthLimit ?? 0;
  const planName = subscription?.plan?.name ?? null;
  const usagePercent = emailsLimit > 0 ? Math.min((emailsUsed / emailsLimit) * 100, 100) : 0;
  const isNearLimit = usagePercent >= 80;

  return (
    <>
      {/* Overlay mobile */}
      {openSidebar && (
        <div
          className="fixed inset-0 z-28 bg-black/50 md:hidden"
          onClick={() => setOpenSidebar(false)}
        />
      )}

      <aside
        className={`w-56 h-screen fixed z-29 bg-secondaryContainer flex flex-col
          border-x border-border text-white
          pt-24 px-4 pb-4
          transition-transform duration-300
          ${
            openSidebar ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
      >
        {/* Nav */}
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive =
              item.path === "/"
                ? pathname === "/"
                : pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                href={item.path}
                prefetch={false}
                onClick={() => setOpenSidebar(false)}
                className={`relative flex items-center gap-3 p-2 px-3 rounded-lg border
                  transition-colors duration-200
                  ${
                    isActive
                      ? "bg-container text-white border-border"
                      : "text-darkText hover:bg-container hover:text-white border-transparent"
                  }`}
              >
                <HugeiconsIcon
                  icon={item.icon}
                  size={20}
                  className={isActive ? "text-lightPrimary" : ""}
                />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer — plano + uso de emails */}
        {planName && emailsLimit > 0 && (
          <div className="mt-auto border-t border-border pt-4 flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-darkText text-xs truncate">{planName}</span>
              <span className={`text-xs shrink-0 ${isNearLimit ? "text-yellowAlert" : "text-darkText"}`}>
                {emailsUsed.toLocaleString("pt-BR")}/{emailsLimit.toLocaleString("pt-BR")}
              </span>
            </div>
            <div className="h-1 w-full bg-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500
                  ${isNearLimit ? "bg-yellowAlert" : "bg-primary"}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
