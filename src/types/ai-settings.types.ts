export type CartAttempt = {
  enabled: boolean;
  delayHours: number;
  tone: string;
  useAiGenerated: boolean;
  customMessage: string | null;
  discountEnabled: boolean;
  discountPercent: number | null;
};

export type AiSettings = {
  id: string;
  storeId: string;
  isActive: boolean;

  // Identidade
  assistantName: string;
  language: "PT" | "EN";
  tone: "friendly" | "formal" | "casual";
  personality: string | null;

  // Sharing toggles
  shareTrackingCode: boolean;
  shareOrderDetails: boolean;
  shareInventoryStatus: boolean;
  shareExchangePolicy: boolean;
  shareDeliveryTime: boolean;
  shareProductPrices: boolean;

  // Email
  emailResponseActive: boolean;
  emailRequireApproval: boolean;
  emailFromName: string | null;
  emailSignature: string | null;
  autoDetectLanguage: boolean;
  emailSubjectBlacklist: string[];

  // Carrinho abandonado
  cartAbandonment: {
    enabled: boolean;
    attempts: CartAttempt[];
  };

  // Pós-compra
  postPurchase: {
    enabled: boolean;
    sendOrderConfirmation: boolean;
    sendTrackingEmail: boolean;
    upsellEnabled: boolean;
  };

  // Reengajamento
  reengagement: {
    enabled: boolean;
    inactivityDays: number;
  };

  // Delay de resposta
  replyDelay: {
    enabled: boolean;
    mode: "fixed" | "random";
    fixedMinutes: number;
    minMinutes: number;
    maxMinutes: number;
  } | null;

  // Textos customizados
  exchangePolicy: string | null;
  shippingPolicy: string | null;
  faq: string | null;
};
