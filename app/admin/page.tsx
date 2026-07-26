"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";

import AdminGuard from "@/components/AdminGuard";
import {
  listBusinesses,
  removeBusiness,
} from "@/lib/businesses";
import {
  auth,
  firebaseConfigured,
} from "@/lib/firebase";

import type { Business } from "@/types/business";

export default function AdminPage() {
  const [businesses, setBusinesses] = useState<
    Business[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setMessage("");

    try {
      const data = await listBusinesses();
      setBusinesses(data);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load businesses."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    const confirmed = window.confirm(
      "Delete this business permanently?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeBusiness(id);

      setMessage(
        "Business deleted successfully."
      );

      await load();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete business."
      );
    }
  }

  async function handleSignOut() {
    const adminAuth = auth;

    if (!adminAuth) {
      return;
    }

    await signOut(adminAuth);
    window.location.href = "/admin/login";
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xl font-black text-emerald-800">
                Go Nilgiris Admin
              </p>

              <p className="text-sm text-slate-500">
                Manage owners, businesses and customer
                enquiries
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/explore"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold"
              >
                View Website
              </Link>

              <Link
                href="/admin/approvals"
                className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-800"
              >
                Owner Approvals
              </Link>

              <Link
                href="/admin/business-approvals"
                className="rounded-xl border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-800"
              >
                Business Approvals
              </Link>

              <Link
                href="/admin/enquiries"
                className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800"
              >
                Customer Enquiries
              </Link>

              {firebaseConfigured && (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-700"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </header>

        <section className="px-5 py-8">
          <div className="mx-auto max-w-7xl">
            {!firebaseConfigured && (
              <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
                <p className="font-black">
                  Firebase setup required
                </p>

                <p className="mt-1 text-sm">
                  Add Firebase environment variables,
                  enable Email/Password Authentication and
                  create a Firestore Database to activate
                  admin features.
                </p>
              </div>
            )}

            <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/admin/approvals"
                className="rounded-3xl border border-amber-200 bg-amber-50 p-6 transition hover:border-amber-400 hover:shadow-md"
              >
                <p className="text-sm font-bold uppercase tracking-widest text-amber-700">
                  Owner Accounts
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-900">
                  Owner Approvals
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Review, approve or suspend registered
                  business-owner accounts.
                </p>

                <p className="mt-4 font-bold text-amber-700">
                  Review Owners →
                </p>
              </Link>

              <Link
                href="/admin/business-approvals"
                className="rounded-3xl border border-purple-200 bg-purple-50 p-6 transition hover:border-purple-400 hover:shadow-md"
              >
                <p className="text-sm font-bold uppercase tracking-widest text-purple-700">
                  Owner Listings
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-900">
                  Business Approvals
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Review business listings submitted by
                  approved owners.
                </p>

                <p className="mt-4 font-bold text-purple-700">
                  Review Businesses →
                </p>
              </Link>

              <Link
                href="/admin/enquiries"
                className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 transition hover:border-emerald-400 hover:shadow-md"
              >
                <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
                  Leads
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-900">
                  Customer Enquiries
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  View customer requirements, contact
                  customers and update enquiry status.
                </p>

                <p className="mt-4 font-bold text-emerald-700">
                  Open Enquiries →
                </p>
              </Link>

              <Link
                href="/admin/businesses/new"
                className="rounded-3xl border border-blue-200 bg-blue-50 p-6 transition hover:border-blue-400 hover:shadow-md"
              >
                <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
                  Directory
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-900">
                  Add New Business
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Create a hotel, homestay, restaurant,
                  taxi, shopping or tourist-place listing.
                </p>

                <p className="mt-4 font-bold text-blue-700">
                  Add Business →
                </p>
              </Link>
            </div>

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
                  Business Management
                </p>

                <h1 className="mt-2 text-3xl font-black">
                  Public Businesses
                </h1>

                <p className="mt-2 text-slate-500">
                  {businesses.length} approved listings
                  available
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
              <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 font-semibold shadow-sm">
                {message}
              </div>
            )}

            <div className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {loading ? (
                <p className="p-8 text-center font-bold text-slate-500">
                  Loading...
                </p>
              ) : businesses.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-xl font-black">
                    No businesses available
                  </p>

                  <p className="mt-2 text-slate-500">
                    Add your first business listing from
                    the Admin Dashboard.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {businesses.map((business) => (
                    <div
                      key={business.id}
                      className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        {business.images?.[0] ? (
                          <img
                            src={business.images[0]}
                            alt={business.name}
                            className="h-14 w-14 rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-3xl">
                            {business.icon || "📍"}
                          </div>
                        )}

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

                            {business.featured && (
                              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                                Featured
                              </span>
                            )}

                            {business.submittedBy ===
                              "owner" && (
                              <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700">
                                Owner Submitted
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {business.category} {" - "}
                            {business.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
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
                          type="button"
                          disabled={!firebaseConfigured}
                          onClick={() =>
                            remove(business.id)
                          }
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
