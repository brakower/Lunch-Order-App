"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { Order } from "../constants/types";
import TopNav from "../components/TopNav";

type Status = "queued" | "in_progress" | "ready";

type ByStatus = {
  queued: Order[];
  inProgress: Order[];
  ready: Order[];
};

type KitchenViewProps = {
  byStatus: ByStatus;
  currentUserId: string | null;
  isAdmin: boolean;
  updateStatus: (order_id: string, newStatus: Status) => Promise<void>;
  deleteOrder: (order_id: string) => Promise<void>;
};

function Column({
  title,
  count,
  pillClass,
  children,
}: {
  title: string;
  count: number;
  pillClass: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pillClass}`}>
            {count}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </section>
  );
}

function StatusChip({ status }: { status: Status }) {
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
}

function OrderCard({
  order,
  currentUserId,
  isAdmin,
  updateStatus,
  deleteOrder,
}: {
  order: Order;
  currentUserId: string | null;
  isAdmin: boolean;
  updateStatus: (order_id: string, newStatus: Status) => Promise<void>;
  deleteOrder: (order_id: string) => Promise<void>;
}) {
  const isMine = order.user_id === currentUserId;
  const canDelete = isAdmin || isMine;
  const canManageStatus = isAdmin;

  return (
    <div
      className={`rounded-2xl border-2 bg-white p-4 shadow-sm transition ${
        isMine ? "border-yellow-400" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900">{order.item}</h3>
          <p className="mt-1 text-sm text-slate-600">
            Ordered by <span className="font-semibold text-slate-800">{order.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isMine ? (
            <span className="inline-flex items-center rounded-full bg-yellow-50 text-yellow-800 border border-yellow-200 px-2.5 py-1 text-xs font-semibold">
              Yours
            </span>
          ) : null}

          {canDelete ? (
            <button
              onClick={() => deleteOrder(order.order_id)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
              title="Delete"
              type="button"
            >
              ✕
            </button>
          ) : null}
        </div>
      </div>

      {order.note ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <span className="font-semibold">Note:</span> {order.note}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {canManageStatus && order.status === "queued" ? (
          <button
            onClick={() => updateStatus(order.order_id, "in_progress")}
            className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition"
            type="button"
          >
            Start
          </button>
        ) : null}

        {canManageStatus && order.status === "in_progress" ? (
          <button
            onClick={() => updateStatus(order.order_id, "ready")}
            className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
            type="button"
          >
            Mark Ready
          </button>
        ) : null}

        <StatusChip status={order.status as Status} />
      </div>
    </div>
  );
}

function KitchenDesktop(props: KitchenViewProps) {
  const { byStatus, currentUserId, isAdmin, updateStatus, deleteOrder } = props;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Column
        title="Queued"
        count={byStatus.queued.length}
        pillClass="bg-amber-50 text-amber-700 border border-amber-200"
      >
        {byStatus.queued.length ? (
          byStatus.queued.map(o => (
            <OrderCard
              key={o.order_id}
              order={o}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              updateStatus={updateStatus}
              deleteOrder={deleteOrder}
            />
          ))
        ) : (
          <p className="text-sm text-slate-500">No queued orders.</p>
        )}
      </Column>

      <Column
        title="In Progress"
        count={byStatus.inProgress.length}
        pillClass="bg-blue-50 text-blue-700 border border-blue-200"
      >
        {byStatus.inProgress.length ? (
          byStatus.inProgress.map(o => (
            <OrderCard
              key={o.order_id}
              order={o}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              updateStatus={updateStatus}
              deleteOrder={deleteOrder}
            />
          ))
        ) : (
          <p className="text-sm text-slate-500">Nothing cooking right now.</p>
        )}
      </Column>

      <Column
        title="Ready"
        count={byStatus.ready.length}
        pillClass="bg-emerald-50 text-emerald-700 border border-emerald-200"
      >
        {byStatus.ready.length ? (
          byStatus.ready.map(o => (
            <OrderCard
              key={o.order_id}
              order={o}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              updateStatus={updateStatus}
              deleteOrder={deleteOrder}
            />
          ))
        ) : (
          <p className="text-sm text-slate-500">No ready orders yet.</p>
        )}
      </Column>
    </div>
  );
}

function KitchenMobile(props: KitchenViewProps) {
  const { byStatus, currentUserId, isAdmin, updateStatus, deleteOrder } = props;
  const [tab, setTab] = useState<Status>("queued");

  const list =
    tab === "queued" ? byStatus.queued : tab === "in_progress" ? byStatus.inProgress : byStatus.ready;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setTab("queued")}
          className={`px-4 py-2 rounded-full text-sm border whitespace-nowrap transition ${
            tab === "queued"
              ? "bg-amber-500 text-white border-amber-500"
              : "bg-white text-slate-700 border-slate-200"
          }`}
        >
          Queued ({byStatus.queued.length})
        </button>

        <button
          type="button"
          onClick={() => setTab("in_progress")}
          className={`px-4 py-2 rounded-full text-sm border whitespace-nowrap transition ${
            tab === "in_progress"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-slate-700 border-slate-200"
          }`}
        >
          In Progress ({byStatus.inProgress.length})
        </button>

        <button
          type="button"
          onClick={() => setTab("ready")}
          className={`px-4 py-2 rounded-full text-sm border whitespace-nowrap transition ${
            tab === "ready"
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white text-slate-700 border-slate-200"
          }`}
        >
          Ready ({byStatus.ready.length})
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {list.length ? (
          list.map(o => (
            <OrderCard
              key={o.order_id}
              order={o}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              updateStatus={updateStatus}
              deleteOrder={deleteOrder}
            />
          ))
        ) : (
          <p className="text-sm text-slate-500">Nothing here yet.</p>
        )}
      </div>
    </div>
  );
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadUserAndAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUserId(user?.id ?? null);

      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("user_id", user.id)
          .single();

        if (error) console.error(error.message);
        setIsAdmin(!!data?.is_admin);
      } else {
        setIsAdmin(false);
      }
    };

    loadUserAndAdmin();

    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && data) setOrders(data);
    };

    fetchOrders();

    const channel = supabase
      .channel("orders-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, payload => {
        if (payload.eventType === "INSERT") {
          setOrders(prev => [...prev, payload.new as Order]);
        } else if (payload.eventType === "UPDATE") {
          setOrders(prev =>
            prev.map(o =>
              o.order_id === (payload.new as Order).order_id ? (payload.new as Order) : o
            )
          );
        } else if (payload.eventType === "DELETE") {
          setOrders(prev => prev.filter(o => o.order_id !== (payload.old as Order).order_id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (order_id: string, newStatus: Status) => {
    // ✅ optimistic UI update
    setOrders(prev => prev.map(o => (o.order_id === order_id ? { ...o, status: newStatus } : o)));

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("order_id", order_id);

    if (error) {
      console.error(error.message);
      // Optional: refetch or revert optimistic update if you want
    }

  };

  const deleteOrder = async (order_id: string) => {
    // ✅ optimistic UI removal
    setOrders(prev => prev.filter(o => o.order_id !== order_id));

    const { error } = await supabase.from("orders").delete().eq("order_id", order_id);

    if (error) {
      console.error(error.message);
      // Optional: refetch if delete failed
    }
  };

  const byStatus = useMemo<ByStatus>(() => {
    const queued = orders
      .filter(o => o.status === "queued")
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const inProgress = orders
      .filter(o => o.status === "in_progress")
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const ready = orders
      .filter(o => o.status === "ready")
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return { queued, inProgress, ready };
  }, [orders]);

  const viewProps: KitchenViewProps = {
    byStatus,
    currentUserId,
    isAdmin,
    updateStatus,
    deleteOrder,
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 sm:pb-0 safe-area">
      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <header className="sticky top-0 z-40 mb-6">
          <div className="rounded-2xl border border-slate-200 bg-white/85 backdrop-blur shadow-sm">
            <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-blue-600 to-cyan-500" />
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    🍳 Kitchen Dashboard
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Track every order in real time. Yellow border = your order.
                  </p>
                </div>
                <div className="hidden sm:block shrink-0 max-w-full overflow-x-auto">
                  <TopNav />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile vs Desktop */}
        <div className="lg:hidden">
          <KitchenMobile {...viewProps} />
        </div>

        <div className="hidden lg:block">
          <KitchenDesktop {...viewProps} />
        </div>
      </main>
    </div>
  );
}