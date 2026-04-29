"use client";

import { useAuthStore } from "@/store/auth";
import Link from "next/link";
import { User, Package, Settings } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
        <Link href="/login" className="text-indigo-600 font-medium">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <User className="text-indigo-600" size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-gray-500">{user.email}</p>
            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full capitalize">
              {user.role}
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link
          href="/profile/orders"
          className="bg-white rounded-xl border p-6 hover:shadow-md transition flex items-center gap-4"
        >
          <div className="bg-indigo-100 p-3 rounded-xl">
            <Package className="text-indigo-600" size={24} />
          </div>
          <div>
            <h3 className="font-semibold">My Orders</h3>
            <p className="text-sm text-gray-500">View and track your orders</p>
          </div>
        </Link>

        {user.role === "admin" && (
          <Link
            href="/admin"
            className="bg-white rounded-xl border p-6 hover:shadow-md transition flex items-center gap-4"
          >
            <div className="bg-purple-100 p-3 rounded-xl">
              <Settings className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold">Admin Panel</h3>
              <p className="text-sm text-gray-500">
                Manage store and orders
              </p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
