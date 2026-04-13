"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { destroyCookie, setCookie } from "nookies";
import { toast } from "sonner";

import api from "@/services/api";
import { User } from "@/types/user.types";

type AuthContextType = {
  user: User | null | undefined;
  storeId: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (access_token: string, refresh_token: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  setStoreId: (id: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [storeId, setStoreIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedStoreId = localStorage.getItem("selectedStoreId");

    if (savedUser) {
      const parsed: User = JSON.parse(savedUser);
      setUser(parsed);

      // Validate that savedStoreId belongs to this user's stores
      const storeIsValid =
        savedStoreId && parsed.stores?.some((s) => s.id === savedStoreId);
      const resolvedStoreId = storeIsValid
        ? savedStoreId
        : parsed.stores?.[0]?.id ?? null;

      setStoreIdState(resolvedStoreId);
      if (resolvedStoreId && resolvedStoreId !== savedStoreId) {
        localStorage.setItem("selectedStoreId", resolvedStoreId);
      }
    }

    api
      .get("/users/profile")
      .then((res) => {
        updateUser(res.data);

        // Re-validate after fresh profile — covers token reuse across accounts
        const currentStoreId = localStorage.getItem("selectedStoreId");
        const stillValid = res.data.stores?.some(
          (s: { id: string }) => s.id === currentStoreId
        );
        if (!stillValid && res.data.stores?.length > 0) {
          setStoreId(res.data.stores[0].id);
        }
      })
      .catch(() => {
        if (!savedUser) {
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function updateUser(user: User) {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  }

  function setStoreId(id: string) {
    setStoreIdState(id);
    localStorage.setItem("selectedStoreId", id);
  }

  async function login(access_token: string, refresh_token: string) {
    setLoading(true);
    try {
      const response = await api.get("/users/profile", {
        headers: { Authorization: `Bearer ${access_token}` },
        skipAuthInterceptor: true,
      } as any);

      const userData: User = response.data;

      setCookie(null, "access_token", access_token, {
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
        secure: true,
        sameSite: "strict",
      });

      localStorage.setItem("refresh_token", refresh_token);
      updateUser(userData);

      if (userData.stores && userData.stores.length > 0) {
        setStoreId(userData.stores[0].id);
      }

      router.push("/");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erro ao autenticar. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    destroyCookie(null, "access_token", { path: "/" });

    localStorage.removeItem("user");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("selectedStoreId");

    setUser(null);
    setStoreIdState(null);

    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        storeId,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
        setStoreId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return ctx;
}
