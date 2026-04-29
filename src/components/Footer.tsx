import Link from "next/link";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Creative Ideas</h3>
            <p className="text-sm">
              Your one-stop shop for creative products. Quality items at great
              prices with fast shipping and excellent customer service.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-indigo-400 transition">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-indigo-400 transition">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/orders/track" className="hover:text-indigo-400 transition">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-indigo-400 transition">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-indigo-400 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-400 transition">
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href={`https://wa.me/${process.env.WHATSAPP_PHONE || "1234567890"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-400 transition flex items-center gap-1"
                >
                  <MessageCircle size={14} />
                  WhatsApp Support
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={14} />
                info@creative-ideas.com
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} />
                +1 (234) 567-890
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} />
                123 Creative St, Innovation City
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Creative Ideas Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
