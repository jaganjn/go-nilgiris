"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveBusiness } from "@/lib/businesses";
import { firebaseConfigured } from "@/lib/firebase";
import type { Business, BusinessInput } from "@/types/business";

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
  const [slugEditedManually, setSlugEditedManually] = useState(
    Boolean(initial?.id)
  );

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    id: initial?.id ?? "",
    category: initial?.category ?? "Hotel / Resort",
    icon: initial?.icon ?? "📍",
    location: initial?.location ?? "",
    address: initial?.address ?? "",
    openingHours: initial?.openingHours ?? "",
    description: initial?.description ?? "",
    phone: initial?.phones?.[0]?.number ?? "",
    phoneLabel: initial?.phones?.[0]?.label ?? "Phone",
    whatsapp: initial?.whatsapp ?? "",
    website: initial?.website ?? "",
    maps: initial?.maps ?? "",
    services: initial?.services.join("\n") ?? "",
    highlights: initial?.highlights.join("\n") ?? "",
    additionalInfo: initial?.additionalInfo.join("\n") ?? "",
    images: initial?.images.join("\n") ?? "",
    verified: initial?.verified ?? false,
    featured: initial?.featured ?? false,
  });

  function update(
    key: keyof typeof form,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateBusinessName(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      id: slugEditedManually ? current.id : slugify(value),
    }));
  }

  function updateSlug(value: string) {
    setSlugEditedManually(true);

    setForm((current) => ({
      ...current,
      id: slugify(value),
    }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!firebaseConfigured) {
      setError(
        "Firebase is not configured. Check your Vercel environment variables."
      );
      return;
    }

    const generatedId = slugify(form.id || form.name);

    if (!form.name.trim()) {
      setError("Business name is required.");
      return;
    }

    if (!generatedId) {
      setError("Unable to generate a valid business URL slug.");
      return;
    }

    const images = splitLines(form.images);

    const invalidImage = images.find(
      (url) => !/^https?:\/\//i.test(url)
    );

    if (invalidImage) {
      setError(
        "Every image URL must begin with http:// or https://"
      );
      return;
    }

    setSaving(true);

    try {
      const payload: BusinessInput = {
        id: generatedId,
        name: form.name.trim(),
        category: form.category,
        icon: form.icon.trim() || "📍",
        location: form.location.trim(),
        address: form.address.trim(),
        openingHours: form.openingHours.trim(),
        description: form.description.trim(),
        phones: form.phone.trim()
          ? [
              {
                label: form.phoneLabel.trim() || "Phone",
                number: form.phone.trim(),
              },
            ]
          : [],
        whatsapp: form.whatsapp.trim() || undefined,
        website: form.website.trim() || undefined,
        maps: form.maps.trim() || undefined,
        services: splitLines(form.services),
        highlights: splitLines(form.highlights),
        additionalInfo: splitLines(form.additionalInfo),
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
    "mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500";

  return (
    <form
      onSubmit={submit}
      className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
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
              updateBusinessName(event.target.value)
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
              updateSlug(event.target.value)
            }
            placeholder="Automatically generated"
            className={inputClass}
          />

          <span className="mt-2 block text-xs font-normal text-slate-500">
            Automatically generated from the business name. You can
            edit it before saving.
          </span>
        </label>

        <label className="font-bold">
          Category
          <select
            value={form.category}
            onChange={(event) =>
              update("category", event.target.value)
            }
            className={inputClass}
          >
            <option>Hotel / Resort</option>
            <option>Homestay</option>
            <option>Restaurant</option>
            <option>Taxi</option>
            <option>Shopping</option>
            <option>Tourist Place</option>
            <option>Service</option>
          </select>
        </label>

        <label className="font-bold">
          Icon
          <input
            value={form.icon}
            onChange={(event) =>
              update("icon", event.target.value)
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
              update("location", event.target.value)
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
              update("openingHours", event.target.value)
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
            update("address", event.target.value)
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
            update("description", event.target.value)
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
              update("phoneLabel", event.target.value)
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
              update("phone", event.target.value)
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
              update("whatsapp", event.target.value)
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
              update("website", event.target.value)
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
            update("maps", event.target.value)
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
              update("services", event.target.value)
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
              update("highlights", event.target.value)
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
            value={form.additionalInfo}
            onChange={(event) =>
              update("additionalInfo", event.target.value)
            }
            className={inputClass}
          />
        </label>
      </div>

      <label className="block font-bold">
        Image URLs{" "}
        <span className="font-normal text-slate-500">
          (one public image link per line)
        </span>

        <textarea
          rows={5}
          value={form.images}
          onChange={(event) =>
            update("images", event.target.value)
          }
          placeholder="https://example.com/business-photo.jpg"
          className={inputClass}
        />

        <span className="mt-2 block text-sm font-normal text-slate-500">
          Use direct HTTPS image links from Cloudinary, ImageKit,
          GitHub or another public image host.
        </span>
      </label>

      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 font-bold">
          <input
            type="checkbox"
            checked={form.verified}
            onChange={(event) =>
              update("verified", event.target.checked)
            }
          />
          Verified
        </label>

        <label className="flex items-center gap-2 font-bold">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) =>
              update("featured", event.target.checked)
            }
          />
          Featured
        </label>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving
          ? "Saving..."
          : initial
            ? "Update Business"
            : "Add Business"}
      </button>
    </form>
  );
}
