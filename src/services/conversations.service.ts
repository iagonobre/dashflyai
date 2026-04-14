import api from "@/services/api";
import { ConversationStatus, EmailConversation } from "@/types/conversation.types";

const base = (storeId: string) => `/stores/${storeId}/ai/email/conversations`;

export const conversationsService = {
  list: (storeId: string, status?: ConversationStatus) =>
    api
      .get<EmailConversation[]>(base(storeId), {
        params: status ? { status } : undefined,
      })
      .then((r) => r.data),

  getById: (storeId: string, id: string) =>
    api.get<EmailConversation>(`${base(storeId)}/${id}`).then((r) => r.data),

  approve: (storeId: string, id: string) =>
    api.post(`${base(storeId)}/${id}/approve`).then((r) => r.data),

  reject: (storeId: string, id: string) =>
    api.post(`${base(storeId)}/${id}/reject`).then((r) => r.data),

  editAndApprove: (storeId: string, id: string, content: string) =>
    api
      .patch(`${base(storeId)}/${id}/edit-and-approve`, { body: content })
      .then((r) => r.data),
};
