import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { automationsService } from "@/services/automations.service";

export function useAutomationStats(storeId: string | null) {
  return useQuery({
    queryKey: ["automation-stats", storeId],
    queryFn: () => automationsService.getStats(storeId!),
    enabled: !!storeId,
  });
}

export function useUnsubscribes(storeId: string | null) {
  return useQuery({
    queryKey: ["unsubscribes", storeId],
    queryFn: () => automationsService.listUnsubscribes(storeId!),
    enabled: !!storeId,
  });
}

export function useRemoveUnsubscribe(storeId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => automationsService.removeUnsubscribe(storeId!, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unsubscribes", storeId] });
      toast.success("Email removido da blacklist.");
    },
    onError: () => toast.error("Erro ao remover. Tente novamente."),
  });
}
