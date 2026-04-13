"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  UserCircleIcon,
  Share01Icon,
  Mail01Icon,
  ShoppingCart01Icon,
  PackageIcon,
  ReloadIcon,
  TextSquareIcon,
  AlertCircleIcon,
  LinkForwardIcon,
  ShieldKeyIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { useAuth } from "@/contexts/AuthContext";
import {
  useAiSettings,
  useUpdateAiSettings,
  useInboundEmails,
  useAddInboundEmail,
  useDeleteInboundEmail,
} from "@/hooks/useAiSettings";
import { useInitForwarding, useConfirmManualForwarding } from "@/hooks/useForwarding";
import { toast } from "sonner";

import AssistantIdentityForm from "@/components/settings/AssistantIdentityForm";
import SharingTogglesForm from "@/components/settings/SharingTogglesForm";
import EmailSettingsForm from "@/components/settings/EmailSettingsForm";
import BlacklistEditor from "@/components/settings/BlacklistEditor";
import InboundEmailsManager from "@/components/settings/InboundEmailsManager";
import CartAttemptsEditor from "@/components/settings/CartAttemptsEditor";
import PostPurchaseForm from "@/components/settings/PostPurchaseForm";
import ReengagementForm from "@/components/settings/ReengagementForm";
import CustomTextsForm from "@/components/settings/CustomTextsForm";
import DnsSettingsSection from "@/components/settings/DnsSettingsSection";
import { AiSettings } from "@/types/ai-settings.types";

