import { apiRequest } from "@/services/api";

export interface SaaSInventoryItem {
  application: string;
  spend: string;
  transactions: number;
  users: number;
  sessions: number;
  total_seconds: number;
  total_hours: number;
  last_seen: string | null;
  utilization: "unknown" | "low" | "medium" | "high";
  status: "active" | "low_usage" | "shadow" | "unverified";
}

export async function getSaaSInventory(): Promise<SaaSInventoryItem[]> {
  return apiRequest<SaaSInventoryItem[]>("/usage/inventory/");
}