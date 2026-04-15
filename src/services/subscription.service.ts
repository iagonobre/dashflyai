import api from "./api";
import { AiPlan, AiSubscription, StartTrialResponse } from "@/types/subscription.types";

export const subscriptionService = {
  getPlans: async (): Promise<AiPlan[]> => {
    const res = await api.get("/ai/plans");
    return res.data;
  },

  getSubscription: async (): Promise<AiSubscription | null> => {
    try {
      const res = await api.get("/ai/subscription");
      return res.data ?? null;
    } catch {
      // 403/404 = no active AI subscription for this user
      return null;
    }
  },

  subscribe: async (planId: string): Promise<StartTrialResponse> => {
    const res = await api.post("/ai/subscribe", { aiPlanId: planId });
    return res.data;
  },

  cancel: async (): Promise<void> => {
    await api.delete("/ai/subscription");
  },
};
