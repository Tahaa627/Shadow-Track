import { apiRequest } from "@/services/api";

export interface ExtensionEnrollment {
  id: number;
  enrollment_code: string;
  status: "pending" | "active" | "revoked";
  enrolled_at: string | null;
  last_seen: string | null;
  created_at: string;
  expires_at: string;
}

export async function createExtensionEnrollment(): Promise<ExtensionEnrollment> {
  return apiRequest<ExtensionEnrollment>("/extensions/enrollments/", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function getExtensionEnrollments(): Promise<ExtensionEnrollment[]> {
  return apiRequest<ExtensionEnrollment[]>("/extensions/enrollments/");
}