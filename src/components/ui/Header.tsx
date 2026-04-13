"use client";

import { Menu01Icon, CancelIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@/contexts/AuthContext";
import { useHeaderConfig } from "@/contexts/HeaderConfigContext";
import StoreSwitcher from "@/components/ui/StoreSwitcher";

export default function Header() {
  const { openSidebar, setOpenSidebar } = useHeaderConfig();
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 w-full h-20 z-30 bg-secondaryContainer border-b border-border flex items-center">
      {/* Área da sidebar — w-56 — logo centrada aqui no desktop */}
      <div className="hidden md:flex w-56 shrink-0 items-center justify-center border-r border-border h-full">
        <Link href="/">
          <Image
            src="/assets/horizontal-logo.svg"
            alt="Dashfly"
            width={150}
            height={22}
            priority
          />
        </Link>
      </div>

      {/* Conteúdo do header — resto da largura */}
      <div className="flex flex-1 items-center gap-3 px-4 md:px-6">
        {/* Hamburger mobile */}
        <button
          onClick={() => setOpenSidebar(!openSidebar)}
          className="h-10 w-10 flex items-center justify-center rounded-lg
            bg-container border border-border shrink-0 md:hidden"
          aria-label="Abrir menu"
        >
          <HugeiconsIcon
            icon={openSidebar ? CancelIcon : Menu01Icon}
            size={20}
            className="text-darkText"
          />
        </button>

        {/* Logo mobile */}
        <Link href="/" className="md:hidden shrink-0">
          <Image
            src="/assets/horizontal-logo.svg"
            alt="Dashfly"
            width={110}
            height={20}
            priority
          />
        </Link>

        {/* Store Switcher — visível em todos os breakpoints */}
        <StoreSwitcher />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Direita: badge AI + usuário */}
        <div className="flex items-center gap-3 shrink-0">
          <span
            className="text-[10px] font-semibold tracking-widest uppercase px-2 py-1 rounded-full
              bg-lightPrimary/15 text-lightPrimary border border-lightPrimary/30"
          >
            AI
          </span>

          {user && (
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <div
                className="w-7 h-7 rounded-full bg-lightPrimary/20 border border-lightPrimary/30
                flex items-center justify-center shrink-0"
              >
                <span className="text-lightPrimary text-xs font-semibold">
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </span>
              </div>
              <span className="text-textLight text-sm max-md:hidden truncate max-w-32">
                {user.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
