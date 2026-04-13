"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckmarkCircle01Icon,
  SparklesIcon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { useAuth } from "@/contexts/AuthContext";
import {
  useAiSettings,
  useActivateAi,
  useUpdateAiSettings,
  useInboundEmails,
  useAddInboundEmail,
  useDeleteInboundEmail,
} from "@/hooks/useAiSettings";
import { useAiPlans, useAiSubscription, useSubscribeAi } from "@/hooks/useSubscription";
import { useInitForwarding, useSendForwardingVerification, useVerifyDns } from "@/hooks/useForwarding";
import { useStreamingContent } from "@/hooks/useStreamingContent";
import Toggle from "@/components/ui/Toggle";
import InboundEmailsManager from "@/components/settings/InboundEmailsManager";
import ForwardingSetup from "@/components/settings/ForwardingSetup";
import DnsSettingsSection from "@/components/settings/DnsSettingsSection";
import Spinner from "@/components/ui/Spinner";
import { AiSettings } from "@/types/ai-settings.types";
import { AiPlan } from "@/types/subscription.types";
import { cn } from "@/lib/utils";

// Step 7 = success screen, shown without step indicator
const TOTAL_STEPS = 9;
const SUCCESS_STEP = 8;

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const identitySchema = z.object({
  assistantName: z.string().min(1, "Nome obrigatório"),
  tone: z.enum(["friendly", "formal", "casual"]),
});
type IdentityForm = z.infer<typeof identitySchema>;

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < current
              ? "bg-primary w-6"
              : i === current
              ? "bg-primary w-10"
              : "bg-border w-6"
          }`}
        />
      ))}
    </div>
  );
}

function PlanOption({
  plan,
  selected,
  onSelect,
}: {
  plan: AiPlan;
  selected: boolean;
  onSelect: () => void;
}) {
  const features = [
    { label: "Email automático", enabled: plan.emailResponseEnabled },
    { label: "Automações (carrinho, pós-compra)", enabled: plan.automationsEnabled },
    { label: "Alertas de chargeback", enabled: plan.disputeAlertsEnabled },
    { label: `${plan.emailsPerMonthLimit} emails/mês`, enabled: true },
  ];

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left border rounded-xl p-4 flex flex-col gap-3 transition-all",
        selected
          ? "border-primaryStroke bg-primary/10"
          : "border-border bg-container hover:border-border/80"
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-sm font-semibold">{plan.name}</p>
          <p className="text-2xl font-bold text-white mt-0.5">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(plan.price)}
            <span className="text-darkText text-xs font-normal">/mês</span>
          </p>
        </div>
        <div
          className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
            selected ? "border-primaryStroke bg-primary" : "border-border"
          )}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {features.map((f) => (
          <div key={f.label} className="flex items-center gap-1.5">
            <HugeiconsIcon
              icon={f.enabled ? CheckmarkCircle01Icon : Cancel01Icon}
              size={13}
              className={f.enabled ? "text-greenAlert shrink-0" : "text-border shrink-0"}
            />
            <p className={cn("text-xs", f.enabled ? "text-textLight" : "text-darkText/50")}>
              {f.label}
            </p>
          </div>
        ))}
      </div>
    </button>
  );
}

export default function OnboardingPage() {
  const { user, storeId, setStoreId } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [trialDays, setTrialDays] = useState<number | null>(null);
  const [savedIdentity, setSavedIdentity] = useState<IdentityForm | null>(null);

  const activeStores = user?.stores ?? [];

  const { data: subscription, isLoading: loadingSubscription } = useAiSubscription(storeId);
  const { data: settings, isLoading: loadingSettings } = useAiSettings(storeId);
  const updateSettings = useUpdateAiSettings(storeId);
  const { data: inboundEmails = [], isLoading: loadingEmails } = useInboundEmails(storeId);
  const addEmail = useAddInboundEmail(storeId);
  const deleteEmail = useDeleteInboundEmail(storeId);
  const { data: plans = [], isLoading: loadingPlans } = useAiPlans();
  const subscribe = useSubscribeAi(storeId);
  const activateAi = useActivateAi(storeId);
  const initForwarding = useInitForwarding(storeId);
  const sendVerification = useSendForwardingVerification(storeId);
  const verifyDns = useVerifyDns(storeId);

  const exchangeAI = useStreamingContent();
  const shippingAI = useStreamingContent();
  const faqAI = useStreamingContent();

  // Only redirect if AI is fully activated — subscription alone doesn't mean onboarding is done
  useEffect(() => {
    if (!loadingSubscription && !loadingSettings && settings?.isActive && step === 0) {
      router.replace("/");
    }
  }, [loadingSubscription, loadingSettings, settings?.isActive, step, router]);

  // Skip plan step if subscription already exists (e.g. user refreshed mid-onboarding)
  useEffect(() => {
    if (!loadingSubscription && subscription && !settings?.isActive && step === 0) {
      setStep(1);
    }
  }, [loadingSubscription, subscription, settings?.isActive, step]);

  // Initialize policy fields from saved settings when they load
  useEffect(() => {
    if (!settings) return;
    exchangeAI.reset(settings.exchangePolicy ?? "");
    shippingAI.reset(settings.shippingPolicy ?? "");
    faqAI.reset(settings.faq ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.id]);

  const { register, handleSubmit, formState: { errors } } = useForm<IdentityForm>({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      assistantName: settings?.assistantName ?? "Assistente",
      tone: settings?.tone ?? "friendly",
    },
  });

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const hasEmailFeature = selectedPlan?.emailResponseEnabled ?? true;

  function next() {
    setStep((s) => {
      const n = s + 1;
      // Skip forwarding (2) and domain (3) if plan doesn't have email feature
      if ((n === 2 || n === 3) && !hasEmailFeature) return 4;
      return Math.min(n, TOTAL_STEPS - 1);
    });
  }

  function back() {
    setStep((s) => {
      const p = s - 1;
      if ((p === 2 || p === 3) && !hasEmailFeature) return 1;
      return Math.max(p, 0);
    });
  }

  function handleToggle(data: Partial<AiSettings>) {
    updateSettings.mutate(data);
  }

  function handleIdentitySubmit(data: IdentityForm) {
    updateSettings.mutate(
      { assistantName: data.assistantName, tone: data.tone },
      {
        onSuccess: () => {
          setSavedIdentity(data);
          next();
        },
      }
    );
  }

  function handleStartTrial() {
    if (!selectedPlanId) return;
    subscribe.mutate(selectedPlanId, {
      onSuccess: (res) => {
        setTrialDays(res.trialDays);
        next(); // → step 1
      },
    });
  }

  function handleOAuthConnect(provider: "gmail" | "microsoft") {
    initForwarding.mutate(provider, {
      onSuccess: ({ authUrl }) => {
        window.open(authUrl, "_blank", "noopener,noreferrer");
      },
    });
  }

  function handlePoliciesSubmit() {
    const data: Partial<AiSettings> = {};
    if (exchangeAI.text.trim()) data.exchangePolicy = exchangeAI.text.trim();
    if (shippingAI.text.trim()) data.shippingPolicy = shippingAI.text.trim();
    if (faqAI.text.trim()) data.faq = faqAI.text.trim();
    if (Object.keys(data).length === 0) {
      next();
      return;
    }
    updateSettings.mutate(data, { onSuccess: next });
  }

  function finish() {
    router.push("/");
  }

  // Store selection — shown when user has multiple stores and none is active yet
  if (user && !storeId && activeStores.length > 1) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-container border border-border rounded-2xl p-8 flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primaryStroke/30 flex items-center justify-center">
              <HugeiconsIcon icon={SparklesIcon} size={16} className="text-lightPrimary" />
            </div>
            <p className="text-darkText text-xs">Configuração inicial</p>
          </div>
          <div>
            <h2 className="text-white text-xl font-semibold">Para qual loja você quer configurar?</h2>
            <p className="text-darkText text-sm mt-2 leading-relaxed">
              Escolha a loja que o assistente vai atender. Você pode configurar as demais depois.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {activeStores.map((store) => (
              <button
                key={store.id}
                onClick={() => setStoreId(store.id)}
                className="w-full text-left border border-border bg-background hover:border-primaryStroke
                  hover:bg-primary/5 rounded-xl px-4 py-3 transition-all"
              >
                <p className="text-white text-sm font-medium">{store.name}</p>
                {store.url && (
                  <p className="text-darkText text-xs mt-0.5">{store.url}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Mostra spinner enquanto carrega OU enquanto tem subscription em step 0 (evita piscar antes do redirect)
  if (loadingSubscription || loadingSettings || loadingEmails || (settings?.isActive && step === 0)) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  const emailReady = inboundEmails.length > 0;
  const re = settings?.emailResponseActive ?? false;
  const approval = settings?.emailRequireApproval ?? false;
  const inboundAddress = inboundEmails[0]?.inboundAddress ?? "";
  const toneLabels: Record<string, string> = {
    friendly: "Amigável",
    formal: "Formal",
    casual: "Casual",
  };
  const tone = savedIdentity?.tone ?? settings?.tone ?? "friendly";
  const name = savedIdentity?.assistantName ?? settings?.assistantName ?? "Assistente";

  const filledPolicies = [exchangeAI.text, shippingAI.text, faqAI.text].filter(
    (t) => t.trim().length > 0
  ).length;
  const QUALITY_MAP = [
    { label: "Básica", desc: "respostas genéricas sem contexto da loja", dotColor: "bg-border" },
    { label: "Boa", desc: "com contexto parcial da loja", dotColor: "bg-yellowAlert" },
    { label: "Muito boa", desc: "quase completo", dotColor: "bg-orange-400" },
    { label: "Ótima", desc: "contexto completo da sua loja", dotColor: "bg-greenAlert" },
  ] as const;
  const quality = QUALITY_MAP[filledPolicies];

  // Visible steps count (excluding success screen)
  // If no email feature, steps 1 (email) and 2 (forwarding) merge into 1 skip
  const visibleSteps = hasEmailFeature ? TOTAL_STEPS - 1 : TOTAL_STEPS - 4;
  // Map real step to display index
  function displayIndex(s: number) {
    if (!hasEmailFeature && s > 3) return s - 3;
    return s;
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-container border border-border rounded-2xl overflow-hidden">

        {/* Progress header — hidden on success */}
        {step < SUCCESS_STEP && (
          <div className="px-8 pt-6 pb-0 flex items-center justify-between">
            <StepIndicator current={displayIndex(step)} total={visibleSteps} />
            <span className="text-darkText text-xs">
              {displayIndex(step) + 1} de {visibleSteps}
            </span>
          </div>
        )}

        <div className="px-8 py-8 flex flex-col gap-6">

          {/* ── STEP 0 — Escolha do plano ── */}
          {step === 0 && (
            <>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primaryStroke/30 flex items-center justify-center">
                    <HugeiconsIcon icon={SparklesIcon} size={16} className="text-lightPrimary" />
                  </div>
                  <p className="text-darkText text-xs">Configuração inicial</p>
                </div>
                <h2 className="text-white text-xl font-semibold">Escolha seu plano</h2>
                <p className="text-darkText text-sm mt-2 leading-relaxed">
                  Sem cobrança agora — você ganha dias de teste grátis e a cobrança só começa depois.
                </p>
              </div>

              {loadingPlans ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="md" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {plans.map((plan) => (
                    <PlanOption
                      key={plan.id}
                      plan={plan}
                      selected={selectedPlanId === plan.id}
                      onSelect={() => setSelectedPlanId(plan.id)}
                    />
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleStartTrial}
                  disabled={!selectedPlanId || subscribe.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white
                    bg-primary hover:bg-primaryHover rounded-xl transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {subscribe.isPending ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      Começar teste grátis
                      <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* ── STEP 1 — Email da loja ── */}
          {step === 1 && (
            <>
              <div>
                <h2 className="text-white text-xl font-semibold">
                  Qual email seus clientes usam para falar com você?
                </h2>
                <p className="text-darkText text-sm mt-2 leading-relaxed">
                  A Dashfly AI vai ler e responder as mensagens que chegarem nesse endereço.
                </p>
              </div>

              <InboundEmailsManager
                emails={inboundEmails}
                loading={loadingEmails}
                onAdd={(data) => addEmail.mutate(data)}
                onDelete={(id) => deleteEmail.mutate(id)}
                isAdding={addEmail.isPending}
                isDeleting={deleteEmail.isPending}
                defaultFormOpen
                hideForwardingStatus
              />

              <div className="flex items-center justify-between pt-2">
                <div />
                <button
                  onClick={next}
                  disabled={!emailReady}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white
                    bg-primary hover:bg-primaryHover rounded-xl transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo
                  <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
                </button>
              </div>
            </>
          )}

          {/* ── STEP 2 — Encaminhamento ── */}
          {step === 2 && (
            <>
              <div>
                <h2 className="text-white text-xl font-semibold">
                  Configure o encaminhamento
                </h2>
                <p className="text-darkText text-sm mt-2 leading-relaxed">
                  Para o assistente receber os emails dos seus clientes, você precisa configurar o encaminhamento
                  do seu email para o endereço gerado pelo Dashfly.
                </p>
              </div>

              <ForwardingSetup
                inboundAddress={inboundEmails[0]?.inboundAddress ?? ""}
                status={inboundEmails[0]?.forwardingStatus ?? null}
                provider={inboundEmails[0]?.forwardingProvider ?? null}
                configuredAt={inboundEmails[0]?.forwardingConfiguredAt ?? null}
                verificationSentAt={inboundEmails[0]?.forwardingVerificationSentAt ?? null}
                providerVerificationSubject={inboundEmails[0]?.providerVerificationSubject ?? null}
                providerVerificationBody={inboundEmails[0]?.providerVerificationBody ?? null}
                providerVerificationHtml={inboundEmails[0]?.providerVerificationHtml ?? null}
                onOAuthConnect={handleOAuthConnect}
                onStartVerification={() =>
                  sendVerification.mutate(inboundEmails[0]?.id ?? "", { onSuccess: next })
                }
                isConnecting={initForwarding.isPending}
                isSendingVerification={sendVerification.isPending}
              />

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={back}
                  className="flex items-center gap-1.5 text-darkText text-sm hover:text-textLight transition-colors"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={15} />
                  Voltar
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={next}
                    className="text-darkText text-sm hover:text-textLight transition-colors"
                  >
                    Configurar depois
                  </button>
                  <button
                    onClick={next}
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white
                      bg-primary hover:bg-primaryHover rounded-xl transition-colors"
                  >
                    Já configurei
                    <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── STEP 3 — Domínio ── */}
          {step === 3 && (
            <>
              <div>
                <h2 className="text-white text-xl font-semibold">
                  Configure seu domínio
                </h2>
                <p className="text-darkText text-sm mt-2 leading-relaxed">
                  Adicione dois registros DNS para que as respostas do assistente não caiam no spam dos seus clientes.
                </p>
              </div>

              <DnsSettingsSection
                emails={inboundEmails}
                onVerifyDns={() => verifyDns.mutate()}
                isVerifying={verifyDns.isPending}
              />

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={back}
                  className="flex items-center gap-1.5 text-darkText text-sm hover:text-textLight transition-colors"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={15} />
                  Voltar
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={next}
                    className="text-darkText text-sm hover:text-textLight transition-colors"
                  >
                    Configurar depois
                  </button>
                  <button
                    onClick={next}
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white
                      bg-primary hover:bg-primaryHover rounded-xl transition-colors"
                  >
                    Próximo
                    <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── STEP 4 — Comportamento ── */}
          {step === 4 && (
            <>
              <div>
                <h2 className="text-white text-xl font-semibold">
                  Como o assistente deve responder?
                </h2>
                <p className="text-darkText text-sm mt-2 leading-relaxed">
                  Você pode deixar o assistente responder sozinho ou revisar cada mensagem antes de enviar.
                </p>
              </div>

              <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
                <div className="p-4">
                  <Toggle
                    checked={re}
                    onChange={(checked) => handleToggle({ emailResponseActive: checked })}
                    label="Responder automaticamente"
                    description="O assistente lê e responde os emails dos clientes sem precisar da sua aprovação."
                  />
                </div>
                <div className="p-4">
                  <Toggle
                    checked={approval}
                    onChange={(checked) => handleToggle({ emailRequireApproval: checked })}
                    label="Revisar antes de enviar"
                    description="Você vê a resposta sugerida e decide se quer enviar. Ideal para quem está começando."
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={back}
                  className="flex items-center gap-1.5 text-darkText text-sm hover:text-textLight transition-colors"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={15} />
                  Voltar
                </button>
                <button
                  onClick={next}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white
                    bg-primary hover:bg-primaryHover rounded-xl transition-colors"
                >
                  Próximo
                  <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
                </button>
              </div>
            </>
          )}

          {/* ── STEP 5 — Identidade ── */}
          {step === 5 && (
            <form onSubmit={handleSubmit(handleIdentitySubmit)} className="flex flex-col gap-6">
              <div>
                <h2 className="text-white text-xl font-semibold">Como se chama o seu assistente?</h2>
                <p className="text-darkText text-sm mt-2 leading-relaxed">
                  Dê um nome e escolha como ele vai se comunicar com seus clientes.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-textLight text-sm font-medium">Nome do assistente</label>
                  <input
                    {...register("assistantName")}
                    placeholder="Ex: Sofia, Max, Aria, Lia..."
                    className="bg-background border border-border rounded-xl px-4 py-3 text-white
                      placeholder:text-darkText focus:outline-none focus:border-primaryStroke
                      text-sm transition-colors"
                  />
                  {errors.assistantName && (
                    <p className="text-redAlert text-xs">{errors.assistantName.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-textLight text-sm font-medium">Tom das respostas</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { value: "friendly", label: "Amigável", desc: "Próximo e caloroso" },
                        { value: "formal", label: "Formal", desc: "Profissional e objetivo" },
                        { value: "casual", label: "Casual", desc: "Descontraído e leve" },
                      ] as const
                    ).map((opt) => (
                      <label key={opt.value} className="cursor-pointer">
                        <input
                          {...register("tone")}
                          type="radio"
                          value={opt.value}
                          className="sr-only peer"
                        />
                        <div className="flex flex-col gap-0.5 px-3 py-2.5 rounded-xl border
                          border-border text-center transition-colors cursor-pointer
                          peer-checked:border-primaryStroke peer-checked:bg-primary/10
                          hover:border-border/80 hover:bg-containerHover">
                          <p className="text-textLight text-sm font-medium">{opt.label}</p>
                          <p className="text-darkText text-[11px]">{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={back}
                  className="flex items-center gap-1.5 text-darkText text-sm hover:text-textLight transition-colors"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={15} />
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={updateSettings.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white
                    bg-primary hover:bg-primaryHover rounded-xl transition-colors disabled:opacity-60"
                >
                  {updateSettings.isPending ? (
                    <Spinner size="sm" />
                  ) : (
                    <>Próximo <HugeiconsIcon icon={ArrowRight01Icon} size={15} /></>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 6 — Políticas e FAQ ── */}
          {step === 6 && (
            <>
              <div>
                <h2 className="text-white text-xl font-semibold">
                  Como o assistente deve responder sobre sua loja?
                </h2>
                <p className="text-darkText text-sm mt-2 leading-relaxed">
                  Quanto mais contexto você der, mais preciso o assistente será.
                  A IA gera tudo para você — revise e ajuste se quiser.
                </p>
              </div>

              {/* Quality indicator */}
              <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-3">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-2.5 h-2.5 rounded-full transition-colors duration-300",
                        i < filledPolicies ? quality.dotColor : "bg-border"
                      )}
                    />
                  ))}
                </div>
                <div>
                  <span className="text-textLight text-xs font-medium">{quality.label}</span>
                  <span className="text-darkText text-xs"> — {quality.desc}</span>
                </div>
              </div>

              {/* Policy fields */}
              <div className="flex flex-col gap-5">
                {/* Política de trocas */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-textLight text-sm font-medium">Política de trocas</label>
                    {exchangeAI.isStreaming ? (
                      <span className="text-darkText text-xs flex items-center gap-1.5">
                        <Spinner size="sm" /> Gerando...
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          exchangeAI.stream(
                            `${API_BASE}/ai-content/${storeId}/generate/exchange-policy`
                          )
                        }
                        className="flex items-center gap-1 text-lightPrimary text-xs hover:underline"
                      >
                        <HugeiconsIcon icon={SparklesIcon} size={12} /> Gerar com IA
                      </button>
                    )}
                  </div>
                  <p className="text-darkText text-[11px]">
                    Prazo para troca, condições, exceções, como iniciar...
                  </p>
                  <textarea
                    value={exchangeAI.text}
                    onChange={(e) => exchangeAI.reset(e.target.value)}
                    disabled={exchangeAI.isStreaming}
                    rows={3}
                    placeholder="Ex: Realizamos trocas em até 7 dias após o recebimento do produto..."
                    className="bg-background border border-border rounded-xl px-4 py-3 text-white text-sm
                      placeholder:text-darkText focus:outline-none focus:border-primaryStroke
                      resize-none transition-colors disabled:opacity-60"
                  />
                </div>

                {/* Política de envio */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-textLight text-sm font-medium">Política de envio</label>
                    {shippingAI.isStreaming ? (
                      <span className="text-darkText text-xs flex items-center gap-1.5">
                        <Spinner size="sm" /> Gerando...
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          shippingAI.stream(
                            `${API_BASE}/ai-content/${storeId}/generate/shipping-policy`
                          )
                        }
                        className="flex items-center gap-1 text-lightPrimary text-xs hover:underline"
                      >
                        <HugeiconsIcon icon={SparklesIcon} size={12} /> Gerar com IA
                      </button>
                    )}
                  </div>
                  <p className="text-darkText text-[11px]">
                    Prazo de entrega, frete, regiões atendidas, transportadoras...
                  </p>
                  <textarea
                    value={shippingAI.text}
                    onChange={(e) => shippingAI.reset(e.target.value)}
                    disabled={shippingAI.isStreaming}
                    rows={3}
                    placeholder="Ex: Entregamos para todo o Brasil em até 7 dias úteis via Correios..."
                    className="bg-background border border-border rounded-xl px-4 py-3 text-white text-sm
                      placeholder:text-darkText focus:outline-none focus:border-primaryStroke
                      resize-none transition-colors disabled:opacity-60"
                  />
                </div>

                {/* FAQ */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-textLight text-sm font-medium">FAQ — perguntas frequentes</label>
                    {faqAI.isStreaming ? (
                      <span className="text-darkText text-xs flex items-center gap-1.5">
                        <Spinner size="sm" /> Gerando...
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          faqAI.stream(`${API_BASE}/ai-content/${storeId}/generate/faq`)
                        }
                        className="flex items-center gap-1 text-lightPrimary text-xs hover:underline"
                      >
                        <HugeiconsIcon icon={SparklesIcon} size={12} /> Gerar com IA
                      </button>
                    )}
                  </div>
                  <p className="text-darkText text-[11px]">
                    Dúvidas comuns sobre produtos, pagamento, entrega, rastreio...
                  </p>
                  <textarea
                    value={faqAI.text}
                    onChange={(e) => faqAI.reset(e.target.value)}
                    disabled={faqAI.isStreaming}
                    rows={3}
                    placeholder="Ex: Como rastrear meu pedido? Quais formas de pagamento vocês aceitam?..."
                    className="bg-background border border-border rounded-xl px-4 py-3 text-white text-sm
                      placeholder:text-darkText focus:outline-none focus:border-primaryStroke
                      resize-none transition-colors disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={back}
                  className="flex items-center gap-1.5 text-darkText text-sm hover:text-textLight transition-colors"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={15} />
                  Voltar
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={next}
                    className="text-darkText text-sm hover:text-textLight transition-colors"
                  >
                    Configurar depois
                  </button>
                  <button
                    onClick={handlePoliciesSubmit}
                    disabled={updateSettings.isPending}
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white
                      bg-primary hover:bg-primaryHover rounded-xl transition-colors disabled:opacity-60"
                  >
                    {updateSettings.isPending ? (
                      <Spinner size="sm" />
                    ) : (
                      <>
                        Próximo
                        <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── STEP 7 — Resumo ── */}
          {step === 7 && (
            <>
              <div>
                <h2 className="text-white text-xl font-semibold">Tudo certo por aqui?</h2>
                <p className="text-darkText text-sm mt-2 leading-relaxed">
                  Confira as configurações antes de ativar. Você pode ajustar qualquer coisa depois.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {hasEmailFeature && (
                  <div className="bg-background border border-border rounded-xl px-4 py-3 flex flex-col gap-1">
                    <p className="text-darkText text-[11px] uppercase tracking-wide font-semibold">
                      Email de suporte
                    </p>
                    {inboundEmails.length > 0 ? (
                      inboundEmails.map((e) => (
                        <p key={e.id} className="text-textLight text-sm">
                          {e.fromAddress}
                          <span className="text-darkText text-xs"> · {e.label}</span>
                        </p>
                      ))
                    ) : (
                      <p className="text-darkText text-sm italic">Não configurado</p>
                    )}
                  </div>
                )}

                {hasEmailFeature && (
                  <div className="bg-background border border-border rounded-xl px-4 py-3 flex flex-col gap-1">
                    <p className="text-darkText text-[11px] uppercase tracking-wide font-semibold">
                      Comportamento
                    </p>
                    <p className="text-textLight text-sm">
                      {settings?.emailResponseActive ? "Resposta automática ativa" : "Resposta automática desativada"}
                    </p>
                    <p className="text-textLight text-sm">
                      {settings?.emailRequireApproval ? "Requer revisão" : "Envia sem revisão"}
                    </p>
                  </div>
                )}

                <div className="bg-background border border-border rounded-xl px-4 py-3 flex flex-col gap-1">
                  <p className="text-darkText text-[11px] uppercase tracking-wide font-semibold">
                    Assistente
                  </p>
                  <p className="text-textLight text-sm">
                    {name}
                    <span className="text-darkText text-xs"> · Tom {toneLabels[tone]}</span>
                  </p>
                </div>

                <div className="bg-background border border-border rounded-xl px-4 py-3 flex flex-col gap-1">
                  <p className="text-darkText text-[11px] uppercase tracking-wide font-semibold">
                    Políticas e FAQ
                  </p>
                  <p className="text-textLight text-sm">
                    {filledPolicies === 3
                      ? "Todas configuradas"
                      : filledPolicies > 0
                      ? `${filledPolicies} de 3 configuradas`
                      : "Nenhuma configurada"}
                    <span
                      className={cn(
                        "text-xs ml-1.5",
                        filledPolicies === 3
                          ? "text-greenAlert"
                          : filledPolicies > 0
                          ? "text-yellowAlert"
                          : "text-darkText"
                      )}
                    >
                      · {quality.label}
                    </span>
                  </p>
                </div>

                {selectedPlan && (
                  <div className="bg-background border border-border rounded-xl px-4 py-3 flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-darkText text-[11px] uppercase tracking-wide font-semibold">Plano</p>
                      <p className="text-textLight text-sm">{selectedPlan.name}</p>
                    </div>
                    <p className="text-white text-sm font-semibold shrink-0">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(selectedPlan.price)}
                      <span className="text-darkText text-xs font-normal">/mês</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={back}
                  className="flex items-center gap-1.5 text-darkText text-sm hover:text-textLight transition-colors"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={15} />
                  Voltar
                </button>
                <button
                  onClick={() => activateAi.mutate(undefined, { onSuccess: next })}
                  disabled={activateAi.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white
                    bg-primary hover:bg-primaryHover rounded-xl transition-colors disabled:opacity-60"
                >
                  {activateAi.isPending ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      Confirmar
                      <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* ── STEP 6 — Sucesso ── */}
          {step === SUCCESS_STEP && (
            <>
              <div className="flex flex-col items-center text-center gap-5 py-2">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-2xl bg-primary/20 border border-primaryStroke/30
                    flex items-center justify-center">
                    <HugeiconsIcon icon={SparklesIcon} size={36} className="text-lightPrimary" />
                  </div>
                  <div>
                    <p className="text-darkText text-xs uppercase tracking-widest font-semibold mb-1">
                      Você ganhou
                    </p>
                    <p className="text-white text-6xl font-bold">{trialDays ?? "7"}</p>
                    <p className="text-lightPrimary text-lg font-semibold mt-0.5">
                      {trialDays === 1 ? "dia de teste grátis" : "dias de teste grátis"}
                    </p>
                  </div>
                </div>

                <p className="text-darkText text-sm leading-relaxed max-w-sm">
                  A Dashfly AI está configurada e pronta para trabalhar. Nenhum valor será cobrado agora
                  — a cobrança começa apenas após o período de teste.
                </p>

                <div className="w-full flex flex-col gap-2 text-left bg-background border border-border rounded-xl px-4 py-3">
                  <p className="text-textLight text-xs font-medium">O que acontece agora?</p>
                  {[
                    "O assistente começa a ler e responder emails automaticamente",
                    "Você acompanha tudo pelo painel em tempo real",
                    `Após ${trialDays ?? 7} dias, cobramos a pro-rata do plano escolhido`,
                  ].map((line) => (
                    <div key={line} className="flex items-start gap-2">
                      <HugeiconsIcon
                        icon={CheckmarkCircle01Icon}
                        size={14}
                        className="text-greenAlert shrink-0 mt-0.5"
                      />
                      <p className="text-darkText text-xs leading-relaxed">{line}</p>
                    </div>
                  ))}
                  {filledPolicies === 0 && (
                    <div className="flex items-start gap-2 pt-1 border-t border-border mt-1">
                      <HugeiconsIcon
                        icon={SparklesIcon}
                        size={14}
                        className="text-lightPrimary shrink-0 mt-0.5"
                      />
                      <p className="text-darkText text-xs leading-relaxed">
                        Dica: configure suas políticas de troca e envio nas{" "}
                        <a href="/settings" className="text-lightPrimary hover:underline">
                          configurações
                        </a>{" "}
                        para respostas mais precisas
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={finish}
                className="w-full flex items-center justify-center gap-2 px-6 py-3
                  text-sm font-medium text-white bg-primary hover:bg-primaryHover
                  rounded-xl transition-colors"
              >
                Ir para o painel
                <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
