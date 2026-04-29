import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("orderNumber");

  if (orderNumber) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: { include: { product: true } },
        user: { select: { name: true, email: true } },
      },
    });

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    if (session.role !== "admin" && order.userId !== session.id) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    return Response.json(order);
  }

  const where =
    session.role === "admin" ? {} : { userId: session.id };

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: { include: { product: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(orders);
}
