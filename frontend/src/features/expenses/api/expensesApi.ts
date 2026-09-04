import { apiRequest } from "@/services/api";

export interface Expense {
  id: string;
  vendor: string;
  amount: string;
  currency: string;
  transaction_date: string;
  description: string;
  employee: string;
  department: string;
  source: string;
  created_at: string;
}

export interface ExpenseListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Expense[];
}

export interface ExpenseUploadResponse {
  total_rows: number;
  processed: number;
  failed: number;
  total_spend: string;
  errors: Array<{
    row: number;
    error: string;
  }>;
}

type ExpenseListPayload = ExpenseListResponse | Expense[];

export async function getExpenses(): Promise<ExpenseListResponse> {
  const data = await apiRequest<ExpenseListPayload>("/expenses/");

  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data,
    };
  }

  return data;
}

export async function uploadExpenses(
  file: File,
): Promise<ExpenseUploadResponse> {
  const accessToken = localStorage.getItem("shadowtrack_access_token");
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${baseUrl}/expenses/upload/`, {
    method: "POST",
    headers: {
      ...(accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {}),
    },
    credentials: "include",
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail ?? "Failed to upload expense CSV.");
  }

  return data as ExpenseUploadResponse;
}
