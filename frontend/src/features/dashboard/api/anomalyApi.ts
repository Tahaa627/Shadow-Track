import { apiRequest } from "@/services/api";

export interface DashboardAnomaly {
  type:
    | "large_transaction"
    | "new_vendor"
    | "spend_increase"
    | "spend_spike";
  severity: "low" | "medium" | "high";
  vendor: string;
  amount: string;
  date: string;
  description: string;
  evidence: Record<string, unknown>;
}

export interface DashboardAnomalyResponse {
  count: number;
  results: DashboardAnomaly[];
}

export function getDashboardAnomalies() {
  return apiRequest<DashboardAnomalyResponse>(
    "/dashboard/anomalies/",
  );
}