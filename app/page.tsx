import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="text-5xl font-extrabold text-green-700">
          Go Nilgiris
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-700">
          Discover the best tourist destinations, hotels, restaurants,
          homestays, shopping, taxi services and local businesses across the
          beautiful Nilgiris.
        </p>

        <Link
          href="/explore"
          className="mt-8 rounded-xl bg-green-700 px-6 py-3 text-white transition hover:bg-green-800"
        >
          Explore Now
        </Link>

        <p className="mt-10 text-sm text-gray-500">
          Version 0.1.0 • Powered by Next.js
        </p>
      </section>
    </main>
  );
}
