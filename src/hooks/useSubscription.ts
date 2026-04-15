import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { subscriptionService } from "@/services/subscription.service";

export function useAiPlans() {
  return useQuery({
    queryKey: ["ai-plans"],
    queryFn: () => subscriptionService.getPlans(),
  });
}

export function useAiSubscription() {
  return useQuery({
    queryKey: ["ai-subscription"],
    queryFn: () => subscriptionService.getSubscription(),
  });
}

export function useSubscribeAi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => subscriptionService.subscribe(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-subscription"] });
    },
    onError: () => {
      toast.error("Erro ao iniciar o trial. Tente novamente.");
    },
  });
}

export function useCancelAiSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => subscriptionService.cancel(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-subscription"] });
      toast.success("Assinatura cancelada.");
    },
    onError: () => {
      toast.error("Erro ao cancelar assinatura. Tente novamente.");
    },
  });
}
