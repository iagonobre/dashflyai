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
    // Wait for auth to resolve before redirecting
    if (authLoading) return;
    // No active store = redirect to onboarding
    if (!storeId) {
      router.replace("/onboarding");
      return;
    }
    // Wait for subscription query to finish
    if (isLoading) return;
    if (!subscription) {
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
