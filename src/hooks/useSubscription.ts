import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { subscriptionService } from "@/services/subscription.service";

export function useAiPlans() {
  return useQuery({
    queryKey: ["ai-plans"],
    queryFn: () => subscriptionService.getPlans(),
  });
}

export function useAiSubscription(storeId: string | null) {
  return useQuery({
    queryKey: ["ai-subscription", storeId],
    queryFn: () => subscriptionService.getSubscription(storeId!),
    enabled: !!storeId,
  });
}

export function useSubscribeAi(storeId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => subscriptionService.subscribe(storeId!, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-subscription", storeId] });
    },
    onError: () => {
      toast.error("Erro ao iniciar o trial. Tente novamente.");
    },
  });
}

export function useCancelAiSubscription(storeId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => subscriptionService.cancel(storeId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-subscription", storeId] });
      toast.success("Assinatura cancelada.");
    },
    onError: () => {
      toast.error("Erro ao cancelar assinatura. Tente novamente.");
    },
  });
}
