export type AutomationStats = {
  conversationsMonth: number;
  emailsProcessedMonth: number;
  automationJobsMonth: number;
  pendingApprovalCount: number;
};

export type UnsubscribeScope = "ALL" | "CART" | "REENGAGEMENT";

export type UnsubscribeRecord = {
  id: string;
  customerEmail: string;
  scope: UnsubscribeScope;
  unsubscribedAt: string;
};
