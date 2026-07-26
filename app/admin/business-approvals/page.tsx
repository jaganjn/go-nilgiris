"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import AdminGuard from "@/components/AdminGuard";
import {
  listAllBusinesses,
  updateBusinessApproval,
} from "@/lib/businesses";

import type {
  Business,
  BusinessApprovalStatus,
} from "@/types/business";

function statusLabel(
  status?: BusinessApprovalStatus
) {
  if (status === "approved") {
    return "Approved";
  }

  if (status === "rejected") {
    return "Rejected";
  }

  return "Pending";
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

function formatDate(value: unknown) {
  if (!value || typeof value !== "object") {
    return "Recently submitted";
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
    return "Recently submitted";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function BusinessApprovalsPage() {
  const [businesses, setBusinesses] = useState<
    Business[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadBusinesses() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await listAllBusinesses();

      const ownerSubmissions = data
        .filter(
          (business) =>
            business.submittedBy === "owner"
        )
        .sort((first, second) => {
          const firstPending =
            !first.approvalStatus ||
            first.approvalStatus === "pending";

          const secondPending =
            !second.approvalStatus ||
            second.approvalStatus === "pending";

          if (firstPending && !secondPending) {
            return -1;
          }

          if (!firstPending && secondPending) {
            return 1;
          }

          return first.name.localeCompare(
            second.name
          );
        });

      setBusinesses(ownerSubmissions);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to load business submissions."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBusinesses();
  }, []);

  async function changeApproval(
    business: Business,
    approvalStatus: BusinessApprovalStatus
  ) {
    let rejectionReason = "";

    if (approvalStatus === "rejected") {
      const enteredReason = window.prompt(
        `Enter the rejection reason for ${business.name}:`
      );

      if (enteredReason === null) {
        return;
      }

      rejectionReason = enteredReason.trim();

      if (!rejectionReason) {
        setError(
          "Please enter a reason before rejecting the business."
        );
        return;
      }
    } else {
      const confirmation =
        approvalStatus === "approved"
          ? `Approve ${business.name}? It will become visible publicly.`
          : `Move ${business.name} back to pending approval?`;

      if (!window.confirm(confirmation)) {
        return;
      }
    }

    setUpdatingId(business.id);
    setError("");
    setMessage("");

    try {
      await updateBusinessApproval(
        business.id,
        approvalStatus,
        rejectionReason
      );

      setBusinesses((current) =>
        current.map((item) =>
          item.id === business.id
            ? {
                ...item,
                approvalStatus,
                rejectionReason:
                  approvalStatus === "rejected"
                    ? rejectionReason
                    : "",
              }
            : item
        )
      );

      if (approvalStatus === "approved") {
        setMessage(
          `${business.name} has been approved and is now publicly visible.`
        );
      } else if (approvalStatus === "rejected") {
        setMessage(
          `${business.name} has been rejected.`
        );
      } else {
        setMessage(
          `${business.name} has been moved back to pending approval.`
        );
      }
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to update business approval."
      );
    } finally {
      setUpdatingId("");
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

  return (
    <AdminGuard>
      <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
                Admin Dashboard
              </p>

              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                Business Listing Approvals
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                Review businesses submitted by approved
                owners before making them publicly visible.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadBusinesses}
                disabled={loading}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 disabled:opacity-50"
              >
                Refresh
              </button>

              <Link
                href="/admin"
                className="rounded-xl bg-emerald-700 px-5 py-3 text-center font-bold text-white"
              >
                鈫� Admin Dashboard
              </Link>
            </div>
          </div>

          <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Owner Submissions
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
              Loading business submissions...
            </div>
          ) : businesses.length === 0 ? (
            <div className="mt-7 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="text-6xl">馃彧</div>

              <h2 className="mt-5 text-2xl font-black">
                No owner business submissions
              </h2>

              <p className="mt-3 text-slate-500">
                Businesses submitted by owners will appear
                here for approval.
              </p>
            </div>
          ) : (
            <section className="mt-7 space-y-5">
              {businesses.map((business) => {
                const phone =
                  business.phones?.[0]?.number || "";

                return (
                  <article
                    key={business.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                  >
                    {business.images?.[0] && (
                      <img
                        src={business.images[0]}
                        alt={business.name}
                        className="h-56 w-full object-cover"
                      />
                    )}

                    <div className="p-6">
                      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-4xl">
                              {business.icon || "馃搷"}
                            </span>

                            <div>
                              <h2 className="text-2xl font-black">
                                {business.name}
                              </h2>

                              <p className="mt-1 text-slate-500">
                                {business.category} 鈥" "}
                                {business.location}
                              </p>
                            </div>
                          </div>

                          <p className="mt-3 text-sm text-slate-500">
                            Submitted{" "}
                            {formatDate(
                              business.createdAt
                            )}
                          </p>
                        </div>

                        <span
                          className={`w-fit rounded-full border px-4 py-2 text-sm font-bold ${statusClass(
                            business.approvalStatus
                          )}`}
                        >
                          {statusLabel(
                            business.approvalStatus
                          )}
                        </span>
                      </div>

                      <div className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Owner
                          </p>

                          <p className="mt-2 font-bold">
                            {business.ownerName ||
                              "Business owner"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Owner Email
                          </p>

                          {business.ownerEmail ? (
                            <a
                              href={`mailto:${business.ownerEmail}`}
                              className="mt-2 block break-all font-bold text-emerald-700 hover:underline"
                            >
                              {business.ownerEmail}
                            </a>
                          ) : (
                            <p className="mt-2 text-slate-500">
                              Not available
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Business Phone
                          </p>

                          {phone ? (
                            <a
                              href={`tel:${phone}`}
                              className="mt-2 block font-bold text-emerald-700 hover:underline"
                            >
                              {phone}
                            </a>
                          ) : (
                            <p className="mt-2 text-slate-500">
                              Not available
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Opening Hours
                          </p>

                          <p className="mt-2 font-bold">
                            {business.openingHours ||
                              "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Full Address
                        </p>

                        <p className="mt-2 leading-7 text-slate-700">
                          {business.address}
                        </p>
                      </div>

                      <div className="mt-6">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Business Description
                        </p>

                        <p className="mt-2 whitespace-pre-line leading-7 text-slate-700">
                          {business.description}
                        </p>
                      </div>

                      {business.services?.length > 0 && (
                        <div className="mt-6">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Services
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {business.services.map(
                              (service, index) => (
                                <span
                                  key={`${service}-${index}`}
                                  className="rounded-full bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800"
                                >
                                  {service}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {business.highlights?.length >
                        0 && (
                        <div className="mt-6">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Highlights
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {business.highlights.map(
                              (highlight, index) => (
                                <span
                                  key={`${highlight}-${index}`}
                                  className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800"
                                >
                                  鉁� {highlight}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {business.additionalInfo?.length >
                        0 && (
                        <div className="mt-6">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Additional Information
                          </p>

                          <ul className="mt-3 space-y-2 text-slate-700">
                            {business.additionalInfo.map(
                              (item, index) => (
                                <li
                                  key={`${item}-${index}`}
                                  className="rounded-xl bg-slate-50 px-4 py-3"
                                >
                                  鈥� {item}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {business.website && (
                        <div className="mt-6">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Website
                          </p>

                          <a
                            href={business.website}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 block break-all font-bold text-emerald-700 hover:underline"
                          >
                            {business.website}
                          </a>
                        </div>
                      )}

                      {business.maps && (
                        <div className="mt-6">
                          <a
                            href={business.maps}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-800"
                          >
                            Open Google Maps
                          </a>
                        </div>
                      )}

                      {business.approvalStatus ===
                        "rejected" &&
                        business.rejectionReason && (
                          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                            <p className="font-bold">
                              Rejection reason
                            </p>

                            <p className="mt-2">
                              {business.rejectionReason}
                            </p>
                          </div>
                        )}

                      <div className="mt-7 flex flex-wrap gap-3">
                        {business.approvalStatus !==
                          "approved" && (
                          <button
                            type="button"
                            disabled={
                              updatingId === business.id
                            }
                            onClick={() =>
                              changeApproval(
                                business,
                                "approved"
                              )
                            }
                            className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Approve Business
                          </button>
                        )}

                        {business.approvalStatus !==
                          "rejected" && (
                          <button
                            type="button"
                            disabled={
                              updatingId === business.id
                            }
                            onClick={() =>
                              changeApproval(
                                business,
                                "rejected"
                              )
                            }
                            className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Reject Business
                          </button>
                        )}

                        {business.approvalStatus !==
                          "pending" && (
                          <button
                            type="button"
                            disabled={
                              updatingId === business.id
                            }
                            onClick={() =>
                              changeApproval(
                                business,
                                "pending"
                              )
                            }
                            className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-3 font-bold text-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Move to Pending
                          </button>
                        )}

                        {business.approvalStatus ===
                          "approved" && (
                          <Link
                            href={`/business/${business.id}`}
                            target="_blank"
                            className="rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-3 font-bold text-emerald-800"
                          >
                            View Public Listing
                          </Link>
                        )}
                      </div>

                      {updatingId === business.id && (
                        <p className="mt-4 text-sm font-bold text-slate-500">
                          Updating approval status...
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </main>
    </AdminGuard>
  );
}
