"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { listBusinesses } from "@/lib/businesses";

import type { Business } from "@/types/business";

const categories = [
  "All",
  "Hotel / Resort",
  "Homestay",
  "Restaurant",
  "Taxi",
  "Shopping",
  "Tea Estate",
  "Tourist Place",
  "Adventure",
  "Service",
];

type ListingFilter =
  | "all"
  | "verified"
  | "featured";

type BusinessCardImageProps = {
  src: string;
  alt: string;
  icon?: string;
};

function BusinessCardImage({
  src,
  alt,
  icon,
}: BusinessCardImageProps) {
  const [failed, setFailed] =
    useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed) {
    return (
      <div className="flex h-48 items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100 text-7xl">
        {icon || "📍"}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() =>
        setFailed(true)
      }
      className="h-48 w-full object-cover"
    />
  );
}

export default function ExplorePage() {
  const [businesses, setBusinesses] =
    useState<Business[]>([]);

  const [category, setCategory] =
    useState("All");

  const [location, setLocation] =
    useState("All");

  const [listingFilter, setListingFilter] =
    useState<ListingFilter>("all");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");

    listBusinesses()
      .then((data) => {
        if (!cancelled) {
          setBusinesses(data);
        }
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Unable to load businesses."
          );
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
  }, []);

  const locations = useMemo(() => {
    const availableLocations =
      businesses
        .map((business) =>
          business.location.trim()
        )
        .filter(Boolean);

    return [
      "All",
      ...Array.from(
        new Set(availableLocations)
      ).sort((first, second) =>
        first.localeCompare(second)
      ),
    ];
  }, [businesses]);

  const filtered = useMemo(() => {
    const term =
      search.trim().toLowerCase();

    return businesses.filter(
      (business) => {
        const categoryMatch =
          category === "All" ||
          business.category ===
            category;

        const locationMatch =
          location === "All" ||
          business.location ===
            location;

        const listingMatch =
          listingFilter === "all" ||
          (listingFilter ===
            "verified" &&
            business.verified) ||
          (listingFilter ===
            "featured" &&
            business.featured);

        const searchMatch =
          !term ||
          [
            business.name,
            business.location,
            business.category,
            business.description,
            ...(business.services ??
              []),
            ...(business.highlights ??
              []),
          ]
            .join(" ")
            .toLowerCase()
            .includes(term);

        return (
          categoryMatch &&
          locationMatch &&
          listingMatch &&
          searchMatch
        );
      }
    );
  }, [
    businesses,
    category,
    location,
    listingFilter,
    search,
  ]);

  const filtersActive =
    search.trim() !== "" ||
    category !== "All" ||
    location !== "All" ||
    listingFilter !== "all";

  function clearFilters() {
    setSearch("");
    setCategory("All");
    setLocation("All");
    setListingFilter("all");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 px-5 py-14 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-200">
            Explore the Nilgiris
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Find trusted places and local services
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-emerald-50">
            Search stays, restaurants, taxis,
            attractions, shops and local services
            across the Nilgiris.
          </p>

          <div className="mx-auto mt-7 max-w-2xl">
            <label
              htmlFor="business-search"
              className="sr-only"
            >
              Search businesses
            </label>

            <input
              id="business-search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search by name, service or place..."
              className="w-full rounded-2xl border border-white/20 bg-white px-5 py-4 text-slate-900 shadow-xl outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-white/20"
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-5 sm:py-10">
        <div className="mx-auto max-w-7xl">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
                  Search Filters
                </p>

                <h2 className="mt-1 text-xl font-black">
                  Narrow your results
                </h2>
              </div>

              {filtersActive && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <label className="font-bold text-slate-700">
                Category
                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                >
                  {categories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="font-bold text-slate-700">
                Location
                <select
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                >
                  {locations.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="font-bold text-slate-700">
                Listing type
                <select
                  value={listingFilter}
                  onChange={(event) =>
                    setListingFilter(
                      event.target
                        .value as ListingFilter
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="all">
                    All listings
                  </option>

                  <option value="verified">
                    Verified only
                  </option>

                  <option value="featured">
                    Featured only
                  </option>
                </select>
              </label>
            </div>
          </section>

          <div className="mt-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
                Public Directory
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Explore businesses
              </h2>
            </div>

            <p className="text-sm font-semibold text-slate-500">
              {loading
                ? "Loading..."
                : `${filtered.length} listing${
                    filtered.length === 1
                      ? ""
                      : "s"
                  }`}
            </p>
          </div>

          {error && (
            <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-center font-semibold text-red-700">
              {error}
            </div>
          )}

          {loading && (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="h-48 animate-pulse bg-slate-200" />

                  <div className="space-y-4 p-6">
                    <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
                    <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                    <div className="h-20 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading &&
            !error &&
            filtered.length === 0 && (
              <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="text-6xl">
                  🔍
                </div>

                <h3 className="mt-5 text-2xl font-black">
                  No matching businesses
                </h3>

                <p className="mt-3 text-slate-600">
                  Try another search,
                  category or location.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white"
                >
                  Clear All Filters
                </button>
              </div>
            )}

          {!loading &&
            !error &&
            filtered.length > 0 && (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map(
                  (business) => (
                    <article
                      key={business.id}
                      className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      {business
                        .images?.[0] ? (
                        <BusinessCardImage
                          src={
                            business
                              .images[0]
                          }
                          alt={
                            business.name
                          }
                          icon={
                            business.icon
                          }
                        />
                      ) : (
                        <div className="flex h-48 items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100 text-7xl">
                          {business.icon ||
                            "📍"}
                        </div>
                      )}

                      <div className="flex flex-1 flex-col p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                            {
                              business.category
                            }
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {business.verified && (
                              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                                ✓ Verified
                              </span>
                            )}

                            {business.featured && (
                              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                                ★ Featured
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="mt-3 break-words text-xl font-black">
                          {business.name}
                        </h3>

                        <p className="mt-3 break-words text-sm font-semibold text-slate-500">
                          📍{" "}
                          {business.location}
                        </p>

                        <p className="mt-4 line-clamp-3 break-words leading-7 text-slate-600">
                          {
                            business.description
                          }
                        </p>

                        {business.services
                          ?.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {business.services
                              .slice(0, 3)
                              .map(
                                (
                                  service,
                                  index
                                ) => (
                                  <span
                                    key={`${service}-${index}`}
                                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
                                  >
                                    {
                                      service
                                    }
                                  </span>
                                )
                              )}
                          </div>
                        )}

                        <Link
                          href={`/business/${business.id}`}
                          className="mt-auto block rounded-xl bg-emerald-700 px-4 py-3 text-center font-bold text-white transition hover:bg-emerald-800"
                        >
                          View Details
                        </Link>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
        </div>
      </section>
    </main>
  );
}
