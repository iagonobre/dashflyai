"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail01Icon,
  LockPasswordIcon,
  EyeIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import { z } from "zod";

import { useState } from "react";
import { useForm } from "react-hook-form";

import Image from "next/image";

import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "O email é obrigatório.")
    .email("Endereço de email inválido."),
  password: z.string().min(1, "A senha é obrigatória."),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit({ email, password }: LoginSchema) {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password }, {
        skipAuthInterceptor: true,
      } as any);

      const { access_token, refresh_token } =
        response.data.tokens ?? response.data;
      await login(access_token, refresh_token);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Credenciais inválidas. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md px-4">
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <Image
          src="/assets/horizontal-logo.svg"
          alt="Dashfly"
          width={200}
          height={30}
          priority
          className="mb-3"
        />
        <p className="text-darkText text-xs tracking-widest uppercase font-light">
          AI Assistant for Merchants
        </p>
      </div>

      {/* Card */}
      <div className="bg-container border border-border rounded-2xl p-8">
        <h1 className="text-white text-xl font-semibold mb-1">Entrar</h1>
        <p className="text-darkText text-sm mb-8">
          Use as mesmas credenciais do Dashfly.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-textLight text-sm font-medium"
            >
              Email
            </label>
            <div className="relative">
              <HugeiconsIcon
                icon={Mail01Icon}
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-darkText pointer-events-none"
              />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                {...register("email")}
                className={cn(
                  "w-full bg-background border rounded-lg pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-darkText",
                  "focus:outline-none focus:border-primaryStroke transition-colors",
                  errors.email ? "border-redAlert" : "border-border"
                )}
              />
            </div>
            {errors.email && (
              <p className="text-redAlert text-xs">{errors.email.message}</p>
            )}
          </div>

          {/* Senha */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-textLight text-sm font-medium"
            >
              Senha
            </label>
            <div className="relative">
              <HugeiconsIcon
                icon={LockPasswordIcon}
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-darkText pointer-events-none"
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
                className={cn(
                  "w-full bg-background border rounded-lg pl-9 pr-10 py-2.5 text-white text-sm placeholder:text-darkText",
                  "focus:outline-none focus:border-primaryStroke transition-colors",
                  errors.password ? "border-redAlert" : "border-border"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-darkText hover:text-white transition-colors"
                tabIndex={-1}
              >
                <HugeiconsIcon
                  icon={showPassword ? ViewOffIcon : EyeIcon}
                  size={16}
                />
              </button>
            </div>
            {errors.password && (
              <p className="text-redAlert text-xs">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "mt-2 w-full bg-primary hover:bg-primaryHover text-white font-medium rounded-lg py-2.5 text-sm",
              "transition-colors flex items-center justify-center gap-2",
              isLoading && "opacity-60"
            )}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-darkText text-xs mt-6">
        Problemas para acessar?{" "}
        <a
          href="https://dashfly.com.br/help"
          className="text-lightPrimaryText hover:text-white transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Fale com o suporte
        </a>
      </p>
    </div>
  );
}
