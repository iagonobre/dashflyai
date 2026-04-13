export type AutomationStats = {
  conversationsMonth: number;
  emailsProcessedMonth: number;
  automationJobsMonth: number;
  pendingApprovalCount: number;
  openDisputesCount: number;
};

export type UnsubscribeScope = "ALL" | "CART" | "REENGAGEMENT";

export type UnsubscribeRecord = {
  id: string;
  customerEmail: string;
  scope: UnsubscribeScope;
  unsubscribedAt: string;
};

export type DisputeStatus = "pending_review" | "submitted" | "dismissed";

export type DisputeDraft = {
  id: string;
  shopifyDisputeId: string;
  orderNumber: string;
  amount: number;
  reason: string;
  draftContent: string;
  status: DisputeStatus;
  createdAt: string;
  reviewedAt: string | null;
};
