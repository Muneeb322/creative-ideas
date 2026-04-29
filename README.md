# Creative Ideas Store - E-Commerce Platform

A full-featured e-commerce platform built with **Next.js 16**, **Prisma 7**, **SQLite**, **Tailwind CSS**, and **AI integration**.

## Features

### Storefront
- Product catalog with categories, search, and filtering
- Product detail pages with reviews and related products
- Shopping cart with persistent state (Zustand)
- Secure checkout with multiple payment options
- Order tracking with progress visualization

### Admin Panel
- Dashboard with analytics (revenue, orders, customers)
- Product management (CRUD with image URLs, categories, pricing)
- Order management with status updates
- User management
- Real-time email + WhatsApp notifications on order updates

### Payment Integration
- **Stripe** integration for secure card payments
- Cash on Delivery (COD) option
- SSL-encrypted checkout

### Order Tracking
- **Email notifications** via Nodemailer (SMTP) - order confirmation & status updates
- **WhatsApp notifications** via wa.me API links (free, no API key needed)
- Visual order progress tracker
- Track by order number

### AI Integration
- **AI Chatbot** powered by Google Gemini (free tier) for customer support
- Product recommendations
- Fallback responses when API is not configured

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes (Route Handlers)
- **Database**: SQLite via Prisma 7 + better-sqlite3 adapter
- **Auth**: JWT-based with httpOnly cookies (jose library)
- **State**: Zustand with persistence
- **Payment**: Stripe
- **Email**: Nodemailer (SMTP)
- **WhatsApp**: wa.me deep links (free)
- **AI**: Google Gemini API (free tier)
- **Icons**: Lucide React

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Set up database
```bash
npx prisma generate
npx prisma migrate dev
npm run db:seed
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts

| Role     | Email                        | Password    |
|----------|------------------------------|-------------|
| Admin    | admin@creative-ideas.com     | admin123    |
| Customer | customer@example.com         | customer123 |

## Environment Variables

See `.env.example` for all required environment variables:

- `DATABASE_URL` - SQLite database path
- `AUTH_SECRET` - JWT signing secret
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` - Stripe API keys
- `SMTP_HOST` / `SMTP_USER` / `SMTP_PASSWORD` - Email configuration
- `WHATSAPP_PHONE` - WhatsApp business phone number
- `GEMINI_API_KEY` - Google Gemini API key (free tier)

## Scripts

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run db:seed    # Seed database
npm run db:migrate # Run migrations
npm run db:studio  # Open Prisma Studio
```
