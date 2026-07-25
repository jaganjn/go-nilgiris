import Link from "next/link";
import { notFound } from "next/navigation";

type Business = {
  name: string;
  category: string;
  icon: string;
  address: string;
  openingHours: string;
  description: string;
  phones?: { label: string; number: string }[];
  whatsapp?: string;
  website?: string;
  maps?: string;
  services: string[];
  highlights?: string[];
  additionalInfo?: string[];
  social?: { instagram?: string; facebook?: string };
};

const businesses: Record<string, Business> = {
  "sterling-ooty": {
    name: "Sterling Ooty – Fern Hill",
    category: "Hotel / Resort",
    icon: "🏨",
    address: "Fern Hill, Ooty, Tamil Nadu, India",
    openingHours: "Hotel reception operates throughout the day",
    description:
      "Sterling Ooty – Fern Hill is a hill resort offering accommodation, dining and leisure facilities in Ooty. The detailed contact and booking information can be updated using the official information collected for this listing.",
    services: [
      "Accommodation",
      "Restaurant and café",
      "Room service",
      "Parking",
      "Spa and steam room",
      "Indoor games",
      "Laundry service",
      "Travel desk",
    ],
    highlights: [
      "Hill resort setting",
      "Family-friendly facilities",
      "Access to Ooty attractions",
    ],
  },

  "green-valley-homestay": {
    name: "Green Valley Home",
    category: "Homestay / Accommodation",
    icon: "🏡",
    address:
      "Mysore Rd, 4/24, Kandal, Kalhatty, Ooty, Tamil Nadu 643001, India",
    openingHours:
      "Monday–Saturday: Open 24 hours | Sunday: 12:00 AM–11:30 AM",
    description:
      "Green Valley Home is a budget-friendly stay option located along the scenic Mysore–Ooty Road near Kalhatty. Surrounded by greenery and hills, it offers a quiet atmosphere with comfortable rooms and convenient access to Ooty and the Kalhatty Ghat road.",
    phones: [{ label: "Phone", number: "+91 63827 00562" }],
    maps: "https://maps.google.com/?cid=5678027483322694868",
    services: [
      "24-hour front desk assistance",
      "On-site vehicle parking",
      "Room service",
      "Daily housekeeping",
      "Local sightseeing assistance",
      "Cab and travel assistance",
    ],
    additionalInfo: [
      "Approximately 4–5 km from Ooty town centre, railway station and bus stand.",
      "This listing specifically refers to the Green Valley Home located in Ooty, Nilgiris.",
    ],
  },

  "earls-secret": {
    name: "Earl's Secret",
    category: "Restaurant / Fine Dining",
    icon: "🍽️",
    address:
      "Havelock Rd, Police Quarters, Pudumund, Ooty, Tamil Nadu 643001, India (inside King's Cliff Heritage Hotel)",
    openingHours: "Daily: 12:30 PM–5:30 PM and 7:30 PM–10:00 PM",
    description:
      "Earl's Secret is a renowned heritage restaurant housed inside King's Cliff, a century-old British colonial mansion. It is known for its glass-fronted atrium, manicured lawns, hill views and a menu featuring Continental, Mughlai, Italian and North Indian dishes.",
    phones: [
      { label: "Mobile", number: "+91 94870 00222" },
      { label: "Landline", number: "+91 423 245 2889" },
    ],
    whatsapp: "+91 94870 00222",
    website: "https://www.littlearth.in/kings-cliff/",
    maps: "https://maps.google.com/?cid=5940351450717023691",
    services: [
      "Indoor dining room",
      "Glass-atrium garden seating",
      "Multi-cuisine lunch and dinner",
      "Tea and coffee service",
      "Table reservations",
      "Live music on select evenings",
      "Free on-site parking",
    ],
    highlights: [
      "Signature Earl's Secret Pie with ice cream",
      "Pastas and sizzlers",
      "Cappuccinos",
    ],
    additionalInfo: [
      "Approximately 2.5 km from Ooty town centre.",
      "Advance reservations are recommended, particularly for glass-atrium seating.",
    ],
    social: {
      instagram: "https://www.instagram.com/littlearthgroup/",
      facebook: "https://www.facebook.com/littlearthgroup/",
    },
  },

  "nilgiri-taxi": {
    name: "Nilgiri Taxi",
    category: "Taxi / Car Rental / Travel Agency",
    icon: "🚕",
    address:
      "No. 147, Dr. Ambedkar Colony, Mel Kodappamund, Ooty, Tamil Nadu 643002, India",
    openingHours: "Open 24 hours daily",
    description:
      "Nilgiri Taxi is an Ooty-based cab service and tour operator specialising in local sightseeing, outstation round trips and airport or railway transfers. Its drivers are experienced in navigating mountain and ghat roads.",
    phones: [{ label: "Phone", number: "+91 80981 84686" }],
    whatsapp: "+91 80981 84686",
    website: "https://nilgiritaxi.com/",
    maps: "https://maps.google.com/?cid=4163779295383919778",
    services: [
      "Ooty local sightseeing packages",
      "Outstation trips to Coimbatore, Mysore, Bengaluru, Coonoor, Mudumalai and Wayanad",
      "Airport pickup and drop",
      "Railway station pickup and drop",
      "One-way cab services",
      "Custom holiday itineraries",
      "Hatchbacks, sedans, SUVs and Tempo Travellers",
    ],
    additionalInfo: [
      "Advance booking is available by phone or WhatsApp.",
      "Local drivers can assist travellers with day-trip planning.",
    ],
  },

  "tea-factory-museum": {
    name: "The Tea Factory & The Tea Museum",
    category: "Tourist Attraction / Museum / Factory / Shopping",
    icon: "🍃",
    address:
      "Doddabetta Road, Mel Koddapmund, Thalayathimund, Ooty, Tamil Nadu 643002, India",
    openingHours: "Daily: 9:00 AM–6:00 PM",
    description:
      "Operated under Homewood Tea Estate, The Tea Factory & The Tea Museum presents the history and production of Nilgiri tea. Visitors can see live CTC processing, explore historical displays, taste freshly brewed tea and shop for tea, chocolates and local souvenirs.",
    phones: [
      { label: "Phone 1", number: "+91 94434 18000" },
      { label: "Phone 2", number: "+91 94430 52066" },
    ],
    whatsapp: "+91 94430 52066",
    website: "http://www.homewoodtea.com/",
    maps: "https://maps.google.com/?cid=15573124602750895356",
    services: [
      "Guided tea factory walkthroughs",
      "Live processing demonstrations",
      "Educational museum exhibits",
      "Complimentary tea tasting",
      "Homewood tea outlet",
      "Homemade chocolate unit and store",
      "Souvenir shop",
      "On-site vehicle parking",
    ],
    highlights: [
      "White, CTC, green, cardamom, chocolate and masala teas",
      "Homemade chocolates",
      "Tea sets and Nilgiri souvenirs",
    ],
    additionalInfo: [
      "Entry fee is approximately ₹10–₹20 per visitor.",
      "Approximately 5 km from Ooty Bus Stand and Railway Station.",
      "Approximately 4 km before Doddabetta Peak.",
      "Carrying cash is recommended for shopping.",
    ],
  },

  "tibetan-market": {
    name: "Tibetan Market",
    category: "Shopping / Flea Market / Clothing Market",
    icon: "🛍️",
    address:
      "CP86+Q96, Near Government Botanical Garden, Vannarapettai, Ooty, Tamil Nadu 643001, India",
    openingHours: "Daily: 10:00 AM–8:30 PM",
    description:
      "The Tibetan Market is a vibrant shopping cluster near the Government Botanical Garden. Managed primarily by Tibetan refugees and local vendors, it is known for affordable winter wear, woollens, handicrafts and traditional souvenirs.",
    phones: [{ label: "Phone", number: "+91 1800 4253 1111" }],
    maps: "https://maps.google.com/?cid=14333316303811037676",
    services: [
      "Jackets, sweaters, shawls and cardigans",
      "Hoodies, beanies, gloves and woollen socks",
      "Stoles and ponchos",
      "Tibetan handicrafts and prayer flags",
      "Artificial jewellery, carpets and wooden décor",
      "Nearby tea, snack and street-food stalls",
    ],
    additionalInfo: [
      "Approximately 2 km from Ooty town centre and bus stand.",
      "Many shops use fixed, budget-friendly pricing.",
      "Carrying cash is recommended in case mobile connectivity affects UPI payments.",
    ],
  },
};

