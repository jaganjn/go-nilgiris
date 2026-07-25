import Link from "next/link";

const businesses = {
  "sterling-ooty": {
    name: "Sterling Ooty Fern Hill",
    category: "Hotel",
    location: "Fern Hill, Ooty",
    rating: "4.5",
    reviews: "1,248 reviews",
    icon: "🏨",
    description:
      "Sterling Ooty Fern Hill is a scenic hill resort offering comfortable rooms, family-friendly facilities and beautiful views of the Nilgiris. It is suitable for families, couples and weekend travellers looking for a peaceful stay near Ooty.",
    address: "Fern Hill, Ooty, Tamil Nadu 643004",
    phone: "+91 98765 43210",
    hours: "Open 24 hours",
    highlights: [
      "Mountain-view rooms",
      "Family-friendly stay",
      "Restaurant and room service",
      "Parking available",
      "Close to major Ooty attractions",
      "Suitable for couples and groups",
    ],
  },
  "green-valley-homestay": {
    name: "Green Valley Homestay",
    category: "Homestay",
    location: "Coonoor",
    rating: "4.7",
    reviews: "326 reviews",
    icon: "🏡",
    description:
      "Green Valley Homestay offers a calm and comfortable stay surrounded by tea gardens and green hills. Guests can enjoy a local experience, peaceful surroundings and easy access to nearby Coonoor attractions.",
    address: "Upper Coonoor, Tamil Nadu 643101",
    phone: "+91 98765 43211",
    hours: "Open 24 hours",
    highlights: [
      "Tea estate views",
      "Homely food",
      "Family rooms",
      "Free parking",
      "Peaceful location",
      "Local sightseeing support",
    ],
  },
  "earls-secret": {
    name: "Earl's Secret",
    category: "Restaurant",
    location: "Ooty",
    rating: "4.6",
    reviews: "892 reviews",
    icon: "🍽️",
    description:
      "Earl's Secret is a popular dining destination in Ooty known for its colonial atmosphere, scenic surroundings and quality food. It is a good choice for families, couples and visitors looking for a relaxed dining experience.",
    address: "Havelock Road, Ooty, Tamil Nadu 643001",
    phone: "+91 98765 43212",
    hours: "11:00 AM – 10:00 PM",
    highlights: [
      "Colonial-style ambience",
      "Indoor and outdoor seating",
      "Family-friendly dining",
      "Vegetarian options",
      "Popular tourist location",
      "Advance reservation recommended",
    ],
  },
  "nilgiris-taxi-service": {
    name: "Nilgiris Taxi Service",
    category: "Taxi",
    location: "Ooty, Coonoor and Kotagiri",
    rating: "4.8",
    reviews: "541 reviews",
    icon: "🚕",
    description:
      "Nilgiris Taxi Service provides local sightseeing, railway station pickup, airport transfers and customised travel packages across Ooty, Coonoor, Kotagiri and nearby hill areas.",
    address: "Commercial Road, Ooty, Tamil Nadu 643001",
    phone: "+91 98765 43213",
    hours: "Open 24 hours",
    highlights: [
      "Local sightseeing packages",
      "Airport and railway pickup",
      "Experienced local drivers",
      "One-way and round-trip services",
      "Family and group vehicles",
      "Custom travel plans",
    ],
  },
  "tea-factory-museum": {
    name: "Tea Factory & Museum",
    category: "Tourist Place",
    location: "Ooty",
    rating: "4.4",
    reviews: "2,135 reviews",
    icon: "🌿",
    description:
      "The Tea Factory and Museum gives visitors an opportunity to learn how Nilgiris tea is processed. Visitors can explore the production process, taste local tea and purchase tea products.",
    address: "Doddabetta Road, Ooty, Tamil Nadu 643002",
    phone: "+91 98765 43214",
    hours: "9:00 AM – 6:00 PM",
    highlights: [
      "Tea manufacturing demonstration",
      "Tea tasting",
      "Local tea products",
      "Family-friendly attraction",
      "Photography areas",
      "Shopping section",
    ],
  },
  "nilgiris-local-market": {
    name: "Nilgiris Local Market",
    category: "Shopping",
    location: "Ooty",
    rating: "4.3",
    reviews: "764 reviews",
    icon: "🛍️",
    description:
      "Nilgiris Local Market is a convenient place to discover homemade chocolates, tea, eucalyptus oils, spices, handicrafts and local souvenirs from the region.",
    address: "Main Bazaar, Ooty, Tamil Nadu 643001",
    phone: "+91 98765 43215",
    hours: "9:00 AM – 9:00 PM",
    highlights: [
      "Homemade chocolates",
      "Nilgiris tea",
      "Essential oils",
      "Spices and local products",
      "Souvenirs",
      "Multiple local shops",
    ],
  },
};

