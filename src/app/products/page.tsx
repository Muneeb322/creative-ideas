import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ category?: string; search?: string; sort?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const { category, search, sort } = params;

  const where: Record<string, unknown> = { active: true };
  if (category) {
    where.category = { slug: category };
  }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  if (sort === "price-desc") orderBy = { price: "desc" };
  if (sort === "name") orderBy = { name: "asc" };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
    }),
    prisma.category.findMany(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl p-6 shadow-sm border sticky top-20">
            <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products"
                  className={`block py-1 text-sm ${!category ? "text-indigo-600 font-medium" : "text-gray-600 hover:text-indigo-600"}`}
                >
                  All Products
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className={`block py-1 text-sm ${category === cat.slug ? "text-indigo-600 font-medium" : "text-gray-600 hover:text-indigo-600"}`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="font-semibold text-gray-900 mt-6 mb-4">Sort By</h3>
            <ul className="space-y-2">
              {[
                { label: "Newest", value: "" },
                { label: "Price: Low to High", value: "price-asc" },
                { label: "Price: High to Low", value: "price-desc" },
                { label: "Name", value: "name" },
              ].map((option) => (
                <li key={option.value}>
                  <Link
                    href={`/products?${category ? `category=${category}&` : ""}${search ? `search=${search}&` : ""}sort=${option.value}`}
                    className={`block py-1 text-sm ${(sort || "") === option.value ? "text-indigo-600 font-medium" : "text-gray-600 hover:text-indigo-600"}`}
                  >
                    {option.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {category
                ? categories.find((c) => c.slug === category)?.name || "Products"
                : search
                  ? `Search: "${search}"`
                  : "All Products"}
            </h1>
            <p className="text-gray-500 text-sm">
              {products.length} product{products.length !== 1 ? "s" : ""}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No products found.</p>
              <Link
                href="/products"
                className="text-indigo-600 font-medium mt-2 inline-block"
              >
                View all products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  salePrice={product.salePrice}
                  image={product.image}
                  stock={product.stock}
                  category={product.category.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
