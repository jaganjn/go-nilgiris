"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import EnquiryForm from "@/components/EnquiryForm";
import { getPublicBusiness } from "@/lib/businesses";

import type { Business } from "@/types/business";

const phoneHref = (number: string) =>
  `tel:${number.replace(/[^\d+]/g, "")}`;

function getWhatsAppNumber(number: string) {
  let cleanNumber = number.replace(/\D/g, "");

  if (
    cleanNumber.length === 11 &&
    cleanNumber.startsWith("0")
  ) {
    cleanNumber = cleanNumber.slice(1);
  }

  if (cleanNumber.length === 10) {
    cleanNumber = `91${cleanNumber}`;
  }

  return cleanNumber;
}

const whatsappHref = (
  number: string,
  businessName: string
) => {
  const cleanNumber = getWhatsAppNumber(number);

  const message = encodeURIComponent(
    `Hello, I found ${businessName} on Go Nilgiris. I would like to know more details.`
  );

  return `https://wa.me/${cleanNumber}?text=${message}`;
};

type SafeImageProps = {
  src: string;
  alt: string;
  className: string;
  fallbackClassName?: string;
  fallbackContent?: React.ReactNode;
};

function SafeImage({
  src,
  alt,
  className,
  fallbackClassName = "",
  fallbackContent = "📷",
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed) {
    return (
      <div
        className={`grid place-items-center bg-slate-100 text-4xl text-slate-400 ${fallbackClassName}`}
        aria-label={`${alt} unavailable`}
      >
        {fallbackContent}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default function BusinessDetailsPage() {
  const params = useParams<{ id: string }>();

  const [business, setBusiness] =
    useState<Business | null>(null);

  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] =
    useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    getPublicBusiness(params.id)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setBusiness(result);
        setSelectedImage(0);
      })
      .catch(() => {
        if (!cancelled) {
          setBusiness(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const images = useMemo(
    () =>
      business?.images
        ?.map((image) => image.trim())
        .filter(Boolean) ?? [],
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
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-black">
            Business not found
          </h1>

          <p className="mt-3 leading-7 text-slate-600">
            This listing may be pending approval, removed
            or the link may be incorrect.
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

  const selectedImageUrl =
    images[selectedImage] ?? images[0];

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900">
      <section className="w-full bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-700 px-4 py-10 text-white sm:px-6 sm:py-14">
        <div className="mx-auto w-full max-w-6xl">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur transition hover:bg-white/20"
          >
            ← Back to Explore
          </Link>

          <div className="mt-7 flex min-w-0 flex-col gap-5 sm:mt-8 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-white/15 text-5xl shadow-xl sm:h-28 sm:w-28 sm:text-6xl">
              {images[0] ? (
                <SafeImage
                  src={images[0]}
                  alt={business.name}
                  className="h-full w-full object-cover"
                  fallbackClassName="h-full w-full"
                  fallbackContent={
                    business.icon || "📍"
                  }
                />
              ) : (
                business.icon || "📍"
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <p className="break-words text-sm font-bold uppercase tracking-widest text-emerald-200">
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

              <h1 className="mt-3 break-words text-3xl font-black leading-tight sm:text-5xl">
                {business.name}
              </h1>

              <p className="mt-4 break-words leading-7 text-emerald-50">
                📍 {business.location}
              </p>
            </div>
          </div>
        </div>
      </section>

      {images.length > 0 && (
        <section className="w-full px-4 pt-6 sm:px-6 sm:pt-8">
          <div className="mx-auto w-full max-w-6xl">
            <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <SafeImage
                key={selectedImageUrl}
                src={selectedImageUrl}
                alt={`${business.name} photo ${
                  selectedImage + 1
                }`}
                className="h-56 w-full object-cover sm:h-[420px]"
                fallbackClassName="h-56 w-full sm:h-[420px]"
              />
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex max-w-full gap-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() =>
                      setSelectedImage(index)
                    }
                    aria-label={`View ${business.name} photo ${
                      index + 1
                    }`}
                    className={`shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                      selectedImage === index
                        ? "border-emerald-700"
                        : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    <SafeImage
                      src={image}
                      alt={`${business.name} thumbnail ${
                        index + 1
                      }`}
                      className="h-20 w-28 object-cover sm:h-24 sm:w-36"
                      fallbackClassName="h-20 w-28 sm:h-24 sm:w-36"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="w-full px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto grid w-full max-w-6xl min-w-0 gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-7">
            <article className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
              <h2 className="text-2xl font-black">
                About
              </h2>

              <p className="mt-4 whitespace-pre-wrap break-words leading-8 text-slate-600">
                {business.description}
              </p>
            </article>

            {business.services?.length > 0 && (
              <article className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                <h2 className="break-words text-2xl font-black">
                  Services & Facilities
                </h2>

                <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2">
                  {business.services.map(
                    (service, index) => (
                      <div
                        key={`${service}-${index}`}
                        className="min-w-0 break-words rounded-2xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-900"
                      >
                        ✓ {service}
                      </div>
                    )
                  )}
                </div>
              </article>
            )}

            {business.highlights?.length > 0 && (
              <article className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                <h2 className="text-2xl font-black">
                  Highlights
                </h2>

                <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2">
                  {business.highlights.map(
                    (item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className="min-w-0 break-words rounded-2xl bg-amber-50 px-4 py-3 text-slate-700"
                      >
                        ⭐ {item}
                      </div>
                    )
                  )}
                </div>
              </article>
            )}

            {business.additionalInfo?.length >
              0 && (
              <article className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                <h2 className="text-2xl font-black">
                  Visitor Information
                </h2>

                <ul className="mt-5 min-w-0 space-y-3 text-slate-600">
                  {business.additionalInfo.map(
                    (item, index) => (
                      <li
                        key={`${item}-${index}`}
                        className="flex min-w-0 gap-3 rounded-2xl bg-slate-50 px-4 py-3"
                      >
                        <span className="shrink-0 font-black text-emerald-700">
                          •
                        </span>

                        <span className="min-w-0 break-words">
                          {item}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </article>
            )}

            <article className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
              <h2 className="text-2xl font-black">
                Address
              </h2>

              <p className="mt-4 whitespace-pre-wrap break-words leading-8 text-slate-600">
                {business.address}
              </p>

              {business.maps && (
                <a
                  href={business.maps}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex max-w-full rounded-xl bg-slate-900 px-5 py-3 text-center font-bold text-white"
                >
                  📍 Get Directions
                </a>
              )}
            </article>

            <div className="min-w-0">
              <EnquiryForm
                businessId={business.id}
                businessName={business.name}
              />
            </div>
          </div>

          <aside className="min-w-0">
            <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:sticky xl:top-24">
              <h2 className="text-xl font-black">
                Contact & Visit
              </h2>

              <div className="mt-5 min-w-0 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Opening hours
                </p>

                <p className="mt-2 break-words font-semibold leading-6">
                  {business.openingHours}
                </p>
              </div>

              <div className="mt-5 grid min-w-0 gap-3">
                {business.phones?.map(
                  (phone, index) => (
                    <a
                      key={`${phone.label}-${phone.number}-${index}`}
                      href={phoneHref(phone.number)}
                      className="min-w-0 break-words rounded-xl bg-emerald-700 px-4 py-3 text-center font-bold text-white transition hover:bg-emerald-800"
                    >
                      📞 {phone.label}:{" "}
                      {phone.number}
                    </a>
                  )
                )}

                {business.whatsapp && (
                  <a
                    href={whatsappHref(
                      business.whatsapp,
                      business.name
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 break-words rounded-xl bg-green-600 px-4 py-3 text-center font-bold text-white transition hover:bg-green-700"
                  >
                    💬 Enquire on WhatsApp
                  </a>
                )}

                {business.website && (
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 break-words rounded-xl border border-emerald-700 px-4 py-3 text-center font-bold text-emerald-700 transition hover:bg-emerald-50"
                  >
                    🌐 Official Website
                  </a>
                )}

                {business.maps && (
                  <a
                    href={business.maps}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 break-words rounded-xl border border-slate-300 px-4 py-3 text-center font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    📍 Open in Google Maps
                  </a>
                )}
              </div>

              <p className="mt-5 break-words text-center text-xs leading-5 text-slate-500">
                Contact the business directly to confirm
                availability, prices, timings and service
                details.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
