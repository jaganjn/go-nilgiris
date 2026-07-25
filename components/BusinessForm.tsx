"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveBusiness } from "@/lib/businesses";
import { firebaseConfigured } from "@/lib/firebase";
import type { Business, BusinessInput } from "@/types/business";

const splitLines = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean);
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function BusinessForm({ initial }: { initial?: Business }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    id: initial?.id ?? "",
    category: initial?.category ?? "Hotel / Resort",
    icon: initial?.icon ?? "📍",
    location: initial?.location ?? "",
    address: initial?.address ?? "",
    openingHours: initial?.openingHours ?? "",
    description: initial?.description ?? "",
    phone: initial?.phones?.[0]?.number ?? "",
    phoneLabel: initial?.phones?.[0]?.label ?? "Phone",
    whatsapp: initial?.whatsapp ?? "",
    website: initial?.website ?? "",
    maps: initial?.maps ?? "",
    services: initial?.services.join("\n") ?? "",
    highlights: initial?.highlights.join("\n") ?? "",
    additionalInfo: initial?.additionalInfo.join("\n") ?? "",
    images: initial?.images.join("\n") ?? "",
    verified: initial?.verified ?? false,
    featured: initial?.featured ?? false,
  });

  function update(key: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!firebaseConfigured) {
      setError("Add your Firebase values in .env.local before saving businesses.");
      return;
    }
    setSaving(true);
    try {
      const id = form.id || slugify(form.name);
      const images = splitLines(form.images);
      const invalidImage = images.find((url) => !/^https?:\/\//i.test(url));
      if (invalidImage) throw new Error("Every image URL must begin with http:// or https://");
      const payload: BusinessInput = {
        id,
        name: form.name.trim(),
        category: form.category,
        icon: form.icon || "📍",
        location: form.location.trim(),
        address: form.address.trim(),
        openingHours: form.openingHours.trim(),
        description: form.description.trim(),
        phones: form.phone ? [{ label: form.phoneLabel || "Phone", number: form.phone }] : [],
        whatsapp: form.whatsapp.trim() || undefined,
        website: form.website.trim() || undefined,
        maps: form.maps.trim() || undefined,
        services: splitLines(form.services),
        highlights: splitLines(form.highlights),
        additionalInfo: splitLines(form.additionalInfo),
        images,
        verified: form.verified,
        featured: form.featured,
      };
      await saveBusiness(payload);
      router.push("/admin");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save business.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500";
  return (
    <form onSubmit={submit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      {error && <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="font-bold">Business name<input required value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} /></label>
        <label className="font-bold">Business ID / URL slug<input value={form.id} onChange={(e) => update("id", e.target.value)} placeholder="auto-created from name" className={inputClass} /></label>
        <label className="font-bold">Category<select value={form.category} onChange={(e) => update("category", e.target.value)} className={inputClass}><option>Hotel / Resort</option><option>Homestay</option><option>Restaurant</option><option>Taxi</option><option>Shopping</option><option>Tourist Place</option><option>Service</option></select></label>
        <label className="font-bold">Icon<input value={form.icon} onChange={(e) => update("icon", e.target.value)} className={inputClass} /></label>
        <label className="font-bold">Short location<input required value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Fern Hill, Ooty" className={inputClass} /></label>
        <label className="font-bold">Opening hours<input required value={form.openingHours} onChange={(e) => update("openingHours", e.target.value)} className={inputClass} /></label>
      </div>
      <label className="block font-bold">Full address<textarea required rows={3} value={form.address} onChange={(e) => update("address", e.target.value)} className={inputClass} /></label>
      <label className="block font-bold">Description<textarea required rows={5} value={form.description} onChange={(e) => update("description", e.target.value)} className={inputClass} /></label>
      <div className="grid gap-5 sm:grid-cols-2"><label className="font-bold">Phone label<input value={form.phoneLabel} onChange={(e) => update("phoneLabel", e.target.value)} className={inputClass} /></label><label className="font-bold">Phone number<input value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} /></label><label className="font-bold">WhatsApp<input value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} className={inputClass} /></label><label className="font-bold">Website<input value={form.website} onChange={(e) => update("website", e.target.value)} className={inputClass} /></label></div>
      <label className="block font-bold">Google Maps link<input value={form.maps} onChange={(e) => update("maps", e.target.value)} className={inputClass} /></label>
      <div className="grid gap-5 lg:grid-cols-3"><label className="font-bold">Services <span className="font-normal text-slate-500">(one per line)</span><textarea rows={8} value={form.services} onChange={(e) => update("services", e.target.value)} className={inputClass} /></label><label className="font-bold">Highlights <span className="font-normal text-slate-500">(one per line)</span><textarea rows={8} value={form.highlights} onChange={(e) => update("highlights", e.target.value)} className={inputClass} /></label><label className="font-bold">Visitor information <span className="font-normal text-slate-500">(one per line)</span><textarea rows={8} value={form.additionalInfo} onChange={(e) => update("additionalInfo", e.target.value)} className={inputClass} /></label></div>
      <label className="block font-bold">Image URLs <span className="font-normal text-slate-500">(one public image link per line)</span><textarea rows={5} value={form.images} onChange={(e) => update("images", e.target.value)} placeholder="https://example.com/business-photo.jpg" className={inputClass} /><span className="mt-2 block text-sm font-normal text-slate-500">Use direct HTTPS image links from Cloudinary, ImageKit, GitHub or another public image host.</span></label>
      <div className="flex flex-wrap gap-5"><label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={form.verified} onChange={(e) => update("verified", e.target.checked)} /> Verified</label><label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} /> Featured</label></div>
      <button disabled={saving} className="rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white disabled:opacity-60">{saving ? "Saving..." : initial ? "Update Business" : "Add Business"}</button>
    </form>
  );
}