type BusinessId = keyof typeof businesses;

export default async function BusinessDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = businesses[id as BusinessId];

  if (!business) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-lg">
          <div className="text-6xl">📍</div>

          <h1 className="mt-5 text-3xl font-black text-slate-900">
            Business not found
          </h1>

          <p className="mt-3 leading-7 text-slate-600">
            The business page you are looking for is unavailable.
          </p>

          <Link
            href="/explore"
            className="mt-6 inline-block rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white"
          >
            Back to Explore
          </Link>
        </div>
      </main>
    );
  }

  const whatsappMessage = encodeURIComponent(
    `Hello, I found ${business.name} through Go Nilgiris. I would like more information.`,
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-emerald-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-xl font-extrabold text-emerald-800">
            Go Nilgiris
          </Link>

          <Link
            href="/explore"
            className="rounded-full border border-emerald-700 px-4 py-2 text-sm font-bold text-emerald-700"
          >
            Back to Explore
          </Link>
        </div>
      </header>

      <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 px-5 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-72 items-center justify-center rounded-3xl bg-white/10 text-8xl shadow-2xl backdrop-blur">
            {business.icon}
          </div>
        </div>
      </section>

      <section className="px-5 py-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
              {business.category}
            </p>

            <h1 className="mt-3 text-4xl font-black sm:text-5xl">
              {business.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold">
              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                ⭐ {business.rating}
              </span>

              <span className="text-slate-500">{business.reviews}</span>

              <span className="text-slate-500">📍 {business.location}</span>
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">About this business</h2>

              <p className="mt-4 leading-8 text-slate-600">
                {business.description}
              </p>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">Highlights</h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {business.highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="rounded-2xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-900"
                  >
                    ✓ {highlight}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">Location</h2>

              <p className="mt-3 leading-7 text-slate-600">
                📍 {business.address}
              </p>

              <div className="mt-5 flex h-64 items-center justify-center rounded-2xl bg-slate-100 text-center text-slate-500">
                <div>
                  <div className="text-5xl">🗺️</div>
                  <p className="mt-3 font-semibold">
                    Google Maps integration will be added later
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">Customer reviews</h2>

              <div className="mt-5 space-y-4">
                <article className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-bold">Arun Kumar</p>
                    <p className="text-amber-600">★★★★★</p>
                  </div>

                  <p className="mt-3 leading-7 text-slate-600">
                    Good experience, helpful service and a convenient location.
                  </p>
                </article>

                <article className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-bold">Priya S</p>
                    <p className="text-amber-600">★★★★☆</p>
                  </div>

                  <p className="mt-3 leading-7 text-slate-600">
                    The listing information was useful and the staff responded
                    quickly.
                  </p>
                </article>
              </div>
            </div>
          </div>

          <aside>
            <div className="sticky top-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
              <h2 className="text-2xl font-black">Contact business</h2>

              <div className="mt-5 space-y-4 text-sm">
                <div>
                  <p className="font-bold text-slate-900">Address</p>
                  <p className="mt-1 leading-6 text-slate-600">
                    {business.address}
                  </p>
                </div>

                <div>
                  <p className="font-bold text-slate-900">Phone</p>
                  <p className="mt-1 text-slate-600">{business.phone}</p>
                </div>

                <div>
                  <p className="font-bold text-slate-900">Business hours</p>
                  <p className="mt-1 text-slate-600">{business.hours}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <a
                  href={`tel:${business.phone.replace(/\s/g, "")}`}
                  className="rounded-xl bg-emerald-700 px-5 py-3 text-center font-bold text-white transition hover:bg-emerald-800"
                >
                  📞 Call Now
                </a>

                <a
                  href={`https://wa.me/919876543210?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-green-600 px-5 py-3 text-center font-bold text-white transition hover:bg-green-700"
                >
                  💬 WhatsApp
                </a>

                <button
                  type="button"
                  className="rounded-xl border border-emerald-700 px-5 py-3 font-bold text-emerald-700 transition hover:bg-emerald-50"
                >
                  📤 Share
                </button>
              </div>

              <p className="mt-5 text-center text-xs leading-5 text-slate-500">
                Please verify pricing, availability and service details directly
                with the business.
              </p>
            </div>
          </aside>
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
