import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendOrderStatusUpdate } from "@/lib/email";
import { generateWhatsAppOrderLink } from "@/lib/whatsapp";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const order = await prisma.order.update({
      where: { id },
      data: {
        status: body.status,
        paymentStatus: body.paymentStatus,
        trackingNumber: body.trackingNumber,
      },
      include: {
        items: { include: { product: true } },
      },
    });

    // Send email notification
    sendOrderStatusUpdate({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: order.total,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      shippingAddress: `${order.shippingAddress}, ${order.shippingCity}`,
      status: order.status,
      trackingNumber: order.trackingNumber || undefined,
    }).catch(console.error);

    // Generate WhatsApp link
    let whatsappLink = null;
    if (order.customerPhone) {
      whatsappLink = generateWhatsAppOrderLink({
        phone: order.customerPhone,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        total: order.total,
        status: order.status,
        items: order.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
        })),
      });
    }

    return Response.json({ success: true, order, whatsappLink });
  } catch {
    return Response.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
