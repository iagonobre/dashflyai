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
  disputeAlertsEnabled: boolean;
  dashflyIntegrationEnabled: boolean;
};

export type AiSubscriptionStatus = "ACTIVE" | "TRIAL" | "CANCELED" | "OVERDUE" | "PENDING";

export type AiStoreSubscription = {
  id: string;
  storeId: string;
  plan: AiPlan;
  status: AiSubscriptionStatus;
  currentPeriodEnd: string;
  trialEndsAt: string | null;
  emailsUsedThisMonth: number;
  conversationsUsedThisMonth: number;
  automationJobsUsedThisMonth: number;
  createdAt: string;
};

export type StartTrialResponse = {
  trialDays: number;
  trialEndsAt: string;
  planName: string;
};
