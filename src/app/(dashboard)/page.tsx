"use client";

import {
  Mail01Icon,
  RobotIcon,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  SparklesIcon,
  ArrowRight01Icon,
  ShieldAlert,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { useAiSettings, useInboundEmails } from "@/hooks/useAiSettings";
import { useAutomationStats } from "@/hooks/useAutomationStats";
import { useConversations } from "@/hooks/useConversations";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

function StatCard({
  label,
  value,
  icon,
  alert,
  loading,
}: {
  label: string;
  value: number | undefined;
  icon: any;
  alert?: boolean;
  loading: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-container border rounded-xl p-5 flex flex-col gap-3",
        alert && (value ?? 0) > 0
          ? "border-yellowAlert/40"
          : "border-border"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-darkText text-sm">{label}</span>
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            alert && (value ?? 0) > 0
              ? "bg-yellowAlert/10"
              : "bg-secondaryContainer"
          )}
        >
          <HugeiconsIcon
            icon={icon}
            size={17}
            className={
              alert && (value ?? 0) > 0 ? "text-yellowAlert" : "text-darkText"
            }
          />
        </div>
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-border/40 rounded-md animate-pulse" />
      ) : (
        <p
          className={cn(
            "text-3xl font-semibold",
            alert && (value ?? 0) > 0 ? "text-yellowAlert" : "text-white"
          )}
        >
          {value ?? 0}
        </p>
      )}
    </div>
  );
}

