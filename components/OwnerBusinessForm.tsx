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
    "mt-2 w-full rounded-xl border border-s
