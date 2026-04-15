export type AiPlan = {
  id: string;
  name: string;
  slug: string;
  price: number;
  chatWidgetEnabled: boolean;
  emailResponseEnabled: boolean;
  inboundEmailsLimit: number;
  emailsPerMonthLimit: number;
  conversationsPerMonth: number;
  automationsEnabled: boolean;
  automationJobsPerMonth: number;
  maxCartAttempts: number;
  dashflyIntegrationEnabled: boolean;
};

export type AiSubscriptionStatus = "ACTIVE" | "TRIAL" | "CANCELED" | "OVERDUE" | "PENDING";

export type AiSubscription = {
  id: string;
  userId: string;
  plan: AiPlan;
  status: AiSubscriptionStatus;
  currentPeriodEnd: string;
  trialEndsAt: string | null;
  emailsUsedThisMonth: number;
  conversationsUsedThisMonth: number;
  automationJobsUsedThisMonth: number;
  totalInboundEmailsUsed: number;
  createdAt: string;
};

/** @deprecated Use AiSubscription instead */
export type AiStoreSubscription = AiSubscription;

export type StartTrialResponse = {
  trialDays: number;
  trialEndsAt: string;
  planName: string;
};