export default function OverviewPage() {
  const { storeId } = useAuth();
  const router = useRouter();

  const { data: settings, isLoading: loadingSettings, isError: settingsError } = useAiSettings(storeId);
  const { data: stats, isLoading: loadingStats } = useAutomationStats(storeId);
  const { data: pending, isLoading: loadingPending } = useConversations(
    storeId,
    "pending_manual_review"
  );
  const { data: inboundEmails = [] } = useInboundEmails(storeId);

  const pendingList = pending?.slice(0, 5) ?? [];

  const DISMISS_KEY = `policies-banner-dismissed-${storeId}`;
  const [policyBannerDismissed, setPolicyBannerDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(DISMISS_KEY) === "1";
  });

  const RESUME_KEY = storeId ? `onboarding_resume_step_${storeId}` : null;
  const [resumeStep, setResumeStep] = useState<number | null>(() => {
    if (typeof window === "undefined" || !storeId) return null;
    const saved = localStorage.getItem(`onboarding_resume_step_${storeId}`);
    return saved ? parseInt(saved, 10) : null;
  });

  function dismissResumeBanner() {
    if (RESUME_KEY) localStorage.removeItem(RESUME_KEY);
    setResumeStep(null);
  }

  const hasUnconfiguredForwarding =
    !loadingSettings &&
    inboundEmails.some((e) => e.forwardingStatus !== "configured");

  const hasSpfNotVerified =
    !loadingSettings &&
    inboundEmails.length > 0 &&
    inboundEmails.some((e) => !e.spfVerified);

  const allPoliciesEmpty =
    !loadingSettings &&
    !!settings?.isActive &&
    !settings.exchangePolicy?.trim() &&
    !settings.shippingPolicy?.trim() &&
    !settings.faq?.trim();

  const showPolicyBanner = allPoliciesEmpty && !policyBannerDismissed;

  function dismissPolicyBanner() {
    localStorage.setItem(DISMISS_KEY, "1");
    setPolicyBannerDismissed(true);
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Título */}
      <div>
        <h1 className="text-white text-2xl font-semibold">Visão Geral</h1>
        <p className="text-darkText text-sm mt-1">
          Acompanhe o desempenho do seu atendimento automatizado.
        </p>
      </div>

      {/* Banner: retomada de onboarding */}
      {resumeStep !== null && !loadingSettings && !settings?.isActive && (
        <div className="bg-primary/8 border border-primaryStroke/30 rounded-xl px-5 py-4 flex items-start gap-4">
          <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primaryStroke/30 flex items-center justify-center shrink-0 mt-0.5">
            <HugeiconsIcon icon={resumeStep === 2 ? Mail01Icon : ShieldAlert} size={18} className="text-lightPrimary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold">
              {resumeStep === 2
                ? "Configuração de encaminhamento pendente"
                : "Verificação de domínio pendente"}
            </p>
            <p className="text-darkText text-sm mt-1 leading-relaxed">
              {resumeStep === 2
                ? "Você salvou o progresso do onboarding. Continue de onde parou para ativar o assistente."
                : "Configure o SPF e DKIM do seu domínio para ativar o envio de respostas."}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => router.push("/onboarding")}
                className="inline-flex items-center gap-1.5 text-lightPrimary text-sm hover:underline"
              >
                Retomar configuração
                <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
              </button>
              <button
                onClick={dismissResumeBanner}
                className="text-darkText text-sm hover:text-textLight transition-colors"
              >
                Dispensar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner: AI não ativa */}
      {!loadingSettings && settings && !settings.isActive && (
        <div className="bg-primary/8 border border-primaryStroke/30 rounded-xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primaryStroke/30 flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={SparklesIcon} size={20} className="text-lightPrimary" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Dashfly AI ainda não está ativo</p>
              <p className="text-darkText text-xs mt-0.5">
                Ative para começar a automatizar seu atendimento, emails e recuperação de carrinhos.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/onboarding")}
            className="shrink-0 bg-primary hover:bg-primaryHover text-white text-sm font-medium
              px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            Ativar agora
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
          </button>
        </div>
      )}

      {/* Banner: SPF não verificado */}
      {hasSpfNotVerified && !hasUnconfiguredForwarding && (
        <div className="bg-yellowAlert/8 border border-yellowAlert/30 rounded-xl px-5 py-4
          flex items-start gap-4">
          <div className="w-9 h-9 rounded-lg bg-yellowAlert/10 border border-yellowAlert/20
            flex items-center justify-center shrink-0 mt-0.5">
            <HugeiconsIcon icon={ShieldAlert} size={18} className="text-yellowAlert" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold">
              Configure SPF para evitar que suas respostas caiam no spam
            </p>
            <p className="text-darkText text-xs mt-1 leading-relaxed">
              Sem SPF verificado, os emails enviados pelo assistente podem ser bloqueados
              ou marcados como spam pelos provedores dos seus clientes.
            </p>
            <Link
              href="/settings?tab=dns"
              className="inline-flex items-center gap-1 text-yellowAlert text-xs mt-2 hover:underline"
            >
              Configurar SPF e DKIM
              <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
            </Link>
          </div>
        </div>
      )}

      {/* Banner: encaminhamento não configurado */}
      {hasUnconfiguredForwarding && (
        <div className="bg-yellowAlert/8 border border-yellowAlert/30 rounded-xl px-5 py-4
          flex items-start gap-4">
          <div className="w-9 h-9 rounded-lg bg-yellowAlert/10 border border-yellowAlert/20
            flex items-center justify-center shrink-0 mt-0.5">
            <HugeiconsIcon icon={AlertCircleIcon} size={18} className="text-yellowAlert" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold">
              Encaminhamento não configurado
            </p>
            <p className="text-darkText text-xs mt-1 leading-relaxed">
              O assistente não consegue receber emails enquanto o encaminhamento não estiver ativo.
            </p>
            <Link
              href="/settings"
              className="inline-flex items-center gap-1 text-yellowAlert text-xs mt-2 hover:underline"
            >
              Configurar agora
              <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
            </Link>
          </div>
        </div>
      )}

      {/* Banner: políticas não configuradas */}
      {showPolicyBanner && (
        <div className="bg-yellowAlert/8 border border-yellowAlert/20 rounded-xl p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-yellowAlert/10 border border-yellowAlert/20 flex items-center justify-center shrink-0 mt-0.5">
              <HugeiconsIcon icon={SparklesIcon} size={18} className="text-yellowAlert" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">
                Melhore as respostas do assistente
              </p>
              <p className="text-darkText text-xs mt-1 leading-relaxed">
                Configure suas políticas de troca, envio e FAQ para que o assistente
                responda com precisão sobre sua loja.
              </p>
              <Link
                href="/settings?tab=texts"
                className="inline-flex items-center gap-1 text-lightPrimary text-xs mt-2 hover:underline"
              >
                Configurar agora
                <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
              </Link>
            </div>
          </div>
          <button
            onClick={dismissPolicyBanner}
            className="text-darkText hover:text-textLight transition-colors shrink-0 mt-0.5"
            title="Dispensar"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>
      )}

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Conversas no mês"
          value={stats?.conversationsMonth}
          icon={Mail01Icon}
          loading={loadingStats}
        />
        <StatCard
          label="Emails processados"
          value={stats?.emailsProcessedMonth}
          icon={CheckmarkCircle01Icon}
          loading={loadingStats}
        />
        <StatCard
          label="Automações disparadas"
          value={stats?.automationJobsMonth}
          icon={RobotIcon}
          loading={loadingStats}
        />
        <StatCard
          label="Aguardando aprovação"
          value={stats?.pendingApprovalCount}
          icon={AlertCircleIcon}
          alert
          loading={loadingStats}
        />
      </div>

      {/* Seção: Pendentes de aprovação */}
      <div className="bg-container border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-white font-medium text-sm">Pendentes de aprovação</h2>
          <Link
            href="/conversations?status=pending_manual_review"
            className="text-primaryText text-xs hover:text-lightPrimaryText transition-colors flex items-center gap-1"
          >
            Ver todas
            <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
          </Link>
        </div>

        {loadingPending ? (
          <div className="flex flex-col divide-y divide-border">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                <div className="h-4 w-32 bg-border/40 rounded animate-pulse" />
                <div className="h-4 flex-1 bg-border/30 rounded animate-pulse" />
                <div className="h-5 w-20 bg-border/20 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        ) : pendingList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={28} className="text-greenAlert/60" />
            <p className="text-darkText text-sm">Nenhuma conversa pendente</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {pendingList.map((conv) => (
              <Link
                key={conv.id}
                href={`/conversations/${conv.id}`}
                className="px-5 py-4 flex items-center gap-4 hover:bg-containerHover transition-colors"
              >
                <p className="text-textLight text-sm truncate w-40 shrink-0">
                  {conv.customerEmail}
                </p>
                <p className="text-darkText text-sm truncate flex-1">{conv.subject}</p>
                <div className="flex items-center gap-2 shrink-0">
                  {conv.blacklistTriggered && (
                    <Badge variant="blacklist">
                      <HugeiconsIcon icon={ShieldAlert} size={11} />
                      Blacklist
                    </Badge>
                  )}
                  <span className="text-darkText text-xs whitespace-nowrap">
                    {formatDistanceToNow(new Date(conv.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Seção: Disputas abertas */}
      {(stats?.openDisputesCount ?? 0) > 0 && (
        <Link
          href="/automations"
          className="bg-redAlert/8 border border-redAlert/30 rounded-xl p-5
            flex items-center justify-between gap-4 hover:bg-redAlert/12 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-redAlert/10 border border-redAlert/30 flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={ShieldAlert} size={20} className="text-redAlert" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">
                {stats?.openDisputesCount}{" "}
                {stats?.openDisputesCount === 1 ? "disputa aberta" : "disputas abertas"}
              </p>
              <p className="text-darkText text-xs mt-0.5">
                A Dashfly AI gerou rascunhos de contestação para sua revisão.
              </p>
            </div>
          </div>
          <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="text-darkText shrink-0" />
        </Link>
      )}
    </div>
  );
}
