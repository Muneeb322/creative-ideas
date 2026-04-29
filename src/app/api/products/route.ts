import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const featured = searchParams.get("featured");

  const where: Record<string, unknown> = { active: true };
  if (category) where.category = { slug: category };
  if (featured === "true") where.featured = true;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(products);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: body.price,
        salePrice: body.salePrice || null,
        image: body.image,
        images: body.images || null,
        stock: body.stock,
        featured: body.featured || false,
        categoryId: body.categoryId,
      },
    });
    return Response.json(product);
  } catch (error) {
    console.error("Create product error:", error);
    return Response.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
