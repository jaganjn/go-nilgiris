"use client";

import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { getAccountProfile } from "@/lib/accounts";
import { auth, firebaseConfigured } from "@/lib/firebase";

type AdminGuardProps = {
  children: ReactNode;
};

type AccessState =
  | "checking"
  | "allowed"
  | "denied"
  | "error";

export default function AdminGuard({
  children,
}: AdminGuardProps) {
  const router = useRouter();

  const [access, setAccess] =
    useState<AccessState>("checking");

  const [error, setError] = useState("");

  useEffect(() => {
    if (!firebaseConfigured || !auth) {
      setAccess("allowed");
      return;
    }

    let cancelled = false;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!currentUser) {
          if (!cancelled) {
            router.replace("/admin/login");
          }

          return;
        }

        try {
          const profile = await getAccountProfile(
            currentUser.uid
          );

          if (cancelled) {
            return;
          }

          const isActiveAdmin =
            profile?.role === "admin" &&
            profile.status === "active";

          setAccess(
            isActiveAdmin ? "allowed" : "denied"
          );
        } catch (caught) {
          if (cancelled) {
            return;
          }

          setError(
            caught instanceof Error
              ? caught.message
              : "Unable to verify administrator access."
          );

          setAccess("error");
        }
      }
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [router]);

  if (!firebaseConfigured) {
    return <>{children}</>;
  }

  if (access === "checking") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />

          <p className="mt-4 font-bold text-slate-600">
            Checking administrator access...
          </p>
        </div>
      </main>
    );
  }

  if (access === "denied") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="text-5xl">🔒</div>

          <h1 className="mt-4 text-2xl font-black text-slate-900">
            Administrator Access Required
          </h1>

          <p className="mt-3 leading-7 text-slate-600">
            This account does not have permission to access
            the Go Nilgiris Admin Dashboard.
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white"
          >
            Return to Website
          </Link>
        </div>
      </main>
    );
  }

  if (access === "error") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-red-800">
            Unable to Verify Access
          </h1>

          <p className="mt-3 text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
