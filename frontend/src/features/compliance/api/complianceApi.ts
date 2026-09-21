import { apiRequest } from "@/services/api";

export interface AuditEvent {
  id: number;
  action: string;
  actor_email: string | null;
  target_type: string;
  target_id: string;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string;
  created_at: string;
}

export async function getAuditEvents(action?: string): Promise<AuditEvent[]> {
  const query = action ? `?action=${encodeURIComponent(action)}` : "";
  return apiRequest<AuditEvent[]>(`/compliance/audit-events/${query}`);
}