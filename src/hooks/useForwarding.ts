import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { forwardingService } from "@/services/forwarding.service";

export function useInitForwarding(storeId: string | null) {
  return useMutation({
    mutationFn: (provider: "gmail" | "microsoft") =>
      forwardingService.initOAuth(storeId!, provider),
    onError: () => {
      toast.error("Erro ao iniciar conexão. Tente novamente.");
    },
  });
}

export function useConfirmManualForwarding(storeId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => forwardingService.confirmManual(storeId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbound-emails", storeId] });
      toast.success("Encaminhamento marcado como configurado!");
    },
    onError: () => {
      toast.error("Erro ao confirmar. Tente novamente.");
    },
  });
}

export function useSendForwardingVerification(storeId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inboundEmailId: string) =>
      forwardingService.sendVerification(storeId!, inboundEmailId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbound-emails", storeId] });
    },
    onError: () => {
      toast.error("Erro ao enviar email de verificação. Tente novamente.");
    },
  });
}

export function useVerifyDns(storeId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => forwardingService.verifyDns(storeId!),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["inbound-emails", storeId] });
      if (data.spf && data.dkim) {
        toast.success("SPF e DKIM verificados com sucesso!");
      } else if (data.spf) {
        toast.success("SPF verificado! Configure o DKIM para melhor entregabilidade.");
      } else {
        toast.error("SPF não encontrado. Verifique se o registro foi adicionado corretamente.");
      }
    },
    onError: () => {
      toast.error("Erro ao verificar DNS. Tente novamente.");
    },
  });
}
