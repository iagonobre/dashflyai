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

export function useDisputeDrafts(storeId: string | null) {
  return useQuery({
    queryKey: ["dispute-drafts", storeId],
    queryFn: () => automationsService.listDisputeDrafts(storeId!),
    enabled: !!storeId,
  });
}

export function useUpdateDisputeDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      automationsService.updateDisputeDraft(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispute-drafts"] });
      toast.success("Rascunho salvo.");
    },
    onError: () => toast.error("Erro ao salvar. Tente novamente."),
  });
}

export function useDismissDisputeDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "submitted" | "dismissed" }) =>
      automationsService.dismissDisputeDraft(id, status),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["dispute-drafts"] });
      toast.success(status === "submitted" ? "Marcado como submetido." : "Alerta descartado.");
    },
    onError: () => toast.error("Erro ao atualizar. Tente novamente."),
  });
}
