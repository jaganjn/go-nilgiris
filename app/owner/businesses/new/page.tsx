"use client";

import Link from "next/link";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import OwnerBusinessForm from "@/components/OwnerBusinessForm";
import { getAccountProfile } from "@/lib/accounts";
import {
  auth,
  firebaseConfigured,
} from "@/lib/firebase";

import type { AccountProfile } from "@/types/account";

type PageState =
  | "checking"
  | "allowed"
  | "denied"
  | "error";

export default function NewOwnerBusinessPage() {
  const router = useRouter();

  const [pageState, setPageState] =
    useState<PageState>("checking");

  const [owner, setOwner] =
    useState<AccountProfile | null>(null);

  const [error, setError] = useState("");

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
          const profile = await getAccountProfile(
            currentUser.uid
          );

          if (cancelled) {
            return;
          }

          if (!profile) {
            await signOut(ownerAuth);
            router.replace("/owner/login");
            return;
          }

          if (
            profile.role === "admin" &&
            profile.status === "active"
          ) {
            router.replace("/admin");
            return;
          }

          if (profile.role !== "owner") {
            await signOut(ownerAuth);
            router.replace("/owner/login");
            return;
          }

          if (profile.status === "pending") {
            router.replace("/owner/pending");
            return;
          }

          if (profile.status === "suspended") {
            setPageState("denied");
            return;
          }

          setOwner(profile);
          setPageState("allowed");
        } catch (caught) {
          if (cancelled) {
            return;
          }

          setError(
            caught instanceof Error
              ? caught.message
              : "Unable to verify owner access."
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

  if (pageState === "checking") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />

          <p className="mt-4 font-bold text-slate-600">
            Checking owner access...
          </p>
        </div>
      </main>
    );
  }

  if (pageState === "denied") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-12">
        <section className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="text-6xl">🔒</div>

          <h1 className="mt-5 text-3xl font-black text-slate-900">
            Access Suspended
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            Your business-owner account is suspended. You
            cannot submit a business until the administrator
            reactivates your account.
          </p>

          <Link
            href="/"
            className="mt-7 inline-block rounded-xl bg-slate-900 px-6 py-3 font-bold text-white"
          >
            Return to Website
          </Link>
        </section>
      </main>
    );
  }

  if (pageState === "error") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-12">
        <section className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-black text-red-800">
            Unable to Open Form
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

  if (!owner) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
              Business Owner Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              Submit Your Business
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              Complete the details below. Your listing will
              be reviewed by the Go Nilgiris administrator
              before it becomes publicly visible.
            </p>
          </div>

          <Link
            href="/owner"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-bold text-slate-700"
          >
            ← Owner Dashboard
          </Link>
        </div>

        <div className="mt-8">
          <OwnerBusinessForm owner={owner} />
        </div>
      </div>
    </main>
  );
}
