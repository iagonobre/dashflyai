import api from "@/services/api";
import { AutomationStats, UnsubscribeRecord } from "@/types/automation.types";

export const automationsService = {
  getStats: (storeId: string) =>
    api.get<AutomationStats>(`/automations/${storeId}/stats`).then((r) => r.data),

  listUnsubscribes: (storeId: string) =>
    api.get<UnsubscribeRecord[]>(`/automations/${storeId}/unsubscribes`).then((r) => r.data),

  removeUnsubscribe: (storeId: string, email: string) =>
    api.delete(`/automations/${storeId}/unsubscribes/${encodeURIComponent(email)}`).then((r) => r.data),
};
