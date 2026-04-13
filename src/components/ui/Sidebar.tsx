"use client";

import {
  Home01Icon,
  Mail01Icon,
  Settings01Icon,
  Logout03Icon,
  RobotIcon,
  CreditCardIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { useHeaderConfig } from "@/contexts/HeaderConfigContext";

const menuItems = [
  { name: "Visão Geral", icon: Home01Icon, path: "/" },
  { name: "Conversas", icon: Mail01Icon, path: "/conversations" },
  { name: "Automações", icon: RobotIcon, path: "/automations" },
  { name: "Configurações", icon: Settings01Icon, path: "/settings" },
  { name: "Assinatura", icon: CreditCardIcon, path: "/subscription" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { openSidebar, setOpenSidebar } = useHeaderConfig();

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
          justify-between border-x border-border text-white
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

        {/* Footer — usuário + logout em linha */}
        <div className="border-t border-border pt-3">
          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-container transition-colors duration-200">
            <div
              className="w-7 h-7 rounded-full bg-lightPrimary/20 border border-lightPrimary/30
              flex items-center justify-center shrink-0"
            >
              <span className="text-lightPrimary text-xs font-semibold">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </span>
            </div>

            <p className="text-textLight text-xs font-medium truncate flex-1">
              {user?.name ?? "Usuário"}
            </p>

            <button
              onClick={logout}
              className="text-darkText hover:text-redAlert transition-colors duration-200 shrink-0"
              title="Sair"
            >
              <HugeiconsIcon icon={Logout03Icon} size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
