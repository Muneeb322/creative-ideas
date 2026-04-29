import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcryptjs from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = bcryptjs.hashSync("admin123", 10);
  const customerPassword = bcryptjs.hashSync("customer123", 10);

  await prisma.user.upsert({
    where: { email: "admin@creative-ideas.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@creative-ideas.com",
      password: adminPassword,
      role: "admin",
      phone: "+1234567890",
    },
  });

  await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "customer@example.com",
      password: customerPassword,
      role: "customer",
      phone: "+1987654321",
      address: "123 Main St",
      city: "New York",
      country: "US",
      zipCode: "10001",
    },
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "electronics" },
      update: {},
      create: {
        name: "Electronics",
        slug: "electronics",
        description: "Latest gadgets and electronic devices",
        image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400",
      },
    }),
    prisma.category.upsert({
      where: { slug: "clothing" },
      update: {},
      create: {
        name: "Clothing",
        slug: "clothing",
        description: "Trendy fashion and apparel",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
      },
    }),
    prisma.category.upsert({
      where: { slug: "home-decor" },
      update: {},
      create: {
        name: "Home & Decor",
        slug: "home-decor",
        description: "Beautiful home decoration items",
        image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400",
      },
    }),
    prisma.category.upsert({
      where: { slug: "books" },
      update: {},
      create: {
        name: "Books",
        slug: "books",
        description: "Best sellers and new releases",
        image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400",
      },
    }),
    prisma.category.upsert({
      where: { slug: "accessories" },
      update: {},
      create: {
        name: "Accessories",
        slug: "accessories",
        description: "Stylish accessories for every occasion",
        image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400",
      },
    }),
  ]);

  const products = [
    { name: "Wireless Bluetooth Headphones", slug: "wireless-bluetooth-headphones", description: "Premium noise-cancelling wireless headphones with 30-hour battery life.", price: 79.99, salePrice: 59.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600", stock: 50, featured: true, categoryId: categories[0].id },
    { name: "Smart Watch Pro", slug: "smart-watch-pro", description: "Advanced smartwatch with health monitoring, GPS tracking, and 7-day battery.", price: 199.99, salePrice: 149.99, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600", stock: 30, featured: true, categoryId: categories[0].id },
    { name: "USB-C Fast Charger", slug: "usb-c-fast-charger", description: "65W GaN USB-C fast charger compatible with laptops, tablets, and phones.", price: 34.99, image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600", stock: 100, featured: false, categoryId: categories[0].id },
    { name: "Classic Denim Jacket", slug: "classic-denim-jacket", description: "Timeless denim jacket crafted from premium cotton.", price: 89.99, salePrice: 69.99, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600", stock: 40, featured: true, categoryId: categories[1].id },
    { name: "Premium Cotton T-Shirt", slug: "premium-cotton-tshirt", description: "Ultra-soft 100% organic cotton t-shirt in multiple colors.", price: 29.99, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600", stock: 200, featured: false, categoryId: categories[1].id },
    { name: "Running Sneakers", slug: "running-sneakers", description: "Lightweight running shoes with responsive cushioning.", price: 119.99, salePrice: 89.99, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600", stock: 60, featured: true, categoryId: categories[1].id },
    { name: "Minimalist Desk Lamp", slug: "minimalist-desk-lamp", description: "Modern LED desk lamp with adjustable brightness.", price: 45.99, image: "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600", stock: 75, featured: false, categoryId: categories[2].id },
    { name: "Ceramic Plant Pot Set", slug: "ceramic-plant-pot-set", description: "Set of 3 handcrafted ceramic plant pots in earthy tones.", price: 39.99, salePrice: 29.99, image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600", stock: 45, featured: true, categoryId: categories[2].id },
    { name: "The Art of Programming", slug: "art-of-programming", description: "A comprehensive guide to modern software development.", price: 49.99, salePrice: 34.99, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600", stock: 100, featured: true, categoryId: categories[3].id },
    { name: "Creative Thinking Handbook", slug: "creative-thinking-handbook", description: "Unlock your creative potential with proven techniques.", price: 24.99, image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600", stock: 80, featured: false, categoryId: categories[3].id },
    { name: "Leather Crossbody Bag", slug: "leather-crossbody-bag", description: "Genuine leather crossbody bag with adjustable strap.", price: 69.99, salePrice: 54.99, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600", stock: 35, featured: true, categoryId: categories[4].id },
    { name: "Polarized Sunglasses", slug: "polarized-sunglasses", description: "UV400 polarized sunglasses with lightweight metal frame.", price: 44.99, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600", stock: 90, featured: false, categoryId: categories[4].id },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  const settings = [
    { key: "store_name", value: "Creative Ideas Store" },
    { key: "store_email", value: "info@creative-ideas.com" },
    { key: "store_phone", value: "+1234567890" },
    { key: "currency", value: "USD" },
    { key: "tax_rate", value: "0.08" },
    { key: "shipping_flat_rate", value: "5.99" },
    { key: "free_shipping_threshold", value: "50" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log("Database seeded successfully!");
  console.log("Admin: admin@creative-ideas.com / admin123");
  console.log("Customer: customer@example.com / customer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
