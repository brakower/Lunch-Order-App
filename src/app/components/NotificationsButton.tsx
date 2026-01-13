"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export default function NotificationsButton() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const enablePush = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("Please log in first.");
        return;
      }

      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        alert("Push notifications are not supported in this browser.");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Notifications permission was not granted.");
        return;
      }

      // Make sure your next-pwa service worker is registered
      const reg = await navigator.serviceWorker.ready;

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        alert("Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY.");
        return;
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // ✅ THIS is exactly where this fetch belongs (right after subscribe)
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          subscription,
        }),
      });

      setEnabled(true);
      alert("Notifications enabled ✅");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Failed to enable notifications.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={enablePush}
      disabled={loading || enabled}
      className={`rounded-xl px-3 py-2 text-sm font-semibold border transition ${
        enabled
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
      }`}
    >
      {enabled ? "Notifications On ✅" : loading ? "Enabling…" : "Enable Notifications"}
    </button>
  );
}