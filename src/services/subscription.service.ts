import api from "./api";
import { AiPlan, AiStoreSubscription, StartTrialResponse } from "@/types/subscription.types";

export const subscriptionService = {
  getPlans: async (): Promise<AiPlan[]> => {
    const res = await api.get("/ai/plans");
    return res.data;
  },

  getSubscription: async (storeId: string): Promise<AiStoreSubscription | null> => {
    const res = await api.get(`/stores/${storeId}/ai/subscription`);
    return res.data;
  },

  subscribe: async (storeId: string, planId: string): Promise<StartTrialResponse> => {
    const res = await api.post(`/stores/${storeId}/ai/subscribe`, { aiPlanId: planId });
    return res.data;
  },

  cancel: async (storeId: string): Promise<void> => {
    await api.delete(`/stores/${storeId}/ai/cancel`);
  },
};
