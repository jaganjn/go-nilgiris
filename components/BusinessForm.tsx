"use client";

import { useRouter } from "next/navigation";
import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { saveBusiness } from "@/lib/businesses";
import { uploadBusinessImage } from "@/lib/cloudinaryUpload";
import { firebaseConfigured } from "@/lib/firebase";

import type {
  Business,
  BusinessInput,
} from "@/types/business";

const maximumImages = 10;

const splitLines = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function BusinessForm({
  initial,
}: {
  initial?: Business;
}) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [uploading, setUploading] =
    useState(false);

  const [uploadMessage, setUploadMessage] =
    useState("");

  const [uploadedImages, setUploadedImages] =
    useState<string[]>(
      Array.isArray(initial?.images)
        ? initial.images
        : []
    );

  const [
    slugEditedManually,
    setSlugEditedManually,
  ] = useState(Boolean(initial?.id));

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    id: initial?.id ?? "",
    category:
      initial?.category ??
      "Hotel / Resort",
    icon: initial?.icon ?? "📍",
    location: initial?.location ?? "",
    address: initial?.address ?? "",
    openingHours:
      initial?.openingHours ?? "",
    description:
      initial?.description ?? "",
    phone:
      initial?.phones?.[0]?.number ??
      "",
    phoneLabel:
      initial?.phones?.[0]?.label ??
      "Phone",
    whatsapp:
      initial?.whatsapp ?? "",
    website:
      initial?.website ?? "",
    maps: initial?.maps ?? "",
    services:
      initial?.services.join("\n") ??
      "",
    highlights:
      initial?.highlights.join("\n") ??
      "",
    additionalInfo:
      initial?.additionalInfo.join(
        "\n"
      ) ?? "",
    images: "",
    verified:
      initial?.verified ?? false,
    featured:
      initial?.featured ?? false,
  });

  function update(
    key: keyof typeof form,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setError("");
  }

  function updateBusinessName(
    value: string
  ) {
    setForm((current) => ({
      ...current,
      name: value,
      id: slugEditedManually
        ? current.id
        : slugify(value),
    }));

    setError("");
  }

  function updateSlug(value: string) {
    setSlugEditedManually(true);

    setForm((current) => ({
      ...current,
      id: slugify(value),
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

    const manualImages =
      splitLines(form.images);

    const currentImageCount =
      new Set([
        ...uploadedImages,
        ...manualImages,
      ]).size;

    const remainingSlots =
      maximumImages - currentImageCount;

    if (remainingSlots <= 0) {
      setError(
        `You can add a maximum of ${maximumImages} images.`
      );
      return;
    }

    if (files.length > remainingSlots) {
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

    let completedUploads = 0;

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

        setUploadedImages((current) =>
          current.includes(imageUrl)
            ? current
            : [
                ...current,
                imageUrl,
              ]
        );

        completedUploads += 1;
      }

      setUploadMessage(
        `${completedUploads} image${
          completedUploads === 1
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

      if (completedUploads > 0) {
        setUploadMessage(
          `${completedUploads} image${
            completedUploads === 1
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

  function removeUploadedImage(
    imageUrl: string
  ) {
    setUploadedImages((current) =>
      current.filter(
        (image) =>
          image !== imageUrl
      )
    );

    setUploadMessage("");
    setError("");
  }

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (uploading) {
      setError(
        "Please wait until all selected images finish uploading."
      );
      return;
    }

    if (!firebaseConfigured) {
      setError(
        "Firebase is not configured. Check your Vercel environment variables."
      );
      return;
    }

    const generatedId = slugify(
      form.id || form.name
    );

    if (!form.name.trim()) {
      setError(
        "Business name is required."
      );
      return;
    }

    if (!generatedId) {
      setError(
        "Unable to generate a valid business URL slug."
      );
      return;
    }

    const manualImages =
      splitLines(form.images);

    const invalidImage =
      manualImages.find(
        (url) =>
          !/^https?:\/\//i.test(url) &&
          !url.startsWith(
            "/images/"
          )
      );

    if (invalidImage) {
      setError(
        "Every additional image must be a public URL or a local path beginning with /images/"
      );
      return;
    }

    const images = Array.from(
      new Set([
        ...uploadedImages,
        ...manualImages,
      ])
    );

    if (
      images.length >
      maximumImages
    ) {
      setError(
        `A business can have a maximum of ${maximumImages} images.`
      );
      return;
    }

    setSaving(true);

    try {
      const payload: BusinessInput = {
        id: generatedId,
        name: form.name.trim(),
        category: form.category,
        icon:
          form.icon.trim() || "📍",
        location:
          form.location.trim(),
        address:
          form.address.trim(),
        openingHours:
          form.openingHours.trim(),
        description:
          form.description.trim(),

        phones: form.phone.trim()
          ? [
              {
                label:
                  form.phoneLabel.trim() ||
                  "Phone",

                number:
                  form.phone.trim(),
              },
            ]
          : [],

        whatsapp:
          form.whatsapp.trim() ||
          undefined,

        website:
          form.website.trim() ||
          undefined,

        maps:
          form.maps.trim() ||
          undefined,

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

        images,
        verified: form.verified,
        featured: form.featured,
      };

      await saveBusiness(payload);

      router.push("/admin");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to save business."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

  return (
    <form
      onSubmit={submit}
      className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="font-bold">
          Business name
          <input
            required
            value={form.name}
            onChange={(event) =>
              updateBusinessName(
                event.target.value
              )
            }
            placeholder="Ooty Lake View Resort"
            className={inputClass}
          />
        </label>

        <label className="font-bold">
          Business ID / URL slug
          <input
            required
            value={form.id}
            onChange={(event) =>
              updateSlug(
                event.target.value
              )
            }
            placeholder="Automatically generated"
            className={inputClass}
          />

          <span className="mt-2 block text-xs font-normal text-slate-500">
            Automatically generated from the business name.
            You can edit it before saving.
          </span>
        </label>

        <label className="font-bold">
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
            <option>
              Hotel / Resort
            </option>
            <option>Homestay</option>
            <option>Restaurant</option>
            <option>Taxi</option>
            <option>Shopping</option>
            <option>Tea Estate</option>
            <option>
              Tourist Place
            </option>
            <option>Adventure</option>
            <option>Service</option>
          </select>
        </label>

        <label className="font-bold">
          Icon
          <input
            value={form.icon}
            onChange={(event) =>
              update(
                "icon",
                event.target.value
              )
            }
            className={inputClass}
          />
        </label>

        <label className="font-bold">
          Short location
          <input
            required
            value={form.location}
            onChange={(event) =>
              update(
                "location",
                event.target.value
              )
            }
            placeholder="Fern Hill, Ooty"
            className={inputClass}
          />
        </label>

        <label className="font-bold">
          Opening hours
          <input
            required
            value={form.openingHours}
            onChange={(event) =>
              update(
                "openingHours",
                event.target.value
              )
            }
            placeholder="Open 24 hours"
            className={inputClass}
          />
        </label>
      </div>

      <label className="block font-bold">
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
          className={inputClass}
        />
      </label>

      <label className="block font-bold">
        Description
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
          className={inputClass}
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="font-bold">
          Phone label
          <input
            value={form.phoneLabel}
            onChange={(event) =>
              update(
                "phoneLabel",
                event.target.value
              )
            }
            placeholder="Reception"
            className={inputClass}
          />
        </label>

        <label className="font-bold">
          Phone number
          <input
            type="tel"
            value={form.phone}
            onChange={(event) =>
              update(
                "phone",
                event.target.value
              )
            }
            className={inputClass}
          />
        </label>

        <label className="font-bold">
          WhatsApp
          <input
            type="tel"
            value={form.whatsapp}
            onChange={(event) =>
              update(
                "whatsapp",
                event.target.value
              )
            }
            placeholder="919876543210"
            className={inputClass}
          />
        </label>

        <label className="font-bold">
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

      <label className="block font-bold">
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
          placeholder="https://maps.google.com/..."
          className={inputClass}
        />
      </label>

      <div className="grid gap-5 lg:grid-cols-3">
        <label className="font-bold">
          Services{" "}
          <span className="font-normal text-slate-500">
            (one per line)
          </span>

          <textarea
            rows={8}
            value={form.services}
            onChange={(event) =>
              update(
                "services",
                event.target.value
              )
            }
            className={inputClass}
          />
        </label>

        <label className="font-bold">
          Highlights{" "}
          <span className="font-normal text-slate-500">
            (one per line)
          </span>

          <textarea
            rows={8}
            value={form.highlights}
            onChange={(event) =>
              update(
                "highlights",
                event.target.value
              )
            }
            className={inputClass}
          />
        </label>

        <label className="font-bold">
          Visitor information{" "}
          <span className="font-normal text-slate-500">
            (one per line)
          </span>

          <textarea
            rows={8}
            value={
              form.additionalInfo
            }
            onChange={(event) =>
              update(
                "additionalInfo",
                event.target.value
              )
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
              Upload images directly from your phone or
              computer. Maximum {maximumImages} images and
              5 MB per image.
            </p>
          </div>

          <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-800">
            {uploadedImages.length}/
            {maximumImages} uploaded
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
              : initial
                ? "Choose New Images"
                : "Choose Images"}
          </span>

          <span className="mt-1 text-sm text-slate-500">
            JPG, PNG, WEBP and other image formats
          </span>

          <input
            type="file"
            accept="image/*"
            multiple
            disabled={
              uploading ||
              uploadedImages.length >=
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

        {uploadedImages.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-500">
            No uploaded business images.
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {uploadedImages.map(
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
                      Image {index + 1}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        removeUploadedImage(
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

      <label className="block font-bold">
        Additional image links{" "}
        <span className="font-normal text-slate-500">
          (optional, one per line)
        </span>

        <textarea
          rows={4}
          value={form.images}
          onChange={(event) =>
            update(
              "images",
              event.target.value
            )
          }
          placeholder="/images/businesses/example-business-01.jpg"
          className={inputClass}
        />

        <span className="mt-2 block text-sm font-normal leading-6 text-slate-500">
          Uploaded images are added automatically. You may
          also enter a local path beginning with /images/ or
          a direct HTTPS image URL.
        </span>
      </label>

      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 font-bold">
          <input
            type="checkbox"
            checked={form.verified}
            onChange={(event) =>
              update(
                "verified",
                event.target.checked
              )
            }
          />
          Verified
        </label>

        <label className="flex items-center gap-2 font-bold">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) =>
              update(
                "featured",
                event.target.checked
              )
            }
          />
          Featured
        </label>
      </div>

      <button
        type="submit"
        disabled={
          saving || uploading
        }
        className="rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading
          ? "Uploading Images..."
          : saving
            ? "Saving..."
            : initial
              ? "Update Business"
              : "Add Business"}
      </button>
    </form>
  );
}