const tabs = [
  {
    id: "forwarding",
    label: "Encaminhamento",
    icon: LinkForwardIcon,
    description: "Configure o email da sua loja para o assistente receber mensagens",
  },
  {
    id: "email",
    label: "Respostas",
    icon: Mail01Icon,
    description: "Como o assistente responde e quais assuntos ignorar",
  },
  {
    id: "dns",
    label: "DNS / SPF / DKIM",
    icon: ShieldKeyIcon,
    description: "Autenticação de domínio para evitar spam",
  },
  {
    id: "identity",
    label: "Seu assistente",
    icon: UserCircleIcon,
    description: "Nome, idioma e personalidade",
  },
  {
    id: "sharing",
    label: "O que pode responder",
    icon: Share01Icon,
    description: "Informações que o assistente pode compartilhar",
  },
  {
    id: "cart",
    label: "Recuperar carrinhos",
    icon: ShoppingCart01Icon,
    description: "Emails automáticos para carrinhos abandonados",
  },
  {
    id: "postpurchase",
    label: "Após a venda",
    icon: PackageIcon,
    description: "Confirmações e rastreio pós-compra",
  },
  {
    id: "reengagement",
    label: "Clientes inativos",
    icon: ReloadIcon,
    description: "Reative clientes que não compram há tempo",
  },
  {
    id: "texts",
    label: "Textos da loja",
    icon: TextSquareIcon,
    description: "Política de troca, envio e FAQ",
  },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function SettingsPage() {
  const { storeId, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabId | null) ?? "forwarding";
  const [activeTab, setActiveTab] = useState<TabId>(
    tabs.some((t) => t.id === initialTab) ? initialTab : "forwarding"
  );

  const { data: settings, isLoading, isError } = useAiSettings(storeId);
  const updateSettings = useUpdateAiSettings(storeId);

  const { data: inboundEmails = [], isLoading: loadingEmails } = useInboundEmails(storeId);
  const addEmail = useAddInboundEmail(storeId);
  const deleteEmail = useDeleteInboundEmail(storeId);
  const initForwarding = useInitForwarding(storeId);
  const confirmManualForwarding = useConfirmManualForwarding(storeId);

  function handleForwardingOAuth(_id: string, provider: "gmail" | "microsoft") {
    initForwarding.mutate(provider, {
      onSuccess: ({ authUrl }) => {
        window.open(authUrl, "_blank", "noopener,noreferrer");
      },
    });
  }

  function handleForwardingConfirmManual(_id: string) {
    confirmManualForwarding.mutate();
  }

  // Redireciona para aba de encaminhamento enquanto não houver email configurado
  const emailNotConfigured = !loadingEmails && inboundEmails.length === 0;
  useEffect(() => {
    if (emailNotConfigured) setActiveTab("forwarding");
  }, [emailNotConfigured]);

  function handleSave(data: Partial<AiSettings>) {
    updateSettings.mutate(data, {
      onSuccess: () => toast.success("Configurações salvas!"),
    });
  }

  function handleToggle(data: Partial<AiSettings>) {
    updateSettings.mutate(data);
  }

  const showLoading = authLoading || isLoading;

  if (showLoading) {
    return (
      <div className="p-6 flex flex-col gap-6">
        <div className="h-8 w-48 bg-border/40 rounded animate-pulse" />
        <div className="h-20 bg-border/30 rounded-xl animate-pulse" />
        <div className="flex gap-6 max-md:flex-col">
          <div className="w-52 shrink-0 flex flex-col gap-1">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-12 bg-border/30 rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="flex-1 bg-container border border-border rounded-xl p-5 flex flex-col gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-border/30 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <div className="p-6">
        <p className="text-redAlert text-sm">
          Erro ao carregar configurações. Verifique sua conexão e tente novamente.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-white text-2xl font-semibold">Configurações</h1>
        <p className="text-darkText text-sm mt-1">
          Ajuste como o Dashfly AI funciona na sua loja.
        </p>
      </div>

      {/* Banner de setup — aparece enquanto nenhum email estiver conectado */}
      {emailNotConfigured && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl px-5 py-4
          flex items-start gap-4">
          <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30
            flex items-center justify-center shrink-0 mt-0.5">
            <HugeiconsIcon icon={AlertCircleIcon} size={18} className="text-lightPrimary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold">
              Conecte o email da sua loja para começar
            </p>
            <p className="text-darkText text-xs mt-1 leading-relaxed">
              O Dashfly AI precisa saber qual email seus clientes usam para falar com você.
              Sem isso, o assistente não consegue ler nem responder mensagens.
              Comece pela seção abaixo — leva menos de 2 minutos.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-6 max-md:flex-col">
        {/* Nav lateral */}
        <nav className="w-52 shrink-0 flex flex-col gap-1 max-md:flex-row max-md:w-full
          max-md:overflow-x-auto max-md:pb-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isForwardingTab = tab.id === "forwarding";
            const showDot = isForwardingTab && emailNotConfigured;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg
                  text-sm transition-colors text-left
                  ${isActive
                    ? "bg-container border border-border text-white"
                    : "text-darkText hover:bg-container hover:text-white border border-transparent"
                  }`}
              >
                <HugeiconsIcon
                  icon={tab.icon}
                  size={16}
                  className={isActive ? "text-lightPrimary" : ""}
                />
                <span className="whitespace-nowrap">{tab.label}</span>
                {showDot && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-yellowAlert shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Painel de conteúdo */}
        <div className="flex-1 bg-container border border-border rounded-xl overflow-hidden">
          {/* Header do painel */}
          <div className="px-5 py-4 border-b border-border">
            <p className="text-white font-semibold text-sm">
              {tabs.find((t) => t.id === activeTab)?.label}
            </p>
            <p className="text-darkText text-xs mt-0.5">
              {tabs.find((t) => t.id === activeTab)?.description}
            </p>
          </div>

          <div className="px-5 py-5">

            {/* ENCAMINHAMENTO */}
            {activeTab === "forwarding" && (
              <InboundEmailsManager
                emails={inboundEmails}
                loading={loadingEmails}
                onAdd={(data) => addEmail.mutate(data)}
                onDelete={(id) => deleteEmail.mutate(id)}
                isAdding={addEmail.isPending}
                isDeleting={deleteEmail.isPending}
                onForwardingOAuth={handleForwardingOAuth}
                onForwardingConfirmManual={handleForwardingConfirmManual}
                isForwardingConnecting={initForwarding.isPending}
                isForwardingConfirming={confirmManualForwarding.isPending}
              />
            )}

            {/* RESPOSTAS */}
            {activeTab === "email" && (
              <div className="flex flex-col gap-8">
                <section className="flex flex-col gap-3">
                  <div>
                    <p className="text-textLight text-sm font-semibold">
                      Como o assistente responde
                    </p>
                    <p className="text-darkText text-xs mt-0.5">
                      Defina se as respostas são enviadas automaticamente ou passam pela sua aprovação.
                    </p>
                  </div>
                  <EmailSettingsForm
                    settings={settings}
                    onSave={handleSave}
                    onToggle={handleToggle}
                    isSaving={updateSettings.isPending}
                  />
                </section>

                <section className="border-t border-border pt-6 flex flex-col gap-3">
                  <div>
                    <p className="text-textLight text-sm font-semibold">
                      Assuntos que precisam da sua atenção
                    </p>
                    <p className="text-darkText text-xs mt-0.5">
                      Quando um cliente mencionar essas palavras, o assistente pausa a
                      resposta automática e te avisa para responder pessoalmente.
                    </p>
                  </div>
                  <BlacklistEditor
                    settings={settings}
                    onSave={handleSave}
                    isSaving={updateSettings.isPending}
                  />
                </section>
              </div>
            )}

            {/* DNS / SPF / DKIM */}
            {activeTab === "dns" && <DnsSettingsSection />}

            {/* SEU ASSISTENTE */}
            {activeTab === "identity" && (
              <AssistantIdentityForm
                settings={settings}
                onSave={handleSave}
                isSaving={updateSettings.isPending}
              />
            )}

            {/* O QUE PODE RESPONDER */}
            {activeTab === "sharing" && (
              <div className="flex flex-col gap-4">
                <p className="text-darkText text-xs leading-relaxed">
                  Escolha quais informações o assistente pode compartilhar com os clientes
                  durante o atendimento. Você pode desativar qualquer item a qualquer momento.
                </p>
                <SharingTogglesForm settings={settings} onToggle={handleToggle} />
              </div>
            )}

            {/* RECUPERAR CARRINHOS */}
            {activeTab === "cart" && (
              <CartAttemptsEditor
                settings={settings}
                onSave={handleSave}
                isSaving={updateSettings.isPending}
              />
            )}

            {/* APÓS A VENDA */}
            {activeTab === "postpurchase" && (
              <PostPurchaseForm settings={settings} onToggle={handleToggle} />
            )}

            {/* CLIENTES INATIVOS */}
            {activeTab === "reengagement" && (
              <ReengagementForm
                settings={settings}
                onToggle={handleToggle}
                onSave={handleSave}
                isSaving={updateSettings.isPending}
              />
            )}

            {/* TEXTOS DA LOJA */}
            {activeTab === "texts" && (
              <div className="flex flex-col gap-3">
                <p className="text-darkText text-xs leading-relaxed">
                  Adicione ou gere com IA os textos que o assistente usa para responder
                  perguntas sobre a sua loja. Quanto mais completos, melhores as respostas.
                </p>
                <CustomTextsForm
                  settings={settings}
                  storeId={storeId ?? ""}
                  onSave={handleSave}
                  isSaving={updateSettings.isPending}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
