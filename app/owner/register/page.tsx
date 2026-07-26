"use client";

import Link from "next/link";
import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  type User,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createOwnerProfile } from "@/lib/accounts";
import {
  auth,
  firebaseConfigured,
} from "@/lib/firebase";

const initialForm = {
  displayName: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function getRegistrationError(error: unknown) {
  if (error instanceof FirebaseError) {
    if (error.code === "auth/email-already-in-use") {
      return "An account already exists with this email address.";
    }

    if (error.code === "auth/invalid-email") {
      return "Please enter a valid email address.";
    }

    if (error.code === "auth/weak-password") {
      return "Please use a stronger password with at least 6 characters.";
    }

    if (error.code === "auth/operation-not-allowed") {
      return "Email and password registration is not enabled.";
    }
  }

  return error instanceof Error
    ? error.message
    : "Unable to create your owner account.";
}

export default function OwnerRegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  }

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

    const cleanName = form.displayName.trim();
    const cleanPhone = form.phone.replace(/\D/g, "");
    const cleanEmail = form.email.trim().toLowerCase();

    if (cleanName.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (cleanPhone.length < 7) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      setError(
        "Please confirm that the information you provide is accurate."
      );
      return;
    }

    setSubmitting(true);

    let createdUser: User | null = null;

    try {
      const credential =
        await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          form.password
        );

      createdUser = credential.user;

      await createOwnerProfile(createdUser.uid, {
        displayName: cleanName,
        email: cleanEmail,
        phone: form.phone.trim(),
      });

      router.replace("/owner/pending");
      router.refresh();
    } catch (caught) {
      if (createdUser) {
        await deleteUser(createdUser).catch(() => {
          // Prevent the rollback error from hiding
          // the original registration error.
        });
      }

      setError(getRegistrationError(caught));
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
            Go Nilgiris for business
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Create a Business Owner Account
          </h1>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
            Register your details to submit and manage your
            business on Go Nilgiris. Your account will require
            admin approval before owner access is activated.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="font-bold text-slate-800">
              Full name
              <input
                required
                type="text"
                value={form.displayName}
                onChange={(event) =>
                  updateField(
                    "displayName",
                    event.target.value
                  )
                }
                placeholder="Enter your full name"
                autoComplete="name"
                className={inputClass}
              />
            </label>

            <label className="font-bold text-slate-800">
              Phone number
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  updateField("phone", event.target.value)
                }
                placeholder="Enter your phone number"
                autoComplete="tel"
                inputMode="tel"
                className={inputClass}
              />
            </label>
          </div>

          <label className="block font-bold text-slate-800">
            Email address
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) =>
                updateField("email", event.target.value)
              }
              placeholder="Enter your email address"
              autoComplete="email"
              className={inputClass}
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="font-bold text-slate-800">
              Password
              <input
                required
                type="password"
                value={form.password}
                onChange={(event) =>
                  updateField(
                    "password",
                    event.target.value
                  )
                }
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                className={inputClass}
              />
            </label>

            <label className="font-bold text-slate-800">
              Confirm password
              <input
                required
                type="password"
                value={form.confirmPassword}
                onChange={(event) =>
                  updateField(
                    "confirmPassword",
                    event.target.value
                  )
                }
                placeholder="Enter the password again"
                autoComplete="new-password"
                className={inputClass}
              />
            </label>
          </div>

          <label className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => {
                setAcceptedTerms(event.target.checked);
                setError("");
              }}
              className="mt-1 h-4 w-4"
            />

            <span>
              I confirm that the information provided is
              accurate and that I represent a genuine business
              operating in or serving the Nilgiris.
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-emerald-700 px-6 py-3.5 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Creating Account..."
              : "Create Owner Account"}
          </button>

          <p className="text-center text-sm text-slate-500">
            Already registered?{" "}
            <Link
              href="/owner/login"
              className="font-bold text-emerald-700 hover:underline"
            >
              Owner Login
            </Link>
          </p>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="font-bold text-slate-600 hover:text-emerald-700"
          >
            ← Return to Go Nilgiris
          </Link>
        </div>
      </div>
    </main>
  );
}
