import { apiDownload } from "@/services/api";

export async function downloadExpenseReport(): Promise<void> {
  const response = await apiDownload("/dashboard/report/");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "shadowaudit-expense-report.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}