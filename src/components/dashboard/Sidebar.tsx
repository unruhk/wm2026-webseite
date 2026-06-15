"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/dashboard",         label: "Übersicht",   icon: "▦" },
  { href: "/dashboard/matches", label: "Spiele",       icon: "📅" },
  { href: "/dashboard/lineup",  label: "Aufstellung",  icon: "⬡" },
];

export default function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/dashboard/login");
    router.refresh();
  }

  const NavLinks = () => (
    <nav className="flex-1 space-y-1">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              active
                ? "bg-[#D4AF37] text-black"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ── Desktop-Sidebar ── */}
      <aside className="hidden md:flex w-60 flex-col bg-white/3 border-r border-white/8 min-h-screen p-4">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
            ⚽
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-bold leading-none">Trainer-Bereich</p>
            <p className="text-white/30 text-xs truncate mt-0.5">{email}</p>
          </div>
        </div>

        <NavLinks />

        {/* Logout */}
        <div className="mt-4 pt-4 border-t border-white/8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <span>→</span> Abmelden
          </button>
        </div>
      </aside>

      {/* ── Mobile-Header ── */}
      <header className="md:hidden flex items-center justify-between bg-[#0A0A0A] border-b border-white/8 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#D4AF37] rounded-full flex items-center justify-center text-black text-xs font-bold">
            ⚽
          </div>
          <span className="text-white text-sm font-bold">Trainer-Bereich</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="text-white/60 hover:text-white p-1 cursor-pointer"
          aria-label="Menü öffnen"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </header>

      {/* ── Mobile-Dropdown ── */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0A0A0A] border-b border-white/8 px-4 pb-4 space-y-1">
          <NavLinks />
          <div className="pt-2 border-t border-white/8 mt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <span>→</span> Abmelden
            </button>
          </div>
        </div>
      )}
    </>
  );
}
