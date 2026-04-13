"use client";

import { createContext, useContext, useState } from "react";

interface HeaderConfigContextType {
  openSidebar: boolean;
  setOpenSidebar: (open: boolean) => void;
}

const HeaderConfigContext = createContext<HeaderConfigContextType | null>(null);

export function HeaderConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <HeaderConfigContext.Provider value={{ openSidebar, setOpenSidebar }}>
      {children}
    </HeaderConfigContext.Provider>
  );
}

export function useHeaderConfig() {
  const ctx = useContext(HeaderConfigContext);
  if (!ctx) {
    throw new Error(
      "useHeaderConfig must be used within a HeaderConfigProvider"
    );
  }
  return ctx;
}
