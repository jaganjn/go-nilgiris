"use client";

import Link from "next/link";
import { FirebaseError } from "firebase/app";
import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getAccountProfile } from "@/lib/accounts";
import {
  auth,
  firebaseConfigured,
} from "@/lib/firebase";

function getLoginError(error: unknown) {
  if (error instanceof FirebaseError) {
    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/user-not-found"
    ) {
      return "The email address or password is incorrect.";
    }

    if (error.code === "auth/invalid-email") {
      return "Please enter a valid email address.";
    }

    if (error.code === "auth/too-many-requests") {
      return "Too many login attempts. Please wait and try again.";
    }
  }

  return error instanceof Error
    ? error.message
    : "Unable to log in.";
}

export default function OwnerLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!firebaseConfigured || !auth) {
      setError(
        "Firebase is not configured. Please contact the administrator."
      );
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setSubmitting(true);

    try {
      const credential =
        await signInWithEmailAndPassword(
          auth,
          email.trim().toLowerCase(),
          password
        );

      const profile = await getAccountProfile(
        credential.user.uid
      );

      if (!profile) {
        await signOut(auth);

        setError(
          "No Go Nilgiris account profile was found for this login."
        );

        return;
      }

      if (
        profile.role === "admin" &&
        profile.status === "active"
      ) {
        router.replace("/admin");
        router.refresh();
        return;
      }

      if (profile.role !== "owner") {
        await signOut(auth);
        setError("This is not a valid business-owner account.");
        return;
      }

      if (profile.status === "pending") {
        router.replace("/owner/pending");
        router.refresh();
        return;
      }

      if (profile.status === "suspended") {
        await signOut(auth);

        setError(
          "This owner account has been suspended. Please contact the Go Nilgiris administrator."
        );

        return;
      }

      router.replace("/owner");
      router.refresh();
    } catch (caught) {
      setError(getLoginError(caught));
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-12 text-slate-900">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
            Go Nilgiris for business
          </p>

          <h1 className="mt-3 text-3xl font-black">
            Business Owner Login
          </h1>

          <p className="mt-3 leading-7 text-slate-600">
            Log in to manage your business listing and view
            customer enquiries.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-5"
        >
          <label className="block font-bold text-slate-800">
            Email address
            <input
              required
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              placeholder="Enter your registered email"
              autoComplete="email"
              className={inputClass}
            />
          </label>

          <label className="block font-bold text-slate-800">
            Password
            <input
              required
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
              className={inputClass}
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-emerald-700 px-6 py-3.5 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Logging In..."
              : "Owner Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Haven&apos;t registered yet?{" "}
          <Link
            href="/owner/register"
            className="font-bold text-emerald-700 hover:underline"
          >
            Create Owner Account
          </Link>
        </p>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="font-bold text-slate-600 hover:text-emerald-700"
          >
            ← Return to Go Nilgiris
          </Link>
        </div>
      </section>
    </main>
  );
}
