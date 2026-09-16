import { apiRequest } from "@/services/api";

export interface DashboardSummary {
  total_spend: string;
  monthly_spend: string;
  risk_score: number;
  shadow_saas_count: number;
  active_tools: number;
  potential_savings: string;
  anomalies: number;
  high_risk_findings: number;
}

export interface DashboardSpendPoint {
  month: string;
  spend: string;
}

export interface DashboardSpendResponse {
  results: DashboardSpendPoint[];
}

export async function getDashboardSummary() {
  return apiRequest<DashboardSummary>("/dashboard/summary/");
}

export async function getDashboardSpend() {
  return apiRequest<DashboardSpendResponse>("/dashboard/spend/");
}