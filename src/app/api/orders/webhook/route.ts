import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();

  // ✅ this is where your console.log belongs
  console.log("webhook body:", body);

  // You’ll parse out status + user_id from body.record (depends on your webhook payload shape)
  const record = body?.record;
  const oldRecord = body?.old_record;

  const user_id = record?.user_id;
  const newStatus = record?.status;
  const oldStatus = oldRecord?.status;

  // only notify on status transitions
  const changed = newStatus && newStatus !== oldStatus;
  const shouldNotify = changed && (newStatus === "in_progress" || newStatus === "ready");

  if (shouldNotify && user_id) {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/push/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id,
        payload: {
          title: "Beta Lunch",
          body:
            newStatus === "in_progress"
              ? "Your order is now in progress 🔥"
              : "Your order is ready ✅",
        },
      }),
    });
  }

  return NextResponse.json({ ok: true });
}