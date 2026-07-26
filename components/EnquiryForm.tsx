"use client";

import { useState, type FormEvent } from "react";
import { createEnquiry } from "@/lib/enquiries";

type EnquiryFormProps = {
  businessId: string;
  businessName: string;
};

const emptyForm = {
  customerName: "",
  phone: "",
  email: "",
  serviceDate: "",
  message: "",
};

export default function EnquiryForm({
  businessId,
  businessName,
}: EnquiryFormProps) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setSuccess(false);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setSuccess(false);

    const cleanPhone = form.phone.replace(/\D/g, "");

    if (form.customerName.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }

    if (cleanPhone.length < 7) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (form.message.trim().length < 10) {
      setError(
        "Please enter a short message explaining your requirement."
      );
      return;
    }

    setSubmitting(true);

    try {
      await createEnquiry({
        businessId,
        businessName,
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        serviceDate: form.serviceDate || undefined,
        message: form.message.trim(),
      });

      setForm(emptyForm);
      setSuccess(true);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to send your enquiry. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
        Customer enquiry
      </p>

      <h2 className="mt-2 text-2xl font-black text-slate-900">
        Enquire about {businessName}
      </h2>

      <p className="mt-3 leading-7 text-slate-600">
        Submit your requirement and the business can contact you
        regarding availability, pricing and other details.
      </p>

      {success && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          ✓ Your enquiry has been submitted successfully.
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="font-bold text-slate-800">
            Your name
            <input
              required
              type="text"
              value={form.customerName}
              onChange={(event) =>
                updateField(
                  "customerName",
                  event.target.value
                )
              }
              placeholder="Enter your name"
              autoComplete="name"
              className={inputClass}
            />
          </label>

          <label className="font-bold text-slate-800">
            Phone number
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(event) =>
                updateField("phone", event.target.value)
              }
              placeholder="Enter your phone number"
              autoComplete="tel"
              inputMode="tel"
              className={inputClass}
            />
          </label>

          <label className="font-bold text-slate-800">
            Email{" "}
            <span className="font-normal text-slate-500">
              (optional)
            </span>
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                updateField("email", event.target.value)
              }
              placeholder="Enter your email address"
              autoComplete="email"
              className={inputClass}
            />
          </label>

          <label className="font-bold text-slate-800">
            Required date{" "}
            <span className="font-normal text-slate-500">
              (optional)
            </span>
            <input
              type="date"
              value={form.serviceDate}
              onChange={(event) =>
                updateField(
                  "serviceDate",
                  event.target.value
                )
              }
              className={inputClass}
            />
          </label>
        </div>

        <label className="block font-bold text-slate-800">
          Your requirement
          <textarea
            required
            rows={5}
            value={form.message}
            onChange={(event) =>
              updateField("message", event.target.value)
            }
            placeholder={`Example: I would like to know the availability and price for ${businessName}.`}
            className={inputClass}
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-emerald-700 px-6 py-3.5 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {submitting
            ? "Submitting..."
            : "Submit Enquiry"}
        </button>

        <p className="text-xs leading-5 text-slate-500">
          Your details will be used only to respond to this
          enquiry.
        </p>
      </form>
    </section>
  );
}
