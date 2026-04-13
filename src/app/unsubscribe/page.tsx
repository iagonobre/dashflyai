"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckmarkCircle01Icon,
  Cancel01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Spinner from "@/components/ui/Spinner";

type State = "loading" | "success" | "error" | "invalid";

const SCOPES: Record<string, string> = {
  ALL: "Todos os emails automáticos",
  CART: "Emails de recuperação de carrinho",
  REENGAGEMENT: "Emails de reativação de clientes",
};

export default function UnsubscribePage() {
  const params = useSearchParams();
  const token = params.get("token");

  const [state, setState] = useState<State>(token ? "loading" : "invalid");
  const [scope, setScope] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

    fetch(`${apiUrl}/unsubscribe?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) {
          setState("error");
          return;
        }
        const data = await res.json().catch(() => ({}));
        setScope(data?.scope ?? null);
        setState("success");
      })
      .catch(() => setState("error"));
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primaryStroke/30
          flex items-center justify-center">
          <HugeiconsIcon icon={SparklesIcon} size={16} className="text-lightPrimary" />
        </div>
        <p className="text-white font-semibold">Dashfly AI</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-container border border-border rounded-2xl p-8
        flex flex-col items-center text-center gap-5">

        {state === "loading" && (
          <>
            <Spinner size="md" />
            <p className="text-darkText text-sm">Processando sua solicitação...</p>
          </>
        )}

        {state === "success" && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-greenAlert/10 border border-greenAlert/20
              flex items-center justify-center">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={28} className="text-greenAlert" />
            </div>
            <div>
              <h1 className="text-white text-xl font-semibold">
                Descadastro confirmado
              </h1>
              <p className="text-darkText text-sm mt-2 leading-relaxed">
                Você não receberá mais{" "}
                <span className="text-textLight">
                  {scope ? SCOPES[scope] ?? "emails automáticos" : "emails automáticos"}
                </span>{" "}
                desta loja.
              </p>
            </div>
            <div className="w-full bg-background border border-border rounded-xl px-4 py-3 text-left">
              <p className="text-darkText text-xs leading-relaxed">
                Se você descadastrou por engano ou mudou de ideia, entre em contato
                diretamente com a loja. Apenas eles podem desfazer esta ação.
              </p>
            </div>
          </>
        )}

        {state === "error" && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-redAlert/10 border border-redAlert/20
              flex items-center justify-center">
              <HugeiconsIcon icon={Cancel01Icon} size={28} className="text-redAlert" />
            </div>
            <div>
              <h1 className="text-white text-xl font-semibold">
                Link inválido ou expirado
              </h1>
              <p className="text-darkText text-sm mt-2 leading-relaxed">
                Não conseguimos processar sua solicitação. O link pode ter sido usado antes
                ou estar incorreto.
              </p>
            </div>
            <p className="text-darkText text-xs">
              Se continuar recebendo emails indesejados, entre em contato com a loja.
            </p>
          </>
        )}

        {state === "invalid" && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-border/20 border border-border
              flex items-center justify-center">
              <HugeiconsIcon icon={Cancel01Icon} size={28} className="text-darkText" />
            </div>
            <div>
              <h1 className="text-white text-xl font-semibold">Link inválido</h1>
              <p className="text-darkText text-sm mt-2 leading-relaxed">
                Este link de descadastro não é válido. Verifique se você copiou corretamente
                o link do email.
              </p>
            </div>
          </>
        )}
      </div>

      <p className="text-darkText text-xs mt-8">
        Dashfly AI · Atendimento automatizado para lojas online
      </p>
    </div>
  );
}
