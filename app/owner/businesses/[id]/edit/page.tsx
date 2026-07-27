"use client";

import Link from "next/link";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { useParams, useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { getAccountProfile } from "@/lib/accounts";
import {
  getBusiness,
  submitOwnerBusinessUpdate,
} from "@/lib/businesses";
import { uploadBusinessImage } from "@/lib/cloudinaryUpload";
import {
  auth,
  firebaseConfigured,
} from "@/lib/firebase";

import type { AccountProfile } from "@/types/account";
import type {
  Business,
  BusinessUpdateInput,
} from "@/types/business";

type PageState =
  | "checking"
  | "allowed"
  | "not-found"
  | "forbidden"
  | "suspended"
  | "error";

const maximumImages = 6;

const splitLines = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const initialForm = {
  name: "",
  category: "Hotel / Resort",
  icon: "📍",
  location: "",
  address: "",
  openingHours: "",
  description: "",
  phoneLabel: "Phone",
  phone: "",
  whatsapp: "",
  website: "",
  maps: "",
  services: "",
  highlights: "",
  additionalInfo: "",
};

export default function OwnerBusinessEditPage() {
  const router = useRouter();
  const params = useParams();

  const businessId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const [pageState, setPageState] =
    useState<PageState>("checking");

  const [owner, setOwner] =
    useState<AccountProfile | null>(null);

  const [business, setBusiness] =
    useState<Business | null>(null);

  const [form, setForm] =
    useState(initialForm);

  const [images, setImages] =
    useState<string[]>([]);

  const [uploading, setUploading] =
    useState(false);

  const [uploadMessage, setUploadMessage] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const ownerAuth = auth;

    if (
      !firebaseConfigured ||
      !ownerAuth
    ) {
      setError("Firebase is not configured.");
      setPageState("error");
      return;
    }

    if (!businessId) {
      setPageState("not-found");
      return;
    }

    let cancelled = false;

    const unsubscribe =
      onAuthStateChanged(
        ownerAuth,
        async (currentUser) => {
          if (!currentUser) {
            router.replace(
              "/owner/login"
            );
            return;
          }

          try {
            const account =
              await getAccountProfile(
                currentUser.uid
              );

            if (cancelled) {
              return;
            }

            if (!account) {
              await signOut(ownerAuth);
              router.replace(
                "/owner/login"
              );
              return;
            }

            if (
              account.role === "admin" &&
              account.status === "active"
            ) {
              router.replace("/admin");
              return;
            }

            if (
              account.role !== "owner"
            ) {
              await signOut(ownerAuth);
              router.replace(
                "/owner/login"
              );
              return;
            }

            if (
              account.status === "pending"
            ) {
              router.replace(
                "/owner/pending"
              );
              return;
            }

            if (
              account.status ===
              "suspended"
            ) {
              setOwner(account);
              setPageState(
                "suspended"
              );
              return;
            }

            const loadedBusiness =
              await getBusiness(
                businessId
              );

            if (cancelled) {
              return;
            }

            if (!loadedBusiness) {
              setPageState(
                "not-found"
              );
              return;
            }

            if (
              loadedBusiness.ownerId !==
                account.uid ||
              loadedBusiness.submittedBy !==
                "owner"
            ) {
              setPageState(
                "forbidden"
              );
              return;
            }

            if (
              loadedBusiness.approvalStatus !==
              "approved"
            ) {
              setError(
                "Only approved businesses can be edited using this page."
              );
              setPageState(
                "forbidden"
              );
              return;
            }

            const source =
              loadedBusiness.pendingUpdate ??
              loadedBusiness;

            setOwner(account);
            setBusiness(
              loadedBusiness
            );

            setForm({
              name: source.name ?? "",
              category:
                source.category ??
                "Hotel / Resort",
              icon:
                source.icon ?? "📍",
              location:
                source.location ?? "",
              address:
                source.address ?? "",
              openingHours:
                source.openingHours ??
                "",
              description:
                source.description ??
                "",
              phoneLabel:
                source.phones?.[0]
                  ?.label ??
                "Phone",
              phone:
                source.phones?.[0]
                  ?.number ?? "",
              whatsapp:
                source.whatsapp ?? "",
              website:
                source.website ?? "",
              maps:
                source.maps ?? "",
              services:
                source.services?.join(
                  "\n"
                ) ?? "",
              highlights:
                source.highlights?.join(
                  "\n"
                ) ?? "",
              additionalInfo:
                source.additionalInfo?.join(
                  "\n"
                ) ?? "",
            });

            setImages(
              Array.isArray(
                source.images
              )
                ? source.images
                : []
            );

            setPageState("allowed");
          } catch (caught) {
            if (cancelled) {
              return;
            }

            setError(
              caught instanceof Error
                ? caught.message
                : "Unable to load this business."
            );

            setPageState("error");
          }
        }
      );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [businessId, router]);

  function update(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  }

  async function handleImageUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files ?? []
    );

    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    const remainingSlots =
      maximumImages - images.length;

    if (remainingSlots <= 0) {
      setError(
        `You can upload a maximum of ${maximumImages} images.`
      );
      return;
    }

    if (
      files.length >
      remainingSlots
    ) {
      setError(
        `You can select only ${remainingSlots} more image${
          remainingSlots === 1
            ? ""
            : "s"
        }.`
      );
      return;
    }

    setUploading(true);
    setUploadMessage("");
    setError("");

    let uploadedCount = 0;

    try {
      for (
        let index = 0;
        index < files.length;
        index += 1
      ) {
        setUploadMessage(
          `Uploading image ${
            index + 1
          } of ${files.length}...`
        );

        const imageUrl =
          await uploadBusinessImage(
            files[index]
          );

        setImages((current) =>
          current.includes(imageUrl)
            ? current
            : [
                ...current,
                imageUrl,
              ]
        );

        uploadedCount += 1;
      }

      setUploadMessage(
        `${uploadedCount} image${
          uploadedCount === 1
            ? ""
            : "s"
        } uploaded successfully.`
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to upload the selected image."
      );

      if (uploadedCount > 0) {
        setUploadMessage(
          `${uploadedCount} image${
            uploadedCount === 1
              ? ""
              : "s"
          } uploaded before the error occurred.`
        );
      } else {
        setUploadMessage("");
      }
    } finally {
      setUploading(false);
    }
  }

  function removeImage(
    imageUrl: string
  ) {
    setImages((current) =>
      current.filter(
        (image) =>
          image !== imageUrl
      )
    );

    setUploadMessage("");
    setError("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (
      !owner ||
      !business
    ) {
      setError(
        "Owner or business information is unavailable."
      );
      return;
    }

    if (uploading) {
      setError(
        "Please wait until all selected images finish uploading."
      );
      return;
    }

    if (
      form.name.trim().length < 2
    ) {
      setError(
        "Please enter the business name."
      );
      return;
    }

    if (!form.location.trim()) {
      setError(
        "Please enter the business location."
      );
      return;
    }

    if (!form.address.trim()) {
      setError(
        "Please enter the full address."
      );
      return;
    }

    if (
      form.description.trim()
        .length < 20
    ) {
      setError(
        "Please provide a business description of at least 20 characters."
      );
      return;
    }

    if (!form.phone.trim()) {
      setError(
        "Please enter a business phone number."
      );
      return;
    }

    const invalidImage =
      images.find(
        (image) =>
          !/^https:\/\//i.test(
            image
          )
      );

    if (invalidImage) {
      setError(
        "Every business image must use a valid HTTPS URL."
      );
      return;
    }

    const payload: BusinessUpdateInput =
      {
        name: form.name.trim(),
        category:
          form.category.trim(),
        icon:
          form.icon.trim() ||
          "📍",
        location:
          form.location.trim(),
        address:
          form.address.trim(),
        openingHours:
          form.openingHours.trim() ||
          "Contact business for timings",
        description:
          form.description.trim(),

        phones: [
          {
            label:
              form.phoneLabel.trim() ||
              "Phone",
            number:
              form.phone.trim(),
          },
        ],

        whatsapp:
          form.whatsapp.trim(),
        website:
          form.website.trim(),
        maps:
          form.maps.trim(),

        services: splitLines(
          form.services
        ),

        highlights: splitLines(
          form.highlights
        ),

        additionalInfo:
          splitLines(
            form.additionalInfo
          ),

        images: Array.from(
          new Set(images)
        ),
      };

    setSaving(true);

    try {
      await submitOwnerBusinessUpdate(
        business.id,
        payload,
        owner
      );

      router.replace("/owner");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to submit the business update."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  if (pageState === "checking") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />

          <p className="mt-4 font-bold text-slate-600">
            Loading business editor...
          </p>
        </div>
      </main>
    );
  }

  if (
    pageState === "not-found" ||
    pageState === "forbidden"
  ) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-12 text-slate-900">
        <section className="w-full max-w-md rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm">
          <div className="text-6xl">
            ⚠️
          </div>

          <h1 className="mt-5 text-2xl font-black">
            Business Cannot Be Edited
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            {error ||
              "This business was not found or does not belong to your owner account."}
          </p>

          <Link
            href="/owner"
            className="mt-7 inline-block rounded-xl bg-slate-900 px-6 py-3 font-bold text-white"
          >
            Return to Dashboard
          </Link>
        </section>
      </main>
    );
  }

  if (pageState === "suspended") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-12 text-slate-900">
        <section className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="text-6xl">
            🔒
          </div>

          <h1 className="mt-5 text-3xl font-black">
            Account Suspended
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            Your owner account is suspended. Please contact
            the Go Nilgiris administrator.
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
            Unable to Open Editor
          </h1>

          <p className="mt-4 text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"
          >
            Try Again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/owner"
          className="inline-flex items-center font-bold text-emerald-700 hover:underline"
        >
          ← Back to Owner Dashboard
        </Link>

        <section className="mt-5 rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-700 p-7 text-white shadow-sm sm:p-10">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-200">
            Business Update Request
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Edit {business?.name}
          </h1>

          <p className="mt-3 max-w-3xl leading-7 text-emerald-50">
            Change your business information and upload the
            latest images. Your current approved listing
            will remain public until the administrator
            approves these changes.
          </p>
        </section>

        {business?.updateApprovalStatus ===
          "pending" && (
          <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-800">
            <p className="font-black">
              An update is already awaiting approval
            </p>

            <p className="mt-1 leading-6">
              You are editing the latest submitted version.
              Submitting again will replace the previous
              pending update.
            </p>
          </div>
        )}

        {business?.updateApprovalStatus ===
          "rejected" && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p className="font-black">
              Previous update rejected
            </p>

            <p className="mt-1 leading-6">
              {business.updateRejectionReason ||
                "Please review the details and submit the update again."}
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <label className="block font-bold text-slate-800">
            Business URL
            <input
              value={business?.id ?? ""}
              readOnly
              className={`${inputClass} cursor-not-allowed bg-slate-100 text-slate-500`}
            />

            <span className="mt-2 block text-xs font-normal text-slate-500">
              The public business URL cannot be changed.
            </span>
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="font-bold text-slate-800">
              Business name
              <input
                required
                value={form.name}
                onChange={(event) =>
                  update(
                    "name",
                    event.target.value
                  )
                }
                placeholder="Enter your business name"
                className={inputClass}
              />
            </label>

            <label className="font-bold text-slate-800">
              Category
              <select
                value={form.category}
                onChange={(event) =>
                  update(
                    "category",
                    event.target.value
                  )
                }
                className={inputClass}
              >
                <option>Hotel / Resort</option>
                <option>Homestay</option>
                <option>Restaurant</option>
                <option>Taxi</option>
                <option>Shopping</option>
                <option>Tea Estate</option>
                <option>Tourist Place</option>
                <option>Adventure</option>
                <option>Service</option>
              </select>
            </label>

            <label className="font-bold text-slate-800">
              Icon
              <input
                value={form.icon}
                onChange={(event) =>
                  update(
                    "icon",
                    event.target.value
                  )
                }
                placeholder="📍"
                className={inputClass}
              />
            </label>

            <label className="font-bold text-slate-800">
              Area or town
              <input
                required
                value={form.location}
                onChange={(event) =>
                  update(
                    "location",
                    event.target.value
                  )
                }
                placeholder="Ooty, Coonoor, Kotagiri..."
                className={inputClass}
              />
            </label>

            <label className="font-bold text-slate-800">
              Opening hours
              <input
                value={form.openingHours}
                onChange={(event) =>
                  update(
                    "openingHours",
                    event.target.value
                  )
                }
                placeholder="Example: 9:00 AM - 8:00 PM"
                className={inputClass}
              />
            </label>
          </div>

          <label className="block font-bold text-slate-800">
            Full address
            <textarea
              required
              rows={3}
              value={form.address}
              onChange={(event) =>
                update(
                  "address",
                  event.target.value
                )
              }
              placeholder="Enter the complete business address"
              className={inputClass}
            />
          </label>

          <label className="block font-bold text-slate-800">
            Business description
            <textarea
              required
              rows={5}
              value={form.description}
              onChange={(event) =>
                update(
                  "description",
                  event.target.value
                )
              }
              placeholder="Describe your business, products and services."
              className={inputClass}
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="font-bold text-slate-800">
              Phone label
              <input
                value={form.phoneLabel}
                onChange={(event) =>
                  update(
                    "phoneLabel",
                    event.target.value
                  )
                }
                placeholder="Reception / Booking"
                className={inputClass}
              />
            </label>

            <label className="font-bold text-slate-800">
              Business phone
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  update(
                    "phone",
                    event.target.value
                  )
                }
                placeholder="Enter contact number"
                className={inputClass}
              />
            </label>

            <label className="font-bold text-slate-800">
              WhatsApp number
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(event) =>
                  update(
                    "whatsapp",
                    event.target.value
                  )
                }
                placeholder="Example: 919876543210"
                className={inputClass}
              />
            </label>

            <label className="font-bold text-slate-800">
              Website
              <input
                type="url"
                value={form.website}
                onChange={(event) =>
                  update(
                    "website",
                    event.target.value
                  )
                }
                placeholder="https://example.com"
                className={inputClass}
              />
            </label>
          </div>

          <label className="block font-bold text-slate-800">
            Google Maps link
            <input
              type="url"
              value={form.maps}
              onChange={(event) =>
                update(
                  "maps",
                  event.target.value
                )
              }
              placeholder="Paste your Google Maps link"
              className={inputClass}
            />
          </label>

          <div className="grid gap-5 lg:grid-cols-3">
            <label className="font-bold text-slate-800">
              Services
              <span className="block text-xs font-normal text-slate-500">
                Enter one service per line
              </span>

              <textarea
                rows={7}
                value={form.services}
                onChange={(event) =>
                  update(
                    "services",
                    event.target.value
                  )
                }
                placeholder={
                  "Room booking\nRestaurant\nParking"
                }
                className={inputClass}
              />
            </label>

            <label className="font-bold text-slate-800">
              Highlights
              <span className="block text-xs font-normal text-slate-500">
                Enter one highlight per line
              </span>

              <textarea
                rows={7}
                value={form.highlights}
                onChange={(event) =>
                  update(
                    "highlights",
                    event.target.value
                  )
                }
                placeholder={
                  "Mountain view\nFamily friendly\nNear town"
                }
                className={inputClass}
              />
            </label>

            <label className="font-bold text-slate-800">
              Additional information
              <span className="block text-xs font-normal text-slate-500">
                Enter one item per line
              </span>

              <textarea
                rows={7}
                value={
                  form.additionalInfo
                }
                onChange={(event) =>
                  update(
                    "additionalInfo",
                    event.target.value
                  )
                }
                placeholder={
                  "Advance booking recommended\nPets not allowed"
                }
                className={inputClass}
              />
            </label>
          </div>

          <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Business Images
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Remove old images or upload the latest
                  images directly from your phone. Maximum{" "}
                  {maximumImages} images and 5 MB per image.
                </p>
              </div>

              <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-800">
                {images.length}/{maximumImages} images
              </span>
            </div>

            <label
              className={`mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-8 text-center transition ${
                uploading
                  ? "cursor-not-allowed border-slate-300 bg-slate-100 opacity-70"
                  : "border-emerald-300 bg-white hover:border-emerald-500 hover:bg-emerald-50"
              }`}
            >
              <span className="text-4xl">
                📷
              </span>

              <span className="mt-3 font-black text-emerald-800">
                {uploading
                  ? "Uploading Images..."
                  : "Choose New Images"}
              </span>

              <span className="mt-1 text-sm text-slate-500">
                Select images from your phone gallery
              </span>

              <input
                type="file"
                accept="image/*"
                multiple
                disabled={
                  uploading ||
                  images.length >=
                    maximumImages
                }
                onChange={
                  handleImageUpload
                }
                className="hidden"
              />
            </label>

            {uploadMessage && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-blue-800">
                {uploadMessage}
              </div>
            )}

            {images.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-500">
                No business images selected.
              </div>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {images.map(
                  (
                    imageUrl,
                    index
                  ) => (
                    <article
                      key={`${imageUrl}-${index}`}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                      <img
                        src={imageUrl}
                        alt={`Business image ${
                          index + 1
                        }`}
                        className="h-44 w-full object-cover"
                      />

                      <div className="flex items-center justify-between gap-3 p-3">
                        <p className="text-sm font-bold text-slate-700">
                          Image{" "}
                          {index + 1}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            removeImage(
                              imageUrl
                            )
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
          </section>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <p className="font-bold">
              Administrator approval required
            </p>

            <p className="mt-1">
              Submitting this form will not immediately
              replace your public listing. The current
              approved version stays visible until the
              administrator approves your update.
            </p>
          </div>

          <button
            type="submit"
            disabled={
              saving || uploading
            }
            className="w-full rounded-xl bg-emerald-700 px-6 py-3.5 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading
              ? "Uploading Images..."
              : saving
                ? "Submitting Update..."
                : "Submit Update for Approval"}
          </button>
        </form>
      </div>
    </main>
  );
}
