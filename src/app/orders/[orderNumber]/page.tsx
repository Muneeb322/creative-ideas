import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import {
  Package,
  CheckCircle,
  Truck,
  Clock,
  XCircle,
  MessageCircle,
  Mail,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ orderNumber: string }>;
}

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

function getStatusIndex(status: string): number {
  if (status === "cancelled") return -1;
  return statusSteps.findIndex((s) => s.key === status);
}

export default async function OrderDetailPage({ params }: Props) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: { include: { product: true } },
      user: { select: { name: true, email: true } },
    },
  });

  if (!order) notFound();

  const currentStep = getStatusIndex(order.status);
  const isCancelled = order.status === "cancelled";

  const whatsappPhone = (process.env.WHATSAPP_PHONE || "1234567890").replace(
    /[^0-9]/g,
    ""
  );
  const whatsappMessage = encodeURIComponent(
    `Hi! I'd like to inquire about my order #${order.orderNumber}`
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.orderNumber}
            </h1>
            <p className="text-gray-500 text-sm">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isCancelled
                ? "bg-red-100 text-red-700"
                : currentStep >= 4
                  ? "bg-green-100 text-green-700"
                  : "bg-indigo-100 text-indigo-700"
            }`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        {/* Progress Tracker */}
        {!isCancelled && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStep;
                return (
                  <div
                    key={step.key}
                    className="flex flex-col items-center flex-1"
                  >
                    <div className="relative flex items-center w-full">
                      {index > 0 && (
                        <div
                          className={`flex-1 h-1 ${index <= currentStep ? "bg-indigo-600" : "bg-gray-200"}`}
                        />
                      )}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                          isActive
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      {index < statusSteps.length - 1 && (
                        <div
                          className={`flex-1 h-1 ${index < currentStep ? "bg-indigo-600" : "bg-gray-200"}`}
                        />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 ${isActive ? "text-indigo-600 font-medium" : "text-gray-400"}`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="bg-red-50 rounded-lg p-4 mb-6 flex items-center gap-3">
            <XCircle className="text-red-500" size={24} />
            <p className="text-red-700">
              This order has been cancelled.
            </p>
          </div>
        )}

        {order.trackingNumber && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-blue-700 text-sm">
              Tracking Number:{" "}
              <span className="font-bold">{order.trackingNumber}</span>
            </p>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Order Items</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="font-bold">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span>
              {order.shipping === 0 ? "Free" : `$${order.shipping.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span>${order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total</span>
            <span className="text-indigo-600">${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Shipping & Contact */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-bold mb-3">Shipping Address</h2>
          <p className="text-gray-600 text-sm">
            {order.customerName}
            <br />
            {order.shippingAddress}
            <br />
            {order.shippingCity}, {order.shippingCountry} {order.shippingZip}
          </p>
          {order.customerEmail && (
            <p className="text-gray-600 text-sm mt-2 flex items-center gap-1">
              <Mail size={14} />
              {order.customerEmail}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-bold mb-3">Need Help?</h2>
          <div className="space-y-3">
            <a
              href={`https://wa.me/${whatsappPhone}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
            >
              <MessageCircle size={18} />
              Contact via WhatsApp
            </a>
            <a
              href={`mailto:info@creative-ideas.com?subject=Order ${order.orderNumber}`}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <Mail size={18} />
              Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
