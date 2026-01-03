"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { useUser } from "@supabase/auth-helpers-react";

import { menuItems } from "../constants/menuItems";
import { MenuItem, Profile } from "../constants/types";
import TopNav from "../components/TopNav";

function MenuPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const user = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Tabs
  const categories = useMemo(() => menuItems.map(s => s.category), []);
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  const activeSection = useMemo(
    () => menuItems.find(s => s.category === activeCategory),
    [activeCategory]
  );

  // Restore category when coming back from /order?cat=...
  useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat && menuItems.some(s => s.category === cat)) {
      setActiveCategory(cat);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load profile (so Menu can still gate/disable ordering if you want)
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .eq("user_id", user.id)
          .single();

        if (error) console.error("Error fetching profile:", error.message);
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const canOrder = !!user && !!profile && !loading;

  const goToOrderScreen = (item: MenuItem) => {
    router.push(
      `/order?item=${encodeURIComponent(item.name)}&from=/menu&cat=${encodeURIComponent(
        activeCategory
      )}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="max-w-5xl mx-auto p-4 sm:p-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-slate-600">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-5xl mx-auto p-4 sm:p-6">
        {/* Header / App Shell */}
        <header className="sticky top-0 z-40 mb-6">
          <div className="rounded-2xl border border-slate-200 bg-white/85 backdrop-blur shadow-sm">
            {/* Fun accent bar */}
            <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-blue-600 to-cyan-500" />

            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    🍔 Menu
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    Pick something tasty — add a note on the next screen.
                  </p>
                </div>

                <div className="shrink-0 max-w-full overflow-x-auto">
                  <TopNav />
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {menuItems.map(section => {
                  const count = section.items.length;
                  const label = `${section.category} (${count})`;
                  const active = activeCategory === section.category;

                  return (
                    <button
                      key={section.category}
                      onClick={() => setActiveCategory(section.category)}
                      className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition ${
                        active
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-bold text-slate-900">{activeCategory}</h2>

            {!canOrder ? (
              <span className="text-xs text-slate-500">
                {user ? "Loading profile..." : "Log in to order"}
              </span>
            ) : (
              <span className="text-xs text-slate-500">
                Ordering as <span className="font-semibold text-slate-700">{profile?.full_name}</span>
              </span>
            )}
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeSection?.items.map(item => (
              <li
                key={item.name}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:-translate-y-[1px]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                      {item.name}
                    </h3>
                    {item.description ? (
                      <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                    ) : (
                      <p className="mt-1 text-sm text-slate-500">No description</p>
                    )}
                  </div>

                  <span className="shrink-0 inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-xs font-semibold">
                    {activeCategory}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <button
                    onClick={() => goToOrderScreen(item)}
                    disabled={!canOrder}
                    className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] ${
                      canOrder
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-blue-300 cursor-not-allowed"
                    }`}
                  >
                    Order Now →
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 safe-area">
          <main className="max-w-5xl mx-auto p-4 sm:p-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-600">Loading order…</p>
            </div>
          </main>
        </div>
      }
    >
      <MenuPageInner/>
    </Suspense>
  );
}
