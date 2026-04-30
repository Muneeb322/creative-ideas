# Testing the Creative Ideas E-Commerce Platform

## Setup

```bash
npm install
npx prisma generate
npx prisma db push   # Use db push instead of migrate dev if the SQLite file was wiped
npx tsx prisma/seed.ts
npm run dev
```

The dev server runs on `http://localhost:3000`.

**Important**: The SQLite database file (`dev.db`) lives at the project root (not in `prisma/`), controlled by `DATABASE_URL="file:./dev.db"` in `.env`. If the DB file gets wiped (0 bytes or missing tables), delete it and re-run `npx prisma db push && npx tsx prisma/seed.ts`. Note that `prisma migrate dev` may report "Already in sync" even when the DB is empty — use `prisma db push` as a more reliable alternative.

## Demo Accounts

| Role     | Email                        | Password    |
|----------|------------------------------|-------------|
| Admin    | admin@creative-ideas.com     | admin123    |
| Customer | customer@example.com         | customer123 |

## Key Routes

### Storefront
- `/` — Homepage (hero, categories, featured products)
- `/products` — Product catalog with filtering/search
- `/products/[slug]` — Product detail page
- `/cart` — Shopping cart
- `/checkout` — Checkout (requires login)
- `/orders/[orderNumber]` — Order detail with progress tracker
- `/orders/track` — Track order by number
- `/login`, `/register` — Auth pages

### Admin Panel
- `/admin` — Dashboard (revenue, orders, products, customers stats)
- `/admin/products` — Product list with CRUD
- `/admin/products/new` — Add new product
- `/admin/products/[id]` — Edit product
- `/admin/orders` — Orders list
- `/admin/orders/[id]` — Order detail with status/tracking update
- `/admin/users` — User management

## Testing Tips

### Admin Order Detail Navigation
The admin orders list (`/admin/orders`) links to order detail pages using the database `id` (CUID), not the order number. If the eye icon in the Actions column is hard to click, navigate directly via `/admin/orders/{orderId}`. Query the DB to get the order ID:
```bash
python3 -c "import sqlite3; conn = sqlite3.connect('dev.db'); c = conn.cursor(); c.execute('SELECT id, orderNumber FROM \"Order\"'); [print(r) for r in c.fetchall()]; conn.close()"
```

### Cart State
The cart uses Zustand with localStorage persistence. After placing an order, the cart is cleared. If you need to re-test checkout, add items to cart again via the product cards' cart buttons.

### Login Redirects
- Customer login → redirects to `/`
- Admin login → redirects to `/admin`
- Accessing `/admin/*` without admin role → redirects to `/login`

### Calculations
- Tax: 8% of subtotal
- Shipping: $5.99 (free for orders over $50)
- Example: Wireless Bluetooth Headphones ($59.99) → Subtotal $59.99, Shipping Free, Tax $4.80, Total $64.79

### External Services (Optional)
These features degrade gracefully without configuration:
- **AI Chatbot**: Requires `GEMINI_API_KEY` in `.env`. Without it, returns hardcoded fallback responses.
- **Email**: Requires SMTP settings (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`). Without them, the toast still says "Email notification sent" but no email is delivered.
- **Stripe**: Requires `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY`. Use Cash on Delivery for testing without Stripe.
- **WhatsApp**: Uses free wa.me deep links — no API key needed.

## Devin Secrets Needed
- `GEMINI_API_KEY` — For AI chatbot with real Gemini responses (optional)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — For real email delivery (optional)
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` — For Stripe card payments (optional)

All secrets are optional — the app works fully with Cash on Delivery, fallback chatbot, and toast-only email notifications.
