"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BillingEstimateActivityRange,
  getBillingEstimate,
} from "@/features/dashboard/services/billing-service";

export function useBillingEstimate(
  activityRange: BillingEstimateActivityRange,
) {
  return useQuery({
    queryKey: [
      "billing",
      "estimate",
      activityRange.startDate,
      activityRange.endDate,
    ],
    queryFn: () => getBillingEstimate(activityRange),
    placeholderData: (previousData) => previousData,
  });
}
