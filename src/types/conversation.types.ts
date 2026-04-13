export type ConversationStatus =
  | "pending_manual_review"
  | "approved"
  | "sent"
  | "rejected"
  | "blacklist";

export type MessageDirection = "INBOUND" | "OUTBOUND";
export type DeliveryStatus = "DELIVERED" | "BOUNCED" | "DEFERRED";

export type EmailMessage = {
  id: string;
  conversationId: string;
  direction: MessageDirection;
  content: string;
  messageId: string | null;
  timestamp: string;
  deliveryStatus: DeliveryStatus | null;
  openCount: number;
  clickCount: number;
  firstOpenedAt: string | null;
  firstClickedAt: string | null;
  spamReported: boolean;
};

export type EmailConversation = {
  id: string;
  storeId: string;
  customerEmail: string;
  subject: string;
  status: ConversationStatus;
  blacklistTriggered: boolean;
  spamReported: boolean;
  createdAt: string;
  updatedAt: string;
  messages?: EmailMessage[];
};
