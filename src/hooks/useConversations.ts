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

export function useConversation(storeId: string | null, id: string | null) {
  return useQuery({
    queryKey: ["conversation", storeId, id],
    queryFn: () => conversationsService.getById(storeId!, id!),
    enabled: !!storeId && !!id,
  });
}

export function useApproveConversation(storeId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => conversationsService.approve(storeId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Resposta aprovada e enviada.");
    },
    onError: () => toast.error("Erro ao aprovar. Tente novamente."),
  });
}

export function useRejectConversation(storeId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => conversationsService.reject(storeId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Resposta rejeitada.");
    },
    onError: () => toast.error("Erro ao rejeitar. Tente novamente."),
  });
}

export function useEditAndApprove(storeId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      conversationsService.editAndApprove(storeId!, id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Resposta editada e enviada.");
    },
    onError: () => toast.error("Erro ao enviar. Tente novamente."),
  });
}
