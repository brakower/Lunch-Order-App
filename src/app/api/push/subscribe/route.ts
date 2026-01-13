import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // important because web-push uses node libs sometimes

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only env var
);

export async function POST(req: Request) {
  try {
    console.log("SUBSCRIBE HIT");
    const body = await req.json();
    console.log("subscribe body:", body);
    
    const user_id = body.user_id as string | undefined;
    const subscription = body.subscription;

    if (!user_id || !subscription?.endpoint) {
      return NextResponse.json({ error: "Missing user_id or subscription" }, { status: 400 });
    }

    // Store whatever you want; easiest is raw jsonb
    // Table example: push_subscriptions(user_id uuid, endpoint text unique, subscription jsonb, created_at timestamptz)
    const { error } = await supabaseAdmin.from("push_subscriptions").upsert(
      {
        user_id,
        endpoint: subscription.endpoint,
        subscription,
      },
      { onConflict: "endpoint" }
    );

    if (error) {
      console.error("subscribe upsert error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("subscribe route error:", e);
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}