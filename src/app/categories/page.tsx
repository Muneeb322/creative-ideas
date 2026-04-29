import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
      products: {
        where: { active: true },
        take: 4,
        select: { image: true, name: true },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Shop by Category
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="group bg-white rounded-xl border overflow-hidden hover:shadow-md transition"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={category.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600"}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h2 className="text-white text-xl font-bold">
                  {category.name}
                </h2>
                <p className="text-white/80 text-sm">
                  {category._count.products} products
                </p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-600 text-sm mb-3">
                {category.description}
              </p>
              <div className="flex items-center text-indigo-600 font-medium text-sm">
                Browse Products
                <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
