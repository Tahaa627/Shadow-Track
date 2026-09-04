"use client";

import type { Expense } from "../api/expensesApi";

interface ExpenseTableProps {
  expenses: Expense[];
}

export default function ExpenseTable({ expenses }: ExpenseTableProps) {
  if (!expenses.length) {
    return (
      <section className="border border-[#212938] bg-[#11141d] px-5 py-12 text-center">
        <p className="text-sm font-medium text-[#f3f4f6]">No expenses yet</p>
        <p className="mt-1 text-xs text-[#9ba1ad]">
          Upload a CSV to start building your spend inventory.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden border border-[#212938] bg-[#11141d]" aria-label="Expense records">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-[#212938]">
              {["Vendor", "Amount", "Date", "Department", "Employee", "Source"].map((heading) => (
                <th key={heading} className="px-5 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-[#9ba1ad]">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-b border-[#212938] last:border-0">
                <td className="px-5 py-3 text-xs font-medium text-[#f3f4f6]">{expense.vendor}</td>
                <td className="px-5 py-3 text-xs font-medium text-[#f3f4f6]">
                  {expense.currency} {Number(expense.amount).toLocaleString()}
                </td>
                <td className="px-5 py-3 text-xs text-[#9ba1ad]">{expense.transaction_date}</td>
                <td className="px-5 py-3 text-xs text-[#9ba1ad]">{expense.department || "-"}</td>
                <td className="px-5 py-3 text-xs text-[#9ba1ad]">{expense.employee || "-"}</td>
                <td className="px-5 py-3">
                  <span className="border border-[#303849] px-2 py-1 text-[9px] font-medium uppercase text-[#9ba1ad]">
                    {expense.source}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
