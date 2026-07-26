"use client";

import Link from "next/link";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getAccountProfile } from "@/lib/accounts";
import { listOwnerBusinesses } from "@/lib/businesses";
import {
  auth,
  firebaseConfigured,
} from "@/lib/firebase";

import type { AccountProfile } from "@/types/account";
import type {
  Business,
  BusinessApprovalStatus,
} from "@/types/business";

type PageState =
  | "checking"
  | "allowed"
  | "suspended"
  | "error";

function statusLabel(
  status?: BusinessApprovalStatus
) {
  if (status === "approved") {
    return "Approved";
  }

  if (status === "rejected") {
    return "Rejected";
  }

  return "Pending Approval";
}

function statusClass(
  status?: BusinessApprovalStatus
) {
  if (status === "approved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "rejected") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
}

export default function OwnerDashboardPage() {
  const router = useRouter();

  const [pageState, setPageState] =
    useState<PageState>("checking");

  const [profile, setProfile] =
    useState<AccountProfile | null>(null);

  const [businesses, setBusinesses] =
    useState<Business[]>([]);

  const [error, setError] = useState("");
  const [signingOut, setSigningOut] =
    useState(false);

  useEffect(() => {
    const ownerAuth = auth;

    if (!firebaseConfigured || !ownerAuth) {
      setError("Firebase is not configured.");
      setPageState("error");
      return;
    }

    let cancelled = false;

    const unsubscribe = onAuthStateChanged(
      ownerAuth,
      async (currentUser) => {
        if (!currentUser) {
          router.replace("/owner/login");
          return;
        }

        try {
          const account = await getAccountProfile(
            currentUser.uid
          );

          if (cancelled) {
            return;
          }

          if (!account) {
            await signOut(ownerAuth);
            router.replace("/owner/login");
            return;
          }

          if (
            account.role === "admin" &&
            account.status === "active"
          ) {
            router.replace("/admin");
            return;
          }

          if (account.role !== "owner") {
            await signOut(ownerAuth);
            router.replace("/owner/login");
            return;
          }

          if (account.status === "pending") {
            router.replace("/owner/pending");
            return;
          }

          if (account.status === "suspended") {
            setProfile(account);
            setPageState("suspended");
            return;
          }

          const ownerBusinesses =
            await listOwnerBusinesses(account.uid);

          if (cancelled) {
            return;
          }

          setProfile(account);
          setBusinesses(ownerBusinesses);
          setPageState("allowed");
        } catch (caught) {
          if (cancelled) {
            return;
          }

          setError(
            caught instanceof Error
              ? caught.message
              : "Unable to load owner dashboard."
          );

          setPageState("error");
        }
      }
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [router]);

  async function handleSignOut() {
    const ownerAuth = auth;

    if (!ownerAuth) {
      return;
    }

    setSigningOut(true);

    try {
      await signOut(ownerAuth);
      router.replace("/owner/login");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  }

  const pendingCount = businesses.filter(
    (business) =>
      !business.approvalStatus ||
      business.approvalStatus === "pending"
  ).length;

  const approvedCount = businesses.filter(
    (business) =>
      business.approvalStatus === "approved"
  ).length;

  const rejectedCount = businesses.filter(
    (business) =>
      business.approvalStatus === "rejected"
  ).length;

  if (pageState === "checking") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />

          <p className="mt-4 font-bold text-slate-600">
            Loading owner dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (pageState === "suspended") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-12 text-slate-900">
        <section className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="text-6xl">🔒</div>

          <h1 className="mt-5 text-3xl font-black">
            Account Suspended
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            Your Go Nilgiris business-owner account is
            currently suspended. Please contact the
            administrator for assistance.
          </p>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="mt-7 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white disabled:opacity-60"
          >
            {signingOut
              ? "Signing Out..."
              : "Sign Out"}
          </button>
        </section>
      </main>
    );
  }

  if (pageState === "error") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-12">
        <section className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-black text-red-800">
            Unable to Open Dashboard
          </h1>

          <p className="mt-4 text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"
          >
            Try Again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-700 p-7 text-white shadow-sm sm:p-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-200">
                Business Owner Dashboard
              </p>

              <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                Welcome, {profile?.displayName}
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-emerald-50">
                Manage your Go Nilgiris business listings
                and track their approval status.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/20 disabled:opacity-60"
            >
              {signingOut
                ? "Signing Out..."
                : "Sign Out"}
            </button>
          </div>
        </section>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Total Listings
            </p>

            <p className="mt-2 text-3xl font-black">
              {businesses.length}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-semibold text-amber-700">
              Pending
            </p>

            <p className="mt-2 text-3xl font-black text-amber-800">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-semibold text-emerald-700">
              Approved
            </p>

            <p className="mt-2 text-3xl font-black text-emerald-800">
              {approvedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-semibold text-red-700">
              Rejected
            </p>

            <p className="mt-2 text-3xl font-black text-red-800">
              {rejectedCount}
            </p>
          </div>
        </section>

        <section className="mt-7 grid gap-5 md:grid-cols-2">
          <article className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
            <div className="text-4xl">🏪</div>

            <p className="mt-5 text-sm font-bold uppercase tracking-widest text-emerald-700">
              Business Listing
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Add Your Business
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Submit your business details for admin review.
              Approved listings will appear publicly on Go
              Nilgiris.
            </p>

            <Link
              href="/owner/businesses/new"
              className="mt-6 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800"
            >
              Submit New Business
            </Link>
          </article>

          <article className="rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
            <div className="text-4xl">📩</div>

            <p className="mt-5 text-sm font-bold uppercase tracking-widest text-blue-700">
              Customer Enquiries
            </p>

            <h2 className="mt-2 text-2xl font-black">
              View Your Enquiries
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              View enquiries received for your approved
              business listings.
            </p>
            <Link href="/owner/enquiries"
  className="mt-6 inline-block rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800">
  Open My Enquiries
            </Link>
          </article>
        </section>

        <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-black">
                My Business Listings
              </h2>

              <p className="mt-1 text-slate-500">
                Check the current approval status of your
                submissions.
              </p>
            </div>

            <Link
              href="/owner/businesses/new"
              className="rounded-xl bg-emerald-700 px-5 py-3 text-center font-bold text-white"
            >
              + Add Business
            </Link>
          </div>

          {businesses.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <div className="text-5xl">🏪</div>

              <h3 className="mt-4 text-xl font-black">
                No business submitted yet
              </h3>

              <p className="mt-2 text-slate-500">
                Submit your first business to begin the
                approval process.
              </p>

              <Link
                href="/owner/businesses/new"
                className="mt-5 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white"
              >
                Submit Your Business
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {businesses.map((business) => (
                <article
                  key={business.id}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-3xl">
                          {business.icon || "📍"}
                        </span>

                        <div>
                          <h3 className="text-xl font-black">
                            {business.name}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {business.category} •{" "}
                            {business.location}
                          </p>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${statusClass(
                        business.approvalStatus
                      )}`}
                    >
                      {statusLabel(
                        business.approvalStatus
                      )}
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-3 leading-7 text-slate-600">
                    {business.description}
                  </p>

                  {business.approvalStatus ===
                    "rejected" &&
                    business.rejectionReason && (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <p className="font-bold">
                          Rejection reason
                        </p>

                        <p className="mt-1">
                          {business.rejectionReason}
                        </p>
                      </div>
                    )}

                  {business.approvalStatus ===
                    "pending" ||
                  !business.approvalStatus ? (
                    <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                      Your listing is awaiting administrator
                      review.
                    </div>
                  ) : null}

                  {business.approvalStatus ===
                    "approved" && (
                    <Link
                      href={`/business/${business.id}`}
                      className="mt-5 inline-block rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800"
                    >
                      View Public Listing
                    </Link>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">
            Account Information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Owner Name
              </p>

              <p className="mt-2 font-bold">
                {profile?.displayName}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Email
              </p>

              <p className="mt-2 break-all font-bold">
                {profile?.email}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Phone
              </p>

              <p className="mt-2 font-bold">
                {profile?.phone}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Account Status
              </p>

              <p className="mt-2 font-black text-emerald-800">
                Approved
              </p>
            </div>
          </div>
        </section>

        <div className="mt-7 text-center">
          <Link
            href="/"
            className="font-bold text-emerald-700 hover:underline"
          >
            ← Return to Go Nilgiris Website
          </Link>
        </div>
      </div>
    </main>
  );
}
