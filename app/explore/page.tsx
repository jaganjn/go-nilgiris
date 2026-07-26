"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { listBusinesses } from "@/lib/businesses";
import type { Business } from "@/types/business";

const categories = [
  "All",
  "Hotel / Resort",
  "Homestay",
  "Restaurant",
  "Taxi",
  "Shopping",
  "Tourist Place",
];

export default function ExplorePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listBusinesses()
      .then(setBusinesses)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return businesses.filter((business) => {
      const categoryMatch =
        category === "All" || business.category === category;

      const searchMatch =
        !term ||
        [
          business.name,
          business.location,
          business.category,
          business.description,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);

      return categoryMatch && searchMatch;
    });
  }, [businesses, category, search]);

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

          <div className="mx-auto mt-7 max-w-2xl">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search hotels, restaurants, taxi services..."
              className="w-full rounded-2xl border border-white/20 bg-white px-5 py-4 text-slate-900 shadow-xl outline-none"
            />
          </div>
        </div>
      </section>

      <section className="px-5 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-3 overflow-x-auto pb-3">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  category === item
                    ? "bg-emerald-700 text-white"
                    : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-8 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
                Verified directory
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Explore businesses
              </h2>
            </div>

            <p className="text-sm text-slate-500">
              {loading ? "Loading..." : `${filtered.length} listings`}
            </p>
          </div>

          {!loading && filtered.length === 0 && (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
              No businesses match your search.
            </div>
          )}

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((business) => (
              <article
                key={business.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                {business.images?.[0] ? (
                  <img
                    src={business.images[0]}
                    alt={business.name}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100 text-7xl">
                    {business.icon}
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      {business.category}
                    </p>

                    {business.verified && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 text-xl font-black">
                    {business.name}
                  </h3>

                  <p className="mt-3 text-sm font-semibold text-slate-500">
                    📍 {business.location}
                  </p>

                  <p className="mt-4 line-clamp-3 leading-7 text-slate-600">
                    {business.description}
                  </p>

                  <Link
                    href={`/business/${business.id}`}
                    className="mt-6 block rounded-xl bg-emerald-700 px-4 py-3 text-center font-bold text-white"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
