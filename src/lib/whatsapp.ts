export function generateWhatsAppOrderLink(data: {
  phone: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  items: Array<{ name: string; quantity: number }>;
}): string {
  const itemsList = data.items
    .map((item) => `  - ${item.name} x${item.quantity}`)
    .join("\n");

  const message = encodeURIComponent(
    `Hi ${data.customerName}! 🛍️\n\n` +
      `Your order #${data.orderNumber} update:\n` +
      `Status: ${data.status.toUpperCase()}\n\n` +
      `Items:\n${itemsList}\n\n` +
      `Total: $${data.total.toFixed(2)}\n\n` +
      `Track your order: ${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderNumber}\n\n` +
      `Thank you for shopping with ${process.env.NEXT_PUBLIC_APP_NAME || "Creative Ideas Store"}!`
  );

  const cleanPhone = data.phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanPhone}?text=${message}`;
}

export function generateWhatsAppSupportLink(message?: string): string {
  const phone = (process.env.WHATSAPP_PHONE || "1234567890").replace(
    /[^0-9]/g,
    ""
  );
  const text = encodeURIComponent(
    message || "Hi! I need help with my order."
  );
  return `https://wa.me/${phone}?text=${text}`;
}
