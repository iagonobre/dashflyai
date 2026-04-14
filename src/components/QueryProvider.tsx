"use client";

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";

function BackendOfflineQueryGuard({ children }: { children: React.ReactNode }) {
  const { backendOffline } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!backendOffline) return;

    // Cancel all in-flight queries so they stop spinning
    queryClient.cancelQueries();

    // Disable all queries while offline — they won't refetch until re-enabled
    queryClient.setDefaultOptions({
      queries: {
        enabled: false,
        retry: false,
        staleTime: 60 * 1000,
      },
    });
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
