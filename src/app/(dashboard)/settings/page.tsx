"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  UserCircleIcon,
  Mail01Icon,
  AlertCircleIcon,
  LinkForwardIcon,
  ShieldKeyIcon,
  RobotIcon,
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
import {
  useInitForwarding,
  useSendForwardingVerification,
  useVerifyDns,
} from "@/hooks/useForwarding";
import { useAiSubscription } from "@/hooks/useSubscription";
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
import ReplyDelayForm from "@/components/settings/ReplyDelayForm";
import { AiSettings } from "@/types/ai-settings.types";

const tabs = [
  {
    id: "forwarding",
    label: "Encaminhamento",
    icon: LinkForwardIcon,
    description:
      "Configure o email da sua loja para o assistente receber mensagens",
  },
  {
    id: "dns",
    label: "Domínio",
    icon: ShieldKeyIcon,
    description: "Configure SPF e DKIM para que seus emails não caiam no spam",
  },
  {
    id: "email",
    label: "Respostas",
    icon: Mail01Icon,
    description: "Como o assistente responde e quais assuntos ignorar",
  },
  {
    id: "assistant",
    label: "Assistente",
    icon: UserCircleIcon,
    description: "Identidade, o que pode compartilhar e textos da loja",
  },
  {
    id: "automations",
    label: "Automações",
    icon: RobotIcon,
    description: "Carrinhos abandonados, pós-venda e reengajamento",
  },
] as const;

type TabId = (typeof tabs)[number]["id"];

