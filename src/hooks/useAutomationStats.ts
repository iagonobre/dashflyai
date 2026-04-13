import { useQuery } from "@tanstack/react-query";
import { automationsService } from "@/services/automations.service";

export function useAutomationStats(storeId: string | null) {
  return useQuery({
    queryKey: ["automation-stats", storeId],
    queryFn: () => automationsService.getStats(storeId!),
    enabled: !!storeId,
  });
}
