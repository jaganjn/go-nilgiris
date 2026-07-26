"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import {
  listOwnerProfiles,
  updateOwnerStatus,
} from "@/lib/accounts";
import type {
  AccountProfile,
  AccountStatus,
} from "@/types/account";

function statusLabel(status: AccountStatus) {
  if (status === "active") return "Approved";
  if (status === "suspended") return "Suspended";
  return "Pending";
}

function statusClass(status: AccountStatus) {
  if (status === "active") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "suspended") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function formatDate(value: unknown) {
  if (!value || typeof value !== "object") {
    return "Recently registered";
  }

  const timestamp = value as {
    toDate?: () => Date;
    seconds?: number;
  };

  let date: Date | null = null;

  if (typeof timestamp.toDate === "function") {
    date = timestamp.toDate();
  } else if (typeof timestamp.seconds === "number") {
    date = new Date(timestamp.seconds * 1000);
  }

  if (!date || Number.isNaN(date.getTime())) {
    return "Recently registered";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function OwnerApprovalsPage() {
  const [owners, setOwners] = useState<AccountProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUid, setUpdatingUid] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadOwners() {
    setLoading(true);
    setError("");

    try {
      const data = await listOwnerProfiles();
      setOwners(data);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to load owner accounts."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOwners();
  }, []);

  async function changeStatus(
    uid: string,
    status: AccountStatus
  ) {
    const confirmationMessage =
      status === "active"
        ? "Approve this business-owner account?"
        : status === "suspended"
          ? "Suspend this business-owner account?"
          : "Move this account back to pending approval?";

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    setUpdatingUid(uid);
    setError("");
    setMessage("");

    try {
      await updateOwnerStatus(uid, status);

      setOwners((current) =>
        current.map((owner) =>
          owner.uid === uid
            ? {
                ...owner,
                status,
              }
            : owner
        )
      );

      setMessage(
        status === "active"
          ? "Owner account approved successfully."
          : status === "suspended"
            ? "Owner account suspended."
            : "Owner account moved to pending."
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to update owner status."
      );
    } finally {
      setUpdatingUid("");
    }
  }

  const pendingCount = owners.filter(
    (owner) => owner.status === "pending"
  ).length;

  const activeCount = owners.filter(
    (owner) => owner.status === "active"
  ).length;

  const suspendedCount = owners.filter(
    (owner) => owner.status === "suspended"
  ).length;

  return (
    <AdminGuard>
      <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
                Admin dashboard
              </p>

              <h1 className="mt-2 text-3xl font-black">
                Business Owner Approvals
              </h1>

              <p className="mt-2 text-slate-500">
                Review, approve and manage registered business-owner
                accounts.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadOwners}
                disabled={loading}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold disabled:opacity-50"
              >
                Refresh
              </button>

              <Link
                href="/admin"
                className="rounded-xl bg-emerald-700 px-4 py-3 text-center text-sm font-bold text-white"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-500">
                Total owners
              </p>

              <p className="mt-2 text-3xl font-black">
                {owners.length}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-semibold text-amber-700">
                Pending approval
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
                {activeCount}
              </p>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="text-sm font-semibold text-red-700">
                Suspended
              </p>

              <p className="mt-2 text-3xl font-black text-red-800">
                {suspendedCount}
              </p>
            </div>
          </div>

          {message && (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-semibold text-emerald-800">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-7 rounded-3xl border border-slate-200 bg-white p-10 text-center font-bold text-slate-500">
              Loading owner accounts...
            </div>
          ) : owners.length === 0 ? (
            <div className="mt-7 rounded-3xl border border-slate-200 bg-white p-10 text-center">
              <p className="text-xl font-black">
                No owner registrations yet
              </p>

              <p className="mt-2 text-slate-500">
                New business-owner registrations will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-7 space-y-5">
              {owners.map((owner) => {
                const cleanPhone = owner.phone.replace(/\D/g, "");

                return (
                  <article
                    key={owner.uid}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                  >
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-black">
                            {owner.displayName}
                          </h2>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass(
                              owner.status
                            )}`}
                          >
                            {statusLabel(owner.status)}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          Registered {formatDate(owner.createdAt)}
                        </p>
                      </div>

                      <select
                        value={owner.status}
                        disabled={updatingUid === owner.uid}
                        onChange={(event) =>
                          changeStatus(
                            owner.uid,
                            event.target.value as AccountStatus
                          )
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500 disabled:opacity-50"
                      >
                        <option value="pending">
                          Pending
                        </option>

                        <option value="active">
                          Approve
                        </option>

                        <option value="suspended">
                          Suspend
                        </option>
                      </select>
                    </div>

                    <div className="mt-5 grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Email
                        </p>

                        <a
                          href={`mailto:${owner.email}`}
                          className="mt-1 block break-all font-semibold text-emerald-700 hover:underline"
                        >
                          {owner.email}
                        </a>
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Phone
                        </p>

                        <a
                          href={`tel:${owner.phone}`}
                          className="mt-1 block font-semibold text-emerald-700 hover:underline"
                        >
                          {owner.phone}
                        </a>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      {owner.status !== "active" && (
                        <button
                          type="button"
                          disabled={updatingUid === owner.uid}
                          onClick={() =>
                            changeStatus(owner.uid, "active")
                          }
                          className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                        >
                          Approve Owner
                        </button>
                      )}

                      {owner.status !== "suspended" && (
                        <button
                          type="button"
                          disabled={updatingUid === owner.uid}
                          onClick={() =>
                            changeStatus(owner.uid, "suspended")
                          }
                          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 disabled:opacity-50"
                        >
                          Suspend
                        </button>
                      )}

                      <a
                        href={`tel:${owner.phone}`}
                        className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold"
                      >
                        Call Owner
                      </a>

                      {cleanPhone && (
                        <a
                          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                            `Hello ${owner.displayName}, this is regarding your Go Nilgiris business-owner registration.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800"
                        >
                          WhatsApp Owner
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </AdminGuard>
  );
}
