import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

export const runtime = "nodejs";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,       
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user_id = body.user_id as string | undefined;
    const payload = body.payload ?? {};

    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("push_subscriptions")
      .select("endpoint, subscription")
      .eq("user_id", user_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const subs = data ?? [];
    await Promise.all(
      subs.map(async row => {
        try {
          await webpush.sendNotification(row.subscription, JSON.stringify(payload));
        } catch (err: any) {
          // if subscription expired, remove it
          const statusCode = err?.statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await supabaseAdmin.from("push_subscriptions").delete().eq("endpoint", row.endpoint);
          }
          console.error("sendNotification error:", err);
        }
      })
    );

    return NextResponse.json({ ok: true, sent: subs.length });
  } catch (e: any) {
    console.error("send route error:", e);
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}