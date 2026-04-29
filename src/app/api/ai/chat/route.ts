import { chatWithAI } from "@/lib/ai";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    const products = await prisma.product.findMany({
      where: { active: true },
      select: { name: true, price: true, salePrice: true, stock: true },
      take: 20,
    });

    const productContext = products
      .map(
        (p) =>
          `${p.name} - $${p.salePrice || p.price} ${p.stock > 0 ? "(in stock)" : "(out of stock)"}`
      )
      .join("\n");

    const response = await chatWithAI(message, history || [], productContext);

    return Response.json({ response });
  } catch {
    return Response.json(
      { response: "Sorry, I encountered an error. Please try again!" },
      { status: 500 }
    );
  }
}
