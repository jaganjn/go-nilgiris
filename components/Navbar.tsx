
"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-2"
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-xl text-white">
            🌿
          </div>

          <div>
            <p className="text-lg font-extrabold leading-none text-slate-900">
              Go Nilgiris
            </p>
            <p className="mt-1 text-xs text-slate-500">
              One Destination. Endless Experiences.
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="font-semibold text-slate-700 transition hover:text-emerald-700"
          >
            Home
          </Link>

          <Link
            href="/explore"
            className="font-semibold text-slate-700 transition hover:text-emerald-700"
          >
            Explore
          </Link>

          <Link
            href="/explore?category=stay"
            className="font-semibold text-slate-700 transition hover:text-emerald-700"
          >
            Stay
          </Link>

          <Link
            href="/explore?category=food"
            className="font-semibold text-slate-700 transition hover:text-emerald-700"
          >
            Food
          </Link>

          <Link
            href="/explore?category=shopping"
            className="font-semibold text-slate-700 transition hover:text-emerald-700"
          >
            Shopping
          </Link>

          <Link
            href="/admin/login"
            className="rounded-xl bg-emerald-600 px-4 py-2.5 font-bold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Admin Panel
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-2xl text-slate-800 md:hidden"
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            <Link
              href="/"
              onClick={closeMenu}
              className="rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100"
            >
              Home
            </Link>

            <Link
              href="/explore"
              onClick={closeMenu}
              className="rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100"
            >
              Explore
            </Link>

            <Link
              href="/explore?category=stay"
              onClick={closeMenu}
              className="rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100"
            >
              Stay
            </Link>

            <Link
              href="/explore?category=food"
              onClick={closeMenu}
              className="rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100"
            >
              Food
            </Link>

            <Link
              href="/explore?category=shopping"
              onClick={closeMenu}
              className="rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100"
            >
              Shopping
            </Link>

            <Link
              href="/admin/login"
              onClick={closeMenu}
              className="mt-2 rounded-xl bg-emerald-600 px-4 py-3 text-center font-bold text-white"
            >
              Admin Panel
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
