import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import { HeaderConfigProvider } from "@/contexts/HeaderConfigContext";
import SubscriptionBannerWrapper from "@/components/subscription/SubscriptionBannerWrapper";
import BackendOfflineBanner from "@/components/ui/BackendOfflineBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HeaderConfigProvider>
      <Header />
      <Sidebar />
      <main className="pt-20 md:pl-56 w-full min-h-screen overflow-y-auto">
        <BackendOfflineBanner />
        <SubscriptionBannerWrapper />
        {children}
      </main>
    </HeaderConfigProvider>
  );
}
