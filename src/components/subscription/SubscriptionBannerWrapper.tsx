"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAiSubscription } from "@/hooks/useSubscription";
import SubscriptionBanner from "./SubscriptionBanner";

export default function SubscriptionBannerWrapper() {
  const { storeId, loading: authLoading } = useAuth();
  const { data: subscription, isLoading } = useAiSubscription(storeId);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to resolve and the query to finish before redirecting
    if (authLoading || !storeId || isLoading) return;
    if (subscription === null || subscription === undefined) {
      router.replace("/onboarding");
    }
  }, [authLoading, storeId, isLoading, subscription, router]);

  // Não mostra o banner na própria página de assinatura
  if (pathname === "/subscription") return null;
  if (isLoading) return null;
  if (!subscription) return null;

  return (
    <div className="px-6 pt-4">
      <SubscriptionBanner subscription={subscription} />
    </div>
  );
}
