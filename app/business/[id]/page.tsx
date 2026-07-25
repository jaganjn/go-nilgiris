"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getBusiness } from "@/lib/businesses";
import type { Business } from "@/types/business";

const phoneHref = (number: string) => `tel:${number.replace(/[^\d+]/g, "")}`;
const whatsappHref = (number: string) => `https://wa.me/${number.replace(/\D/g, "")}`;

export default function BusinessDetailsPage() {
  const params = useParams<{ id: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBusiness(params.id).then(setBusiness).finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <main className="grid min-h-screen place-items-center bg-slate-50 font-bold text-emerald-800">Loading business...</main>;
  if (!business) return <main className="grid min-h-screen place-items-center bg-slate-50 px-5"><div className="text-center"><h1 className="text-3xl font-black">Business not found</h1><Link href="/explore" className="mt-5 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white">Back to Explore</Link></div></main>;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-emerald-100 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><Link href="/" className="text-xl font-extrabold text-emerald-800">Go Nilgiris</Link><Link href="/explore" className="rounded-full border border-emerald-700 px-4 py-2 text-sm font-bold text-emerald-700">Back to Explore</Link></div></header>

      <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 px-5 py-14 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-white/15 text-6xl shadow-lg">{business.images?.[0] ? <img src={business.images[0]} alt={business.name} className="h-full w-full object-cover" /> : business.icon}</div>
            <div><div className="flex flex-wrap items-center gap-3"><p className="text-sm font-bold uppercase tracking-widest text-emerald-200">{business.category}</p>{business.verified && <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">✓ Verified listing</span>}</div><h1 className="mt-2 text-4xl font-black sm:text-5xl">{business.name}</h1><p className="mt-4 max-w-3xl text-emerald-50">📍 {business.address}</p></div>
          </div>
        </div>
      </section>

      {business.images.length > 1 && <section className="px-5 pt-8"><div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-3">{business.images.slice(0, 3).map((image) => <img key={image} src={image} alt={business.name} className="h-52 w-full rounded-2xl object-cover" />)}</div></section>}

      <section className="px-5 py-10"><div className="mx-auto grid max-w-6xl gap-7 lg:grid-cols-[1fr_360px]">
        <div className="space-y-7">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-black">About</h2><p className="mt-4 leading-8 text-slate-600">{business.description}</p></article>
          {business.services.length > 0 && <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-black">Services & Facilities</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{business.services.map((service) => <div key={service} className="rounded-2xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-900">✓ {service}</div>)}</div></article>}
          {business.highlights.length > 0 && <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-black">Highlights</h2><ul className="mt-5 space-y-3 text-slate-600">{business.highlights.map((item) => <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">⭐ {item}</li>)}</ul></article>}
          {business.additionalInfo.length > 0 && <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-black">Visitor Information</h2><ul className="mt-5 space-y-3 text-slate-600">{business.additionalInfo.map((item) => <li key={item} className="flex gap-3"><span>•</span><span>{item}</span></li>)}</ul></article>}
        </div>
        <aside><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-5"><h2 className="text-xl font-black">Contact & Visit</h2><div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Opening hours</p><p className="mt-2 font-semibold leading-6">{business.openingHours}</p></div><div className="mt-5 grid gap-3">{business.phones.map((phone) => <a key={`${phone.label}-${phone.number}`} href={phoneHref(phone.number)} className="rounded-xl bg-emerald-700 px-4 py-3 text-center font-bold text-white">📞 {phone.label}: {phone.number}</a>)}{business.whatsapp && <a href={whatsappHref(business.whatsapp)} target="_blank" rel="noreferrer" className="rounded-xl bg-green-600 px-4 py-3 text-center font-bold text-white">💬 WhatsApp</a>}{business.website && <a href={business.website} target="_blank" rel="noreferrer" className="rounded-xl border border-emerald-700 px-4 py-3 text-center font-bold text-emerald-700">🌐 Official Website</a>}{business.maps && <a href={business.maps} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-300 px-4 py-3 text-center font-bold text-slate-700">📍 Open in Google Maps</a>}</div></div></aside>
      </div></section>
    </main>
  );
}
