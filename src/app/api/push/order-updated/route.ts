import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,        
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("webhook body:", body);

    // Supabase webhook payload usually includes: record + old_record
    const record = body.record;
    const old = body.old_record;

    if (!record) {
      return NextResponse.json({ error: "No record in webhook payload" }, { status: 400 });
    }

    const newStatus = record.status;
    const oldStatus = old?.status;

    // ✅ Only notify when status CHANGED to these
    const shouldNotify =
      newStatus !== oldStatus && (newStatus === "in_progress" || newStatus === "ready");

    if (!shouldNotify) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const userId = record.user_id;
    if (!userId) {
      return NextResponse.json({ ok: true, skipped: true, reason: "No user_id" });
    }

    // Fetch subscription(s) for that user
    const { data: subs, error } = await supabaseAdmin
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!subs?.length) return NextResponse.json({ ok: true, skipped: true, reason: "No sub" });

    const payload = JSON.stringify({
      title: "Beta Lunch 🍔",
      body:
        newStatus === "in_progress"
          ? `Your order is now in progress: ${record.item}`
          : `Your order is ready: ${record.item}`,
      url: "/myOrders",
    });

    // send to all stored subscriptions for user (or just one)
    await Promise.allSettled(
      subs.map(s => webpush.sendNotification(s.subscription as any, payload))
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message ?? "Unknown error" }, { status: 500 });
  }
}