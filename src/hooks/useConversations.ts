import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { conversationsService } from "@/services/conversations.service";
import { ConversationStatus } from "@/types/conversation.types";

export function useConversations(storeId: string | null, status?: ConversationStatus) {
  return useQuery({
    queryKey: ["conversations", storeId, status],
    queryFn: () => conversationsService.list(storeId!, status),
    enabled: !!storeId,
  });
}

export function useConversation(id: string | null) {
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: () => conversationsService.getById(id!),
    enabled: !!id,
  });
}

export function useApproveConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => conversationsService.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Resposta aprovada e enviada.");
    },
    onError: () => toast.error("Erro ao aprovar. Tente novamente."),
  });
}

export function useRejectConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => conversationsService.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Resposta rejeitada.");
    },
    onError: () => toast.error("Erro ao rejeitar. Tente novamente."),
  });
}

export function useEditAndApprove() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      conversationsService.editAndApprove(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Resposta editada e enviada.");
    },
    onError: () => toast.error("Erro ao enviar. Tente novamente."),
  });
}
