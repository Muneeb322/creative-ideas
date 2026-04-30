"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  image: string;
  stock: number;
  category?: string;
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  salePrice,
  image,
  stock,
  category,
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (stock <= 0) return;
    if (!user) {
      toast.error("Please login to add items to cart");
      router.push("/login");
      return;
    }
    addItem({ id, name, price, salePrice, image, slug, stock });
    toast.success(`${name} added to cart!`);
  };

  const discount = salePrice
    ? Math.round(((price - salePrice) / price) * 100)
    : 0;

  return (
    <Link href={`/products/${slug}`} className="group">
      <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all overflow-hidden">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </span>
          )}
          {stock <= 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Out of Stock</span>
            </div>
          )}
        </div>
        <div className="p-4">
          {category && (
            <p className="text-xs text-indigo-600 font-medium mb-1">{category}</p>
          )}
          <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition line-clamp-2">
            {name}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {salePrice ? (
                <>
                  <span className="text-lg font-bold text-indigo-600">
                    ${salePrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    ${price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-gray-900">
                  ${price.toFixed(2)}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={stock <= 0}
              className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
