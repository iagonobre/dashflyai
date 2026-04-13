import api from "@/services/api";
import { ConversationStatus, EmailConversation } from "@/types/conversation.types";

export const conversationsService = {
  list: (storeId: string, status?: ConversationStatus) =>
    api
      .get<EmailConversation[]>(`/email-conversations/${storeId}`, {
        params: status ? { status } : undefined,
      })
      .then((r) => r.data),

  getById: (id: string) =>
    api.get<EmailConversation>(`/email-conversations/detail/${id}`).then((r) => r.data),

  approve: (id: string) =>
    api.post<EmailConversation>(`/email-conversations/${id}/approve`).then((r) => r.data),

  reject: (id: string) =>
    api.post<EmailConversation>(`/email-conversations/${id}/reject`).then((r) => r.data),

  editAndApprove: (id: string, content: string) =>
    api
      .patch<EmailConversation>(`/email-conversations/${id}/edit-and-approve`, { content })
      .then((r) => r.data),
};
