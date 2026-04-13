import api from "./api";

export const forwardingService = {
  initOAuth: async (
    storeId: string,
    provider: "gmail" | "microsoft",
  ): Promise<{ authUrl: string }> => {
    const res = await api.post(`/stores/${storeId}/ai/email/forwarding/init`, { provider });
    return res.data;
  },

  confirmManual: async (storeId: string): Promise<void> => {
    await api.post(`/stores/${storeId}/ai/email/forwarding/confirm-manual`);
  },

  sendVerification: async (storeId: string, inboundEmailId: string): Promise<{ sent: boolean }> => {
    const res = await api.post(
      `/stores/${storeId}/ai/email/forwarding/${inboundEmailId}/send-verification`,
    );
    return res.data;
  },

  verifyDns: async (storeId: string): Promise<{ spf: boolean; dkim: boolean; checkedAt: string }> => {
    const res = await api.post(`/stores/${storeId}/ai/email/dns/verify`);
    return res.data;
  },
};