function SettingsPage() {
  const { storeId, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabId | null) ?? "forwarding";
  const [activeTab, setActiveTab] = useState<TabId>(
    tabs.some((t) => t.id === initialTab) ? initialTab : "forwarding"
  );

  const { data: settings, isLoading, isError } = useAiSettings(storeId);
  const updateSettings = useUpdateAiSettings(storeId);
  const { data: subscription } = useAiSubscription(storeId);

  const {
    data: inboundEmails = [],
    isLoading: loadingEmails,
    isError: emailsError,
  } = useInboundEmails(storeId);
  const addEmail = useAddInboundEmail(storeId);
  const deleteEmail = useDeleteInboundEmail(storeId);
  const initForwarding = useInitForwarding(storeId);
  const sendVerification = useSendForwardingVerification(storeId);
  const verifyDns = useVerifyDns(storeId);

  function handleForwardingOAuth(_id: string, provider: "gmail" | "microsoft") {
    initForwarding.mutate(provider, {
      onSuccess: ({ authUrl }) => {
        window.open(authUrl, "_blank", "noopener,noreferrer");
      },
    });
  }

  function handleForwardingStartVerification(id: string) {
    sendVerification.mutate(id);
  }

  const emailNotConfigured = !loadingEmails && !emailsError && inboundEmails.length === 0;
  const spfNotVerified =
    !loadingEmails &&
    !emailsError &&
    inboundEmails.length > 0 &&
    inboundEmails.some((e) => !e.spfVerified);

  useEffect(() => {
    if (emailNotConfigured) setActiveTab("forwarding");
  }, [emailNotConfigured]);

  function handleSave(data: Partial<AiSettings>) {
    updateSettings.mutate(data, {
      onSuccess: () => toast.success("Configurações salvas!"),
    });
  }

  function handleToggle(data: Partial<AiSettings>) {
    updateSettings.mutate(data, {
      onSuccess: () => toast.success("Configuração salva!"),
    });
  }

  const showLoading = authLoading || isLoading;

  if (showLoading) {
    return (
      <div className="p-6 flex flex-col gap-6">
        <div className="h-8 w-48 bg-border/40 rounded animate-pulse" />
        <div className="h-20 bg-border/30 rounded-xl animate-pulse" />
        <div className="flex gap-6 max-md:flex-col">
          <div className="w-52 shrink-0 flex flex-col gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-border/30 rounded-lg animate-pulse"
              />
            ))}
          </div>
          <div className="flex-1 bg-container border border-border rounded-xl p-5 flex flex-col gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-10 bg-border/30 rounded animate-pulse"
              />
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
          Erro ao carregar configurações. Verifique sua conexão e tente
          novamente.
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
          Ajuste como a Dashfly AI funciona na sua loja.
        </p>
      </div>

      {/* Banner de setup */}
      {emailNotConfigured && (
        <div
          className="bg-primary/10 border border-primary/30 rounded-xl px-5 py-4
          flex items-start gap-4"
        >
          <div
            className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30
            flex items-center justify-center shrink-0 mt-0.5"
          >
            <HugeiconsIcon
              icon={AlertCircleIcon}
              size={18}
              className="text-lightPrimary"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold">
              Conecte o email da sua loja para começar
            </p>
            <p className="text-darkText text-xs mt-1 leading-relaxed">
              A Dashfly AI precisa saber qual email seus clientes usam para
              falar com você. Sem isso, o assistente não consegue ler nem
              responder mensagens.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-6 max-md:flex-col">
        {/* Nav lateral */}
        <nav
          className="w-52 shrink-0 flex flex-col gap-1 max-md:flex-row max-md:w-full
          max-md:overflow-x-auto max-md:pb-1"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const showDot = tab.id === "forwarding" && emailNotConfigured;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg
                  text-sm transition-colors text-left
                  ${
                    isActive
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
          <div className="px-6 py-5 border-b border-border">
            <p className="text-white font-semibold text-base">
              {tabs.find((t) => t.id === activeTab)?.label}
            </p>
            <p className="text-darkText text-sm mt-0.5">
              {tabs.find((t) => t.id === activeTab)?.description}
            </p>
          </div>

          <div className="px-6 py-6">
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
                onForwardingStartVerification={
                  handleForwardingStartVerification
                }
                isForwardingConnecting={initForwarding.isPending}
                isSendingVerification={sendVerification.isPending}
                maxEmails={subscription?.plan.inboundEmailsLimit ?? 1}
              />
            )}

            {/* DOMÍNIO */}
            {activeTab === "dns" && (
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-4 bg-background">
                  <DnsSettingsSection
                    emails={inboundEmails}
                    onVerifyDns={() => verifyDns.mutate()}
                    isVerifying={verifyDns.isPending}
                  />
                </div>
              </div>
            )}

            {/* RESPOSTAS */}
            {activeTab === "email" && (
              <div className="flex flex-col gap-10">
                {/* Banner SPF */}
                {spfNotVerified && (
                  <div
                    className="flex items-start gap-3 bg-yellowAlert/8 border border-yellowAlert/30
                    rounded-xl px-4 py-3"
                  >
                    <div
                      className="w-7 h-7 rounded-lg bg-yellowAlert/20 flex items-center
                      justify-center shrink-0 mt-0.5"
                    >
                      <HugeiconsIcon
                        icon={ShieldKeyIcon}
                        size={14}
                        className="text-yellowAlert"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-yellowAlert text-sm font-medium">
                        Domínio não autenticado
                      </p>
                      <p className="text-darkText text-xs mt-0.5 leading-relaxed">
                        Configure SPF e DKIM na aba{" "}
                        <button
                          onClick={() => setActiveTab("dns")}
                          className="text-lightPrimary hover:underline"
                        >
                          Domínio
                        </button>{" "}
                        para evitar que suas respostas caiam no spam.
                      </p>
                    </div>
                  </div>
                )}

                <section className="flex flex-col gap-4">
                  <div>
                    <p className="text-textLight text-base font-semibold">
                      Como o assistente responde
                    </p>
                    <p className="text-darkText text-sm mt-0.5">
                      Defina se as respostas são enviadas automaticamente ou
                      passam pela sua aprovação.
                    </p>
                  </div>
                  <EmailSettingsForm
                    settings={settings}
                    onSave={handleSave}
                    onToggle={handleToggle}
                    isSaving={updateSettings.isPending}
                    spfNotVerified={spfNotVerified}
                  />
                </section>

                <section className="border-t border-border pt-6 flex flex-col gap-4">
                  <div>
                    <p className="text-textLight text-base font-semibold">
                      Delay de resposta
                    </p>
                    <p className="text-darkText text-sm mt-0.5">
                      Configure um tempo de espera antes de responder, tornando
                      a interação mais natural e menos robótica.
                    </p>
                  </div>
                  <ReplyDelayForm
                    settings={settings}
                    onSave={handleSave}
                    isSaving={updateSettings.isPending}
                  />
                </section>

                <section className="border-t border-border pt-6 flex flex-col gap-4">
                  <div>
                    <p className="text-textLight text-base font-semibold">
                      Palavras de atenção
                    </p>
                    <p className="text-darkText text-sm mt-0.5">
                      Quando mencionadas pelo cliente, o assistente pausa e te
                      avisa para responder pessoalmente.
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

            {/* ASSISTENTE */}
            {activeTab === "assistant" && (
              <div className="flex flex-col gap-10">
                <section className="flex flex-col gap-4">
                  <div>
                    <p className="text-textLight text-base font-semibold">
                      Identidade
                    </p>
                    <p className="text-darkText text-sm mt-0.5">
                      Nome, idioma e tom de voz do assistente.
                    </p>
                  </div>
                  <AssistantIdentityForm
                    settings={settings}
                    onSave={handleSave}
                    isSaving={updateSettings.isPending}
                  />
                </section>

                <section className="border-t border-border pt-6 flex flex-col gap-4">
                  <div>
                    <p className="text-textLight text-base font-semibold">
                      O que pode compartilhar
                    </p>
                    <p className="text-darkText text-sm mt-0.5">
                      Informações da loja que o assistente pode divulgar nas
                      respostas.
                    </p>
                  </div>
                  <SharingTogglesForm
                    settings={settings}
                    onToggle={handleToggle}
                  />
                </section>

                <section className="border-t border-border pt-6 flex flex-col gap-4">
                  <div>
                    <p className="text-textLight text-base font-semibold">
                      Textos da loja
                    </p>
                    <p className="text-darkText text-sm mt-0.5">
                      Política de troca, envio e FAQ usados nas respostas.
                      Quanto mais completos, melhor.
                    </p>
                  </div>

                  <CustomTextsForm
                    settings={settings}
                    storeId={storeId ?? ""}
                    onSave={handleSave}
                    isSaving={updateSettings.isPending}
                  />
                </section>
              </div>
            )}

            {/* AUTOMAÇÕES */}
            {activeTab === "automations" && (
              <div className="flex flex-col gap-10">
                <section className="flex flex-col gap-4">
                  <div>
                    <p className="text-textLight text-base font-semibold">
                      Recuperar carrinhos
                    </p>
                    <p className="text-darkText text-sm mt-0.5">
                      Emails automáticos enviados quando um cliente abandona o
                      carrinho.
                    </p>
                  </div>
                  <CartAttemptsEditor
                    settings={settings}
                    onSave={handleSave}
                    isSaving={updateSettings.isPending}
                    spfNotVerified={spfNotVerified}
                  />
                </section>

                <section className="border-t border-border pt-6 flex flex-col gap-4">
                  <div>
                    <p className="text-textLight text-base font-semibold">
                      Após a venda
                    </p>
                    <p className="text-darkText text-sm mt-0.5">
                      Confirmação de pedido, rastreio e sugestões pós-compra.
                    </p>
                  </div>
                  <PostPurchaseForm
                    settings={settings}
                    onToggle={handleToggle}
                    spfNotVerified={spfNotVerified}
                  />
                </section>

                <section className="border-t border-border pt-6 flex flex-col gap-4">
                  <div>
                    <p className="text-textLight text-base font-semibold">
                      Clientes inativos
                    </p>
                    <p className="text-darkText text-sm mt-0.5">
                      Reative clientes que não compram há um tempo com um email
                      automático.
                    </p>
                  </div>
                  <ReengagementForm
                    settings={settings}
                    onToggle={handleToggle}
                    onSave={handleSave}
                    isSaving={updateSettings.isPending}
                    spfNotVerified={spfNotVerified}
                  />
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPageWrapper() {
  return (
    <Suspense>
      <SettingsPage />
    </Suspense>
  );
}
