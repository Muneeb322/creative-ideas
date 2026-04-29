import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import EditProductForm from "./EditProductForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany(),
  ]);

  if (!product) notFound();

  return (
    <EditProductForm
      product={JSON.parse(JSON.stringify(product))}
      categories={JSON.parse(JSON.stringify(categories))}
    />
  );
}
