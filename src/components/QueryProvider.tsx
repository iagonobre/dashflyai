"use client";

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";

function BackendOfflineQueryGuard({ children }: { children: React.ReactNode }) {
  const { backendOffline } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!backendOffline) return;
    // Cancel in-flight requests so they stop spinning — but don't globally
    // disable queries (that would break mutations and future navigations)
    queryClient.cancelQueries();
  }, [backendOffline, queryClient]);

  return <>{children}</>;
}

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            // Don't retry network errors (backend offline) — only retry HTTP errors
            retry: (failureCount, error: any) => {
              if (!error?.response) return false;
              return failureCount < 1;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <BackendOfflineQueryGuard>{children}</BackendOfflineQueryGuard>
    </QueryClientProvider>
  );
}
