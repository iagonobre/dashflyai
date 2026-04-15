"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAiSubscription } from "@/hooks/useSubscription";
import SubscriptionBanner from "./SubscriptionBanner";

export default function SubscriptionBannerWrapper() {
  const { storeId, loading: authLoading } = useAuth();
  const { data: subscription, isLoading } = useAiSubscription();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to resolve before redirecting
    if (authLoading) return;
    // No store at all (brand new user) → send to onboarding
    if (!storeId) {
      router.replace("/onboarding");
    }
    // NOTE: we intentionally do NOT redirect when !subscription.
    // If the user switches to an unconfigured store, they should see
    // the "AI não ativa" banner on the dashboard and choose what to do —
    // not get forced into onboarding and stuck there.
  }, [authLoading, storeId, router]);

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
