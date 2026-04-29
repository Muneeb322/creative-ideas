import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  shippingAddress: string;
  status: string;
  trackingNumber?: string;
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  const itemsHtml = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${item.price.toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
      <div style="background:#4F46E5;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
        <h1 style="margin:0">Order Confirmation</h1>
        <p style="margin:5px 0 0">Thank you for your order!</p>
      </div>
      <div style="padding:20px;background:#f9fafb;border:1px solid #e5e7eb">
        <p>Hi <strong>${data.customerName}</strong>,</p>
        <p>Your order <strong>#${data.orderNumber}</strong> has been ${data.status === "confirmed" ? "confirmed" : "received"}.</p>
        
        <h3 style="color:#4F46E5">Order Details</h3>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#e5e7eb">
              <th style="padding:8px;text-align:left">Item</th>
              <th style="padding:8px;text-align:center">Qty</th>
              <th style="padding:8px;text-align:right">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        
        <div style="margin-top:15px;padding:10px;background:white;border-radius:4px">
          <p style="margin:4px 0">Subtotal: <strong>$${data.subtotal.toFixed(2)}</strong></p>
          <p style="margin:4px 0">Tax: <strong>$${data.tax.toFixed(2)}</strong></p>
          <p style="margin:4px 0">Shipping: <strong>$${data.shipping.toFixed(2)}</strong></p>
          <p style="margin:4px 0;font-size:18px;color:#4F46E5">Total: <strong>$${data.total.toFixed(2)}</strong></p>
        </div>

        <h3 style="color:#4F46E5">Shipping Address</h3>
        <p>${data.shippingAddress}</p>

        ${data.trackingNumber ? `<h3 style="color:#4F46E5">Tracking</h3><p>Tracking Number: <strong>${data.trackingNumber}</strong></p>` : ""}
        
        <div style="margin-top:20px;padding:15px;background:#EEF2FF;border-radius:4px;text-align:center">
          <p style="margin:0">Track your order at:</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderNumber}" 
             style="color:#4F46E5;font-weight:bold">
            ${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderNumber}
          </a>
        </div>
      </div>
      <div style="padding:15px;text-align:center;color:#6b7280;font-size:12px;border-radius:0 0 8px 8px;background:#f3f4f6">
        <p>&copy; ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_APP_NAME || "Creative Ideas Store"}. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@creative-ideas.com",
      to: data.customerEmail,
      subject: `Order Confirmation #${data.orderNumber}`,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: "Failed to send email" };
  }
}

export async function sendOrderStatusUpdate(data: OrderEmailData) {
  const statusMessages: Record<string, string> = {
    confirmed: "Your order has been confirmed and is being prepared.",
    processing: "Your order is being processed.",
    shipped: "Your order has been shipped!",
    delivered: "Your order has been delivered.",
    cancelled: "Your order has been cancelled.",
  };

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
      <div style="background:#4F46E5;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
        <h1 style="margin:0">Order Update</h1>
      </div>
      <div style="padding:20px;background:#f9fafb;border:1px solid #e5e7eb">
        <p>Hi <strong>${data.customerName}</strong>,</p>
        <p>${statusMessages[data.status] || `Your order status has been updated to: ${data.status}`}</p>
        <p>Order: <strong>#${data.orderNumber}</strong></p>
        ${data.trackingNumber ? `<p>Tracking Number: <strong>${data.trackingNumber}</strong></p>` : ""}
        <div style="margin-top:20px;text-align:center">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderNumber}" 
             style="background:#4F46E5;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">
            Track Your Order
          </a>
        </div>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@creative-ideas.com",
      to: data.customerEmail,
      subject: `Order #${data.orderNumber} - Status Update: ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}`,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: "Failed to send email" };
  }
}
