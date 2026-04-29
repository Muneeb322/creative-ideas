import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import OrderActions from "./OrderActions";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      user: { select: { name: true, email: true, phone: true } },
    },
  });

  if (!order) notFound();

  return (
    <div className="max-w-4xl">
      <OrderActions order={JSON.parse(JSON.stringify(order))} />
    </div>
  );
}
