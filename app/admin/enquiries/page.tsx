"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import {
  listEnquiries,
  updateEnquiryStatus,
} from "@/lib/enquiries";
import type {
  Enquiry,
  EnquiryStatus,
} from "@/types/enquiry";

const statusOptions: EnquiryStatus[] = [
  "new",
  "contacted",
  "closed",
];

function formatStatus(status: EnquiryStatus) {
  if (status === "new") return "New";
  if (status === "contacted") return "Contacted";
  return "Closed";
}

function statusClass(status: EnquiryStatus) {
  if (status === "new") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (status === "contacted") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
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

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  async function loadEnquiries() {
    setLoading(true);
    setError("");

    try {
      const data = await listEnquiries();
      setEnquiries(data);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to load enquiries."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEnquiries();
  }, []);

  async function changeStatus(
    enquiryId: string,
    status: EnquiryStatus
  ) {
    setUpdatingId(enquiryId);
    setError("");

    try {
      await updateEnquiryStatus(enquiryId, status);

      setEnquiries((current) =>
        current.map((enquiry) =>
          enquiry.id === enquiryId
            ? { ...enquiry, status }
            : enquiry
        )
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to update enquiry status."
      );
    } finally {
      setUpdatingId("");
    }
  }

  const newCount = enquiries.filter(
    (enquiry) => enquiry.status === "new"
  ).length;

  const contactedCount = enquiries.filter(
    (enquiry) => enquiry.status === "contacted"
  ).length;

  const closedCount = enquiries.filter(
    (enquiry) => enquiry.status === "closed"
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
                Customer Enquiries
              </h1>

              <p className="mt-2 text-slate-500">
                View customer requirements and manage their status.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadEnquiries}
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
                Total enquiries
              </p>
              <p className="mt-2 text-3xl font-black">
                {enquiries.length}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <p className="text-sm font-semibold text-blue-700">
                New
              </p>
              <p className="mt-2 text-3xl font-black text-blue-800">
                {newCount}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-semibold text-amber-700">
                Contacted
              </p>
              <p className="mt-2 text-3xl font-black text-amber-800">
                {contactedCount}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm font-semibold text-emerald-700">
                Closed
              </p>
              <p className="mt-2 text-3xl font-black text-emerald-800">
                {closedCount}
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-7 rounded-3xl border border-slate-200 bg-white p-10 text-center font-bold text-slate-500">
              Loading enquiries...
            </div>
          ) : enquiries.length === 0 ? (
            <div className="mt-7 rounded-3xl border border-slate-200 bg-white p-10 text-center">
              <p className="text-xl font-black">
                No enquiries received yet
              </p>

              <p className="mt-2 text-slate-500">
                Customer enquiries submitted through business pages will
                appear here.
              </p>
            </div>
          ) : (
            <div className="mt-7 space-y-5">
              {enquiries.map((enquiry) => (
                <article
                  key={enquiry.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-black">
                          {enquiry.customerName}
                        </h2>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass(
                            enquiry.status
                          )}`}
                        >
                          {formatStatus(enquiry.status)}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        Submitted {formatDate(enquiry.createdAt)}
                      </p>
                    </div>

                    <label className="text-sm font-bold text-slate-700">
                      Enquiry status
                      <select
                        value={enquiry.status}
                        disabled={updatingId === enquiry.id}
                        onChange={(event) =>
                          changeStatus(
                            enquiry.id,
                            event.target.value as EnquiryStatus
                          )
                        }
                        className="ml-3 rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-emerald-500 disabled:opacity-50"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {formatStatus(status)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="mt-5 grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Business
                      </p>

                      <Link
                        href={`/business/${enquiry.businessId}`}
                        className="mt-1 block font-bold text-emerald-700 hover:underline"
                      >
                        {enquiry.businessName}
                      </Link>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Phone
                      </p>

                      <a
                        href={`tel:${enquiry.phone}`}
                        className="mt-1 block font-bold text-emerald-700 hover:underline"
                      >
                        {enquiry.phone}
                      </a>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Email
                      </p>

                      {enquiry.email ? (
                        <a
                          href={`mailto:${enquiry.email}`}
                          className="mt-1 block break-all font-semibold text-emerald-700 hover:underline"
                        >
                          {enquiry.email}
                        </a>
                      ) : (
                        <p className="mt-1 text-slate-500">
                          Not provided
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Required date
                      </p>

                      <p className="mt-1 font-semibold">
                        {enquiry.serviceDate || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-sm font-bold text-slate-700">
                      Customer requirement
                    </p>

                    <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-slate-200 p-4 leading-7 text-slate-600">
                      {enquiry.message}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <a
                      href={`tel:${enquiry.phone}`}
                      className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white"
                    >
                      Call Customer
                    </a>

                    <a
                      href={`https://wa.me/${enquiry.phone.replace(
                        /\D/g,
                        ""
                      )}?text=${encodeURIComponent(
                        `Hello ${enquiry.customerName}, we received your enquiry regarding ${enquiry.businessName}.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800"
                    >
                      WhatsApp Customer
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </AdminGuard>
  );
}
