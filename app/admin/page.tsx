"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { listBusinesses, removeBusiness } from "@/lib/businesses";
import { auth, firebaseConfigured } from "@/lib/firebase";
import type { Business } from "@/types/business";

export default function AdminPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setBusinesses(await listBusinesses());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm("Delete this business permanently?")) return;

    try {
      await removeBusiness(id);
      setMessage("Business deleted.");
      await load();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete business."
      );
    }
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-xl font-black text-emerald-800">
                Go Nilgiris Admin
              </p>

              <p className="text-sm text-slate-500">
                Manage directory listings
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href="/explore"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold"
              >
                View website
              </Link>

              {firebaseConfigured && (
                <button
                  onClick={() => auth && signOut(auth)}
                  className="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-700"
                >
                  Sign out
                </button>
              )}
            </div>
          </div>
        </header>

        <section className="px-5 py-8">
          <div className="mx-auto max-w-7xl">
            {!firebaseConfigured && (
              <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
                <p className="font-black">Firebase setup required</p>

                <p className="mt-1 text-sm">
                  The public website is currently showing bundled seed
                  businesses. Add Firebase values to{" "}
                  <code>.env.local</code>, enable Email/Password
                  Authentication and Firestore to activate admin saving.
                  Images are saved as external URLs, so Firebase Storage is
                  not required.
                </p>
              </div>
            )}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
                  Dashboard
                </p>

                <h1 className="mt-2 text-3xl font-black">
                  Businesses
                </h1>

                <p className="mt-2 text-slate-500">
                  {businesses.length} listings available
                </p>
              </div>

              <Link
                href="/admin/businesses/new"
                className="rounded-xl bg-emerald-700 px-5 py-3 text-center font-bold text-white"
              >
                + Add Business
              </Link>
            </div>

            {message && (
              <div className="mt-5 rounded-xl bg-white p-4 font-semibold shadow-sm">
                {message}
              </div>
            )}

            <div className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {loading ? (
                <p className="p-8 text-center font-bold text-slate-500">
                  Loading...
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {businesses.map((business) => (
                    <div
                      key={business.id}
                      className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-3xl">
                          {business.icon}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-black">
                              {business.name}
                            </h2>

                            {business.verified && (
                              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                                Verified
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {business.category} · {business.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/business/${business.id}`}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold"
                        >
                          View
                        </Link>

                        <Link
                          href={`/admin/businesses/${business.id}/edit`}
                          className="rounded-lg border border-emerald-300 px-3 py-2 text-sm font-bold text-emerald-700"
                        >
                          Edit
                        </Link>

                        <button
                          disabled={!firebaseConfigured}
                          onClick={() => remove(business.id)}
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700 disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </AdminGuard>
  );
}
