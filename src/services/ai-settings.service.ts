import api from "@/services/api";
import { AiSettings } from "@/types/ai-settings.types";

export const aiSettingsService = {
  getSettings: (storeId: string) =>
    api.get<AiSettings>(`/ai-settings/${storeId}`).then((r) => r.data),

  updateSettings: (storeId: string, data: Partial<AiSettings>) =>
    api.patch<AiSettings>(`/ai-settings/${storeId}`, data).then((r) => r.data),

  activate: (storeId: string) =>
    api.post<AiSettings>(`/ai-settings/${storeId}/activate`).then((r) => r.data),

  listInboundEmails: (storeId: string) =>
    api.get(`/ai-settings/${storeId}/inbound-emails`).then((r) => r.data),

  addInboundEmail: (storeId: string, data: { label: string; fromAddress: string }) =>
    api.post(`/ai-settings/${storeId}/inbound-emails`, data).then((r) => r.data),

  deleteInboundEmail: (storeId: string, id: string) =>
    api.delete(`/ai-settings/${storeId}/inbound-emails/${id}`).then((r) => r.data),
};
