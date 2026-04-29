import { prisma } from "@/lib/db";
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    totalOrders,
    totalProducts,
    totalUsers,
    totalRevenue,
    recentOrders,
    ordersByStatus,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: { not: "refunded" } },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const revenue = totalRevenue._sum.total || 0;

  const statusCounts = Object.fromEntries(
    ordersByStatus.map((s) => [s.status, s._count])
  );

  const stats = [
    {
      label: "Total Revenue",
      value: `$${revenue.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
      href: "/admin/orders",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      icon: ShoppingCart,
      color: "bg-indigo-100 text-indigo-600",
      href: "/admin/orders",
    },
    {
      label: "Products",
      value: totalProducts,
      icon: Package,
      color: "bg-orange-100 text-orange-600",
      href: "/admin/products",
    },
    {
      label: "Customers",
      value: totalUsers,
      icon: Users,
      color: "bg-purple-100 text-purple-600",
      href: "/admin/users",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-xl border p-6 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <Icon size={22} />
                </div>
                <ArrowUpRight size={16} className="text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Order Status */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-bold mb-4">Order Status Overview</h2>
          <div className="space-y-3">
            {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map(
              (status) => {
                const count = statusCounts[status] || 0;
                const percentage =
                  totalOrders > 0
                    ? ((count / totalOrders) * 100).toFixed(1)
                    : "0";
                const colors: Record<string, string> = {
                  pending: "bg-yellow-500",
                  confirmed: "bg-blue-500",
                  processing: "bg-indigo-500",
                  shipped: "bg-purple-500",
                  delivered: "bg-green-500",
                  cancelled: "bg-red-500",
                };
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-gray-600">{status}</span>
                      <span className="font-medium">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colors[status]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-indigo-600 font-medium"
            >
              View All
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-sm">
                      #{order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.user.name} •{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">
                      ${order.total.toFixed(2)}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
