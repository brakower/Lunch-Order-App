"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { Order } from "../constants/types";
import TopNav from "@/app/components/TopNav";

type Status = "queued" | "in_progress" | "ready";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const run = async () => {
      try {
        // Get current user (needed for realtime filter)
        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();

        if (userErr || !user) {
          console.error("Not logged in / couldn't load user:", userErr?.message);
          setOrders([]);
          return;
        }

        // ✅ Secure fetch (RPC enforces user_id = auth.uid())
        const { data, error } = await supabase.rpc("get_my_orders");
        if (error) {
          console.error("Error fetching my orders:", error.message);
          setOrders([]);
        } else {
          setOrders((data ?? []) as Order[]);
        }

        // ✅ Realtime: only listen to changes for this user
        channel = supabase
          .channel(`orders-changes-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "orders",
              filter: `user_id=eq.${user.id}`,
            },
            payload => {
              if (payload.eventType === "INSERT") {
                setOrders(prev => [...prev, payload.new as Order]);
              } else if (payload.eventType === "UPDATE") {
                const updated = payload.new as Order;
                setOrders(prev => prev.map(o => (o.order_id === updated.order_id ? updated : o)));
              } else if (payload.eventType === "DELETE") {
                const deleted = payload.old as Order;
                setOrders(prev => prev.filter(o => o.order_id !== deleted.order_id));
              }
            }
          )
          .subscribe();
      } finally {
        setLoading(false);
      }
    };

    run();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const byStatus = useMemo(() => {
    const sortAsc = (a: Order, b: Order) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    const sortDesc = (a: Order, b: Order) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

    const queued = orders.filter(o => o.status === "queued").sort(sortAsc);
    const inProgress = orders.filter(o => o.status === "in_progress").sort(sortDesc);
    const ready = orders.filter(o => o.status === "ready").sort(sortDesc);

    return { queued, inProgress, ready };
  }, [orders]);

  const deleteOrder = async (order_id: string) => {
    const prevOrders = orders;
    setOrders(prev => prev.filter(o => o.order_id !== order_id));
  
    const { error } = await supabase.from("orders").delete().eq("order_id", order_id);
  
    if (error) {
      console.error("Delete failed:", error.message);
      setOrders(prevOrders);
      alert(`Failed to delete order: ${error.message}`);
    }
  };  

  const Column = ({
    title,
    count,
    pillClass,
    emptyText,
    children,
  }: {
    title: string;
    count: number;
    pillClass: string;
    emptyText: string;
    children: React.ReactNode;
  }) => (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${pillClass}`}>
            {count}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {count ? children : <p className="text-sm text-slate-500">{emptyText}</p>}
      </div>
    </section>
  );

  const StatusChip = ({ status }: { status: Status }) => {
    if (status === "queued") {
      return (
        <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 text-xs font-semibold">
          Queued ⏳
        </span>
      );
    }
    if (status === "in_progress") {
      return (
        <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 text-xs font-semibold">
          In Progress 🔥
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 text-xs font-semibold">
        Ready ✅
      </span>
    );
  };


  const OrderCard = ({ order }: { order: Order }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900">{order.item}</h3>
          <button
            onClick={() => deleteOrder(order.order_id)}
            className="shrink-0 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
            title="Delete"
          >
            ✕
          </button>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Ordered by <span className="font-semibold text-slate-800">{order.name}</span>
          </p>
        </div>
      </div>

      {order.note ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <span className="font-semibold">Note:</span> {order.note}
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <StatusChip status={order.status as Status} />
      </div>
    </div>
    
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <header className="sticky top-0 z-40 mb-6">
          <div className="rounded-2xl border border-slate-200 bg-white/85 backdrop-blur shadow-sm">
            <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-blue-600 to-cyan-500" />
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    🧾 My Orders
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Track your orders as they move from queued → in progress → ready.
                  </p>
                </div>
                <div className="shrink-0">
                  <TopNav />
                </div>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">Loading your orders…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Column
              title="Queued"
              count={byStatus.queued.length}
              pillClass="bg-amber-50 text-amber-700 border-amber-200"
              emptyText="Nothing queued right now."
            >
              {byStatus.queued.map(o => (
                <OrderCard key={o.order_id} order={o} />
              ))}
            </Column>

            <Column
              title="In Progress"
              count={byStatus.inProgress.length}
              pillClass="bg-blue-50 text-blue-700 border-blue-200"
              emptyText="Nothing cooking right now."
            >
              {byStatus.inProgress.map(o => (
                <OrderCard key={o.order_id} order={o} />
              ))}
            </Column>

            <Column
              title="Ready"
              count={byStatus.ready.length}
              pillClass="bg-emerald-50 text-emerald-700 border-emerald-200"
              emptyText="No ready orders yet."
            >
              {byStatus.ready.map(o => (
                <OrderCard key={o.order_id} order={o} />
              ))}
            </Column>
          </div>
        )}
      </main>
    </div>
  );
}