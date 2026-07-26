"use client";

import Link from "next/link";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAccountProfile } from "@/lib/accounts";
import {
  auth,
  firebaseConfigured,
} from "@/lib/firebase";
import type { AccountProfile } from "@/types/account";

type PageState =
  | "checking"
  | "allowed"
  | "suspended"
  | "error";

export default function OwnerDashboardPage() {
  const router = useRouter();

  const [pageState, setPageState] =
    useState<PageState>("checking");

  const [profile, setProfile] =
    useState<AccountProfile | null>(null);

  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!firebaseConfigured || !auth) {
      setError("Firebase is not configured.");
      setPageState("error");
      return;
    }

    let cancelled = false;

    const unsubscribe = onAuthStateChanged(
      auth,
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
            await signOut(auth);
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
            await signOut(auth);
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

          setProfile(account);
          setPageState("allowed");
        } catch (caught) {
          if (cancelled) {
            return;
          }

          setError(
            caught instanceof Error
              ? caught.message
              : "Unable to load owner account."
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
    if (!auth) {
      return;
    }

    setSigningOut(true);

    try {
      await signOut(auth);
      router.replace("/owner/login");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  }

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
            Your Go Nilgiris business-owner account is currently
            suspended. Please contact the administrator for
            assistance.
          </p>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="mt-7 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white disabled:opacity-60"
          >
            {signingOut ? "Signing Out..." : "Sign Out"}
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
                Your Go Nilgiris owner account has been approved.
                You can now manage your business presence and
                customer enquiries.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/20 disabled:opacity-60"
            >
              {signingOut ? "Signing Out..." : "Sign Out"}
            </button>
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
              Submit your business details for review and make
              your business discoverable on Go Nilgiris.
            </p>

            <div className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
              Business submission form will be added next.
            </div>
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
              View and respond to enquiries received from tourists
              and local customers.
            </p>

            <div className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
              Owner enquiry management will be added after the
              business submission system.
            </div>
          </article>
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
