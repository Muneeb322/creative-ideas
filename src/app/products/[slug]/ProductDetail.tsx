"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Star,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  MessageCircle,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import toast from "react-hot-toast";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  user: { name: string };
  createdAt: Date;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  image: string;
  images: string[];
  stock: number;
  category: { name: string; slug: string };
  reviews: Review[];
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  image: string;
  stock: number;
  category: { name: string };
}

export default function ProductDetail({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: RelatedProduct[];
}) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
        product.reviews.length
      : 0;

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add items to cart");
      router.push("/login");
      return;
    }
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        image: product.image,
        slug: product.slug,
        stock: product.stock,
      },
      quantity
    );
    toast.success(`${product.name} added to cart!`);
  };

  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        {" / "}
        <Link href="/products" className="hover:text-indigo-600">Products</Link>
        {" / "}
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-indigo-600"
        >
          {product.category.name}
        </Link>
        {" / "}
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === i ? "border-indigo-600" : "border-transparent"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <span className="text-sm text-indigo-600 font-medium">
            {product.category.name}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mt-1 mb-2">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={
                    star <= avgRating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              ({product.reviews.length} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            {product.salePrice ? (
              <>
                <span className="text-3xl font-bold text-indigo-600">
                  ${product.salePrice.toFixed(2)}
                </span>
                <span className="text-xl text-gray-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
                <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-1 rounded">
                  -{discount}%
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">
            {product.description}
          </p>

          {/* Stock */}
          <p
            className={`text-sm font-medium mb-6 ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}
          >
            {product.stock > 0
              ? `In Stock (${product.stock} available)`
              : "Out of Stock"}
          </p>

          {/* Quantity & Add to Cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-100"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 font-medium">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="p-3 hover:bg-gray-100"
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>
            </div>
          )}

          {/* Features */}
          <div className="border-t pt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Truck size={18} className="text-indigo-600" />
              Free shipping on orders over $50
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Shield size={18} className="text-green-600" />
              Secure payment with Stripe
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <RotateCcw size={18} className="text-orange-600" />
              30-day return policy
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <MessageCircle size={18} className="text-green-500" />
              Order tracking via Email & WhatsApp
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Customer Reviews ({product.reviews.length})
        </h2>
        {product.reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-xl border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-medium text-sm">
                        {review.user.name[0]}
                      </span>
                    </div>
                    <span className="font-medium">{review.user.name}</span>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={
                          star <= review.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                slug={p.slug}
                price={p.price}
                salePrice={p.salePrice}
                image={p.image}
                stock={p.stock}
                category={p.category.name}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
