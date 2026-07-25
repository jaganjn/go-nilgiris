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
    id: "sterling-ooty",
    name: "Sterling Ooty – Fern Hill",
    category: "Hotel",
    location: "Ooty",
    icon: "🏨",
    description:
      "A hill resort in Ooty offering accommodation, dining, leisure facilities and convenient access to local attractions.",
  },
  {
    id: "green-valley-homestay",
    name: "Green Valley Home",
    category: "Homestay",
    location: "Kalhatty, Ooty",
    icon: "🏡",
    description:
      "A budget-friendly homestay on the scenic Mysore–Ooty Road with comfortable rooms, parking and travel assistance.",
  },
  {
    id: "earls-secret",
    name: "Earl's Secret",
    category: "Restaurant",
    location: "Pudumund, Ooty",
    icon: "🍽️",
    description:
      "A heritage fine-dining restaurant inside King's Cliff, known for its glass atrium and colonial ambience.",
  },
  {
    id: "nilgiri-taxi",
    name: "Nilgiri Taxi",
    category: "Taxi",
    location: "Mel Kodappamund, Ooty",
    icon: "🚕",
    description:
      "A 24-hour cab and tour service for Nilgiris sightseeing, outstation trips and airport or railway transfers.",
  },
  {
    id: "tea-factory-museum",
    name: "The Tea Factory & The Tea Museum",
    category: "Tourist Place",
    location: "Doddabetta Road, Ooty",
    icon: "🍃",
    description:
      "See Nilgiri tea production, explore museum exhibits, taste fresh tea and shop for tea, chocolates and souvenirs.",
  },
  {
    id: "tibetan-market",
    name: "Tibetan Market",
    category: "Shopping",
    location: "Near Botanical Garden, Ooty",
    icon: "🛍️",
    description:
      "A popular market for winter clothing, woollens, Tibetan handicrafts, accessories and souvenirs.",
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
            Browse accommodation, restaurants, taxi services, shopping,
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
              Showing {places.length} listings
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((place) => (
              <article
                key={place.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-44 items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100 text-7xl">
                  {place.icon}
                </div>

                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    {place.category}
                  </p>

                  <h3 className="mt-2 text-xl font-black text-slate-900">
                    {place.name}
                  </h3>

                  <p className="mt-3 text-sm font-semibold text-slate-500">
                    📍 {place.location}
                  </p>

                  <p className="mt-4 leading-7 text-slate-600">
                    {place.description}
                  </p>

                  <div className="mt-6">
                    <Link
                      href={`/business/${place.id}`}
                      className="block rounded-xl bg-emerald-700 px-4 py-3 text-center font-bold text-white transition hover:bg-emerald-800"
                    >
                      View Details
                    </Link>
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
