"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import AdminGuard from "@/components/AdminGuard";
import { getAccountProfile } from "@/lib/accounts";
import {
  approveOwnerBusinessUpdate,
  listAllBusinesses,
  rejectOwnerBusinessUpdate,
  updateBusinessApproval,
} from "@/lib/businesses";

import type {
  Business,
  BusinessApprovalStatus,
  BusinessPendingUpdate,
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

function getWhatsAppPhone(phone: string) {
  let cleanPhone = phone.replace(/\D/g, "");

  if (
    cleanPhone.length === 11 &&
    cleanPhone.startsWith("0")
  ) {
    cleanPhone = cleanPhone.slice(1);
  }

  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  return cleanPhone;
}

function getBusinessApprovalMessage(
  ownerName: string,
  businessName: string,
  businessId: string
) {
  return `Hello ${ownerName},

Your business listing "${businessName}" has been approved successfully on Go Nilgiris.

Your business is now publicly visible here:

https://go-nilgiris-pearl.vercel.app/business/${businessId}

You can log in to your owner dashboard to view and manage your listing:

https://go-nilgiris-pearl.vercel.app/owner/login

- Go Nilgiris Team`;
}

function showText(value?: string) {
  return value?.trim() || "Not provided";
}

function showList(value?: string[]) {
  if (!value || value.length === 0) {
    return "None";
  }

  return value.join(", ");
}

function showPhone(
  phones?: Array<{
    label: string;
    number: string;
  }>
) {
  const phone = phones?.[0];

  if (!phone?.number) {
    return "Not provided";
  }

  return `${phone.label || "Phone"}: ${phone.number}`;
}

function sameImages(
  currentImages: string[],
  requestedImages: string[]
) {
  return (
    JSON.stringify(currentImages) ===
    JSON.stringify(requestedImages)
  );
}

type ComparisonRowProps = {
  label: string;
  currentValue: string;
  requestedValue: string;
};

function ComparisonRow({
  label,
  currentValue,
  requestedValue,
}: ComparisonRowProps) {
  const changed = currentValue !== requestedValue;

  return (
    <div
      className={`grid gap-3 rounded-2xl border p-4 lg:grid-cols-[180px_1fr_1fr] ${
        changed
          ? "border-amber-200 bg-amber-50/70"
          : "border-slate-200 bg-white"
      }`}
    >
      <div>
        <p className="text-xs font-black uppercase tracking-wider text-slate-500">
          {label}
        </p>

        {changed && (
          <span className="mt-2 inline-block rounded-full bg-amber-200 px-2.5 py-1 text-xs font-bold text-amber-900">
            Changed
          </span>
        )}
      </div>

      <div className="min-w-0 rounded-xl bg-slate-100 p-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Current public value
        </p>

        <p className="mt-2 break-words whitespace-pre-line text-sm leading-6 text-slate-700">
          {currentValue}
        </p>
      </div>

      <div className="min-w-0 rounded-xl bg-blue-50 p-3">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
          Requested value
        </p>

        <p className="mt-2 break-words whitespace-pre-line text-sm font-semibold leading-6 text-blue-950">
          {requestedValue}
        </p>
      </div>
    </div>
  );
}

function applyPendingUpdateLocally(
  business: Business,
  pendingUpdate: BusinessPendingUpdate
): Business {
  return {
    ...business,
    name: pendingUpdate.name,
    category: pendingUpdate.category,
    icon: pendingUpdate.icon,
    location: pendingUpdate.location,
    address: pendingUpdate.address,
    openingHours: pendingUpdate.openingHours,
    description: pendingUpdate.description,
    phones: pendingUpdate.phones,
    whatsapp: pendingUpdate.whatsapp,
    website: pendingUpdate.website,
    maps: pendingUpdate.maps,
    services: pendingUpdate.services,
    highlights: pendingUpdate.highlights,
    additionalInfo: pendingUpdate.additionalInfo,
    images: pendingUpdate.images,
    pendingUpdate: undefined,
    updateApprovalStatus: undefined,
    updateRejectionReason: undefined,
  };
}

export default function BusinessApprovalsPage() {
  const [businesses, setBusinesses] = useState<
    Business[]
  >([]);

  const [ownerPhones, setOwnerPhones] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState("");
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
          const firstHasPendingUpdate =
            first.updateApprovalStatus === "pending";

          const secondHasPendingUpdate =
            second.updateApprovalStatus === "pending";

          if (
            firstHasPendingUpdate &&
            !secondHasPendingUpdate
          ) {
            return -1;
          }

          if (
            !firstHasPendingUpdate &&
            secondHasPendingUpdate
          ) {
            return 1;
          }

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

      const uniqueOwnerIds = Array.from(
        new Set(
          ownerSubmissions
            .map((business) => business.ownerId)
            .filter(
              (ownerId): ownerId is string =>
                Boolean(ownerId)
            )
        )
      );

      const profiles = await Promise.all(
        uniqueOwnerIds.map(async (ownerId) => ({
          ownerId,
          profile: await getAccountProfile(ownerId),
        }))
      );

      const phoneMap: Record<string, string> = {};

      profiles.forEach(({ ownerId, profile }) => {
        if (profile?.phone) {
          phoneMap[ownerId] = profile.phone;
        }
      });

      setOwnerPhones(phoneMap);
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

    const actionKey = `business-${business.id}`;

    setUpdatingKey(actionKey);
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
          `${business.name} has been approved. You can now send the approval WhatsApp message to the owner.`
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
      setUpdatingKey("");
    }
  }

  async function approveUpdate(
    business: Business
  ) {
    if (!business.pendingUpdate) {
      setError(
        "No pending update was found for this business."
      );
      return;
    }

    const confirmed = window.confirm(
      `Approve the updated details for ${business.name}? The requested details and images will replace the current public listing.`
    );

    if (!confirmed) {
      return;
    }

    const actionKey = `update-${business.id}`;

    setUpdatingKey(actionKey);
    setError("");
    setMessage("");

    try {
      await approveOwnerBusinessUpdate(
        business.id
      );

      const pendingUpdate =
        business.pendingUpdate;

      setBusinesses((current) =>
        current.map((item) =>
          item.id === business.id
            ? applyPendingUpdateLocally(
                item,
                pendingUpdate
              )
            : item
        )
      );

      setMessage(
        `${pendingUpdate.name} updated details have been approved and are now public.`
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to approve the business update."
      );
    } finally {
      setUpdatingKey("");
    }
  }

  async function rejectUpdate(
    business: Business
  ) {
    if (!business.pendingUpdate) {
      setError(
        "No pending update was found for this business."
      );
      return;
    }

    const enteredReason = window.prompt(
      `Enter the reason for rejecting the update to ${business.name}:`
    );

    if (enteredReason === null) {
      return;
    }

    const rejectionReason = enteredReason.trim();

    if (!rejectionReason) {
      setError(
        "Please enter a reason before rejecting the update."
      );
      return;
    }

    const actionKey = `update-${business.id}`;

    setUpdatingKey(actionKey);
    setError("");
    setMessage("");

    try {
      await rejectOwnerBusinessUpdate(
        business.id,
        rejectionReason
      );

      setBusinesses((current) =>
        current.map((item) =>
          item.id === business.id
            ? {
                ...item,
                updateApprovalStatus:
                  "rejected",
                updateRejectionReason:
                  rejectionReason,
              }
            : item
        )
      );

      setMessage(
        `${business.name} update request has been rejected.`
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to reject the business update."
      );
    } finally {
      setUpdatingKey("");
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

  const pendingUpdateCount = businesses.filter(
    (business) =>
      business.updateApprovalStatus === "pending" &&
      Boolean(business.pendingUpdate)
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

              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                Review new businesses and owner-requested
                updates before publishing them on Go
                Nilgiris.
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
                ← Admin Dashboard
              </Link>
            </div>
          </div>

          <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
                New Pending
              </p>

              <p className="mt-2 text-3xl font-black text-amber-800">
                {pendingCount}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <p className="text-sm font-semibold text-blue-700">
                Pending Updates
              </p>

              <p className="mt-2 text-3xl font-black text-blue-800">
                {pendingUpdateCount}
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
              <div className="text-6xl">🏪</div>

              <h2 className="mt-5 text-2xl font-black">
                No owner business submissions
              </h2>

              <p className="mt-3 text-slate-500">
                Businesses and update requests submitted by
                owners will appear here.
              </p>
            </div>
          ) : (
            <section className="mt-7 space-y-5">
              {businesses.map((business) => {
                const phone =
                  business.phones?.[0]?.number || "";

                const ownerPhone = business.ownerId
                  ? ownerPhones[business.ownerId] || ""
                  : "";

                const whatsappPhone =
                  getWhatsAppPhone(ownerPhone);

                const approvalMessage =
                  getBusinessApprovalMessage(
                    business.ownerName ||
                      "Business Owner",
                    business.name,
                    business.id
                  );

                const update = business.pendingUpdate;
                const businessActionKey =
                  `business-${business.id}`;
                const updateActionKey =
                  `update-${business.id}`;

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
                              {business.icon || "📍"}
                            </span>

                            <div>
                              <h2 className="text-2xl font-black">
                                {business.name}
                              </h2>

                              <p className="mt-1 text-slate-500">
                                {business.category}
                                {" - "}
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

                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`w-fit rounded-full border px-4 py-2 text-sm font-bold ${statusClass(
                              business.approvalStatus
                            )}`}
                          >
                            {statusLabel(
                              business.approvalStatus
                            )}
                          </span>

                          {update && (
                            <span
                              className={`w-fit rounded-full border px-4 py-2 text-sm font-bold ${
                                business.updateApprovalStatus ===
                                "rejected"
                                  ? "border-red-200 bg-red-50 text-red-700"
                                  : "border-blue-200 bg-blue-50 text-blue-800"
                              }`}
                            >
                              {business.updateApprovalStatus ===
                              "rejected"
                                ? "Update Rejected"
                                : "Update Pending"}
                            </span>
                          )}
                        </div>
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
                            Owner Phone
                          </p>

                          {ownerPhone ? (
                            <a
                              href={`tel:${ownerPhone}`}
                              className="mt-2 block font-bold text-emerald-700 hover:underline"
                            >
                              {ownerPhone}
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

                      {business.highlights?.length > 0 && (
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
                                  ✓ {highlight}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {business.additionalInfo?.length > 0 && (
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
                                  - {item}
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

                      {update && (
                        <section className="mt-8 rounded-3xl border-2 border-blue-200 bg-blue-50/40 p-5 sm:p-6">
                          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                            <div>
                              <p className="text-sm font-black uppercase tracking-widest text-blue-700">
                                Owner Update Request
                              </p>

                              <h3 className="mt-2 text-2xl font-black text-slate-900">
                                Review Updated Details
                              </h3>

                              <p className="mt-2 text-sm leading-6 text-slate-600">
                                Requested{" "}
                                {formatDate(
                                  update.requestedAt
                                )}. Changed rows are highlighted.
                              </p>
                            </div>

                            <span
                              className={`w-fit rounded-full border px-4 py-2 text-sm font-bold ${
                                business.updateApprovalStatus ===
                                "rejected"
                                  ? "border-red-200 bg-red-50 text-red-700"
                                  : "border-blue-200 bg-blue-100 text-blue-800"
                              }`}
                            >
                              {business.updateApprovalStatus ===
                              "rejected"
                                ? "Rejected Update"
                                : "Awaiting Approval"}
                            </span>
                          </div>

                          {business.updateApprovalStatus ===
                            "rejected" &&
                            business.updateRejectionReason && (
                              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                                <p className="font-bold">
                                  Update rejection reason
                                </p>

                                <p className="mt-2 leading-6">
                                  {
                                    business.updateRejectionReason
                                  }
                                </p>
                              </div>
                            )}

                          <div className="mt-6 space-y-3">
                            <ComparisonRow
                              label="Business name"
                              currentValue={showText(
                                business.name
                              )}
                              requestedValue={showText(
                                update.name
                              )}
                            />

                            <ComparisonRow
                              label="Category"
                              currentValue={showText(
                                business.category
                              )}
                              requestedValue={showText(
                                update.category
                              )}
                            />

                            <ComparisonRow
                              label="Icon"
                              currentValue={showText(
                                business.icon
                              )}
                              requestedValue={showText(
                                update.icon
                              )}
                            />

                            <ComparisonRow
                              label="Location"
                              currentValue={showText(
                                business.location
                              )}
                              requestedValue={showText(
                                update.location
                              )}
                            />

                            <ComparisonRow
                              label="Address"
                              currentValue={showText(
                                business.address
                              )}
                              requestedValue={showText(
                                update.address
                              )}
                            />

                            <ComparisonRow
                              label="Opening hours"
                              currentValue={showText(
                                business.openingHours
                              )}
                              requestedValue={showText(
                                update.openingHours
                              )}
                            />

                            <ComparisonRow
                              label="Description"
                              currentValue={showText(
                                business.description
                              )}
                              requestedValue={showText(
                                update.description
                              )}
                            />

                            <ComparisonRow
                              label="Phone"
                              currentValue={showPhone(
                                business.phones
                              )}
                              requestedValue={showPhone(
                                update.phones
                              )}
                            />

                            <ComparisonRow
                              label="WhatsApp"
                              currentValue={showText(
                                business.whatsapp
                              )}
                              requestedValue={showText(
                                update.whatsapp
                              )}
                            />

                            <ComparisonRow
                              label="Website"
                              currentValue={showText(
                                business.website
                              )}
                              requestedValue={showText(
                                update.website
                              )}
                            />

                            <ComparisonRow
                              label="Google Maps"
                              currentValue={showText(
                                business.maps
                              )}
                              requestedValue={showText(
                                update.maps
                              )}
                            />

                            <ComparisonRow
                              label="Services"
                              currentValue={showList(
                                business.services
                              )}
                              requestedValue={showList(
                                update.services
                              )}
                            />

                            <ComparisonRow
                              label="Highlights"
                              currentValue={showList(
                                business.highlights
                              )}
                              requestedValue={showList(
                                update.highlights
                              )}
                            />

                            <ComparisonRow
                              label="Additional info"
                              currentValue={showList(
                                business.additionalInfo
                              )}
                              requestedValue={showList(
                                update.additionalInfo
                              )}
                            />
                          </div>

                          <div
                            className={`mt-5 rounded-2xl border p-4 ${
                              sameImages(
                                business.images ?? [],
                                update.images ?? []
                              )
                                ? "border-slate-200 bg-white"
                                : "border-amber-200 bg-amber-50/70"
                            }`}
                          >
                            <div className="flex flex-wrap items-center gap-3">
                              <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                                Business Images
                              </p>

                              {!sameImages(
                                business.images ?? [],
                                update.images ?? []
                              ) && (
                                <span className="rounded-full bg-amber-200 px-2.5 py-1 text-xs font-bold text-amber-900">
                                  Changed
                                </span>
                              )}
                            </div>

                            <div className="mt-4 grid gap-5 lg:grid-cols-2">
                              <div>
                                <p className="text-sm font-black text-slate-700">
                                  Current public images
                                </p>

                                {business.images?.length ? (
                                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {business.images.map(
                                      (image, index) => (
                                        <img
                                          key={`${image}-${index}`}
                                          src={image}
                                          alt={`Current image ${
                                            index + 1
                                          }`}
                                          className="h-28 w-full rounded-xl border border-slate-200 object-cover"
                                        />
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <p className="mt-3 rounded-xl bg-slate-100 p-4 text-sm text-slate-500">
                                    No current images.
                                  </p>
                                )}
                              </div>

                              <div>
                                <p className="text-sm font-black text-blue-800">
                                  Requested images
                                </p>

                                {update.images?.length ? (
                                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {update.images.map(
                                      (image, index) => (
                                        <img
                                          key={`${image}-${index}`}
                                          src={image}
                                          alt={`Requested image ${
                                            index + 1
                                          }`}
                                          className="h-28 w-full rounded-xl border border-blue-200 object-cover"
                                        />
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <p className="mt-3 rounded-xl bg-blue-100 p-4 text-sm text-blue-700">
                                    Owner requested no images.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <button
                              type="button"
                              disabled={
                                updatingKey ===
                                updateActionKey
                              }
                              onClick={() =>
                                approveUpdate(business)
                              }
                              className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Approve Updated Details
                            </button>

                            {business.updateApprovalStatus !==
                              "rejected" && (
                              <button
                                type="button"
                                disabled={
                                  updatingKey ===
                                  updateActionKey
                                }
                                onClick={() =>
                                  rejectUpdate(business)
                                }
                                className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Reject Update
                              </button>
                            )}

                            <Link
                              href={`/business/${business.id}`}
                              target="_blank"
                              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-bold text-slate-700"
                            >
                              View Current Public Listing
                            </Link>
                          </div>

                          {updatingKey ===
                            updateActionKey && (
                            <p className="mt-4 text-sm font-bold text-blue-700">
                              Updating owner request...
                            </p>
                          )}
                        </section>
                      )}

                      <div className="mt-7 flex flex-wrap gap-3">
                        {business.approvalStatus !==
                          "approved" && (
                          <button
                            type="button"
                            disabled={
                              updatingKey ===
                              businessActionKey
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
                              updatingKey ===
                              businessActionKey
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
                              updatingKey ===
                              businessActionKey
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
                          "approved" &&
                          whatsappPhone && (
                            <a
                              href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                                approvalMessage
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-xl bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700"
                            >
                              Send Approval WhatsApp
                            </a>
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

                      {updatingKey ===
                        businessActionKey && (
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