function phoneHref(number: string) {
  return `tel:${number.replace(/[^\d+]/g, "")}`;
}

function whatsappHref(number: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}`;
}

export function generateStaticParams() {
  return Object.keys(businesses).map((id) => ({ id }));
}

export default async function BusinessDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = businesses[id];

  if (!business) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-emerald-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-xl font-extrabold text-emerald-800">
            Go Nilgiris
          </Link>

          <Link
            href="/explore"
            className="rounded-full border border-emerald-700 px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
          >
            Back to Explore
          </Link>
        </div>
      </header>

      <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 px-5 py-14 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl bg-white/15 text-6xl shadow-lg backdrop-blur">
              {business.icon}
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-200">
                {business.category}
              </p>
              <h1 className="mt-2 text-4xl font-black sm:text-5xl">
                {business.name}
              </h1>
              <p className="mt-4 max-w-3xl text-emerald-50">
                📍 {business.address}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-10">
        <div className="mx-auto grid max-w-6xl gap-7 lg:grid-cols-[1fr_360px]">
          <div className="space-y-7">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-black">About</h2>
              <p className="mt-4 leading-8 text-slate-600">
                {business.description}
              </p>
            </article>

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

            {business.highlights && (
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-black">Highlights</h2>
                <ul className="mt-5 space-y-3 text-slate-600">
                  {business.highlights.map((item) => (
                    <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">
                      ⭐ {item}
                    </li>
                  ))}
                </ul>
              </article>
            )}

            {business.additionalInfo && (
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-black">Visitor Information</h2>
                <ul className="mt-5 space-y-3 text-slate-600">
                  {business.additionalInfo.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            )}
          </div>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
                {business.phones?.map((phone) => (
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
                    href={whatsappHref(business.whatsapp)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-green-600 px-4 py-3 text-center font-bold text-white transition hover:bg-green-700"
                  >
                    💬 WhatsApp
                  </a>
                )}

                {business.maps && (
                  <a
                    href={business.maps}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-emerald-700 px-4 py-3 text-center font-bold text-emerald-700 transition hover:bg-emerald-50"
                  >
                    🗺️ Open in Google Maps
                  </a>
                )}

                {business.website && (
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-300 px-4 py-3 text-center font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    🌐 Visit Website
                  </a>
                )}
              </div>
            </div>

            {business.social &&
              (business.social.instagram || business.social.facebook) && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-black">Social Media</h2>
                  <div className="mt-4 grid gap-3">
                    {business.social.instagram && (
                      <a
                        href={business.social.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-slate-200 px-4 py-3 font-bold hover:bg-slate-50"
                      >
                        Instagram
                      </a>
                    )}
                    {business.social.facebook && (
                      <a
                        href={business.social.facebook}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-slate-200 px-4 py-3 font-bold hover:bg-slate-50"
                      >
                        Facebook
                      </a>
                    )}
                  </div>
                </div>
              )}
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
