import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductDetail from "./ProductDetail";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: { include: { user: { select: { name: true } } } },
    },
  });

  if (!product) notFound();

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      active: true,
    },
    include: { category: true },
    take: 4,
  });

  return (
    <ProductDetail
      product={{
        ...product,
        images: product.images ? product.images.split(",") : [product.image],
      }}
      relatedProducts={relatedProducts}
    />
  );
}
