import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { aiSettingsService } from "@/services/ai-settings.service";
import { AiSettings } from "@/types/ai-settings.types";

export type ForwardingStatus = "awaiting_confirmation" | "configured" | null;

export type InboundEmail = {
  id: string;
  label: string;
  inboundAddress: string;
  fromAddress: string;
  forwardingProvider: "gmail" | "microsoft" | "manual" | null;
  forwardingStatus: ForwardingStatus;
  forwardingConfiguredAt: string | null;
  forwardingVerificationSentAt: string | null;
  spfVerified: boolean;
  dkimVerified: boolean;
  dnsCheckedAt: string | null;
};

export function useAiSettings(storeId: string | null) {
  return useQuery({
    queryKey: ["ai-settings", storeId],
    queryFn: () => aiSettingsService.getSettings(storeId!),
    enabled: !!storeId,
  });
}

export function useActivateAi(storeId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => aiSettingsService.activate(storeId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-settings", storeId] });
    },
    onError: () => {
      toast.error("Erro ao ativar o Dashfly AI. Tente novamente.");
    },
  });
}

export function useUpdateAiSettings(storeId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<AiSettings>) =>
      aiSettingsService.updateSettings(storeId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-settings", storeId] });
    },
    onError: () => {
      toast.error("Erro ao salvar configurações. Tente novamente.");
    },
  });
}

export function useInboundEmails(storeId: string | null) {
  return useQuery<InboundEmail[]>({
    queryKey: ["inbound-emails", storeId],
    queryFn: () => aiSettingsService.listInboundEmails(storeId!),
    enabled: !!storeId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.some((e) => e.forwardingStatus === "awaiting_confirmation")) {
        return 5000;
      }
      return false;
    },
  });
}

export function useAddInboundEmail(storeId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { label: string; fromAddress: string }) =>
      aiSettingsService.addInboundEmail(storeId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbound-emails", storeId] });
      toast.success("Email de entrada adicionado!");
    },
    onError: () => {
      toast.error("Erro ao adicionar email. Tente novamente.");
    },
  });
}

export function useDeleteInboundEmail(storeId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => aiSettingsService.deleteInboundEmail(storeId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbound-emails", storeId] });
      toast.success("Email removido.");
    },
    onError: () => {
      toast.error("Erro ao remover email. Tente novamente.");
    },
  });
}
