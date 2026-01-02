"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const title = useMemo(() => (isLogin ? "Welcome back" : "Create your account"), [isLogin]);
  const subtitle = useMemo(
    () =>
      isLogin
        ? "Log in to order lunch and track it in real time."
        : "Sign up once—then you’re ready to order.",
    [isLogin]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) return;

    try {
      setIsSubmitting(true);

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
          return;
        }

        router.push("/menu");
        return;
      }

      // Sign up
      const { error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
      });

      if (signUpError) {
        setErrorMsg(signUpError.message);
        return;
      }

      // Create profile row (best-effort)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          user_id: user.id,
          full_name: fullName.trim(),
        });

        if (profileError) {
          console.error("Error saving profile:", profileError.message);
        }
      }

      router.push("/menu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-xl mx-auto p-4 sm:p-6">
        {/* Top Card */}
        <section className="mt-8 sm:mt-14 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-cyan-500" />

          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  🍔 Beta Lunch
                </h1>
                <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
              </div>

              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {isLogin ? "Login" : "Sign Up"}
              </span>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>

              {errorMsg ? (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <span className="font-semibold">Error:</span> {errorMsg}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                {!isLogin ? (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                      placeholder="e.g., Frankie"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : null}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="onyen@unc.edu"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
                    isSubmitting ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isSubmitting ? "Working..." : isLogin ? "Log in" : "Create account"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setIsLogin(v => !v);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  {isLogin ? "Need an account? Sign up" : "Already have an account? Log in"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
