"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        Welcome to Beta Lunch
      </h1>

      <div className="flex flex-col gap-4 w-60">

        <button
          onClick={() => router.push("/menu")}
          className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Menu
        </button>

        <button
          onClick={() => router.push("/kitchen")}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Kitchen
        </button>

        <button
          onClick={() => router.push("/myOrders")}
          className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Orders
        </button>
      </div>
    </main>
  );
}
