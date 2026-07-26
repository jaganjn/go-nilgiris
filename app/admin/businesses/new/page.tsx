"use client";

import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";
import BusinessForm from "@/components/BusinessForm";

export default function NewBusinessPage() {
  return (
    <AdminGuard>
      <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900">
        <div className="mx-auto max-w-5xl">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
                Admin dashboard
              </p>

              <h1 className="mt-2 text-3xl font-black">
                Add Business
              </h1>

              <p className="mt-2 text-slate-500">
                Create a new listing for the Go Nilgiris directory.
              </p>
            </div>

            <Link
              href="/admin"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-bold"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <BusinessForm />
        </div>
      </main>
    </AdminGuard>
  );
}
