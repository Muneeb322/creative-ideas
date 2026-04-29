import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/email";
import { generateWhatsAppOrderLink } from "@/lib/whatsapp";

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CI-${timestamp}-${random}`;
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json(
        { success: false, error: "Please sign in to place an order" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      items,
      shippingAddress,
      shippingCity,
      shippingCountry,
      shippingZip,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      paymentMethod,
      subtotal,
      tax,
      shipping,
      total,
    } = body;

    if (!items || items.length === 0) {
      return Response.json(
        { success: false, error: "Cart is empty" },
        { status: 400 }
      );
    }

    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.id,
        status: paymentMethod === "cod" ? "confirmed" : "pending",
        paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
        subtotal,
        tax,
        shipping,
        total,
        shippingAddress,
        shippingCity,
        shippingCountry,
        shippingZip,
        customerName,
        customerEmail,
        customerPhone,
        notes,
        items: {
          create: items.map(
            (item: { productId: string; quantity: number; price: number }) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })
          ),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    // Update stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Send email notification (non-blocking)
    sendOrderConfirmation({
      orderNumber,
      customerName,
      customerEmail,
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total,
      subtotal,
      tax,
      shipping,
      shippingAddress: `${shippingAddress}, ${shippingCity}, ${shippingCountry} ${shippingZip}`,
      status: "confirmed",
    }).catch(console.error);

    // Generate WhatsApp link
    let whatsappLink = null;
    if (customerPhone) {
      whatsappLink = generateWhatsAppOrderLink({
        phone: customerPhone,
        orderNumber,
        customerName,
        total,
        status: "confirmed",
        items: order.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
        })),
      });
    }

    return Response.json({
      success: true,
      orderNumber,
      orderId: order.id,
      whatsappLink,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return Response.json(
      { success: false, error: "Failed to process order" },
      { status: 500 }
    );
  }
}
