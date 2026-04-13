"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowDown01Icon,
  CheckmarkCircle01Icon,
  Store01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";

function cleanUrl(url: string | null | undefined) {
  if (!url) return "";
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

export default function StoreSwitcher() {
  const { user, storeId, setStoreId, loading } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const stores = user?.stores ?? [];
  const currentStore = stores.find((s) => s.id === storeId) ?? stores[0];
  const hasMultiple = stores.length > 1;

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Skeleton while loading
  if (loading) {
    return (
      <div className="h-9.5 w-44 bg-border/40 rounded-xl animate-pulse" />
    );
  }

  if (!currentStore) return null;

  function handleSwitch(id: string) {
    if (id === storeId) {
      setOpen(false);
      return;
    }
    setStoreId(id);
    queryClient.clear();
    setOpen(false);
    const store = stores.find((s) => s.id === id);
    toast.success(`Loja alterada para ${store?.name ?? "nova loja"}`);
  }

  const initial = currentStore.name[0]?.toUpperCase() ?? "L";

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => hasMultiple && setOpen((v) => !v)}
        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border border-border
          bg-container transition-colors duration-200
          ${hasMultiple
            ? "hover:bg-containerHover cursor-pointer"
            : "cursor-default"
          }`}
        aria-haspopup={hasMultiple ? "listbox" : undefined}
        aria-expanded={hasMultiple ? open : undefined}
      >
        {/* Avatar */}
        <div
          className="w-6 h-6 rounded-md bg-primary/20 border border-primary/30
            flex items-center justify-center shrink-0"
        >
          <span className="text-lightPrimary text-[10px] font-bold leading-none">
            {initial}
          </span>
        </div>

        {/* Info */}
        <div className="flex flex-col items-start text-left min-w-0">
          <span className="text-white text-xs font-medium leading-tight truncate max-w-32.5">
            {currentStore.name}
          </span>
          <span className="text-darkText text-[10px] leading-tight truncate max-w-32.5">
            {cleanUrl(currentStore.url)}
          </span>
        </div>

        {/* Arrow */}
        {hasMultiple && (
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={13}
            className={`text-darkText transition-transform duration-200 shrink-0 ${
              open ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {/* Dropdown */}
      {open && hasMultiple && (
        <div
          role="listbox"
          className="absolute top-full left-0 mt-2 w-72 bg-container border border-border
            rounded-xl shadow-2xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="px-3 pt-3 pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Store01Icon} size={13} className="text-darkText" />
              <p className="text-darkText text-[10px] uppercase tracking-wider font-semibold">
                Suas lojas
              </p>
            </div>
          </div>

          {/* Stores list */}
          <div className="py-1.5">
            {stores.map((store) => {
              const isActive = store.id === storeId;
              const storeInitial = store.name[0]?.toUpperCase() ?? "L";

              return (
                <button
                  key={store.id}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSwitch(store.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5
                    hover:bg-containerHover transition-colors text-left group
                    ${isActive ? "bg-primary/5" : ""}`}
                >
                  {/* Store avatar */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                      transition-colors
                      ${isActive
                        ? "bg-primary/20 border border-primary/30"
                        : "bg-secondaryContainer border border-border group-hover:border-primaryStroke/30"
                      }`}
                  >
                    <span
                      className={`text-sm font-bold ${
                        isActive ? "text-lightPrimary" : "text-darkText"
                      }`}
                    >
                      {storeInitial}
                    </span>
                  </div>

                  {/* Store info */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span
                      className={`text-sm font-medium truncate ${
                        isActive ? "text-white" : "text-textLight"
                      }`}
                    >
                      {store.name}
                    </span>
                    <span className="text-darkText text-xs truncate">
                      {cleanUrl(store.url)}
                    </span>
                  </div>

                  {/* Active checkmark */}
                  {isActive && (
                    <HugeiconsIcon
                      icon={CheckmarkCircle01Icon}
                      size={15}
                      className="text-lightPrimary shrink-0"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
