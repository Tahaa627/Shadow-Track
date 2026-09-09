import ProtectedRoute from "@/components/ProtectedRoute";

export default function SecurityPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#0a0d14] px-5 py-16 text-[#f3f4f6] sm:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-bold">Security and compliance</h1>
          <p className="mt-3 text-sm text-[#9ba1ad]">Security and compliance insights will be available here.</p>
        </div>
      </main>
    </ProtectedRoute>
  );
}