"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { useUser } from "@supabase/auth-helpers-react";

import { menuItems } from "@/app/constants/menuItems";
import { NOTE_PRESETS } from "@/app/constants/presets";
import TopNav from "@/app/components/TopNav";

function OrderPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const user = useUser();

  const itemName = params.get("item") ?? "";
  const from = params.get("from") ?? "/menu";
  const cat = params.get("cat") ?? "";
  const backToMenu = cat ? `${from}?cat=${encodeURIComponent(cat)}` : from;

  const item = useMemo(() => {
    if (!itemName) return null;
    for (const section of menuItems) {
      const found = section.items.find(i => i.name === itemName);
      if (found) return { ...found, category: section.category };
    }
    return null;
  }, [itemName]);

  const [profile, setProfile] = useState<{ user_id: string; full_name: string } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [noteText, setNoteText] = useState("");
  const [lastNote, setLastNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load last note
  useEffect(() => {
    const saved = localStorage.getItem("beta_last_note") ?? "";
    setLastNote(saved);
    setNoteText(saved);
  }, []);

  // Fetch profile
  useEffect(() => {
    const run = async () => {
      try {
        if (!user) {
          setProfile(null);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error.message);
          setProfile(null);
        } else {
          setProfile(data);
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    run();
  }, [user]);

  const applyPreset = (preset: string) => {
    setNoteText(prev => {
      const trimmed = prev.trim();
      if (!trimmed) return preset;
      if (trimmed.toLowerCase().includes(preset.toLowerCase())) return prev;
      return `${trimmed}${trimmed.endsWith(".") ? "" : ","} ${preset}`;
    });
  };

  const canSubmit = !!user && !!profile && !!item && !loadingProfile && !isSubmitting;

  const cancel = () => router.push(backToMenu);

  const submitOrder = async () => {
    if (!item) return;

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      alert("Please log in first!");
      router.push("/");
      return;
    }

    if (!profile) {
      alert("Profile not loaded yet. Please wait a moment.");
      return;
    }

    const cleanNote = noteText.trim();
    localStorage.setItem("beta_last_note", cleanNote);
    setLastNote(cleanNote);

    const payload = {
      user_id: currentUser.id,
      name: profile.full_name,
      item: item.name,
      status: "queued",
      note: cleanNote || null,
    };

    try {
      setIsSubmitting(true);
      const { error } = await supabase.from("orders").insert([payload]);

      if (error) {
        console.error("Error placing order:", error.message);
        alert(`Failed to place order: ${error.message}`);
        return;
      }

      alert(`Order placed: ${item.name}`);
      router.push(backToMenu);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!itemName) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="max-w-5xl mx-auto p-4 sm:p-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Confirm Order
            </h1>
            <p className="mt-2 text-slate-600">No item selected.</p>
            <button
              onClick={() => router.push("/menu")}
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-white font-semibold shadow-sm hover:bg-blue-700 active:scale-[0.99] transition"
            >
              Back to Menu
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-5xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <header className="sticky top-0 z-40 mb-6">
          <div className="rounded-2xl border border-slate-200 bg-white/85 backdrop-blur shadow-sm">
            <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-blue-600 to-cyan-500" />
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    🧾 Confirm Order
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Review your item and add an optional note for Tone.
                  </p>
                </div>
                <div className="shrink-0">
                  <TopNav />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Item summary */}
          <section className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500">Item</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  {item?.name ?? itemName}
                </h2>
                {item?.description ? (
                  <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                ) : null}
              </div>

              {item?.category ? (
                <span className="shrink-0 inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-xs font-semibold">
                  {item.category}
                </span>
              ) : null}
            </div>

            <div className="mt-4 space-y-2">
              {!user || !profile ? (
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-900">
                  <p className="font-semibold">Almost there…</p>
                  <p className="mt-1">{user ? "Loading your profile…" : "Log in to place an order."}</p>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  Ordering as{" "}
                  <span className="font-semibold text-slate-900">{profile.full_name}</span>
                </div>
              )}
            </div>
          </section>

          {/* Note + presets + actions */}
          <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Note (optional)</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Add any preferences for Tone. Keep it short and clear.
                </p>
              </div>

              {lastNote ? (
                <button
                  type="button"
                  onClick={() => setNoteText(lastNote)}
                  className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Use last note
                </button>
              ) : null}
            </div>

            {/* Presets */}
            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">Presets</p>
              <div className="flex flex-wrap gap-2">
                {NOTE_PRESETS.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div className="mt-4">
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="e.g., no onions, extra sauce on the side…"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>{noteText.trim().length}/200</span>
                <button
                  type="button"
                  onClick={() => setNoteText("")}
                  className="text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Clear
                </button>
              </div>
            </div>

            {!user || !profile ? (
              <p className="mt-3 text-xs text-red-600">
                You must be logged in and have a profile loaded to place an order.
              </p>
            ) : null}

            {/* Tip */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <span className="font-semibold">Tip:</span> If you don’t need anything special, leave
              it blank and hit <span className="font-semibold">Submit</span>.
            </div>

            {/* Actions at bottom */}
            <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
              <button
                type="button"
                onClick={cancel}
                className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition"
                disabled={isSubmitting}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitOrder}
                disabled={!canSubmit}
                className={`w-full sm:w-auto rounded-xl px-5 py-2 font-semibold text-white shadow-sm transition active:scale-[0.99] ${
                  canSubmit ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? "Placing…" : "Submit Order"}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50">
          <main className="max-w-5xl mx-auto p-4 sm:p-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-600">Loading order…</p>
            </div>
          </main>
        </div>
      }
    >
      <OrderPageInner />
    </Suspense>
  );
}