import Link from "next/link";

const categories = [
  "All",
  "Hotels",
  "Homestays",
  "Restaurants",
  "Taxi",
  "Shopping",
  "Tourist Places",
];

const places = [
  {
    name: "Sterling Ooty Fern Hill",
    category: "Hotel",
    location: "Ooty",
    rating: "4.5",
    icon: "🏨",
    description:
      "A comfortable hill resort with scenic views, family-friendly rooms and easy access to Ooty attractions.",
  },
  {
    name: "Green Valley Homestay",
    category: "Homestay",
    location: "Coonoor",
    rating: "4.7",
    icon: "🏡",
    description:
      "A peaceful homestay surrounded by tea estates, ideal for families, couples and weekend travellers.",
  },
  {
    name: "Earl's Secret",
    category: "Restaurant",
    location: "Ooty",
    rating: "4.6",
    icon: "🍽️",
    description:
      "A popular dining destination known for its colonial atmosphere, scenic setting and quality food.",
  },
  {
    name: "Nilgiris Taxi Service",
    category: "Taxi",
    location: "Ooty, Coonoor, Kotagiri",
    rating: "4.8",
    icon: "🚕",
    description:
      "Local taxi service for sightseeing, railway station pickup, airport travel and customised Nilgiris trips.",
  },
  {
    name: "Tea Factory & Museum",
    category: "Tourist Place",
    location: "Ooty",
    rating: "4.4",
    icon: "🌿",
    description:
      "Learn how Nilgiris tea is produced and explore local tea varieties, products and tasting experiences.",
  },
  {
    name: "Nilgiris Local Market",
    category: "Shopping",
    location: "Ooty",
    rating: "4.3",
    icon: "🛍️",
    description:
      "Discover homemade chocolates, tea products, oils, spices, handmade items and local souvenirs.",
  },
];

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-emerald-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-xl font-extrabold text-emerald-800">
            Go Nilgiris
          </Link>

          <Link
            href="/"
            className="rounded-full border border-emerald-700 px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 px-5 py-16 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-200">
            Explore the Nilgiris
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Find places, services and local experiences
          </h1>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-emerald-50">
            Browse hotels, homestays, restaurants, taxi services, shopping,
            tourist attractions and trusted local businesses.
          </p>

          <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-2xl bg-white p-3 shadow-xl sm:flex-row">
            <input
              type="search"
              placeholder="Search by place, business or category"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500"
            />

            <button
              type="button"
              className="rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white transition hover:bg-emerald-800"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      <section className="px-5 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-3 overflow-x-auto pb-3">
            {categories.map((category, index) => (
              <button
                key={category}
                type="button"
                className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  index === 0
                    ? "bg-emerald-700 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
                Featured listings
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Discover trusted places and services
              </h2>
            </div>

            <p className="text-sm text-slate-500">
              Showing {places.length} sample listings
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((place) => (
              <article
                key={place.name}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-44 items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100 text-7xl">
                  {place.icon}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                        {place.category}
                      </p>

                      <h3 className="mt-2 text-xl font-black text-slate-900">
                        {place.name}
                      </h3>
                    </div>

                    <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
                      ⭐ {place.rating}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-500">
                    📍 {place.location}
                  </p>

                  <p className="mt-4 leading-7 text-slate-600">
                    {place.description}
                  </p>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      className="flex-1 rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white transition hover:bg-emerald-800"
                    >
                      View Details
                    </button>

                    <button
                      type="button"
                      className="rounded-xl border border-emerald-700 px-4 py-3 font-bold text-emerald-700 transition hover:bg-emerald-50"
                    >
                      Contact
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-10 border-t border-slate-200 bg-white px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-center text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>
            <p className="font-extrabold text-emerald-800">Go Nilgiris</p>
            <p className="mt-1">One Destination. Endless Experiences.</p>
          </div>

          <p>© 2026 Go Nilgiris. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
