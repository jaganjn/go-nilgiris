"use client";

import { useRouter } from "next/navigation";
import {
  useState,
  type FormEvent,
} from "react";

import { submitOwnerBusiness } from "@/lib/businesses";
import { firebaseConfigured } from "@/lib/firebase";

import type { AccountProfile } from "@/types/account";
import type { BusinessInput } from "@/types/business";

type OwnerBusinessFormProps = {
  owner: AccountProfile;
};

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

const initialForm = {
  name: "",
  id: "",
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
  images: "",
};

export default function OwnerBusinessForm({
  owner,
}: OwnerBusinessFormProps) {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [slugEditedManually, setSlugEditedManually] =
    useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  function updateBusinessName(value: string) {
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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!firebaseConfigured) {
      setError(
        "Firebase is not configured. Please contact the administrator."
      );
      return;
    }

    const businessId = slugify(
      form.id || form.name
    );

    if (form.name.trim().length < 2) {
      setError("Please enter the business name.");
      return;
    }

    if (!businessId) {
      setError(
        "Unable to generate a valid business URL."
      );
      return;
    }

    if (!form.location.trim()) {
      setError("Please enter the business location.");
      return;
    }

    if (!form.address.trim()) {
      setError("Please enter the full address.");
      return;
    }

    if (form.description.trim().length < 20) {
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

    const images = splitLines(form.images);

    const invalidImage = images.find(
      (image) => !/^https:\/\//i.test(image)
    );

    if (invalidImage) {
      setError(
        "Business image links must begin with https://"
      );
      return;
    }

    const payload: BusinessInput = {
      id: businessId,
      name: form.name.trim(),
      category: form.category,
      icon: form.icon.trim() || "📍",
      location: form.location.trim(),
      address: form.address.trim(),
      openingHours:
        form.openingHours.trim() ||
        "Contact business for timings",
      description: form.description.trim(),

      phones: [
        {
          label:
            form.phoneLabel.trim() || "Phone",
          number: form.phone.trim(),
        },
      ],

      whatsapp: form.whatsapp.trim(),
      website: form.website.trim(),
      maps: form.maps.trim(),

      services: splitLines(form.services),
      highlights: splitLines(form.highlights),
      additionalInfo: splitLines(
        form.additionalInfo
      ),
      images,

      verified: false,
      featured: false,
    };

    setSaving(true);

    try {
      await submitOwnerBusiness(
        payload,
        owner
      );

      router.replace("/owner");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to submit the business."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <p className="font-bold">
          Admin approval required
        </p>

        <p className="mt-1">
          Your business will remain hidden from the public
          until the Go Nilgiris administrator reviews and
          approves it.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="font-bold text-slate-800">
          Business name
          <input
            required
            value={form.name}
            onChange={(event) =>
              updateBusinessName(
                event.target.value
              )
            }
            placeholder="Enter your business name"
            className={inputClass}
          />
        </label>

        <label className="font-bold text-slate-800">
          Business URL
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
            This is generated automatically from the
            business name.
          </span>
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
              update("icon", event.target.value)
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
            placeholder="Example: 9:00 AM – 8:00 PM"
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
          placeholder="Describe your business, products, services and what makes it special."
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
            update("maps", event.target.value)
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
            value={form.additionalInfo}
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

      <label className="block font-bold text-slate-800">
        Business image links
        <span className="block text-xs font-normal text-slate-500">
          Optional — enter one HTTPS image link per line
        </span>

        <textarea
          rows={5}
          value={form.images}
          onChange={(event) =>
            update(
              "images",
              event.target.value
            )
          }
          placeholder={
            "https://example.com/business-photo-1.jpg"
          }
          className={inputClass}
        />

        <span className="mt-2 block text-sm font-normal leading-6 text-slate-500">
          You may leave this blank. The administrator can
          add approved business images later.
        </span>
      </label>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-emerald-700 px-6 py-3.5 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving
          ? "Submitting Business..."
          : "Submit Business for Approval"}
      </button>
    </form>
  );
            }
