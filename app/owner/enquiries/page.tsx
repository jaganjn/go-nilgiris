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
  listOwnerEnquiries,
  updateEnquiryStatus,
} from "@/lib/enquiries";
import {
  auth,
  firebaseConfigured,
} from "@/lib/firebase";

import type { AccountProfile } from "@/types/account";
import type { Business } from "@/types/business";
import type {
  Enquiry,
  EnquiryStatus,
} from "@/types/enquiry";

type PageState =
  | "checking"
  | "allowed"
  | "suspended"
  | "error";

function statusLabel(status: EnquiryStatus) {
  if (status === "contacted") {
    return "Contacted";
  }

  if (status === "closed") {
    return "Closed";
  }

  return "New";
}

function statusClass(status: EnquiryStatus) {
  if (status === "contacted") {
    return "border-blue-200 bg-blue-50 text-blue-800";
  }

  if (status === "closed") {
    return "border-slate-300 bg-slate-100 text-slate-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

function formatDate(value: unknown) {
  if (!value || typeof value !== "object") {
    return "Recently received";
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
    return "Recently received";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatServiceDate(value?: string) {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
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

function getCustomerWhatsAppMessage(
  customerName: string,
  businessName: string,
  ownerName: string
) {
  return `Hello ${customerName},

This is ${ownerName} regarding your enquiry for ${businessName} through Go Nilgiris.

We have received your enquiry and would be happy to assist you.

Please let us know a convenient time to discuss your requirement.

- ${businessName}`;
}

export default function OwnerEnquiriesPage() {
  const router = useRouter();

  const [pageState, setPageState] =
    useState<PageState>("checking");

  const [profile, setProfile] =
    useState<AccountProfile | null>(null);

  const [businesses, setBusinesses] =
    useState<Business[]>([]);

  const [enquiries, setEnquiries] =
    useState<Enquiry[]>([]);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadOwnerData(
    owner: AccountProfile
  ) {
    setLoading(true);
    setError("");

    try {
      const ownerBusinesses =
        await listOwnerBusinesses(owner.uid);

      const approvedBusinesses =
        ownerBusinesses.filter(
          (business) =>
            business.approvalStatus === "approved"
        );

      const businessIds =
        approvedBusinesses.map(
          (business) => business.id
        );

      const ownerEnquiries =
        await listOwnerEnquiries(businessIds);

      setBusinesses(approvedBusinesses);
      setEnquiries(ownerEnquiries);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to load customer enquiries."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const ownerAuth = auth;

    if (!firebaseConfigured || !ownerAuth) {
      setError("Firebase is not configured.");
      setPageState("error");
      setLoading(false);
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
            setLoading(false);
            return;
          }

          setProfile(account);
          setPageState("allowed");

          await loadOwnerData(account);
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
          setLoading(false);
        }
      }
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [router]);

  async function refreshEnquiries() {
    if (!profile) {
      return;
    }

    setMessage("");
    await loadOwnerData(profile);
  }

  async function changeStatus(
    enquiryId: string,
    status: EnquiryStatus
  ) {
    setUpdatingId(enquiryId);
    setError("");
    setMessage("");

    try {
      await updateEnquiryStatus(
        enquiryId,
        status
      );

      setEnquiries((current) =>
        current.map((enquiry) =>
          enquiry.id === enquiryId
            ? {
                ...enquiry,
                status,
              }
            : enquiry
        )
      );

      setMessage(
        `Enquiry status changed to ${statusLabel(
          status
        )}.`
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
    (enquiry) =>
      enquiry.status === "contacted"
  ).length;

  const closedCount = enquiries.filter(
    (enquiry) => enquiry.status === "closed"
  ).length;

  if (pageState === "checking") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />

          <p className="mt-4 font-bold text-slate-600">
            Loading owner enquiries...
          </p>
        </div>
      </main>
    );
  }

  if (pageState === "suspended") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-12">
        <section className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="text-6xl">🔒</div>

          <h1 className="mt-5 text-3xl font-black">
            Account Suspended
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            Your owner account is suspended. Customer
            enquiry access is currently unavailable.
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
            Unable to Open Enquiries
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
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
              Business Owner Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              Customer Enquiries
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              View and respond to enquiries received for
              your approved business listings.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={refreshEnquiries}
              disabled={loading}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 disabled:opacity-50"
            >
              Refresh
            </button>

            <Link
              href="/owner"
              className="rounded-xl bg-emerald-700 px-5 py-3 text-center font-bold text-white"
            >
              Owner Dashboard
            </Link>
          </div>
        </div>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Total Enquiries
            </p>

            <p className="mt-2 text-3xl font-black">
              {enquiries.length}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-semibold text-emerald-700">
              New
            </p>

            <p className="mt-2 text-3xl font-black text-emerald-800">
              {newCount}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm font-semibold text-blue-700">
              Contacted
            </p>

            <p className="mt-2 text-3xl font-black text-blue-800">
              {contactedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-300 bg-slate-100 p-5">
            <p className="text-sm font-semibold text-slate-600">
              Closed
            </p>

            <p className="mt-2 text-3xl font-black text-slate-800">
              {closedCount}
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
            Loading customer enquiries...
          </div>
        ) : businesses.length === 0 ? (
          <div className="mt-7 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="text-6xl">🏪</div>

            <h2 className="mt-5 text-2xl font-black">
              No Approved Businesses
            </h2>

            <p className="mt-3 text-slate-500">
              Customer enquiries will become available
              after one of your business listings is
              approved.
            </p>

            <Link
              href="/owner/businesses/new"
              className="mt-6 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white"
            >
              Submit a Business
            </Link>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="mt-7 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="text-6xl">📩</div>

            <h2 className="mt-5 text-2xl font-black">
              No Customer Enquiries Yet
            </h2>

            <p className="mt-3 text-slate-500">
              New customer enquiries for your approved
              businesses will appear here.
            </p>
          </div>
        ) : (
          <section className="mt-7 space-y-5">
            {enquiries.map((enquiry) => {
              const whatsappPhone =
                getWhatsAppPhone(enquiry.phone);

              const whatsappMessage =
                getCustomerWhatsAppMessage(
                  enquiry.customerName,
                  enquiry.businessName,
                  profile?.displayName ||
                    "Business Owner"
                );

              return (
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
                          {statusLabel(
                            enquiry.status
                          )}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        Received{" "}
                        {formatDate(enquiry.createdAt)}
                      </p>
                    </div>

                    <select
                      value={enquiry.status}
                      disabled={
                        updatingId === enquiry.id
                      }
                      onChange={(event) =>
                        changeStatus(
                          enquiry.id,
                          event.target
                            .value as EnquiryStatus
                        )
                      }
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500 disabled:opacity-50"
                    >
                      <option value="new">
                        New
                      </option>

                      <option value="contacted">
                        Contacted
                      </option>

                      <option value="closed">
                        Closed
                      </option>
                    </select>
                  </div>

                  <div className="mt-5 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Business
                      </p>

                      <p className="mt-2 font-bold">
                        {enquiry.businessName}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Customer Phone
                      </p>

                      <a
                        href={`tel:${enquiry.phone}`}
                        className="mt-2 block font-bold text-emerald-700"
                      >
                        {enquiry.phone}
                      </a>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Customer Email
                      </p>

                      {enquiry.email ? (
                        <a
                          href={`mailto:${enquiry.email}`}
                          className="mt-2 block break-all font-bold text-emerald-700"
                        >
                          {enquiry.email}
                        </a>
                      ) : (
                        <p className="mt-2 text-slate-500">
                          Not provided
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Required Date
                      </p>

                      <p className="mt-2 font-bold">
                        {formatServiceDate(
                          enquiry.serviceDate
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Customer Requirement
                    </p>

                    <p className="mt-2 whitespace-pre-line rounded-2xl border border-slate-200 p-4 leading-7 text-slate-700">
                      {enquiry.message}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <a
                      href={`tel:${enquiry.phone}`}
                      className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700"
                    >
                      Call Customer
                    </a>

                    {whatsappPhone && (
                      <a
                        href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                          whatsappMessage
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl bg-green-600 px-5 py-3 font-bold text-white"
                      >
                        WhatsApp Customer
                      </a>
                    )}

                    {enquiry.email && (
                      <a
                        href={`mailto:${enquiry.email}?subject=${encodeURIComponent(
                          `Your enquiry for ${enquiry.businessName}`
                        )}`}
                        className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 font-bold text-blue-800"
                      >
                        Email Customer
                      </a>
                    )}
                  </div>

                  {updatingId === enquiry.id && (
                    <p className="mt-4 text-sm font-bold text-slate-500">
                      Updating enquiry status...
                    </p>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
