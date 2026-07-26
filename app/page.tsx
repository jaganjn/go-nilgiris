import Link from "next/link";

const categories = [
  {
    name: "Hotels",
    icon: "🏨",
    description: "Comfortable stays",
  },
  {
    name: "Homestays",
    icon: "🏡",
    description: "Local hospitality",
  },
  {
    name: "Restaurants",
    icon: "🍽️",
    description: "Taste the Nilgiris",
  },
  {
    name: "Taxi Services",
    icon: "🚕",
    description: "Travel comfortably",
  },
  {
    name: "Shopping",
    icon: "🛍️",
    description: "Local products",
  },
  {
    name: "Tea Estates",
    icon: "🌿",
    description: "Tea experiences",
  },
  {
    name: "Tourist Places",
    icon: "📍",
    description: "Famous attractions",
  },
  {
    name: "Adventure",
    icon: "⛰️",
    description: "Outdoor experiences",
  },
];

const destinations = [
  {
    name: "Ooty",
    description:
      "Lakes, gardens, viewpoints and unforgettable mountain weather.",
    icon: "🌄",
  },
  {
    name: "Coonoor",
    description:
      "Tea estates, waterfalls, heritage trains and peaceful landscapes.",
    icon: "🚂",
  },
  {
    name: "Kotagiri",
    description:
      "Quiet trails, scenic valleys and authentic Nilgiris experiences.",
    icon: "🌲",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7faf7] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-emerald-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link
            href="/"
            className="text-xl font-extrabold text-emerald-800"
          >
            Go Nilgiris
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-700 md:flex">
            <Link
              href="/"
              className="hover:text-emerald-700"
            >
              Home
            </Link>

            <Link
              href="/explore"
              className="hover:text-emerald-700"
            >
              Explore
            </Link>

            <a
              href="#categories"
              className="hover:text-emerald-700"
            >
              Categories
            </a>

            <a
              href="#destinations"
              className="hover:text-emerald-700"
            >
              Destinations
            </a>
          </nav>

          <Link
            href="/explore"
            className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-800"
          >
            Explore
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-700 px-5 py-20 text-white md:py-28">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-lime-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl text-center">
          <p className="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
            Discover the beauty of the Nilgiris
          </p>

          <h1 className="text-4xl font-black leading-tight sm:text-5xl md:text-7xl">
            One Destination.

            <span className="block text-emerald-200">
              Endless Experiences.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-emerald-50 sm:text-lg">
            Find trusted hotels, homestays, restaurants, taxis,
            shopping, tourist attractions and local businesses
            across Ooty, Coonoor, Kotagiri and the Nilgiris.
          </p>

          <div className="mx-auto mt-9 flex max-w-2xl flex-col gap-3 rounded-2xl bg-white p-3 shadow-2xl sm:flex-row">
            <input
              type="search"
              aria-label="Search the Nilgiris"
              placeholder="Search hotels, places, taxis, restaurants..."
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500"
            />

            <Link
              href="/explore"
              className="rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white transition hover:bg-emerald-800"
            >
              Search
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-3 text-sm">
            <span className="rounded-full bg-white/10 px-4 py-2">
              ✓ Trusted local listings
            </span>

            <span className="rounded-full bg-white/10 px-4 py-2">
              ✓ Tourist-friendly
            </span>

            <span className="rounded-full bg-white/10 px-4 py-2">
              ✓ Mobile responsive
            </span>
          </div>
        </div>
      </section>

      <section
        id="categories"
        className="px-5 py-16 md:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
              Explore by category
            </p>

            <h2 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">
              Everything you need in the Nilgiris
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Discover trusted services, memorable experiences
              and local businesses in one place.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href="/explore"
                className="group rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
              >
                <span className="text-3xl">
                  {category.icon}
                </span>

                <h3 className="mt-4 font-extrabold text-slate-900 group-hover:text-emerald-700">
                  {category.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        id="destinations"
        className="border-y border-emerald-100 bg-white px-5 py-16 md:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
                Featured destinations
              </p>

              <h2 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">
                Places worth exploring
              </h2>
            </div>

            <Link
              href="/explore"
              className="font-bold text-emerald-700 hover:text-emerald-900"
            >
              View all destinations →
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {destinations.map((destination) => (
              <article
                key={destination.name}
                className="rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 p-7"
              >
                <span className="text-5xl">
                  {destination.icon}
                </span>

                <h3 className="mt-6 text-2xl font-black text-slate-900">
                  {destination.name}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {destination.description}
                </p>

                <Link
                  href="/explore"
                  className="mt-6 inline-block font-bold text-emerald-700 hover:text-emerald-900"
                >
                  Explore {destination.name} →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:py-20">
        <div className="mx-auto max-w-7xl rounded-3xl bg-slate-950 px-6 py-12 text-center text-white md:px-12">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-300">
            For local businesses
          </p>

          <h2 className="mt-4 text-3xl font-black md:text-4xl">
            Grow your business with Go Nilgiris
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-300">
            Showcase your business, receive customer enquiries
            and become more discoverable to tourists and local
            residents.
          </p>

          <Link
            href="/owner/register"
            className="mt-7 inline-block rounded-xl bg-emerald-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-emerald-400"
          >
            List Your Business
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-center text-sm text-slate-500 md:flex-row md:items-center md:justify-between md:text-left">
          <div>
            <p className="font-extrabold text-emerald-800">
              Go Nilgiris
            </p>

            <p className="mt-1">
              One Destination. Endless Experiences.
            </p>
          </div>

          <p>© 2026 Go Nilgiris. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
