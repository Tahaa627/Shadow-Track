"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { FileSpreadsheet, Upload, X } from "lucide-react";

import { uploadExpenses } from "../api/expensesApi";

interface ExpenseUploadProps {
  onUploaded: () => void;
}

export default function ExpenseUpload({
  onUploaded,
}: ExpenseUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    processed: number;
    failed: number;
    total_spend: string;
  } | null>(null);
  const [error, setError] = useState("");

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    setError("");
    setResult(null);

    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setFile(null);
      setError("Please select a CSV file.");
      return;
    }

    setFile(selectedFile);
  }

  function clearFile() {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setError("");
    setResult(null);

    try {
      const response = await uploadExpenses(file);

      setResult({
        processed: response.processed,
        failed: response.failed,
        total_spend: response.total_spend,
      });
      clearFile();
      onUploaded();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="border border-[#212938] bg-[#11141d] p-5" aria-labelledby="import-expenses-title">
      <div className="flex items-start justify-between">
        <div>
          <h2 id="import-expenses-title" className="text-sm font-semibold text-[#f3f4f6]">
            Import expenses
          </h2>
          <p className="mt-1 text-xs text-[#9ba1ad]">
            Upload a CSV export from your finance or accounting system.
          </p>
        </div>
        <FileSpreadsheet size={18} className="text-[#f2ca50]" aria-hidden="true" />
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-5 w-full cursor-pointer border border-dashed border-[#303849] px-6 py-8 text-center transition hover:border-[#f2ca50]"
      >
        <Upload size={22} className="mx-auto text-[#9ba1ad]" aria-hidden="true" />
        <span className="mt-3 block text-xs font-medium text-[#f3f4f6]">
          Click to choose a CSV
        </span>
        <span className="mt-1 block text-[10px] text-[#9ba1ad]">
          UTF-8 CSV files supported
        </span>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </button>

      {file && (
        <div className="mt-4 flex items-center justify-between border border-[#212938] px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <FileSpreadsheet size={15} className="shrink-0 text-[#f2ca50]" aria-hidden="true" />
            <span className="truncate text-xs text-[#f3f4f6]">{file.name}</span>
          </div>
          <button
            type="button"
            onClick={clearFile}
            className="ml-3 shrink-0 text-[#9ba1ad] hover:text-[#f3f4f6]"
            aria-label="Remove selected file"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}

      {file && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="mt-4 w-full bg-[#d4af37] px-4 py-2.5 text-xs font-semibold text-[#241a00] transition hover:bg-[#e2c45a] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? "Processing..." : "Upload expenses"}
        </button>
      )}

      {result && (
        <div className="mt-4 border border-[#212938] p-3">
          <p className="text-xs font-semibold text-[#f3f4f6]">Import complete</p>
          <div className="mt-2 grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-[#9ba1ad]">Processed</p>
              <p className="mt-1 text-sm font-semibold text-[#f3f4f6]">{result.processed}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#9ba1ad]">Failed</p>
              <p className="mt-1 text-sm font-semibold text-[#f3f4f6]">{result.failed}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#9ba1ad]">Spend</p>
              <p className="mt-1 text-sm font-semibold text-[#f3f4f6]">
                ${Number(result.total_spend).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400" role="alert">
          {error}
        </div>
      )}
    </section>
  );
}
