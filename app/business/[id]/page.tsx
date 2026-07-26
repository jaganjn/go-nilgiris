"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getBusiness } from "@/lib/businesses";
import EnquiryForm from "@/components/EnquiryForm";
import type { Business } from "@/types/business";

const phoneHref = (number: string) =>
  `tel:${number.replace(/[^\d+]/g, "")}`;

const whatsappHref = (number: string, businessName: string) => {
  const cleanNumber = number.replace(/\D/g, "");
  const message = encodeURIComponent(
    `Hello, I found ${businessName} on Go Nilgiris. I would like to know more details.`
  );

  return `https://wa.me/${cleanNumber}?text=${message}`;
};

export default function BusinessDetailsPage() {
  const params = useParams<{ id: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    setLoading(true);

    getBusiness(params.id)
      .then((result) => {
        setBusiness(result);
        setSelectedImage(0);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const images = useMemo(
    () => business?.images?.filter(Boolean) ?? [],
    [business]
  );

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-700" />
          <p className="mt-4 font-bold text-emerald-800">
            Loading business...
          </p>
        </div>
      </main>
    );
  }

  if (!business) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5">
        <div className="text-center">
          <h1 className="text-3xl font-black">Business not found</h1>
          <p className="mt-3 text-slate-600">
            This listing may have been removed or the link may be incorrect.
          </p>
          <Link
            href="/explore"
            className="mt-5 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white"
          >
            Back to Explore
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-700 px-5 py-12 text-white sm:py-16">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur transition hover:bg-white/20"
          >
            ← Back to Explore
          </Link>

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-white/15 text-6xl shadow-xl">
              {images[0] ? (
                <img
                  src={images[0]}
                  alt={business.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                business.icon
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-bold uppercase tracking-widest text-emerald-200">
                  {business.category}
                </p>

                {business.verified && (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                    ✓ Verified listing
                  </span>
                )}

                {business.featured && (
                  <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-bold text-slate-900">
                    ★ Featured
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
                {business.name}
              </h1>

              <p className="mt-4 max-w-3xl leading-7 text-emerald-50">
                📍 {business.location}
              </p>
            </div>
          </div>
        </div>
      </section>

      {images.length > 0 && (
        <section className="px-5 pt-8">
          <div className="mx-auto max-w-6xl">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <img
                src={images[selectedImage] ?? images[0]}
                alt={`${business.name} photo ${selectedImage + 1}`}
                className="h-64 w-full object-cover sm:h-[420px]"
              />
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    aria-label={`View ${business.name} photo ${index + 1}`}
                    className={`shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                      selectedImage === index
                        ? "border-emerald-700"
                        : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="h-20 w-28 object-cover sm:h-24 sm:w-36"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="px-5 py-10">
        <div className="mx-auto grid max-w-6xl gap-7 lg:grid-cols-[1fr_360px]">
          <div className="space-y-7">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-black">About</h2>
              <p className="mt-4 leading-8 text-slate-600">
                {business.description}
              </p>
            </article>

            {business.services.length > 0 && (
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-black">Services & Facilities</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {business.services.map((service) => (
                    <div
                      key={service}
                      className="rounded-2xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-900"
                    >
                      ✓ {service}
                    </div>
                  ))}
                </div>
              </article>
            )}

            {business.highlights.length > 0 && (
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-black">Highlights</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {business.highlights.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl bg-amber-50 px-4 py-3 text-slate-700"
                    >
                      ⭐ {item}
                    </div>
                  ))}
                </div>
              </article>
            )}

            {business.additionalInfo.length > 0 && (
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-black">Visitor Information</h2>
                <ul className="mt-5 space-y-3 text-slate-600">
                  {business.additionalInfo.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 rounded-2xl bg-slate-50 px-4 py-3"
                    >
                      <span className="font-black text-emerald-700">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            )}

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-black">Address</h2>
              <p className="mt-4 leading-8 text-slate-600">
                {business.address}
              </p>

              {business.maps && (
                <a
                  href={business.maps}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"
                >
                  📍 Get Directions
                </a>
              )}
            </article>

            <EnquiryForm
              businessId={business.id}
              businessName={business.name}
            />
          </div>

          <aside>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-xl font-black">Contact & Visit</h2>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Opening hours
                </p>
                <p className="mt-2 font-semibold leading-6">
                  {business.openingHours}
                </p>
              </div>

              <div className="mt-5 grid gap-3">
                {business.phones.map((phone) => (
                  <a
                    key={`${phone.label}-${phone.number}`}
                    href={phoneHref(phone.number)}
                    className="rounded-xl bg-emerald-700 px-4 py-3 text-center font-bold text-white transition hover:bg-emerald-800"
                  >
                    📞 {phone.label}: {phone.number}
                  </a>
                ))}

                {business.whatsapp && (
                  <a
                    href={whatsappHref(business.whatsapp, business.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-green-600 px-4 py-3 text-center font-bold text-white transition hover:bg-green-700"
                  >
                    💬 Enquire on WhatsApp
                  </a>
                )}

                {business.website && (
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-emerald-700 px-4 py-3 text-center font-bold text-emerald-700 transition hover:bg-emerald-50"
                  >
                    🌐 Official Website
                  </a>
                )}

                {business.maps && (
                  <a
                    href={business.maps}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-300 px-4 py-3 text-center font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    📍 Open in Google Maps
                  </a>
                )}
              </div>

              <p className="mt-5 text-center text-xs leading-5 text-slate-500">
                Contact the business directly to confirm availability, prices,
                timings and service details.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
