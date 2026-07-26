"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import BusinessForm from "@/components/BusinessForm";
import { getBusiness } from "@/lib/businesses";
import type { Business } from "@/types/business";

export default function EditBusinessPage() {
  const params = useParams<{ id: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBusiness(params.id)
      .then(setBusiness)
      .finally(() => setLoading(false));
  }, [params.id]);

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
                Edit Business
              </h1>

              <p className="mt-2 text-slate-500">
                Update the listing details and save them to Firestore.
              </p>
            </div>

            <Link
              href="/admin"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-bold"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center font-bold text-slate-500">
              Loading business...
            </div>
          ) : business ? (
            <BusinessForm initial={business} />
          ) : (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
              <h2 className="text-xl font-black text-red-800">
                Business not found
              </h2>

              <p className="mt-2 text-red-700">
                This listing does not exist in Firestore or the bundled data.
              </p>
            </div>
          )}
        </div>
      </main>
    </AdminGuard>
  );
}
