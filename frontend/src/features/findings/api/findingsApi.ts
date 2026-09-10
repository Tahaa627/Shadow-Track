import { apiRequest } from "@/services/api";

export interface Finding {
  id: number;
  application: string;
  finding_type: "unused" | "low_usage" | "shadow_saas" | "redundant";
  severity: "low" | "medium" | "high";
  annual_spend: string;
  potential_savings: string;
  evidence: {
    users?: number;
    sessions?: number;
    usage_hours?: number;
    [key: string]: unknown;
  };
  recommendation: string;
  created_at: string;
}

export async function getFindings(): Promise<Finding[]> {
  return apiRequest<Finding[]>("/findings/");
}