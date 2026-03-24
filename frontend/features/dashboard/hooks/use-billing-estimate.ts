"use client";

import { useQuery } from "@tanstack/react-query";
import { getBillingEstimate } from "@/features/dashboard/services/billing-service";

export function useBillingEstimate() {
  return useQuery({
    queryKey: ["billing", "estimate"],
    queryFn: getBillingEstimate,
  });
}
