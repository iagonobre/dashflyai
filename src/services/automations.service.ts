import api from "@/services/api";
import { AutomationStats, UnsubscribeRecord } from "@/types/automation.types";
import { DisputeDraft } from "@/types/automation.types";

export const automationsService = {
  getStats: (storeId: string) =>
    api.get<AutomationStats>(`/automations/${storeId}/stats`).then((r) => r.data),

  listUnsubscribes: (storeId: string) =>
    api.get<UnsubscribeRecord[]>(`/automations/${storeId}/unsubscribes`).then((r) => r.data),

  removeUnsubscribe: (storeId: string, email: string) =>
    api.delete(`/automations/${storeId}/unsubscribes/${encodeURIComponent(email)}`).then((r) => r.data),

  listDisputeDrafts: (storeId: string) =>
    api.get<DisputeDraft[]>(`/dispute-drafts/${storeId}`).then((r) => r.data),

  updateDisputeDraft: (id: string, content: string) =>
    api.patch<DisputeDraft>(`/dispute-drafts/${id}`, { draftContent: content }).then((r) => r.data),

  dismissDisputeDraft: (id: string, status: "submitted" | "dismissed") =>
    api.post<DisputeDraft>(`/dispute-drafts/${id}/dismiss`, { status }).then((r) => r.data),
};
