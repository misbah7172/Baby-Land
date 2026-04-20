# babyland Platform — Complete Build Guide

> **Purpose**: This document is a complete, phase-by-phase reconstruction guide for the babyland e-commerce platform. Follow each phase sequentially to build the entire website from scratch. Every configuration, model, API endpoint, component, page, and deployment detail is included.

---

## Table of Contents

- [Phase 1: Project Setup & Foundation](#phase-1-project-setup--foundation)
- [Phase 2: Database Design & Prisma Setup](#phase-2-database-design--prisma-setup)
- [Phase 3: Core Libraries & Utilities](#phase-3-core-libraries--utilities)
- [Phase 4: Authentication System](#phase-4-authentication-system)
- [Phase 5: UI Component Library](#phase-5-ui-component-library)
- [Phase 6: Layout Components & App Shell](#phase-6-layout-components--app-shell)
- [Phase 7: Product System](#phase-7-product-system)
- [Phase 8: Categories, Brands & Attributes](#phase-8-categories-brands--attributes)
- [Phase 9: Cart & Wishlist](#phase-9-cart--wishlist)
- [Phase 10: Order & Checkout System](#phase-10-order--checkout-system)
- [Phase 11: User Account Management](#phase-11-user-account-management)
- [Phase 12: Admin Panel — Layout & Dashboard](#phase-12-admin-panel--layout--dashboard)
- [Phase 13: Admin Panel — Resource Management](#phase-13-admin-panel--resource-management)
- [Phase 14: Advanced Features](#phase-14-advanced-features)
- [Phase 15: State Management (Zustand Stores)](#phase-15-state-management-zustand-stores)
- [Phase 16: Styling & Design System](#phase-16-styling--design-system)
- [Phase 17: Docker & Deployment](#phase-17-docker--deployment)
- [Phase 18: Performance, SEO & Caching](#phase-18-performance-seo--caching)
- [Complete API Reference](#complete-api-reference)
- [Complete File Structure](#complete-file-structure)

---

## Phase 1: Project Setup & Foundation

### 1.1 Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥20.19.0 | Runtime |
| npm/pnpm | Latest | Package manager |
| MariaDB / MySQL 8.0 | Latest | Database |
| Redis | 7.x | Caching (optional, falls back to in-memory) |
| Firebase Project | — | Google/Facebook auth + storage |
| Git | Latest | Version control |

### 1.2 Create Next.js Project

```bash
npx create-next-app@latest babyland-ecommerce --typescript --tailwind --eslint --app --src-dir=false --turbopack
cd babyland-ecommerce
```

### 1.3 Install All Dependencies

```bash
# Core
npm install next@16.1.6 react@19.2.3 react-dom@19.2.3

# Database
npm install prisma@7.3.0 @prisma/client@7.4.0 @prisma/adapter-mariadb@7.4.0 mariadb@3.5.1

# Authentication
npm install jose@6.0.14 bcryptjs@3.0.2 firebase@12.8.0 firebase-admin@13.6.1

# State Management
npm install zustand@5.0.11

# UI & Styling
npm install tailwindcss@4.1.10 @tailwindcss/postcss@4.1.10
npm install lucide-react@0.563.0 clsx@2.1.1 tailwind-merge@3.4.0

# Forms & Validation
npm install react-hook-form@7.71.1 @hookform/resolvers@5.1.0 zod@4.3.6

# Charts & PDF
npm install recharts@3.7.0 jspdf@3.0.1 html2canvas@1.4.1

# Image Processing
npm install sharp@0.33.5

# Email
npm install nodemailer@7.0.5

# Smooth Scrolling
npm install lenis@latest

# Dev Dependencies
npm install -D typescript@5 @types/react @types/react-dom @types/bcryptjs @types/nodemailer
npm install -D prisma@7.3.0 eslint @eslint/eslintrc
```

### 1.4 Folder Structure

Create the following directory structure:

```
babyland-ecommerce/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── page.tsx
│   ├── about/page.tsx
│   ├── account/
│   │   ├── page.tsx
│   │   ├── addresses/page.tsx
│   │   ├── orders/page.tsx
│   │   └── settings/page.tsx
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── login/page.tsx
│   │   ├── attributes/page.tsx
│   │   ├── banners/page.tsx
│   │   ├── brands/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── expenses/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── outlets/page.tsx
│   │   ├── products/page.tsx
│   │   ├── reviews/page.tsx
│   │   ├── settings/page.tsx
│   │   └── users/page.tsx
│   ├── api/
│   │   ├── admin/ (see API Reference)
│   │   ├── attributes/route.ts
│   │   ├── auth/ (9 routes — login, register, logout, me, firebase, forgot-password, reset-password, verify, change-email)
│   │   ├── brands/route.ts
│   │   ├── cart/ (2 routes)
│   │   ├── categories/ (3 routes)
│   │   ├── contact/route.ts
│   │   ├── currency/route.ts
│   │   ├── health/route.ts
│   │   ├── orders/ (3 routes — route.ts, [id]/route.ts, guest/route.ts)
│   │   ├── outlets/route.ts
│   │   ├── products/ (3 routes)
│   │   ├── search/route.ts
│   │   ├── settings/route.ts
│   │   ├── upload/image/route.ts
│   │   ├── uploads/[...path]/route.ts
│   │   ├── user/ (5 routes — profile, password, change-password, addresses, addresses/[id])
│   │   ├── user-location/route.ts
│   │   └── wishlist/ (2 routes)
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   ├── contact/page.tsx
│   ├── faq/page.tsx
│   ├── login/page.tsx
│   ├── maintenance/page.tsx              ← NEW: Branded maintenance mode page
│   ├── order-confirmation/[orderId]/page.tsx
│   ├── outlets/page.tsx
│   ├── privacy/page.tsx
│   ├── product/[slug]/page.tsx
│   ├── register/page.tsx
│   ├── reset-password/page.tsx           ← NEW: Firebase + SMTP hybrid reset
│   ├── returns/page.tsx
│   ├── search/page.tsx
│   ├── shipping/page.tsx
│   ├── shop/page.tsx
│   ├── shop/[category]/page.tsx
│   ├── size-guide/page.tsx
│   ├── terms/page.tsx
│   ├── track/page.tsx
│   └── wishlist/page.tsx
├── components/
│   ├── SearchBar.tsx
│   ├── SmoothScroll.tsx                  ← NEW: Lenis smooth scroll wrapper
│   ├── StoreInitializer.tsx
│   ├── admin/
│   │   ├── AdminLayout.tsx
│   │   └── settings/
│   │       ├── SettingsSaveBar.tsx
│   │       ├── SettingsToggle.tsx
│   │       ├── SocialSettings.tsx        ← NEW: Messenger + WhatsApp + social links config
│   │       └── ... (other settings tab components)
│   ├── charts/ (lazy-loaded recharts wrappers)
│   ├── layout/
│   │   ├── Header.tsx                    ← UPDATED: announcement bar + feature flags
│   │   ├── Footer.tsx                    ← UPDATED: client component + feature flags
│   │   ├── MobileMenu.tsx
│   │   ├── Breadcrumb.tsx
│   │   ├── BottomNavBar.tsx
│   │   ├── NewsletterPopup.tsx
│   │   └── index.ts
│   ├── product/
│   │   ├── ProductGallery.tsx            ← UPDATED: fullscreen lightbox modal
│   │   ├── ProductSelectors.tsx
│   │   ├── ProductDetailClient.tsx       ← UPDATED: feature flags + messenger
│   │   ├── ProductQuickView.tsx
│   │   ├── MessengerButton.tsx           ← NEW: Facebook Messenger product button
│   │   ├── RelatedProducts.tsx
│   │   └── index.ts
│   ├── review/
│   │   ├── ReviewPopup.tsx
│   │   └── ReviewSection.tsx
│   └── ui/
│       ├── Badge.tsx, Button.tsx, Card.tsx, EmptyState.tsx, Input.tsx
│       ├── Loading.tsx, Modal.tsx, Pagination.tsx, ProductCard.tsx
│       ├── QuantitySelector.tsx, Select.tsx, Skeleton.tsx, Textarea.tsx, Toast.tsx
│       └── index.ts
├── hooks/
│   ├── useFormatPrice.ts
│   ├── useSettingsGroup.ts
│   └── useUserCity.ts
├── lib/
│   ├── api-response.ts
│   ├── auth.ts
│   ├── constants.ts
│   ├── email.ts
│   ├── firebase.ts
│   ├── helpers.ts
│   ├── image-loader.ts
│   ├── middleware.ts
│   ├── prisma.ts
│   ├── redis.ts
│   ├── server-cache.ts
│   └── validations.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   ├── icons/
│   └── images/
├── store/
│   ├── auth.ts
│   ├── cart.ts
│   ├── categories.ts
│   ├── features.ts                       ← NEW: Feature flags store (advanced + social settings)
│   ├── index.ts
│   ├── locale.ts
│   ├── products.ts
│   ├── ui.ts
│   └── wishlist.ts
├── types/
│   └── index.ts
├── utils/
│   └── helpers.ts
├── instrumentation.ts
├── middleware.ts                          ← UPDATED: admin auth + maintenance mode + IP blacklist + DDoS rate limiting + security headers
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
├── prisma.config.ts
└── package.json
```

### 1.5 Configuration Files

#### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/uploads/:path*', destination: '/api/uploads/:path*' }
    ];
  },
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      },
      {
        source: '/_next/image/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }
        ]
      },
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }
        ]
      }
    ];
  },
  images: {
    loaderFile: './lib/image-loader.ts',
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
  },
};

export default nextConfig;
```

#### `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0a0a0a",
        secondary: "#1a1a1a",
        accent: "#c9a96e",
        "accent-dark": "#b8944f",
        "accent-light": "#d4b87a",
        "accent-rose": "#d4a5a5",
        cream: "#faf8f5",
        "cream-dark": "#f0ece5",
        surface: "#ffffff",
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",
      },
      fontFamily: {
        sans: ["var(--font-lato)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
```

#### `postcss.config.mjs`

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

#### `eslint.config.mjs`

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  { rules: { "@typescript-eslint/no-explicit-any": "off", "@typescript-eslint/no-unused-vars": "off" } }
];

export default eslintConfig;
```

### 1.6 Environment Variables

Create `.env` file:

```env
# Database
DATABASE_URL="mysql://babyland:your_password@localhost:3306/babyland_ecommerce"
MYSQL_URL="mysql://babyland:your_password@localhost:3306/babyland_ecommerce"

# Redis (optional — falls back to in-memory if not set)
REDIS_URL="redis://localhost:6379"

# Auth
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-long"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# Firebase Client (for Google/Facebook auth)
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abc123"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"

# Firebase Admin (server-side verification)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# App
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Seeding
SEED_DATABASE="true"

# SMTP (fallback if not configured in admin panel)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="your-email@gmail.com"
```

---

## Phase 2: Database Design & Prisma Setup

### 2.1 Prisma Configuration

#### `prisma.config.ts`

```typescript
import path from 'node:path'
import { defineConfig } from 'prisma/config'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  migrate: {
    schema: path.join(__dirname, 'prisma', 'schema.prisma'),
    datasource: {
      url: process.env.DATABASE_URL || process.env.MYSQL_URL || '',
    },
  },
})
```

### 2.2 Complete Prisma Schema

Create `prisma/schema.prisma` — This is the most critical file. It defines all 22 models and 7 enums.

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters", "strictUndefinedChecks"]
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ═══════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════

enum UserRole {
  USER
  ADMIN
}

enum ProductUnit {
  PC
  KG
  G
  L
  ML
  M
  CM
  SET
  PAIR
  BOX
}

enum DiscountType {
  FLAT
  PERCENTAGE
}

enum StockVisibility {
  SHOW_QUANTITY
  SHOW_TEXT
  HIDE
}

enum AttributeType {
  SELECT
  MULTISELECT
  TEXT
  COLOR
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum OperationalCategory {
  SALARY
  RENT
  UTILITIES
  SOFTWARE
  DOMAIN_HOSTING
  PACKAGING_MATERIALS
  OFFICE_SUPPLIES
  TRANSPORT
  MISCELLANEOUS
}

// ═══════════════════════════════════════════════
// MODELS
// ═══════════════════════════════════════════════

model User {
  id            String     @id @default(cuid())
  email         String     @unique
  password      String
  name          String
  phone         String?
  gender        String?
  role          UserRole   @default(USER)
  emailVerified DateTime?
  phoneVerified DateTime?              // ← NEW: OTP phone verification timestamp
  image         String?
  marketingOptIn Boolean  @default(false)
  whatsappPhone  String?

  // Admin-controlled user management flags
  isBlocked     Boolean   @default(false)
  isCodEnabled  Boolean   @default(true)
  isHighRisk    Boolean   @default(false)
  blockReason   String?
  adminNotes    String?   @db.Text

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  addresses     Address[]
  orders        Order[]
  reviews       Review[]
  cart          Cart?
  wishlist      Wishlist[]

  @@index([email])
  @@map("users")
}

model Address {
  id         String   @id @default(cuid())
  userId     String?                       // ← OPTIONAL for guest checkout
  fullName   String
  phone      String
  street     String
  city       String
  state      String?
  postalCode String
  country    String   @default("Bangladesh")
  isDefault  Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user   User?   @relation(fields: [userId], references: [id], onDelete: Cascade)
  orders Order[]

  @@index([userId])
  @@map("addresses")
}

model Category {
  id                String    @id @default(cuid())
  name              String
  slug              String    @unique
  description       String?   @db.Text
  image             String?   @db.Text
  parentId          String?   @map("parent_id")
  isActive          Boolean   @default(true) @map("is_active")
  showInHeader      Boolean   @default(true) @map("show_in_header")
  displayOrder      Int       @default(0) @map("display_order")
  subcategories     Json?     @db.Json
  subcategoryImages Json?     @db.Json @map("subcategory_images")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  products Product[]

  @@map("categories")
}

model Brand {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?  @db.Text
  logo        String?  @db.Text
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  products Product[]

  @@map("brands")
}

model Product {
  id                  String          @id @default(cuid())
  name                String
  slug                String          @unique
  description         String?         @db.LongText
  shortDescription    String?         @db.Text @map("short_description")
  sku                 String?
  barcode             String?
  price               Decimal         @db.Decimal(10, 2)
  compareAtPrice      Decimal?        @db.Decimal(10, 2) @map("compare_at_price")
  costPrice           Decimal?        @db.Decimal(10, 2) @map("cost_price")
  discountType        DiscountType?   @map("discount_type")
  discountValue       Decimal?        @db.Decimal(10, 2) @map("discount_value")
  unit                ProductUnit     @default(PC)
  stock               Int             @default(0)
  lowStockThreshold   Int             @default(5) @map("low_stock_threshold")
  stockVisibility     StockVisibility @default(SHOW_QUANTITY) @map("stock_visibility")
  weight              Decimal?        @db.Decimal(8, 2)
  categoryId          String?         @map("category_id")
  subcategory         String?
  brandId             String?         @map("brand_id")
  tags                String?         @db.Text
  metaTitle           String?         @db.Text @map("meta_title")
  metaDescription     String?         @db.Text @map("meta_description")
  isActive            Boolean         @default(true) @map("is_active")
  isFeatured          Boolean         @default(false) @map("is_featured")
  isSpecialOffer      Boolean         @default(false) @map("is_special_offer")
  isNewArrival        Boolean         @default(false) @map("is_new_arrival")
  isFlashSale         Boolean         @default(false) @map("is_flash_sale")
  isStockClearance    Boolean         @default(false) @map("is_stock_clearance")
  isSpecialDay        Boolean         @default(false) @map("is_special_day")
  isPremiumDrop       Boolean         @default(false) @map("is_premium_drop")
  isArtisanCollection Boolean        @default(false) @map("is_artisan_collection")
  flashSaleEnd        DateTime?       @map("flash_sale_end")
  instantDelivery     Boolean         @default(false) @map("instant_delivery")
  storageCities       Json?           @db.Json @map("storage_cities")
  createdAt           DateTime        @default(now()) @map("created_at")
  updatedAt           DateTime        @updatedAt @map("updated_at")

  category    Category?          @relation(fields: [categoryId], references: [id])
  brand       Brand?             @relation(fields: [brandId], references: [id])
  images      ProductImage[]
  variants    ProductVariant[]
  attributes  ProductAttribute[]
  cartItems   CartItem[]
  wishlist    Wishlist[]
  orderItems  OrderItem[]
  reviews     Review[]
  costs       ProductCost[]

  @@index([categoryId])
  @@index([brandId])
  @@index([slug])
  @@index([isActive])
  @@index([isFeatured])
  @@index([isSpecialOffer])
  @@index([isNewArrival])
  @@index([isFlashSale])
  @@index([price])
  @@index([createdAt])
  @@index([categoryId, isActive])
  @@index([isActive, isFeatured])
  @@index([isActive, createdAt])
  @@map("products")
}

model ProductImage {
  id        String   @id @default(cuid())
  productId String   @map("product_id")
  url       String   @db.Text
  alt       String?
  position  Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at")

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_images")
}

model ProductVariant {
  id              String   @id @default(cuid())
  productId       String   @map("product_id")
  size            String?
  color           String?
  sku             String?
  stock           Int      @default(0)
  priceAdjustment Decimal  @default(0) @db.Decimal(10, 2) @map("price_adjustment")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  product   Product               @relation(fields: [productId], references: [id], onDelete: Cascade)
  cartItems CartItem[]
  values    ProductVariantValue[]

  @@map("product_variants")
}

model ProductAttribute {
  id        String        @id @default(cuid())
  productId String?       @map("product_id")
  name      String
  type      AttributeType @default(SELECT)
  values    Json          @db.Json
  isActive  Boolean       @default(true) @map("is_active")
  position  Int           @default(0)
  createdAt DateTime      @default(now()) @map("created_at")
  updatedAt DateTime      @updatedAt @map("updated_at")

  product        Product?              @relation(fields: [productId], references: [id], onDelete: Cascade)
  variantValues  ProductVariantValue[]

  @@map("product_attributes")
}

model ProductVariantValue {
  id          String @id @default(cuid())
  variantId   String @map("variant_id")
  attributeId String @map("attribute_id")
  value       String

  variant   ProductVariant   @relation(fields: [variantId], references: [id], onDelete: Cascade)
  attribute ProductAttribute @relation(fields: [attributeId], references: [id], onDelete: Cascade)

  @@map("product_variant_values")
}

model Cart {
  id        String     @id @default(cuid())
  userId    String     @unique @map("user_id")
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")

  user  User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items CartItem[]

  @@map("carts")
}

model CartItem {
  id        String   @id @default(cuid())
  cartId    String   @map("cart_id")
  productId String   @map("product_id")
  variantId String?  @map("variant_id")
  quantity  Int      @default(1)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  cart    Cart            @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product Product         @relation(fields: [productId], references: [id], onDelete: Cascade)
  variant ProductVariant? @relation(fields: [variantId], references: [id])

  @@unique([cartId, productId, variantId])
  @@map("cart_items")
}

model Wishlist {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  productId String   @map("product_id")
  createdAt DateTime @default(now()) @map("created_at")

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
  @@map("wishlists")
}

model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique
  userId          String?                          // ← OPTIONAL for guest checkout
  addressId       String?
  status          OrderStatus @default(PENDING)
  subtotal        Decimal     @db.Decimal(10, 2)
  shippingCost    Decimal     @default(0) @db.Decimal(10, 2)
  discount        Decimal     @default(0) @db.Decimal(10, 2)
  total           Decimal     @db.Decimal(10, 2)
  paymentMethod   String
  paymentStatus   String      @default("pending")
  shippingAddressId String?
  notes           String?     @db.Text
  trackingNumber  String?

  // Guest checkout fields                          ← NEW
  guestEmail      String?
  guestPhone      String?
  guestName       String?

  // Marketing & Analytics metadata
  altPhone        String?
  marketingConsent Boolean  @default(false)
  ipAddress       String?
  userAgent       String?  @db.Text
  deviceType      String?
  browser         String?
  os              String?
  screenRes       String?
  language        String?
  referrer        String?  @db.Text
  city            String?
  region          String?
  countryCode     String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  user            User?      @relation(fields: [userId], references: [id])
  shippingAddress Address?   @relation(fields: [shippingAddressId], references: [id])
  items           OrderItem[]
  statusHistory   OrderStatusHistory[]

  @@index([userId])
  @@index([orderNumber])
  @@index([status])
  @@map("orders")
}

model OrderItem {
  id            String  @id @default(cuid())
  orderId       String  @map("order_id")
  productId     String  @map("product_id")
  productName   String  @map("product_name")
  productImage  String? @db.Text @map("product_image")
  variantId     String? @map("variant_id")
  variantSize   String? @map("variant_size")
  variantColor  String? @map("variant_color")
  quantity      Int
  price         Decimal @db.Decimal(10, 2)
  total         Decimal @db.Decimal(10, 2)

  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id])

  @@map("order_items")
}

model OrderStatusHistory {
  id        String      @id @default(cuid())
  orderId   String      @map("order_id")
  status    OrderStatus
  note      String?     @db.Text
  createdAt DateTime    @default(now()) @map("created_at")

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@map("order_status_history")
}

model Review {
  id             String   @id @default(cuid())
  userId         String   @map("user_id")
  productId      String   @map("product_id")
  orderId        String?  @map("order_id")
  rating         Int
  comment        String?  @db.Text
  isApproved     Boolean  @default(false) @map("is_approved")
  showOnHomepage Boolean  @default(false) @map("show_on_homepage")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
  @@map("reviews")
}

model Outlet {
  id        String   @id @default(cuid())
  name      String
  address   String   @db.Text
  phone     String?
  email     String?
  latitude  Decimal? @db.Decimal(10, 8)
  longitude Decimal? @db.Decimal(11, 8)
  hours     String?  @db.Text
  image     String?  @db.Text
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("outlets")
}

model Banner {
  id              String    @id @default(cuid())
  title           String
  subtitle        String?   @db.Text
  image           String    @db.Text
  mobileImage     String?   @db.Text @map("mobile_image")
  link            String?
  buttonText      String?   @map("button_text")
  buttonStyle     String?   @map("button_style")
  textColor       String?   @map("text_color")
  overlayColor    String?   @map("overlay_color")
  overlayOpacity  Decimal?  @db.Decimal(3, 2) @map("overlay_opacity")
  position        Int       @default(0)
  type            String    @default("hero")
  isActive        Boolean   @default(true) @map("is_active")
  startDate       DateTime? @map("start_date")
  endDate         DateTime? @map("end_date")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  @@map("banners")
}

model Newsletter {
  id        String   @id @default(cuid())
  email     String   @unique
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("newsletters")
}

model Contact {
  id        String   @id @default(cuid())
  name      String
  email     String
  subject   String?
  message   String   @db.Text
  isRead    Boolean  @default(false) @map("is_read")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("contacts")
}

model ProductCost {
  id             String   @id @default(cuid())
  productId      String   @map("product_id")
  purchaseCost   Decimal  @db.Decimal(10, 2) @map("purchase_cost")
  importCost     Decimal  @default(0) @db.Decimal(10, 2) @map("import_cost")
  packagingCost  Decimal  @default(0) @db.Decimal(10, 2) @map("packaging_cost")
  warehouseCost  Decimal  @default(0) @db.Decimal(10, 2) @map("warehouse_cost")
  notes          String?  @db.Text
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_costs")
}

model MarketingExpense {
  id          String   @id @default(cuid())
  platform    String
  campaignName String  @map("campaign_name")
  spend       Decimal  @db.Decimal(10, 2)
  orders      Int      @default(0)
  revenue     Decimal  @default(0) @db.Decimal(10, 2)
  clicks      Int      @default(0)
  impressions Int      @default(0)
  startDate   DateTime @map("start_date")
  endDate     DateTime? @map("end_date")
  notes       String?  @db.Text
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("marketing_expenses")
}

model OperationalExpense {
  id          String              @id @default(cuid())
  category    OperationalCategory
  description String
  amount      Decimal             @db.Decimal(10, 2)
  date        DateTime
  recurring   Boolean             @default(false)
  notes       String?             @db.Text
  createdAt   DateTime            @default(now()) @map("created_at")
  updatedAt   DateTime            @updatedAt @map("updated_at")

  @@map("operational_expenses")
}

model CurrencySetting {
  id           String   @id @default(cuid())
  currencyCode String   @unique @map("currency_code")
  currencyName String   @map("currency_name")
  symbol       String
  exchangeRate Decimal  @db.Decimal(10, 4) @map("exchange_rate")
  extraCharge  Decimal  @default(0) @db.Decimal(10, 2) @map("extra_charge")
  minimumItems Int      @default(1) @map("minimum_items")
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@map("currency_settings")
}

model SiteSetting {
  id        String   @id @default(cuid())
  group     String
  key       String
  value     String   @db.LongText
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@unique([group, key])
  @@map("site_settings")
}
```

### 2.3 Database Initialization

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Or create migration (production)
npx prisma migrate dev --name init

# Seed the database
npx prisma db seed
```

### 2.4 Seed File (`prisma/seed.ts`)

The seed creates:
- **1 Admin user**: `admin@babyland.com` / `admin123` (role: ADMIN)
- **1 Regular user**: `user@babyland.com` / `user123`
- **6 Categories**: Men, Women, Kids, Accessories, Footwear, Sports — each with subcategories and display order
- **3 Brands**: Nike, Adidas, Puma
- **10 Sample products** with variants (size/color combinations), images, stock, pricing, SKUs
- **5 Product attributes**: Size, Color, Material, Age Group, Gender
- **Default site settings**: general (siteName, logo, contactEmail), homepage (heroTitle, featuredLimit), shipping (freeShippingThreshold: 1500, defaultShippingCost: 100)

```typescript
import { PrismaClient, UserRole } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  // Create admin
  const adminPassword = await hashPassword('admin123')
  await prisma.user.upsert({
    where: { email: 'admin@babyland.com' },
    update: {},
    create: {
      email: 'admin@babyland.com',
      password: adminPassword,
      name: 'Admin',
      role: UserRole.ADMIN,
    },
  })

  // Create categories with subcategories
  const categories = [
    { name: 'Men', slug: 'men', subcategories: ['T-Shirts', 'Shirts', 'Pants', 'Jackets'], displayOrder: 1 },
    { name: 'Women', slug: 'women', subcategories: ['Tops', 'Dresses', 'Pants', 'Accessories'], displayOrder: 2 },
    { name: 'Kids', slug: 'kids', subcategories: ['Boys', 'Girls', 'Infants'], displayOrder: 3 },
    // ... more categories
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        isActive: true,
        showInHeader: true,
        displayOrder: cat.displayOrder,
        subcategories: cat.subcategories,
      },
    })
  }

  // Create brands, products with variants, attributes, default settings...
  // (Full implementation creates 10 products with images, variants, pricing)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

---

## Phase 3: Core Libraries & Utilities

### 3.1 Prisma Client (`lib/prisma.ts`)

```typescript
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import mariadb from 'mariadb'

function getDatabaseUrl(): string {
  return process.env.DATABASE_URL || process.env.MYSQL_URL || ''
}

function createPool() {
  const url = getDatabaseUrl()
  // Parse URL for Railway compatibility
  const parsed = new URL(url.replace('mysql://', 'http://'))
  return mariadb.createPool({
    host: parsed.hostname,
    port: parseInt(parsed.port || '3306'),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.slice(1),
    connectionLimit: 10,
    acquireTimeout: 30000,
    connectTimeout: 30000,
  })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const pool = createPool()
const adapter = new PrismaMariaDb(pool)

export const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
export default prisma
```

### 3.2 Authentication Library (`lib/auth.ts`)

```typescript
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from './prisma'
import crypto from 'crypto'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')
const COOKIE_NAME = 'auth-token'

// Password hashing (bcryptjs, 12 rounds)
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// JWT token generation (HS256, 7-day expiry)
export async function generateToken(payload: { userId: string; email: string; role: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch { return null }
}

// Cookie management
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function extractToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value || null
}

// Session helpers
export async function getSession() {
  const token = await extractToken()
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload) return null
  return { userId: payload.userId as string, email: payload.email as string, role: payload.role as string }
}

export async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return null
  return session
}

// Password reset tokens
export function generateResetToken(): { token: string; expiry: Date } {
  const token = crypto.randomBytes(32).toString('hex')
  const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  return { token, expiry }
}

export async function verifyResetToken(token: string) {
  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExp: { gt: new Date() } }
  })
  return user
}
```

### 3.3 API Response Helpers (`lib/api-response.ts`)

```typescript
import { NextResponse } from 'next/server'

export interface ApiResponse<T = any> {
  success: boolean; data?: T; error?: string; message?: string
}

export interface PaginatedResponse<T> {
  success: boolean; data: T[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export function successResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, message })
}

export function errorResponse(error: string, status = 400): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error }, { status })
}

export function paginatedResponse<T>(data: T[], total: number, page: number, limit: number): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json({ success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
}

export function unauthorizedResponse(msg = 'Unauthorized'): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: msg }, { status: 401 })
}

export function notFoundResponse(msg = 'Not found'): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: msg }, { status: 404 })
}

export function validationErrorResponse(errors: Record<string, string>): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: 'Validation failed', data: errors }, { status: 422 })
}
```

### 3.4 Helper Utilities (`lib/helpers.ts`)

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Tailwind class merging
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

// Multi-currency price formatting
// Formula: displayPrice = (productPriceBDT + extraCharge) / exchangeRate
export function formatPrice(price: number | string | any, currencyOverride?: string): string {
  const numPrice = typeof price === 'object' && price?.toNumber ? price.toNumber() : Number(price)
  if (isNaN(numPrice)) return '৳0'

  // Access locale store for currency detection
  const { useLocaleStore } = require('@/store/locale')
  const locale = useLocaleStore.getState()
  const currency = currencyOverride || locale.currency || 'BDT'
  const rate = locale.rates?.[currency]

  if (rate && currency !== 'BDT') {
    const converted = (numPrice + (rate.extraCharge || 0)) / rate.exchangeRate
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(converted)
  }
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(numPrice)
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
}

export function truncate(text: string, length: number): string {
  return text.length > length ? text.slice(0, length) + '...' : text
}

export function calculateDiscount(original: number, discounted: number): number {
  return Math.round(((original - discounted) / original) * 100)
}

export function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => { clearTimeout(timeout); timeout = setTimeout(() => func(...args), wait) }
}

export function formatDistanceToNow(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}
```

### 3.5 Constants (`lib/constants.ts`)

```typescript
export const APP_NAME = 'babyland'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
export const DEFAULT_PAGE_SIZE = 20

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending', CONFIRMED: 'Confirmed', PROCESSING: 'Processing',
  SHIPPED: 'Shipped', DELIVERED: 'Delivered', CANCELLED: 'Cancelled', REFUNDED: 'Refunded'
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'warning', CONFIRMED: 'info', PROCESSING: 'info',
  SHIPPED: 'primary', DELIVERED: 'success', CANCELLED: 'danger', REFUNDED: 'danger'
}

export const STORAGE_CITIES = [
  { name: 'Dhaka', lat: 23.8103, lng: 90.4125 },
  { name: 'Chattogram', lat: 22.3569, lng: 91.7832 },
  { name: 'Sylhet', lat: 24.8949, lng: 91.8687 },
  { name: 'Rajshahi', lat: 24.3745, lng: 88.6042 },
  { name: 'Khulna', lat: 22.8456, lng: 89.5403 },
  { name: 'Barishal', lat: 22.7010, lng: 90.3535 },
  { name: 'Rangpur', lat: 25.7439, lng: 89.2752 },
]

export const PAYMENT_METHODS = [
  { id: 'cod', name: 'Cash on Delivery', icon: 'Banknote' },
  { id: 'bkash', name: 'bKash', icon: 'Smartphone' },
  { id: 'nagad', name: 'Nagad', icon: 'Smartphone' },
  { id: 'card', name: 'Credit/Debit Card', icon: 'CreditCard' },
]

export const API_ROUTES = {
  AUTH: { LOGIN: '/api/auth/login', REGISTER: '/api/auth/register', LOGOUT: '/api/auth/logout', ME: '/api/auth/me', FIREBASE: '/api/auth/firebase', FORGOT_PASSWORD: '/api/auth/forgot-password', RESET_PASSWORD: '/api/auth/reset-password' },
  PRODUCTS: '/api/products',
  CATEGORIES: '/api/categories',
  BRANDS: '/api/brands',
  CART: '/api/cart',
  WISHLIST: '/api/wishlist',
  ORDERS: '/api/orders',
  REVIEWS: '/api/reviews',
  SEARCH: '/api/search',
  CONTACT: '/api/contact',
  UPLOAD: '/api/upload/image',
  SETTINGS: '/api/settings',
  CURRENCY: '/api/currency',
  HEALTH: '/api/health',
}

export const PAGE_ROUTES = {
  HOME: '/', SHOP: '/shop', CART: '/cart', WISHLIST: '/wishlist', CHECKOUT: '/checkout',
  LOGIN: '/login', REGISTER: '/register', ACCOUNT: '/account', SEARCH: '/search',
  CONTACT: '/contact', ABOUT: '/about', FAQ: '/faq', PRIVACY: '/privacy', TERMS: '/terms',
  SHIPPING: '/shipping', RETURNS: '/returns', SIZE_GUIDE: '/size-guide', TRACK: '/track',
  OUTLETS: '/outlets', ADMIN: '/admin', ADMIN_LOGIN: '/admin/login',
}

export const STORAGE_KEYS = {
  GUEST_CART: 'babyland_guest_cart',
  LOCALE: 'babyland-locale-v3',
  RECENT_SEARCHES: 'babyland_recent_searches',
  NEWSLETTER_DISMISSED: 'babyland_newsletter_dismissed',
  REVIEW_DISMISSED: 'babyland_review_dismissed',
}

export const VALIDATION = {
  PASSWORD_MIN: 6, PASSWORD_MAX: 100,
  NAME_MIN: 2, NAME_MAX: 100,
  PHONE_MIN: 10, PHONE_MAX: 15,
}

export const DEFAULT_SEO = {
  title: 'babyland | Fashion & Comfort',
  description: 'Shop for Men\'s, Women\'s and Kids\' Fashion at babyland',
  keywords: 'fashion, clothing, online shopping, Bangladesh',
}

export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/babyland',
  instagram: 'https://instagram.com/babyland',
  twitter: 'https://twitter.com/babyland',
}

export const CONTACT_INFO = {
  email: 'babyland.world@gmail.com',
  phone: '+880 1XXX-XXXXXX',
  address: 'Dhaka, Bangladesh',
}
```

### 3.6 Zod Validation Schemas (`lib/validations.ts`)

```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  phone: z.string().min(10).max(15).optional(),
})

export const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(10),
  street: z.string().min(5),
  city: z.string().min(2),
  state: z.string().optional(),
  postalCode: z.string().min(4),
  country: z.string().optional(),
  isDefault: z.boolean().optional(),
})

export const productSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  description: z.string().optional(),
  stock: z.number().int().min(0).optional(),
  // ... additional product fields
})

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const addToCartSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().int().positive(),
})

export const createOrderSchema = z.object({
  shippingAddressId: z.string(),
  paymentMethod: z.string(),
  notes: z.string().optional(),
  altPhone: z.string().optional(),
  marketingOptIn: z.boolean().optional(),
})

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(10),
})

export const newsletterSchema = z.object({
  email: z.string().email(),
})

export const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

export const searchSchema = z.object({
  q: z.string().min(1),
})

// Export inferred types
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
```

### 3.7 Firebase Client (`lib/firebase.ts`)

```typescript
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

let app, auth, analytics, storage

if (!getApps().length) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  storage = getStorage(app)
  if (typeof window !== 'undefined') { analytics = getAnalytics(app) }
} else {
  app = getApps()[0]
  auth = getAuth(app)
  storage = getStorage(app)
}

export async function uploadImage(file: File, path = 'products'): Promise<string> {
  const timestamp = Date.now()
  const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
  const storageRef = ref(storage, `${path}/${fileName}`)
  await uploadBytes(storageRef, file)
  return await getDownloadURL(storageRef)
}

export { app, auth, analytics, storage }
```

### 3.8 Email Service (`lib/email.ts`)

```typescript
import nodemailer from 'nodemailer'
import { prisma } from './prisma'

// Load SMTP settings from database (admin-configurable) or fall back to env vars
async function getSmtpSettings() {
  try {
    const settings = await prisma.siteSetting.findMany({ where: { group: 'email' } })
    const map: Record<string, string> = {}
    settings.forEach(s => { map[s.key] = s.value })
    if (map.smtpHost && map.smtpUser && map.smtpPass) return map
  } catch {}
  return {
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: process.env.SMTP_PORT || '587',
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    smtpFrom: process.env.SMTP_FROM || '',
  }
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const smtp = await getSmtpSettings()
  const transporter = nodemailer.createTransport({
    host: smtp.smtpHost,
    port: parseInt(smtp.smtpPort || '587'),
    secure: smtp.smtpPort === '465',
    auth: { user: smtp.smtpUser, pass: smtp.smtpPass },
  })
  await transporter.sendMail({ from: smtp.smtpFrom || smtp.smtpUser, to, subject, html })
}

export function getPasswordResetEmailHtml(resetUrl: string, userName: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0a0a0a; padding: 20px; text-align: center;">
        <h1 style="color: #c9a96e; margin: 0;">babyland</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Password Reset Request</h2>
        <p>Hi ${userName},</p>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #c9a96e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
        <p>If you didn't request this, ignore this email.</p>
      </div>
    </div>`
}
```

### 3.9 Server Cache (`lib/server-cache.ts`)

```typescript
// Hybrid cache: Redis primary → in-memory Map fallback
// Features: TTL, prefix invalidation, in-flight deduplication, 500-key FIFO eviction

import { redis } from './redis'

class ServerCache {
  private memoryCache = new Map<string, { data: any; expiry: number }>()
  private inflightRequests = new Map<string, Promise<any>>()
  private MAX_KEYS = 500

  async get<T>(key: string, fetcher: () => Promise<T>, ttlSeconds = 60): Promise<T> {
    // Deduplicate in-flight requests
    const existing = this.inflightRequests.get(key)
    if (existing) return existing as Promise<T>

    // Check Redis first
    if (redis) {
      try {
        const cached = await redis.get(key)
        if (cached) return JSON.parse(cached)
      } catch {}
    }

    // Check memory cache
    const memEntry = this.memoryCache.get(key)
    if (memEntry && memEntry.expiry > Date.now()) return memEntry.data

    // Fetch and cache
    const promise = fetcher().then(data => {
      // Store in Redis
      if (redis) redis.setex(key, ttlSeconds, JSON.stringify(data)).catch(() => {})
      // Store in memory with eviction
      if (this.memoryCache.size >= this.MAX_KEYS) {
        const firstKey = this.memoryCache.keys().next().value
        if (firstKey) this.memoryCache.delete(firstKey)
      }
      this.memoryCache.set(key, { data, expiry: Date.now() + ttlSeconds * 1000 })
      this.inflightRequests.delete(key)
      return data
    })

    this.inflightRequests.set(key, promise)
    return promise
  }

  invalidate(key: string) {
    this.memoryCache.delete(key)
    if (redis) redis.del(key).catch(() => {})
  }

  invalidatePrefix(prefix: string) {
    // Memory: delete matching keys
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) this.memoryCache.delete(key)
    }
    // Redis: SCAN-based bulk delete
    if (redis) {
      const scan = async (cursor = '0') => {
        const [next, keys] = await redis.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', 100)
        if (keys.length) await redis.del(...keys)
        if (next !== '0') await scan(next)
      }
      scan().catch(() => {})
    }
  }

  clear() {
    this.memoryCache.clear()
    if (redis) redis.flushdb().catch(() => {})
  }
}

export const serverCache = new ServerCache()

// Warm cache on server startup
export async function warmServerCache() {
  try {
    const { prisma } = await import('./prisma')
    const categories = await prisma.category.findMany({ where: { isActive: true } })
    serverCache['memoryCache'].set('categories:all', { data: categories, expiry: Date.now() + 300000 })
    console.log('Server cache warmed successfully')
  } catch (e) {
    console.error('Cache warming failed:', e)
  }
}
```

### 3.10 Redis Client (`lib/redis.ts`)

```typescript
import Redis from 'ioredis'

let redis: Redis | null = null

if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 100, 3000),
      lazyConnect: true,
    })
    redis.connect().catch(() => { redis = null })
  } catch { redis = null }
}

export { redis }
```

### 3.11 Image Loader (`lib/image-loader.ts`)

```typescript
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`
  }
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`
}
```

### 3.12 Types (`types/index.ts`)

```typescript
export interface ApiResponse<T = any> {
  success: boolean; data?: T; error?: string; message?: string
}

export interface PaginationParams {
  page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]; total: number; page: number; limit: number; totalPages: number
}

export interface ProductFilter {
  categoryId?: string; minPrice?: number; maxPrice?: number
  sizes?: string[]; colors?: string[]; inStock?: boolean; featured?: boolean
}

export interface CartItemType {
  id: string; productId: string; variantId?: string; quantity: number; price: number
  product: { name: string; slug: string; images: { url: string }[] }
  variant?: { size?: string; color?: string }
}

export interface CreateOrderInput {
  shippingAddressId: string; paymentMethod: string
  notes?: string; altPhone?: string; marketingOptIn?: boolean
}

export interface AddressInput {
  fullName: string; phone: string; street: string; city: string
  state?: string; postalCode: string; country?: string; isDefault?: boolean
}

export interface LoginCredentials { email: string; password: string }
export interface RegisterData { name: string; email: string; password: string; phone?: string }
export interface UserSession { id: string; email: string; name: string; role: string; image?: string }
```

---

## Phase 4: Authentication System

### 4.1 Edge Middleware (`middleware.ts` — project root)

Handles five concerns: **security headers**, **admin auth**, **IP blacklist**, **per-IP rate limiting (DDoS protection)**, and **maintenance mode**.

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-only-fallback-secret')

// Security headers applied to every response
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Content-Security-Policy': "default-src 'self'; ...",
}

// Security settings cache (30s TTL) with stampede prevention
type SecurityStatus = {
  maintenanceEnabled: boolean
  maintenanceMessage: string
  ipBlacklist: string[]
  rateLimitEnabled: boolean
  rateLimitRequests: number
  rateLimitWindowMs: number
  checkedAt: number
}
let securityCache: SecurityStatus | null = null
let securityFetchInProgress: Promise<SecurityStatus> | null = null

// Edge-compatible per-IP rate limiter (in-memory sliding window)
const ipHitCounts = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = ipHitCounts.get(ip)
  if (!entry || now > entry.resetAt) {
    ipHitCounts.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }
  entry.count++
  return entry.count <= limit
}

async function getSecurityStatus(request: NextRequest) {
  if (securityCache && Date.now() - securityCache.checkedAt < 30_000) return securityCache
  if (securityFetchInProgress) return securityCache || { /* defaults */ }
  securityFetchInProgress = (async () => {
    const res = await fetch(`${request.nextUrl.origin}/api/settings?groups=security`, { signal: AbortSignal.timeout(3000) })
    if (res.ok) {
      const { security } = await res.json()
      securityCache = {
        maintenanceEnabled: security.maintenanceMode === true,
        maintenanceMessage: security.maintenanceMessage || '...',
        ipBlacklist: /* parsed from comma/newline-separated string */,
        rateLimitEnabled: security.rateLimitEnabled === true,
        rateLimitRequests: security.rateLimitRequests || 60,
        rateLimitWindowMs: (security.rateLimitWindowSeconds || 60) * 1000,
        checkedAt: Date.now(),
      }
    }
    return securityCache || { /* defaults with rateLimitEnabled: false */ }
  })()
  return await securityFetchInProgress
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1) Admin auth — JWT verification for /admin/* routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return redirect('/admin/login')
    const { payload } = await jwtVerify(token, SECRET_KEY)
    if (payload.role !== 'ADMIN') return redirect('/')
  }

  // 2) Skip static assets
  if (pathname.startsWith('/_next/') || pathname === '/maintenance') return next()

  const security = await getSecurityStatus(request)
  const clientIp = getClientIp(request)

  // 3) IP blacklist check (all routes including API)
  if (security.ipBlacklist.includes(clientIp)) return new NextResponse('Access denied', { status: 403 })

  // 4) Per-IP rate limiting — admin-toggleable DDoS protection
  if (security.rateLimitEnabled && clientIp) {
    if (!checkRateLimit(clientIp, security.rateLimitRequests, security.rateLimitWindowMs)) {
      return new NextResponse('Too Many Requests', { status: 429, headers: { 'Retry-After': '60' } })
    }
  }

  // 5) Maintenance mode (skip for API routes)
  if (!pathname.startsWith('/api/') && security.maintenanceEnabled) {
    return NextResponse.rewrite(new URL('/maintenance', request.url))
  }

  return applySecurityHeaders(NextResponse.next())
}

export const config = { matcher: ['/admin/:path*', '/((?!_next/static|_next/image|favicon.ico|icons|images).*)'] }
```

**Key features:**
- **Security headers**: CSP, HSTS, X-Frame-Options, etc. applied to every response
- **Stampede prevention**: Only one security settings fetch at a time; concurrent requests get stale cache
- **Edge-compatible rate limiter**: In-memory `Map` with sliding window, auto-cleanup every 60s
- **Admin-toggleable**: Rate limiting can be enabled/disabled from Admin → Settings → Security

### 4.2 Auth API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/register` | Register with email/password. Zod validation, bcrypt hash, JWT cookie. Enforces blacklist + registration toggle |
| POST | `/api/auth/login` | Login with email/password OR Firebase token. Sets JWT cookie |
| POST | `/api/auth/logout` | Clears auth-token cookie |
| GET | `/api/auth/me` | Returns current user from JWT session |
| POST | `/api/auth/firebase` | Verify Firebase token via Admin SDK. Auto-creates user if new |
| POST | `/api/auth/forgot-password` | Hybrid: Firebase email link OR SMTP token (admin-selectable via `passwordResetMethod` setting) |
| POST | `/api/auth/reset-password` | Verifies reset token, updates password hash |
| POST | `/api/auth/verify` | **NEW** — OTP verification for email/phone. Actions: `send` (generates 6-digit OTP) and `verify` (validates OTP, updates emailVerified/phoneVerified) |
| POST | `/api/auth/change-email` | Change email with password re-verification |

#### Key Implementation Details:

**Register** (`POST /api/auth/register`):
- Validates with `registerSchema` (name, email, password, optional phone)
- Checks if email already exists → 409
- Hashes password with bcrypt (12 rounds)
- Creates user in DB
- Generates JWT token, sets httpOnly cookie
- Returns `{ success: true, data: { user } }`

**Login** (`POST /api/auth/login`):
- Accepts `{ email, password }` or `{ firebaseToken }`
- For email/password: verifies with bcrypt
- For Firebase: verifies token via `firebase-admin`, finds/creates user
- Checks `isBlocked` → 403
- Generates JWT, sets cookie

**Firebase Auth** (`POST /api/auth/firebase`):
- Receives Firebase ID token from client
- Verifies via `admin.auth().verifyIdToken(token)`
- Upserts user by `firebaseUid` or email
- Sets JWT cookie for subsequent API calls

### 4.3 Login & Register Pages

Both pages use:
- `react-hook-form` with `@hookform/resolvers/zod`
- Firebase `GoogleAuthProvider` / `FacebookAuthProvider` via `signInWithPopup`
- `store/auth.ts` for state management
- After successful login: `useCartStore.getState().mergeGuestCart()` (pushes localStorage cart to server)
- Redirect to previous page or `/account`

---

## Phase 5: UI Component Library

### 5.1 Components Overview

| Component | Purpose |
|-----------|---------|
| `Button` | Variants: primary/secondary/outline/ghost/danger. Sizes: sm/md/lg. Loading spinner. `fullWidth` prop |
| `Input` | Label, error message, optional icon. Forwards ref |
| `Select` | Styled dropdown with label and error |
| `Textarea` | Multi-line with label and error |
| `Modal` | Dialog overlay, backdrop blur, ESC/click-outside close, body scroll lock |
| `Toast` | Toast notification system. Context + `useToast()` hook. Types: success/error/warning/info. 3s auto-dismiss |
| `Card` | Container with hover shadow, optional onClick |
| `Badge` | Color variants: primary/success/warning/danger/info |
| `Loading` | Full-page/inline spinner with custom diamond SVG animation |
| `EmptyState` | Illustration with icon, title, description, optional action |
| `Pagination` | Prev/next, page numbers, ellipsis for large ranges |
| `QuantitySelector` | +/- stepper with min/max bounds |
| `Skeleton` | Shimmer loading placeholder |
| `ProductCard` | Product image + badges + price + quick-add + wishlist heart |

### 5.2 SearchBar Component

- **Debounced** autocomplete (300ms) from `/api/products/search-suggestions`
- **Recent searches** in localStorage (max 5)
- Suggestion dropdown showing product names + category
- Click suggestion → navigate to `/product/[slug]`
- Submit → navigate to `/search?q=...`

### 5.3 Toast System

The `ToastProvider` wraps the entire app. Usage:

```typescript
import { useToast } from '@/components/ui/Toast'

const { showToast } = useToast()
showToast('Item added to cart!', 'success')

// Or imperative (from anywhere):
window.__toast?.('Error occurred', 'error')
```

---

## Phase 6: Layout Components & App Shell

### 6.1 Root Layout (`app/layout.tsx`)

```typescript
import type { Metadata } from "next"
import { Playfair_Display, Lato } from "next/font/google"
import { Header, Footer, BottomNavBar } from "@/components/layout"
import { ToastProvider } from "@/components/ui/Toast"
import StoreInitializer from "@/components/StoreInitializer"
import ReviewPopup from "@/components/review/ReviewPopup"
import SmoothScroll from "@/components/SmoothScroll"               // ← NEW: Lenis

const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], weight: ["400","500","600","700"] })
const lato = Lato({ variable: "--font-lato", subsets: ["latin"], weight: ["300","400","700"] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://babyland-ecommerce-production-e676.up.railway.app'),
  title: "babyland | Fashion & Comfort",
  description: "Shop for Men's, Women's and Kids' Fashion at the best price that looks great, is comfortable and makes you confident.",
  keywords: "fashion, clothing, mens fashion, womens fashion, kids fashion, online shopping, Bangladesh",
  alternates: { canonical: '/' },
  openGraph: {
    title: "babyland | Fashion & Comfort",
    description: "Shop for Men's, Women's and Kids' Fashion at the best price",
    type: "website", locale: "en_US", siteName: "babyland",
  },
  twitter: {
    card: 'summary',
    title: "babyland | Fashion & Comfort",
    description: "Shop for Men's, Women's and Kids' Fashion at the best price",
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${lato.variable} antialiased`}>
        <ToastProvider>
          <SmoothScroll>
            <StoreInitializer />
            <Header />
            <main className="min-h-screen pt-[60px] md:pt-[72px] pb-16 md:pb-0">{children}</main>
            <Footer />
            <BottomNavBar />
            <ReviewPopup />
          </SmoothScroll>
        </ToastProvider>
      </body>
    </html>
  )
}
```

### 6.2 Store Initializer (`components/StoreInitializer.tsx`)

Renders nothing (`return null`). On mount, runs these tasks in parallel:

1. **Feature Flags**: `fetchFlags()` → loads admin settings (advanced + social groups) for conditional UI rendering
2. **Locale**: `detectLocation()` → `fetchRates()` (geo-IP → currency detection)
3. **Categories**: `fetchHeaderCategories()` + `fetchFullCategories()` → prefetch products per category + shop page 1
4. **Auth**: `fetchUser()` → `fetchCart()` + `fetchWishlist()`

### 6.3 Layout Components

| Component | Description |
|-----------|-------------|
| `Header` | Logo, SearchBar, category mega-menu, account/wishlist/cart icons with badge counts, mobile hamburger. **NEW:** Announcement bar (from admin homepage settings, dismissible), feature flag conditionals (enableWishlist, enableOrderTracking). **UPDATED:** All icon-only links have `sr-only` text for accessibility; search inputs have `aria-label` |
| `MobileMenu` | Slide-in sidebar, category accordion with subcategories, auth links. Uses `useUIStore` |
| `Footer` | **Client component** with feature flag conditionals. Multi-column: company info, quick links, customer service, newsletter signup, social links, copyright. Track Order and Size Guide links conditionally shown. **UPDATED:** Social icon links have `sr-only` text for accessibility |
| `BottomNavBar` | Mobile-only fixed bottom nav: Home, Shop, Cart, Wishlist, Account (with badge counts) |
| `Breadcrumb` | Dynamic breadcrumb trail from `items` prop |
| `NewsletterPopup` | Timed popup (15s delay), dismissable for 7 days via localStorage |

### 6.4 Smooth Scroll (`components/SmoothScroll.tsx`) — NEW

```typescript
'use client'
import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { usePathname } from 'next/navigation'

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      infinite: false,
    })
    lenisRef.current = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => { lenis.destroy(); lenisRef.current = null }
  }, [])

  // Scroll to top on route change
  useEffect(() => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true })
  }, [pathname])

  return <>{children}</>
}
```

Requires Lenis CSS in `globals.css`:
```css
html.lenis, html.lenis body { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }
.lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
.lenis.lenis-stopped { overflow: hidden; }
```

### 6.4 Instrumentation (`instrumentation.ts`)

```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { warmServerCache } = await import('./lib/server-cache')
    warmServerCache()
  }
}
```

Warms the server cache with categories on server startup.

---

## Phase 7: Product System

### 7.1 Product API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/products` | List products with filters (category, subcategory, brand, price range, sizes, colors, tags, featured flags), pagination, sorting. 60s server cache |
| GET | `/api/products/[slug]` | Single product with images, variants, category, brand, approved reviews with stats, 4 related products |
| GET | `/api/products/search-suggestions` | Autocomplete by name LIKE %q%, limit 8, returns id/name/category/slug |

**Filtering Options** (query params):
- `category`, `subcategory`, `brand` — slug-based
- `minPrice`, `maxPrice` — price range
- `sizes`, `colors` — comma-separated
- `tags` — comma-separated
- `featured`, `specialOffer`, `newArrival`, `flashSale`, `stockClearance`, `specialDay`, `premiumDrop`, `artisanCollection` — boolean flags
- `sort` — `price-asc`, `price-desc`, `name-asc`, `name-desc`, `newest`
- `page`, `limit` — pagination (default 20)
- `search` — text search across name/description/tags/SKU

### 7.2 Product Components

| Component | Lines | Purpose |
|-----------|-------|---------|
| `ProductDetailClient` | ~582 | Main product detail page. Lazy loads Gallery, Selectors, ReviewSection. Features: breadcrumb, gallery, product info (badges, name, code, star rating, price, stock), size/color selectors, add-to-cart + wishlist, instant delivery section with geo-IP city detection, trust icons (COD/shipping/return/security), description/reviews tabs, related products |
| `ProductGallery` | — | Main image + thumbnail strip. Click to select, zoom on hover (CSS transform), swipe gestures (touch events), fullscreen lightbox modal |
| `ProductSelectors` | — | Size chips (available/unavailable by variant stock), color swatches (hex via `getColorHex()`), quantity selector with variant-aware stock limits |
| `RelatedProducts` | — | Grid of 4 related products from same category |
| `ProductQuickView` | — | Modal compact product view without navigation |
| `ProductCard` (in ui/) | — | Card with Next/Image, badges (New/Sale/Featured/Flash Sale etc.), discount price, quick-add cart, wishlist heart toggle |

### 7.3 Product Detail Page (`app/product/[slug]/page.tsx`)

- **Server component** with `generateMetadata()` for SEO
- Fetches product data server-side
- Renders `ProductDetailClient` (client component)
- ISR: `revalidate = 60`

### 7.4 Search System

**Full-text search** (`GET /api/search`):
- Searches across product name, description, tags, SKU using SQL `LIKE`
- Supports all product filters (category, subcategory, brand, price range)
- Returns: products, pagination, available filters (categories list, price range)
- 30s cache-control header

**Search page** (`app/search/page.tsx`):
- Reads `?q=` param
- Uses `useProductsStore.fetchSearch()`
- Displays product grid with filter sidebar

---

## Phase 8: Categories, Brands & Attributes

### 8.1 Category API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/categories` | All active categories. Cached |
| GET | `/api/categories/with-children` | Categories with `showInHeader=true` for mega-menu. Cached |
| GET | `/api/categories/[slug]/subcategories` | Subcategories for a specific category |

### 8.2 Brand & Attribute Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/brands` | All active brands. Cached |
| GET | `/api/attributes` | All product attributes. Cached |

### 8.3 Shop Page (`app/shop/page.tsx`)

Features:
- **Product grid** with responsive layout
- **Sidebar filters**: category, subcategory, brand, price range slider, sizes, colors
- **Sorting**: price asc/desc, name asc/desc, newest
- **Pagination** with page numbers
- **URL search params** for shareable filter state
- Filters update URL → re-fetches via products store

### 8.4 Category Pages (`app/shop/[category]/page.tsx`)

Redirects `/shop/[category]` to `/shop?category=[category]`. Includes `generateMetadata()` for per-category SEO:

```typescript
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params
  const name = category.charAt(0).toUpperCase() + category.slice(1)
  return {
    title: `${name}'s Collection | babyland`,
    description: `Shop ${name}'s fashion at babyland — quality clothing at the best prices.`,
    alternates: { canonical: `/shop/${category}` },
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  redirect(`/shop?category=${encodeURIComponent(category)}`)
}
```

---

## Phase 9: Cart & Wishlist

### 9.1 Cart API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/cart` | Get cart with items + product + variant + images. Returns cart summary (subtotal, itemCount, shipping, tax, total) |
| POST | `/api/cart` | Add item: findOrCreate cart, upsert cartItem by [cartId, productId, variantId] composite |
| PATCH | `/api/cart/[itemId]` | Update quantity |
| DELETE | `/api/cart/[itemId]` | Remove item |

### 9.2 Wishlist API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/wishlist` | User's wishlist with product details |
| POST | `/api/wishlist` | Add product to wishlist |
| DELETE | `/api/wishlist/[productId]` | Remove from wishlist |

### 9.3 Dual-Mode Cart Architecture

The cart operates in two modes:

**Guest Mode** (not logged in):
- Cart stored in localStorage (`babyland_guest_cart`)
- Local add/update/remove operations
- No API calls needed

**Logged-in Mode**:
- Cart stored in database via API
- Optimistic updates (update UI immediately, revert on error)
- `mergeGuestCart()` — after login, pushes all localStorage items to server via sequential POST calls

### 9.4 Cart Page (`app/cart/page.tsx`)

- Item list: product image, name, variant info, quantity selector, remove button, line total
- Price summary sidebar: subtotal, shipping (free above threshold from settings), total
- "Proceed to Checkout" button (requires login)
- Empty state with "Continue Shopping" link

### 9.5 Wishlist Page (`app/wishlist/page.tsx`)

- Product cards with remove button and "Add to Cart" per item
- Empty state illustration

---

## Phase 10: Order & Checkout System

### 10.1 Order API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/orders` | User's orders list with items |
| POST | `/api/orders` | Create order in DB transaction |
| GET | `/api/orders/[id]` | Single order with items, address, status history |

### 10.2 Order Creation Flow (`POST /api/orders`)

Runs in a **database transaction**:
1. Validate cart has items
2. Validate shipping address exists and belongs to user
3. Validate stock for each item (check product + variant stock)
4. Create order with order number (auto-generated)
5. Create order items with product snapshots (name, image, price at time of order)
6. Decrement stock for each product/variant
7. Clear user's cart
8. Create initial status history entry (PENDING)
9. Capture analytics metadata: IP, user agent, device type, browser, OS, screen resolution, language, referrer, city, region, country code

### 10.3 Checkout Page (`app/checkout/page.tsx`)

Multi-step flow:
1. **Address Selection**: Choose existing or create new address
2. **Payment Method**: COD, bKash, Nagad, Credit/Debit Card
3. **Order Review**: Items summary, pricing, address confirmation
4. **Marketing Opt-in**: Optional newsletter consent checkbox
5. **Place Order**: Submit with device/browser metadata collection

### 10.4 Order Confirmation (`app/order-confirmation/[orderId]/page.tsx`)

Shows order success with:
- Order number
- Items summary
- Shipping address
- Payment method
- "Track Order" and "Continue Shopping" links
- Receipt download (PDF via jspdf + html2canvas)

### 10.5 Order Tracking (`app/track/page.tsx`)

- Enter order number to track
- Shows order status timeline with status history
- Real-time status from `OrderStatusHistory` table

---

## Phase 11: User Account Management

### 11.1 User API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update name, phone, image |
| GET | `/api/user/addresses` | List user's addresses |
| POST | `/api/user/addresses` | Create new address (manages `isDefault` flag) |
| PUT | `/api/user/addresses/[id]` | Update address |
| DELETE | `/api/user/addresses/[id]` | Delete address |
| PUT | `/api/user/password` | Change password (verify current, hash new) |

### 11.2 Account Pages

| Page | Path | Features |
|------|------|----------|
| Account Dashboard | `/account` | Profile edit, quick stats (orders, addresses, wishlist) |
| Addresses | `/account/addresses` | Add/edit/delete/set-default addresses |
| Order History | `/account/orders` | Orders list with status badges, click for detail |
| Settings | `/account/settings` | Change password, notification preferences |

---

## Phase 12: Admin Panel — Layout & Dashboard

### 12.1 Admin Layout (`components/admin/AdminLayout.tsx`)

Shell with:
- **Sidebar**: Collapsible with icon-only mode. Sections:
  - Dashboard, Products, Orders, Customers, Reviews
  - Categories, Banners, Outlets, Currencies
  - Expenses, Backups, Settings
- **Top bar**: Admin name, logout button
- **Active route** highlighting
- **Mobile**: Overlay sidebar on small screens

### 12.2 Admin Login (`app/admin/login/page.tsx`)

Separate admin login page. Authenticates against `/api/auth/login`, checks role=ADMIN.

### 12.3 Admin Dashboard (`app/admin/page.tsx`) — ~3870 lines

**8 Collapsible Analytics Sections:**

#### 1. Business Overview
- KPI cards: Revenue (today/week/period/total with trend %), Orders, AOV, Conversion Rate
- Charts: Daily revenue line chart, Daily orders bar chart (completed/pending/cancelled), New vs returning customers, Category sales (top 10 pie), Category stock distribution

#### 2. Sales Analytics
- Top 10 selling products with trend indicators
- Bottom 10 low-selling products
- Revenue by category breakdown
- Payment method distribution
- Cart abandonment rate

#### 3. Customer Intelligence
- Top 10 CLV (Customer Lifetime Value) customers
- Repeat purchase rate
- Customer segmentation: New / Active / VIP (>50,000 BDT) / At Risk
- 6-month acquisition trend
- Order frequency distribution
- Customer locations map
- Purchase time heatmap (converted to Asia/Dhaka timezone)
- Churn analysis

#### 4. Product Performance
- Stock alerts with days-until-stockout estimates
- Fast-moving products (high turnover ratio)
- Slow-moving products
- Profit margins (real COGS from `product_costs` table or 60% estimate)
- Inventory value by category
- Turnover distribution

#### 5. Marketing Performance
- Conversion funnel visualization
- Top performing products
- Orders by day of week / hour of day
- Geographic performance by region
- CAC (Customer Acquisition Cost) & ROAS from `marketing_expenses`

#### 6. Financial Health
- Real expense data from 3 tables: `product_costs`, `marketing_expenses`, `operational_expenses`
- Monthly P&L trends (6 months)
- Category profitability
- Cash flow analysis
- Expense breakdown pie chart
- Tax calculation (15%)
- Year-over-year comparison
- Financial ratios (gross margin, net margin, expense ratio)
- Top revenue products with COGS

#### 7. AI Insights
- 7-day sales forecast (linear regression on 30-day data)
- Restock recommendations with priority levels
- Pricing optimization suggestions
- Demand predictions by category
- Anomaly detection (2 standard deviations)
- Customer segmentation insights
- 6 automated insight types

#### 8. Quick Stats
- Low stock product alerts
- Top products table
- Recent orders table

**Dashboard Features:**
- Date range presets (Today, 7 days, 30 days, 90 days, custom)
- Auto-refresh intervals (30s, 1min, 5min)
- CSV and PDF export for all data
- All charts lazy-loaded via `dynamic(() => import(...))`
- All API calls go to `/api/admin/dashboard/*` sub-routes

### 12.4 Dashboard API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/admin/dashboard` | Basic stats, low stock, recent orders, top products |
| GET | `/api/admin/dashboard/business-overview` | KPIs with trends, 5 chart datasets |
| GET | `/api/admin/dashboard/sales-analytics` | Top/bottom products, category revenue, payment methods |
| GET | `/api/admin/dashboard/customer-intelligence` | CLV, segmentation, acquisition, churn, locations, heatmap |
| GET | `/api/admin/dashboard/product-performance` | Stock alerts, turnover, margins, inventory value |
| GET | `/api/admin/dashboard/marketing-performance` | Funnel, CAC, ROAS, day/hour trends, geographic |
| GET | `/api/admin/dashboard/financial-health` | P&L, cash flow, expenses, tax, financial ratios |
| GET | `/api/admin/dashboard/ai-insights` | Forecasting, restock, pricing, anomalies, auto-insights |

---

## Phase 13: Admin Panel — Resource Management

### 13.1 Admin Products

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/admin/products` | Products with search/filter/pagination |
| POST | `/api/admin/products` | Create product with images + variants |
| GET | `/api/admin/products/[id]` | Full product details |
| PUT | `/api/admin/products/[id]` | Update with image add/remove/reorder, variant upsert |
| DELETE | `/api/admin/products/[id]` | Soft/hard delete |
| POST | `/api/admin/products/bulk` | Bulk activate/deactivate/delete |
| POST | `/api/admin/products/import` | CSV import (custom parser, auto-create categories/brands, upsert by SKU/slug) |
| GET | `/api/admin/products/export` | CSV export (26 columns) |

**Admin Products Page** (`app/admin/products/page.tsx`):
- Product listing table with search, category/brand/status filters
- Bulk actions (select all, activate, deactivate, delete)
- Add/Edit product form with:
  - Basic info (name, slug auto-gen, description, short description)
  - Pricing (price, compare-at, cost, discount type/value)
  - Inventory (stock, low stock threshold, visibility, SKU, barcode)
  - Organization (category with subcategory, brand, tags, unit)
  - Images (drag-drop upload via `/api/upload/image`, reorder, alt text)
  - Variants (size/color/SKU/stock/price adjustment matrix)
  - Flags (featured, special offer, new arrival, flash sale, etc.)
  - Instant delivery (toggle + select storage cities from 7 locations)
  - SEO (meta title, meta description)
- CSV import/export buttons

### 13.2 Admin Orders

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/admin/orders` | Orders with search/status/date filters |
| GET | `/api/admin/orders/[id]` | Full order detail (items, address, status history, analytics) |
| PATCH | `/api/admin/orders/[id]` | Update status (creates status history entry) |
| POST | `/api/admin/orders/bulk` | Bulk status update / delete |

**Admin Orders Page**:
- Orders table with order number, customer, total, status badge, date
- Status filter dropdown (all statuses)
- Date range filter
- Search by order number or customer name
- Order detail modal showing items, shipping address, payment info, status timeline, customer analytics (device, browser, location)
- Status update dropdown with optional note

### 13.3 Admin Users

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/admin/users` | All users with order count |
| PATCH | `/api/admin/users/[id]` | Update user role (USER/ADMIN), toggle blocked/COD/high-risk flags |

### 13.4 Admin Categories

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/admin/categories` | Categories with subcategories |
| POST | `/api/admin/categories` | Create category (name, slug, description, image, subcategories JSON, display order, showInHeader) |
| PATCH | `/api/admin/categories/[id]` | Update category |
| DELETE | `/api/admin/categories/[id]` | Delete category (check for products first) |

### 13.5 Admin Reviews

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/admin/reviews` | Reviews with filters (status, rating, product) |
| PATCH | `/api/admin/reviews/[id]` | Approve/reject review, toggle `showOnHomepage` |
| DELETE | `/api/admin/reviews/[id]` | Delete review |

### 13.6 Admin Banners

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/admin/banners` | All banners |
| POST | `/api/admin/banners` | Create banner (title, subtitle, image, mobile image, link, button text/style, text/overlay colors, position, type, active, date range) |
| PATCH | `/api/admin/banners/[id]` | Update banner |
| DELETE | `/api/admin/banners/[id]` | Delete banner |

**Banner Types**: hero, promotional, category, sidebar, popup

### 13.7 Admin Outlets

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/outlets` | Create outlet (name, address, phone, email, lat/lng, hours, image) |
| PATCH | `/api/admin/outlets/[id]` | Update outlet |
| DELETE | `/api/admin/outlets/[id]` | Delete outlet |

### 13.8 Admin Settings (`/api/admin/settings`)

**9 Settings Groups** (each a tab in admin settings page):

| Group | Keys |
|-------|------|
| `general` | siteName, tagline, logo, favicon, contactEmail, contactPhone, address |
| `homepage` | heroTitle, heroSubtitle, heroImage, featuredLimit, showNewArrivals, showSpecialOffers |
| `shipping` | freeShippingThreshold, defaultShippingCost, estimatedDelivery, shippingPolicy |
| `payment` | enableCOD, enableBkash, enableNagad, enableCard, bkashNumber, nagadNumber |
| `email` | smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom, passwordResetMethod (firebase/smtp) |
| `seo` | defaultTitle, defaultDescription, defaultKeywords, googleAnalyticsId, facebookPixelId |
| `social` | **NEW:** messengerEnabled, messengerPageId, facebookUrl, instagramUrl, twitterUrl, youtubeUrl, whatsappNumber, whatsappMessage |
| `appearance` | primaryColor, accentColor, fontFamily, headerStyle, footerStyle |
| `advanced` | enableWishlist, enableProductReviews, enableCoupons, enableMultiCurrency, enableGuestCheckout, enableOrderTracking, enableSizeGuide, enableCompareProducts, enableLiveChat, liveChatWidgetId, homepageLayout, paymentGatewayEnabled |
| `security` | maintenanceEnabled, maintenanceMessage, registrationEnabled, requireEmailVerification, requirePhoneVerification, ipBlacklist, phoneBlacklist, emailDomainBlacklist, **rateLimitEnabled**, **rateLimitRequests**, **rateLimitWindowSeconds** |

**API**: `GET /api/admin/settings?group=X` / `PUT /api/admin/settings` (body: `{ group, settings: { key: value } }`)
- Each setting is upserted with composite unique `[group, key]`
- Values stored as `LongText` strings (JSON-stringified for complex values)

### 13.9 Admin Currency Management

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/admin/currency` | All currencies |
| POST | `/api/admin/currency` | Create currency (code, name, symbol, exchangeRate, extraCharge, minimumItems) |
| PUT | `/api/admin/currency/[id]` | Update currency |
| DELETE | `/api/admin/currency/[id]` | Delete currency (cannot delete BDT base) |

**Public**: `GET /api/currency` — Returns active currencies for frontend locale detection

**Pricing Formula**: `displayPrice = (productPriceBDT + extraCharge) / exchangeRate`

### 13.10 Admin Expenses / COGS

| Method | Route | Purpose |
|--------|-------|---------|
| GET/POST | `/api/admin/expenses/cogs` | CRUD for product costs (purchase, import, packaging, warehouse cost) |
| GET/POST | `/api/admin/expenses/marketing` | CRUD for marketing expenses (platform, campaign, spend, orders, clicks, impressions) |
| GET/POST | `/api/admin/expenses/operational` | CRUD for operational expenses (9 categories: SALARY, RENT, UTILITIES, etc.) |
| GET | `/api/admin/expenses/summary` | Combined expense summary from all 3 tables, 6-month trend |
| GET | `/api/admin/expenses/products` | Product list for COGS dropdown |

### 13.11 Admin Cache & Backup Management

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/admin/cache` | Cache sizes (.next directory stats) |
| DELETE | `/api/admin/cache` | Clear .next/cache, revalidate 8 paths, clear serverCache |
| POST | `/api/admin/backups` | Full backup management (504 lines). Rate limiting + audit logging. Actions: backup-mysql/redis/uploads/all, cleanup, verify (SHA256), restore, delete, offsite-upload (S3), restore-test, get/save-settings |
| GET | `/api/admin/backups/download` | Stream backup file download |

---

## Phase 14: Advanced Features

### 14.1 Review System

**API Routes:**
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/reviews?productId=X` | Reviews for product (approved only + stats with rating breakdown) |
| POST | `/api/reviews` | Submit review (requires: logged in, delivered order for this product, one review per product per user) |
| GET | `/api/reviews/pending` | User's delivered orders with unreviewed items (for review popup) |

**Review Popup** (`components/review/ReviewPopup.tsx` — 316 lines):
- Auto-popup 3 seconds after page load
- Checks for pending reviews via `/api/reviews/pending`
- Star rating selector (1-5)
- Optional comment (max 1000 chars)
- Dismissed for 24 hours via localStorage
- Handles multiple pending items sequentially

**Review Section** (`components/review/ReviewSection.tsx`):
- Stats overview: average rating, total reviews, rating breakdown bars (5★ to 1★ with count + percentage)
- Individual reviews: avatar, name, star rating, verified purchase badge, relative timestamps, comment

### 14.2 Multi-Currency / Locale System

**Geo-IP Detection Flow** (in `store/locale.ts`):
1. Try 3 fallback geo-IP services: `ip-api.com/json`, `ipapi.co/json`, `ipinfo.io/json`
2. Fall back to timezone detection (`Intl.DateTimeFormat`)
3. Fall back to browser language (`navigator.language`)
4. Map country → currency (16 supported currencies)

**16 Supported Currencies**: BDT, USD, GBP, EUR, INR, AUD, CAD, SGD, MYR, JPY, CNY, AED, SAR, KWD, QAR, OMR

**Exchange Rate Flow**:
1. Admin configures rates at `/api/admin/currency` (stored in `CurrencySetting` model)
2. Frontend fetches active rates from `GET /api/currency`
3. `formatPrice()` applies: `(priceBDT + extraCharge) / exchangeRate`
4. Persisted to localStorage via Zustand persist middleware (`babyland-locale-v3`)

### 14.3 Instant Delivery Detection

**API**: `GET /api/user-location`
- Detects user city via `ip-api.com` geo-IP + Haversine formula
- Matches against 7 storage cities (Dhaka, Chattogram, Sylhet, Rajshahi, Khulna, Barishal, Rangpur)
- 50km radius matching
- Used in product detail page to show "Instant Delivery Available" for products stored in user's city

**Hook**: `useUserCity()` — Returns `{ city, loading }`

### 14.4 Image Upload & Processing

**API**: `POST /api/upload/image`
- Max 10MB file size
- Sharp processing: WebP conversion, max 1920px, quality 80
- GIF and SVG passthrough (no processing)
- Saves to `public/uploads/products/`
- Returns URL path

**Serving uploads**: `GET /api/uploads/[...path]` — Serves uploaded files from disk (needed because runtime uploads aren't in the Next.js build output)

### 14.5 Contact & Newsletter

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/contact` | Store contact form submission (name, email, subject, message) |
| POST | _Newsletter_ (inline in Footer/NewsletterPopup) | Subscribe to newsletter |
| GET | `/api/outlets` | Active outlets with lat/lng for map display |

### 14.6 Static Pages

| Page | Path | Content |
|------|------|---------|
| About | `/about` | Company story, team, mission |
| FAQ | `/faq` | Accordion Q&A sections |
| Privacy | `/privacy` | Privacy policy |
| Terms | `/terms` | Terms of service |
| Shipping | `/shipping` | Shipping information |
| Returns | `/returns` | Return & refund policy |
| Size Guide | `/size-guide` | Size chart tables |
| Outlets | `/outlets` | Store locations from API |

### 14.7 Health Check

**API**: `GET /api/health`
- Checks: Database ping, Redis ping
- Returns: status (healthy/degraded/unhealthy), latencies, timestamp
- Used by Railway/Docker healthchecks

### 14.8 Maintenance Mode — NEW

When `maintenanceEnabled` is `true` in `security` settings group:
- Edge middleware rewrites all non-API, non-admin routes to `/maintenance`
- Branded maintenance page (`app/maintenance/page.tsx`) with babyland styling, wrench icon, and admin-configurable message
- Auto-checks every 30 seconds (middleware cache TTL)
- Admin panel unaffected — admins can still log in and toggle it off

### 14.8.1 DDoS / Rate Limiting — NEW

Admin-toggleable per-IP request rate limiting at the Edge middleware level.

**Admin UI** (`SecuritySettings.tsx` → DDoS / Rate Limiting section):
- **Enable/Disable toggle** — `rateLimitEnabled` (default: `false`)
- **Max Requests per IP** — `rateLimitRequests` (default: `60`, range: 10–1000)
- **Time Window** — `rateLimitWindowSeconds` (default: `60`, options: 30s / 1min / 2min / 5min)
- Warning banner when disabled: "Your site is vulnerable to DDoS attacks"
- Info banner when enabled showing active limits

**How it works:**
1. Edge middleware fetches rate limit config from `security` settings group (cached 30s)
2. In-memory `Map<ip, { count, resetAt }>` tracks hits per IP (edge-compatible, no Redis needed)
3. When `rateLimitEnabled === true` and IP exceeds `rateLimitRequests` within `rateLimitWindowMs`, returns `429 Too Many Requests` with `Retry-After` header
4. Applies to **all routes** (pages + API) except static assets and `/maintenance`
5. Stale entries auto-cleaned every 60s to prevent memory leaks

**Use case:** Disable rate limiting when running load tests (e.g., Locust), enable in production to block DDoS/abuse. The toggle is instant — no deployment needed.

| Setting Key | Type | Default | Description |
|-------------|------|---------|-------------|
| `rateLimitEnabled` | boolean | `false` | Master toggle for per-IP rate limiting |
| `rateLimitRequests` | number | `60` | Max requests per IP per time window |
| `rateLimitWindowSeconds` | number | `60` | Time window in seconds |

### 14.9 IP / Phone / Email Blacklist Enforcement — NEW

Admin configures blacklists in Security settings tab (newline or comma-separated):
- **IP Blacklist**: Checked at middleware level (before page render) + order creation + registration
- **Phone Blacklist**: Checked at registration + order creation
- **Email Domain Blacklist**: Checked at registration + order creation (e.g., `tempmail.com`)

### 14.10 Email/Phone OTP Verification — NEW

**API**: `POST /api/auth/verify`

| Action | Body | Result |
|--------|------|--------|
| `send` | `{ action: "send", type: "email" }` | Generates 6-digit OTP, sends via SMTP (or logs in dev), 5-min TTL, 60s rate limit |
| `send` | `{ action: "send", type: "phone" }` | Generates OTP, logs to console (SMS gateway placeholder) |
| `verify` | `{ action: "verify", type: "email", otp: "123456" }` | Validates OTP, sets `emailVerified` timestamp in DB |
| `verify` | `{ action: "verify", type: "phone", otp: "123456" }` | Validates OTP, sets `phoneVerified` timestamp in DB |

- Max 5 attempts before OTP invalidated
- In-memory store (use Redis in production for multi-instance)
- Enforcement: `POST /api/orders` checks `requireEmailVerification` / `requirePhoneVerification` settings

### 14.11 Feature Flags System — NEW

Admin controls (`advanced` and `social` settings groups) are consumed as live feature flags in the frontend:

| Flag | Default | Controls |
|------|---------|----------|
| `enableWishlist` | `true` | Wishlist icon in Header, wishlist button on ProductCard + ProductDetailClient |
| `enableProductReviews` | `true` | Review stars, Reviews tab, ReviewSection on product detail |
| `enableOrderTracking` | `true` | Track Order link in Header + Footer |
| `enableSizeGuide` | `true` | Size Guide link in Footer |
| `enableGuestCheckout` | `false` | Guest checkout on checkout page |
| `enableMultiCurrency` | `true` | Currency switcher in locale store |
| `enableCoupons` | `false` | Coupon field in checkout (placeholder) |
| `enableCompareProducts` | `false` | Compare feature (placeholder) |
| `enableLiveChat` | `false` | Live chat widget (placeholder) |
| `messengerEnabled` | `false` | Messenger button on product detail page |

**Architecture**: `store/features.ts` (Zustand) → fetches `/api/settings?groups=advanced,social` → all components read flags reactively

### 14.12 Guest Checkout — NEW

When `enableGuestCheckout` is `true`:
- Unauthenticated users see a guest checkout form instead of login redirect
- Guest checkout banner shows sign-in/register links
- Orders created via `POST /api/orders/guest` (no auth required)
- Address created without `userId` (optional field)
- Order fields: `guestEmail`, `guestPhone`, `guestName` (instead of userId)
- Order numbers prefixed `ORD-G-`
- Full blacklist enforcement on guest orders too

### 14.13 Messenger Integration — NEW

**Admin Config** (`Social` tab in admin settings):
- Enable/disable Messenger button on product pages
- Set Facebook Page ID or username

**Product Page** (`MessengerButton` component):
- Blue pill button with Messenger SVG icon: "Message Us About This Product"
- Opens `m.me/{PageID}?ref=product:{productCode}+{productName}` in new tab
- Reads `messengerEnabled` and `messengerPageId` from feature flags store

**Admin Settings Component** (`SocialSettings.tsx`):
- Facebook Messenger toggle + Page ID input
- WhatsApp number + message template
- Social Links: Facebook, Instagram, Twitter/X, YouTube

### 14.14 Product Gallery Lightbox — NEW

`ProductGallery.tsx` now supports fullscreen image viewing:
- Click any image to open fullscreen modal
- Keyboard navigation: `Escape` (close), `ArrowLeft`/`ArrowRight` (navigate)
- Thumbnail strip at bottom of lightbox
- Navigation arrows on sides
- Body scroll lock when open

### 14.15 Announcement Bar — NEW

`Header.tsx` includes a dismissible announcement bar:
- Fetches `announcementBarText` and `announcementBarEnabled` from homepage settings
- Dark background strip at very top of page
- Dismiss button (X) removes it for the session
- When visible, header shifts down by 36px

---

## Phase 15: State Management (Zustand Stores)

### 15.1 Store Architecture

All stores use **Zustand 5** with:
- **In-flight request deduplication** (prevents duplicate API calls)
- **Optimistic updates** (update UI immediately, revert on error)
- **Cross-store communication** (logout clears cart + wishlist)

### 15.2 Stores Summary

| Store | File | State | Key Methods |
|-------|------|-------|-------------|
| Auth | `store/auth.ts` | `user`, `isLoading`, `isChecked` | `fetchUser()`, `setUser()`, `updateProfile()`, `logout()` (clears cart/wishlist), `reset()` |
| Cart | `store/cart.ts` (357 lines) | `items`, `isLoading`, `lastFetched` | `fetchCart()`, `addItem()` (optimistic badge), `updateQuantity()` (optimistic with rollback), `removeItem()`, `mergeGuestCart()`, `clearLocal()`, `getCartSummary()` |
| Wishlist | `store/wishlist.ts` | `items`, `isLoading` | `fetchWishlist()`, `addItem()`, `removeItem()` (optimistic), `isInWishlist()`, `getCount()`, `clearLocal()` |
| Products | `store/products.ts` (326 lines) | 4 caches: `detailCache` (10min), `listingCache` (5min), `searchCache`, `miscCache` | `fetchProduct(slug)`, `fetchProducts(params)`, `fetchSearch(params)`, `fetchMisc(url)`, `invalidateProduct()`, `invalidateListings()`, `invalidateAll()` |
| Categories | `store/categories.ts` | `headerCategories`, `fullCategories` | `fetchHeaderCategories()`, `fetchFullCategories()`, `invalidate()` |
| Locale | `store/locale.ts` (281 lines) | `currency`, `country`, `rates` | `detectLocation()`, `fetchRates()`, `setCurrency()` |
| UI | `store/ui.ts` | `isMobileMenuOpen` | `toggleMobileMenu()`, `closeMobileMenu()` |
| **Features** | **`store/features.ts`** (NEW) | `enableWishlist`, `enableProductReviews`, `enableGuestCheckout`, `enableOrderTracking`, `enableSizeGuide`, `messengerEnabled`, `messengerPageId`, + 6 more | `fetchFlags()` — fetches `/api/settings?groups=advanced,social`, parses booleans from admin settings |

**Store barrel export** (`store/index.ts`):
```typescript
export { useAuthStore } from './auth'
export { useCategoriesStore } from './categories'
export { useCartStore } from './cart'
export { useWishlistStore } from './wishlist'
export { useProductsStore } from './products'
export { useUIStore } from './ui'
export { useLocaleStore } from './locale'
export { useFeatureFlagsStore } from './features'   // ← NEW
```

### 15.3 Cart Dual-Mode Detail

```
Guest Mode (localStorage)          Logged-In Mode (API)
─────────────────────────          ────────────────────
addItem → localStorage             addItem → POST /api/cart
updateQuantity → localStorage      updateQuantity → PATCH /api/cart/[itemId]
removeItem → localStorage          removeItem → DELETE /api/cart/[itemId]
                                   
        LOGIN → mergeGuestCart() ─────→ Sequential POST for each guest item
                                       Clear localStorage after merge
```

---

## Phase 16: Styling & Design System

### 16.1 Global CSS (`app/globals.css`)

Uses Tailwind v4 with `@import "tailwindcss"` and `@theme inline`:

```css
@import "tailwindcss";

/* ── Lenis Smooth Scroll ── */
html.lenis, html.lenis body { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }
.lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
.lenis.lenis-stopped { overflow: hidden; }
.lenis.lenis-scrolling iframe { pointer-events: none; }

@theme inline {
  --color-primary: #0a0a0a;
  --color-secondary: #1a1a1a;
  --color-accent: #c9a96e;
  --color-accent-dark: #b8944f;
  --color-accent-light: #d4b87a;
  --color-accent-rose: #d4a5a5;
  --color-background: #faf8f5;
  --color-cream: #faf8f5;
  --color-cream-dark: #f0ece5;
  --color-surface: #ffffff;
  --font-heading: 'Playfair Display', Georgia, serif;
  --font-body: 'Lato', system-ui, sans-serif;
}

/* Auto-hide scrollbar */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

/* Fade-in animation */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.animate-fade-in { animation: fadeIn 0.5s ease-in-out; }

/* Dialog transitions */
dialog::backdrop { background: rgba(0, 0, 0, 0.5); }
dialog[open] { animation: fadeIn 0.2s ease-out; }

/* Line clamp utilities */
.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
```

### 16.2 Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#0a0a0a` | Text, headers, buttons |
| Secondary | `#1a1a1a` | Dark backgrounds |
| Accent | `#c9a96e` | Gold accents, CTAs, highlights |
| Accent Rose | `#d4a5a5` | Special offer badges |
| Cream | `#faf8f5` | Page background |
| Surface | `#ffffff` | Cards, modals |

### 16.3 Typography

| Font | Usage | Weights |
|------|-------|---------|
| Playfair Display | Headings, brand name, product titles | 400, 500, 600, 700 |
| Lato | Body text, buttons, navigation, forms | 300, 400, 700 |

### 16.4 Responsive Breakpoints

Standard Tailwind breakpoints:
- `sm`: 640px
- `md`: 768px — Main mobile/desktop breakpoint
- `lg`: 1024px
- `xl`: 1280px

Key responsive patterns:
- Header: Compact height on mobile (60px) → taller on desktop (72px)
- BottomNavBar: Visible on mobile only (`md:hidden`)
- Product grid: 2 columns mobile → 3-4 columns desktop
- Sidebar filters: Hidden on mobile → visible on desktop
- Admin sidebar: Overlay on mobile → fixed on desktop

---

## Phase 17: Docker & Deployment

### 17.1 Dockerfile (Multi-Stage Build)

```dockerfile
# Stage 1: Dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat vips-dev
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prisma generation
RUN npx prisma generate
# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner
FROM node:22-alpine AS runner
RUN apk add --no-cache curl vips
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/start.sh ./start.sh

RUN chmod +x start.sh
RUN mkdir -p public/uploads && chown nextjs:nodejs public/uploads

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["./start.sh"]
```

### 17.2 Docker Compose (6 services)

```yaml
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci --max-connections=200

  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru --appendonly yes
    volumes:
      - redis_data:/data

  app:
    build: .
    depends_on:
      mysql: { condition: service_healthy }
      redis: { condition: service_started }
    environment:
      DATABASE_URL: mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@mysql:3306/${MYSQL_DATABASE}
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      # ... all other env vars
    volumes:
      - uploads:/app/public/uploads

  nginx:
    image: nginx:alpine
    depends_on: [app]
    ports:
      - "${NGINX_HTTP_PORT:-80}:80"
      - "${NGINX_HTTPS_PORT:-443}:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - uploads:/app/public/uploads:ro

  backup:
    image: alpine:latest
    # Backup service for MySQL dumps, Redis RDB, uploads
    volumes:
      - mysql_data:/var/lib/mysql:ro
      - redis_data:/redis-data:ro
      - uploads:/app/uploads:ro
      - backups:/backups

  adminer:
    image: adminer
    ports:
      - "8080:8080"
    depends_on: [mysql]

volumes:
  mysql_data:
  redis_data:
  uploads:
  backups:
  ssl_certs:

networks:
  default:
    driver: bridge
```

### 17.3 Railway Deployment

`railway.toml`:
```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 5

[[mounts]]
source = "uploads"
destination = "/app/public/uploads"
```

**Railway Setup Steps:**
1. Create Railway project
2. Add MySQL plugin
3. Add Redis plugin
4. Connect GitHub repo (`docker` branch)
5. Set all environment variables
6. Deploy

### 17.4 Render Deployment

`render.yaml`:
```yaml
services:
  - type: web
    name: babyland-ecommerce
    runtime: node
    plan: free
    region: oregon
    buildCommand: npm install && npx prisma generate && npm run build
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        generateValue: true
    autoDeploy: true
```

### 17.5 Start Script (`start.sh`)

```bash
#!/bin/sh
# Wait for database
echo "Waiting for database..."
sleep 5

# Run migrations
npx prisma db push --accept-data-loss 2>/dev/null || true

# Seed if enabled
if [ "$SEED_DATABASE" = "true" ]; then
  npx prisma db seed 2>/dev/null || true
fi

# Start Next.js
exec node server.js
```

---

## Phase 18: Performance, SEO & Caching

### 18.1 Three-Layer Caching Strategy

```
Layer 1: CDN Headers (next.config.ts)
├── Static assets: max-age=31536000, immutable
├── Images: max-age=2592000, stale-while-revalidate
└── Uploads: max-age=2592000, stale-while-revalidate

Layer 2: ISR (Incremental Static Regeneration)
├── Product pages: revalidate = 60 (1 minute)
├── Products listing: revalidate = 60
└── Homepage: revalidate = 60

Layer 3: Server Cache (lib/server-cache.ts)
├── Redis primary (if available)
├── In-memory Map fallback (500 keys max, FIFO eviction)
├── In-flight request deduplication
└── Prefix-based invalidation (e.g., invalidate all "products:*")
```

**CDN Cache-Control headers per API route:**

| Route | Server Cache TTL | CDN s-maxage | stale-while-revalidate |
|-------|-----------------|-------------|------------------------|
| `/api/products` | 10 min | 600s (10 min) | 300s (5 min) |
| `/api/categories` | 30 min | 300s (5 min) | 600s (10 min) |
| `/api/settings` | 5 min | 300s (5 min) | 600s (10 min) |
| `/api/banners` | 5 min | 300s (5 min) | 600s (10 min) |

**Product API optimization:** Images limited to 5 per product in listing responses to reduce payload size.

### 18.2 Image Optimization

| Aspect | Config |
|--------|--------|
| Formats | AVIF + WebP (auto-negotiation by browser) |
| Upload Processing | Sharp: max 1920px, WebP quality 80, GIF/SVG passthrough |
| Custom Loader | Routes through `/_next/image` optimization pipeline |
| Remote Patterns | All HTTPS hosts allowed |
| Device Sizes | 640, 750, 828, 1080, 1200, 1920, 2048 |
| Image Sizes | 16, 32, 48, 64, 96, 128, 256, 384 |

### 18.3 Cache Warming

On server startup (`instrumentation.ts`):
1. `warmServerCache()` is called
2. Pre-fetches and caches: all active categories, product listings for main categories
3. Reduces cold-start latency

### 18.4 Client-Side Caching

| Store | Cache Duration | Strategy |
|-------|---------------|----------|
| Products Detail | 10 minutes | In-memory Map with TTL |
| Products Listing | 5 minutes | In-memory Map with TTL |
| Search Results | Session | In-memory Map |
| Categories | Session | Fetched once on mount |
| Locale/Currency | Persistent | localStorage via Zustand persist |
| Recent Searches | Persistent | localStorage (max 5 items) |

### 18.5 SEO

- `generateMetadata()` on product pages (dynamic title, description, Open Graph)
- `generateMetadata()` on category pages (dynamic title, description, canonical URL)
- Root metadata in layout.tsx (title, description, keywords, Open Graph, Twitter cards, canonical, robots)
- `metadataBase` set for proper absolute URL resolution
- Semantic HTML throughout
- JSON-LD ready (can be added per product page)

### 18.6 robots.txt (`app/robots.ts`) — NEW

Generated via Next.js `MetadataRoute.Robots` API:

```typescript
import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://babyland-ecommerce-production-e676.up.railway.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/account/', '/checkout/', '/order-confirmation/'],
    }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
```

### 18.7 Sitemap (`app/sitemap.ts`) — NEW

Dynamic sitemap with 13 static pages + DB-driven categories and products:

```typescript
import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://babyland-ecommerce-production-e676.up.railway.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    // ... /contact, /faq, /login, /register, /track, /outlets, /shipping, /returns, /privacy, /terms
  ]

  // Dynamic: categories (try/catch for build-time DB unavailability)
  let categoryPages: MetadataRoute.Sitemap = []
  try {
    const categories = await prisma.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } })
    categoryPages = categories.map(cat => ({ url: `${SITE_URL}/shop/${cat.slug}`, lastModified: cat.updatedAt, changeFrequency: 'weekly', priority: 0.7 }))
  } catch {}

  // Dynamic: products
  let productPages: MetadataRoute.Sitemap = []
  try {
    const products = await prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } })
    productPages = products.map(p => ({ url: `${SITE_URL}/product/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'weekly', priority: 0.6 }))
  } catch {}

  return [...staticPages, ...categoryPages, ...productPages]
}
```

### 18.8 Accessibility Enhancements — NEW

| Fix | Location | Detail |
|-----|----------|--------|
| sr-only text on icon links | `Header.tsx` | Added `<span className="sr-only">` to Account, Wishlist, Cart (desktop), Track Order, Cart (mobile) icon links |
| sr-only text on social links | `Footer.tsx` | Added `<span className="sr-only">` to Facebook, Instagram, TikTok, X social icon links |
| aria-label on search inputs | `Header.tsx` | Added `aria-label="Search products"` to desktop and mobile search inputs |
| aria-label on newsletter input | `page.tsx` | Added `aria-label="Email address for newsletter"` to newsletter email input |
| H1 in loading state | `page.tsx` | Added `<h1 className="sr-only">babyland \| Fashion & Comfort</h1>` in homepage loading state |

### 18.9 Security Headers (next.config.ts) — NEW

All pages receive these security headers via `next.config.ts` `headers()` function:

| Header | Value |
|--------|-------|
| X-Content-Type-Options | `nosniff` |
| X-Frame-Options | `DENY` |
| X-XSS-Protection | `1; mode=block` |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| Permissions-Policy | `camera=(), microphone=(), geolocation=()` |
| Strict-Transport-Security | `max-age=63072000; includeSubDomains; preload` |
| Content-Security-Policy | Full CSP with self, Firebase, Google domains |
| X-DNS-Prefetch-Control | `off` |
| X-Powered-By | Removed (`poweredByHeader: false`) |

Additionally, `generateEtags: true` is enabled for conditional caching (HTTP 304 responses).

---

## Complete API Reference

### Public APIs (No Auth Required)

| # | Method | Route | Purpose |
|---|--------|-------|---------|
| 1 | GET | `/api/health` | Health check (DB + Redis) |
| 2 | GET | `/api/products` | Products with filters, pagination, sorting |
| 3 | GET | `/api/products/[slug]` | Single product with images, variants, reviews |
| 4 | GET | `/api/products/search-suggestions` | Autocomplete (limit 8) |
| 5 | GET | `/api/search` | Full-text search with filters |
| 6 | GET | `/api/categories` | All active categories |
| 7 | GET | `/api/categories/with-children` | Header categories with subcategories |
| 8 | GET | `/api/categories/[slug]/subcategories` | Subcategories for a category |
| 9 | GET | `/api/brands` | All active brands |
| 10 | GET | `/api/attributes` | All product attributes |
| 11 | GET | `/api/outlets` | Active outlets |
| 12 | GET | `/api/currency` | Active currencies for locale |
| 13 | GET | `/api/settings?group=X` | Public site settings |
| 14 | GET | `/api/user-location` | Geo-IP city detection |
| 15 | POST | `/api/contact` | Contact form submission |

### Auth APIs

| # | Method | Route | Purpose |
|---|--------|-------|---------|
| 16 | POST | `/api/auth/register` | Register (email, password, name). Enforces blacklist + registration toggle |
| 17 | POST | `/api/auth/login` | Login (email/password or Firebase token) |
| 18 | POST | `/api/auth/logout` | Clear auth cookie |
| 19 | GET | `/api/auth/me` | Current user session |
| 20 | POST | `/api/auth/firebase` | Firebase token verification |
| 21 | POST | `/api/auth/forgot-password` | Hybrid: Firebase email link or SMTP token |
| 22 | POST | `/api/auth/reset-password` | Reset with token |
| 23 | POST | `/api/auth/verify` | **NEW** — OTP send/verify for email + phone |
| 24 | POST | `/api/auth/change-email` | Change email with password re-verification |

### User APIs (Auth Required)

| # | Method | Route | Purpose |
|---|--------|-------|---------|
| 23 | GET | `/api/user/profile` | Get profile |
| 24 | PUT | `/api/user/profile` | Update profile |
| 25 | PUT | `/api/user/password` | Change password |
| 26 | GET | `/api/user/addresses` | List addresses |
| 27 | POST | `/api/user/addresses` | Create address |
| 28 | PUT | `/api/user/addresses/[id]` | Update address |
| 29 | DELETE | `/api/user/addresses/[id]` | Delete address |
| 30 | GET | `/api/cart` | Get cart |
| 31 | POST | `/api/cart` | Add to cart |
| 32 | PATCH | `/api/cart/[itemId]` | Update quantity |
| 33 | DELETE | `/api/cart/[itemId]` | Remove item |
| 34 | GET | `/api/wishlist` | Get wishlist |
| 35 | POST | `/api/wishlist` | Add to wishlist |
| 36 | DELETE | `/api/wishlist/[productId]` | Remove from wishlist |
| 37 | GET | `/api/orders` | User's orders |
| 38 | POST | `/api/orders` | Create order (transaction). Enforces email/phone verification + blacklists |
| 39 | GET | `/api/orders/[id]` | Order detail |
| 40 | POST | `/api/orders/guest` | **NEW** — Guest checkout order (no auth required, enforces blacklists + enableGuestCheckout flag) |
| 41 | GET | `/api/reviews?productId=X` | Product reviews |
| 41 | POST | `/api/reviews` | Submit review |
| 42 | GET | `/api/reviews/pending` | Pending reviews for popup |

### Upload API

| # | Method | Route | Purpose |
|---|--------|-------|---------|
| 43 | POST | `/api/upload/image` | Upload image (Sharp processing) |
| 44 | GET | `/api/uploads/[...path]` | Serve uploaded files |

### Admin APIs (Admin Auth Required)

| # | Method | Route | Purpose |
|---|--------|-------|---------|
| 45 | GET | `/api/admin/dashboard` | Basic dashboard stats |
| 46 | GET | `/api/admin/dashboard/business-overview` | KPIs + chart data |
| 47 | GET | `/api/admin/dashboard/sales-analytics` | Top/bottom products, category revenue |
| 48 | GET | `/api/admin/dashboard/customer-intelligence` | CLV, segmentation, churn |
| 49 | GET | `/api/admin/dashboard/product-performance` | Stock, turnover, margins |
| 50 | GET | `/api/admin/dashboard/marketing-performance` | Funnel, CAC, ROAS |
| 51 | GET | `/api/admin/dashboard/financial-health` | P&L, cash flow, ratios |
| 52 | GET | `/api/admin/dashboard/ai-insights` | Forecasting, anomalies |
| 53 | GET | `/api/admin/products` | Products list (admin) |
| 54 | POST | `/api/admin/products` | Create product |
| 55 | GET | `/api/admin/products/[id]` | Product detail (admin) |
| 56 | PUT | `/api/admin/products/[id]` | Update product |
| 57 | DELETE | `/api/admin/products/[id]` | Delete product |
| 58 | POST | `/api/admin/products/bulk` | Bulk activate/deactivate/delete |
| 59 | POST | `/api/admin/products/import` | CSV import |
| 60 | GET | `/api/admin/products/export` | CSV export |
| 61 | GET | `/api/admin/orders` | Orders list (admin) |
| 62 | GET | `/api/admin/orders/[id]` | Order detail (admin) |
| 63 | PATCH | `/api/admin/orders/[id]` | Update order status |
| 64 | POST | `/api/admin/orders/bulk` | Bulk status update |
| 65 | GET | `/api/admin/users` | Users list |
| 66 | PATCH | `/api/admin/users/[id]` | Update user role/flags |
| 67 | GET | `/api/admin/categories` | Categories (admin) |
| 68 | POST | `/api/admin/categories` | Create category |
| 69 | PATCH | `/api/admin/categories/[id]` | Update category |
| 70 | DELETE | `/api/admin/categories/[id]` | Delete category |
| 71 | GET | `/api/admin/reviews` | Reviews (admin) |
| 72 | PATCH | `/api/admin/reviews/[id]` | Approve/reject review |
| 73 | DELETE | `/api/admin/reviews/[id]` | Delete review |
| 74 | GET | `/api/admin/banners` | Banners list |
| 75 | POST | `/api/admin/banners` | Create banner |
| 76 | PATCH | `/api/admin/banners/[id]` | Update banner |
| 77 | DELETE | `/api/admin/banners/[id]` | Delete banner |
| 78 | GET/PUT | `/api/admin/settings` | Settings CRUD by group |
| 79 | GET | `/api/admin/currency` | Currencies list |
| 80 | POST | `/api/admin/currency` | Create currency |
| 81 | PUT | `/api/admin/currency/[id]` | Update currency |
| 82 | DELETE | `/api/admin/currency/[id]` | Delete currency |
| 83 | PATCH | `/api/admin/outlets/[id]` | Update outlet |
| 84 | DELETE | `/api/admin/outlets/[id]` | Delete outlet |
| 85 | GET | `/api/admin/cache` | Cache stats |
| 86 | DELETE | `/api/admin/cache` | Clear all caches |
| 87 | POST | `/api/admin/backups` | Backup management |
| 88 | GET | `/api/admin/backups/download` | Download backup |
| 89 | GET/POST | `/api/admin/expenses/cogs` | Product costs CRUD |
| 90 | GET/POST | `/api/admin/expenses/marketing` | Marketing expenses CRUD |
| 91 | GET/POST | `/api/admin/expenses/operational` | Operational expenses CRUD |
| 92 | GET | `/api/admin/expenses/summary` | Expense summary |
| 93 | GET | `/api/admin/expenses/products` | Products for COGS dropdown |

---

## Complete File Structure

```
babyland-ecommerce/
│
├── 📁 app/
│   ├── globals.css                          # Tailwind v4 + Lenis smooth scroll CSS
│   ├── layout.tsx                           # Root layout with SmoothScroll wrapper
│   ├── loading.tsx                          # Global loading spinner
│   ├── page.tsx                             # Homepage (banners, featured, new arrivals)
│   │
│   ├── 📁 api/
│   │   ├── 📁 admin/
│   │   │   ├── 📁 backups/
│   │   │   │   ├── route.ts                 # Backup management (504 lines)
│   │   │   │   └── 📁 download/route.ts     # Stream backup download
│   │   │   ├── 📁 banners/
│   │   │   │   ├── route.ts                 # GET/POST banners
│   │   │   │   └── 📁 [id]/route.ts         # PATCH/DELETE banner
│   │   │   ├── 📁 cache/route.ts            # GET/DELETE cache
│   │   │   ├── 📁 categories/
│   │   │   │   ├── route.ts                 # GET/POST categories
│   │   │   │   └── 📁 [id]/route.ts         # PATCH/DELETE category
│   │   │   ├── 📁 currency/
│   │   │   │   ├── route.ts                 # GET/POST currencies
│   │   │   │   └── 📁 [id]/route.ts         # PUT/DELETE currency
│   │   │   ├── 📁 dashboard/
│   │   │   │   ├── route.ts                 # Basic stats
│   │   │   │   ├── 📁 ai-insights/route.ts
│   │   │   │   ├── 📁 business-overview/route.ts
│   │   │   │   ├── 📁 customer-intelligence/route.ts
│   │   │   │   ├── 📁 financial-health/route.ts
│   │   │   │   ├── 📁 marketing-performance/route.ts
│   │   │   │   ├── 📁 product-performance/route.ts
│   │   │   │   └── 📁 sales-analytics/route.ts
│   │   │   ├── 📁 expenses/
│   │   │   │   ├── 📁 cogs/route.ts
│   │   │   │   ├── 📁 marketing/route.ts
│   │   │   │   ├── 📁 operational/route.ts
│   │   │   │   ├── 📁 products/route.ts
│   │   │   │   └── 📁 summary/route.ts
│   │   │   ├── 📁 orders/
│   │   │   │   ├── route.ts                 # GET orders (admin)
│   │   │   │   ├── 📁 [id]/route.ts         # GET/PATCH order
│   │   │   │   └── 📁 bulk/route.ts
│   │   │   ├── 📁 outlets/📁 [id]/route.ts  # PATCH/DELETE
│   │   │   ├── 📁 products/
│   │   │   │   ├── route.ts                 # GET/POST products
│   │   │   │   ├── 📁 [id]/route.ts         # GET/PUT/DELETE
│   │   │   │   ├── 📁 bulk/route.ts
│   │   │   │   ├── 📁 export/route.ts
│   │   │   │   └── 📁 import/route.ts
│   │   │   ├── 📁 reviews/
│   │   │   │   ├── route.ts
│   │   │   │   └── 📁 [id]/route.ts
│   │   │   ├── 📁 settings/route.ts         # GET/PUT by group
│   │   │   └── 📁 users/
│   │   │       ├── route.ts
│   │   │       └── 📁 [id]/route.ts
│   │   ├── 📁 attributes/route.ts
│   │   ├── 📁 auth/
│   │   │   ├── 📁 change-email/route.ts     # ← NEW — Change email with password verification
│   │   │   ├── 📁 firebase/route.ts
│   │   │   ├── 📁 forgot-password/route.ts
│   │   │   ├── 📁 login/route.ts
│   │   │   ├── 📁 logout/route.ts
│   │   │   ├── 📁 me/route.ts
│   │   │   ├── 📁 register/route.ts
│   │   │   ├── 📁 reset-password/route.ts
│   │   │   └── 📁 verify/route.ts           # ← NEW — OTP send/verify for email & phone
│   │   ├── 📁 brands/route.ts
│   │   ├── 📁 cart/
│   │   │   ├── route.ts                     # GET/POST cart
│   │   │   └── 📁 [itemId]/route.ts         # PATCH/DELETE
│   │   ├── 📁 categories/
│   │   │   ├── route.ts
│   │   │   ├── 📁 with-children/route.ts
│   │   │   └── 📁 [slug]/📁 subcategories/route.ts
│   │   ├── 📁 contact/route.ts
│   │   ├── 📁 currency/route.ts
│   │   ├── 📁 health/route.ts
│   │   ├── 📁 orders/
│   │   │   ├── route.ts                     # GET/POST orders
│   │   │   ├── 📁 all/route.ts              # ← UPDATED — Admin all-orders with guest fallback
│   │   │   ├── 📁 guest/route.ts            # ← NEW — Guest checkout (no auth)
│   │   │   └── 📁 [id]/route.ts
│   │   ├── 📁 outlets/route.ts
│   │   ├── 📁 products/
│   │   │   ├── route.ts
│   │   │   ├── 📁 [slug]/route.ts
│   │   │   └── 📁 search-suggestions/route.ts
│   │   ├── 📁 reviews/
│   │   │   ├── route.ts
│   │   │   └── 📁 pending/route.ts
│   │   ├── 📁 search/route.ts
│   │   ├── 📁 settings/route.ts
│   │   ├── 📁 upload/📁 image/route.ts
│   │   ├── 📁 uploads/📁 [...path]/route.ts
│   │   ├── 📁 user/
│   │   │   ├── 📁 addresses/
│   │   │   │   ├── route.ts
│   │   │   │   └── 📁 [id]/route.ts
│   │   │   ├── 📁 password/route.ts
│   │   │   └── 📁 profile/route.ts
│   │   ├── 📁 user-location/route.ts
│   │   └── 📁 wishlist/
│   │       ├── route.ts
│   │       └── 📁 [productId]/route.ts
│   │
│   ├── robots.ts                            # ← NEW — SEO robots.txt via MetadataRoute API
│   ├── sitemap.ts                           # ← NEW — Dynamic sitemap (static + DB-driven URLs)
│   │
│   ├── 📁 about/page.tsx
│   ├── 📁 account/
│   │   ├── page.tsx                         # Account dashboard
│   │   ├── 📁 addresses/page.tsx
│   │   ├── 📁 orders/page.tsx
│   │   └── 📁 settings/page.tsx
│   ├── 📁 admin/
│   │   ├── page.tsx                         # Admin dashboard (3870 lines, 8 analytics sections)
│   │   ├── 📁 login/page.tsx
│   │   ├── 📁 attributes/page.tsx
│   │   ├── 📁 banners/page.tsx
│   │   ├── 📁 brands/page.tsx
│   │   ├── 📁 categories/page.tsx
│   │   ├── 📁 expenses/page.tsx
│   │   ├── 📁 orders/page.tsx
│   │   ├── 📁 outlets/page.tsx
│   │   ├── 📁 products/page.tsx
│   │   ├── 📁 reviews/page.tsx
│   │   ├── 📁 settings/page.tsx
│   │   └── 📁 users/page.tsx
│   ├── 📁 cart/page.tsx
│   ├── 📁 checkout/page.tsx                 # ← UPDATED — Guest checkout support
│   ├── 📁 contact/page.tsx
│   ├── 📁 faq/page.tsx
│   ├── 📁 login/page.tsx
│   ├── 📁 maintenance/page.tsx              # ← NEW — Maintenance mode landing page
│   ├── 📁 order-confirmation/📁 [orderId]/page.tsx
│   ├── 📁 outlets/page.tsx
│   ├── 📁 privacy/page.tsx
│   ├── 📁 product/📁 [slug]/page.tsx        # ← UPDATED — Fullscreen lightbox gallery
│   ├── 📁 register/page.tsx
│   ├── 📁 reset-password/page.tsx           # ← NEW — SMTP-based password reset form
│   ├── 📁 returns/page.tsx
│   ├── 📁 search/page.tsx
│   ├── 📁 shipping/page.tsx
│   ├── 📁 shop/
│   │   ├── page.tsx
│   │   └── 📁 [category]/page.tsx
│   ├── 📁 size-guide/page.tsx
│   ├── 📁 terms/page.tsx
│   ├── 📁 track/page.tsx
│   └── 📁 wishlist/page.tsx
│
├── 📁 components/
│   ├── SearchBar.tsx                        # Debounced autocomplete (300ms, 5 recent)
│   ├── SmoothScroll.tsx                     # ← NEW — Lenis smooth scroll wrapper
│   ├── StoreInitializer.tsx                 # Prefetch all stores + feature flags
│   ├── 📁 admin/
│   │   ├── AdminLayout.tsx                  # Admin shell with sidebar
│   │   └── 📁 settings/
│   │       └── SocialSettings.tsx           # ← NEW — Social links + Messenger config
│   ├── 📁 charts/ (lazy-loaded recharts)
│   ├── 📁 layout/
│   │   ├── Header.tsx                       # ← UPDATED — sr-only text on icon links, aria-labels on search inputs
│   │   ├── Footer.tsx                       # ← UPDATED — sr-only text on social icon links
│   │   ├── MobileMenu.tsx
│   │   ├── AnnouncementBar.tsx              # ← NEW — Dismissible top banner (feature-flagged)
│   │   ├── Breadcrumb.tsx, BottomNavBar.tsx
│   │   ├── MessengerButton.tsx              # ← NEW — Floating Messenger chat button
│   │   ├── NewsletterPopup.tsx
│   │   └── index.ts
│   ├── 📁 product/
│   │   ├── ProductDetailClient.tsx (582 lines)
│   │   ├── ProductGallery.tsx               # ← UPDATED — Fullscreen lightbox with zoom
│   │   ├── ProductSelectors.tsx
│   │   ├── RelatedProducts.tsx, ProductQuickView.tsx
│   │   └── index.ts
│   ├── 📁 review/
│   │   ├── ReviewPopup.tsx (316 lines)
│   │   └── ReviewSection.tsx
│   └── 📁 ui/ (14 components)
│       ├── Badge, Button, Card, EmptyState, Input
│       ├── Loading, Modal, Pagination, ProductCard
│       ├── QuantitySelector, Select, Skeleton, Textarea, Toast
│       └── index.ts
│
├── 📁 hooks/
│   ├── useFormatPrice.ts                    # Price formatting hook
│   ├── useSettingsGroup.ts                  # Fetch settings by group
│   └── useUserCity.ts                       # Geo-IP city detection
│
├── 📁 lib/
│   ├── api-response.ts                      # Standard API response helpers
│   ├── auth.ts                              # JWT, bcrypt, cookies, reset tokens
│   ├── constants.ts                         # App constants, routes, cities
│   ├── email.ts                             # Nodemailer with DB SMTP settings
│   ├── firebase.ts                          # Firebase client init
│   ├── helpers.ts                           # cn(), formatPrice(), slugify(), etc.
│   ├── image-loader.ts                      # Custom Next.js image loader
│   ├── middleware.ts                        # ← UPDATED — requireAuth with IP/phone/email blacklist checks
│   ├── prisma.ts                            # MariaDB adapter with pool
│   ├── redis.ts                             # Redis client singleton
│   ├── server-cache.ts                      # Hybrid Redis/in-memory cache
│   └── validations.ts                       # Zod schemas
│
├── 📁 prisma/
│   ├── schema.prisma                        # ← UPDATED — 22 models, guest fields, phoneVerified, feature flags
│   └── seed.ts                              # Database seeder
│
├── 📁 store/
│   ├── auth.ts                              # Auth state + fetchUser
│   ├── cart.ts                              # Dual-mode cart (357 lines)
│   ├── categories.ts                        # Header + full categories
│   ├── features.ts                          # ← NEW — Feature flags store (fetches from /api/settings)
│   ├── index.ts                             # Barrel export (all stores)
│   ├── locale.ts                            # Geo-IP + currency (281 lines)
│   ├── products.ts                          # 4 caches + dedup (326 lines)
│   ├── ui.ts                                # Mobile menu toggle
│   └── wishlist.ts                          # Optimistic wishlist
│
├── 📁 types/index.ts                        # TypeScript interfaces
├── 📁 utils/helpers.ts                      # Re-exports from lib/helpers
│
├── instrumentation.ts                       # Server startup cache warming
├── middleware.ts                             # ← UPDATED — Edge middleware (admin auth + maintenance + IP blacklist + DDoS rate limiting + security headers)
├── next.config.ts                           # ← UPDATED — Rewrites, CDN headers, security headers, ETag generation
├── tailwind.config.ts                       # Custom theme
├── tsconfig.json
├── prisma.config.ts                         # Prisma datasource config
├── postcss.config.mjs
├── eslint.config.mjs
└── package.json
```

---

## Phase 19: Kubernetes Deployment

Production-grade Kubernetes configuration for deploying the babyland e-commerce application at scale. Designed to handle **2,000–3,000+ concurrent users** with auto-scaling, in-cluster Redis caching, and proper health-gated traffic routing.

### 19.1 Architecture Overview

```
Internet
    │
    ▼
┌─────────────────────────────┐
│  NGINX Ingress Controller   │  ← TLS termination, rate limiting, gzip
│  babyland.com / www          │
└─────────────┬───────────────┘
              │ Port 80
              ▼
┌─────────────────────────────┐
│  ClusterIP Service          │  ← Internal round-robin load balancer
│  babyland-service:80         │     (only ready pods receive traffic)
└─────────────┬───────────────┘
              │ Port 3000
    ┌─────────┼─────────┐
    ▼         ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐
│ Pod 1  │ │ Pod 2  │ │ Pod 3  │  ← 3–10 replicas (HPA at 60% CPU)
│ :3000  │ │ :3000  │ │ :3000  │
└────────┘ └────────┘ └────────┘
    │         │         │
    ├─────────┼─────────┤
    ▼         ▼         ▼
┌──────────────┐  ┌─────────────┐
│ MySQL (ext)  │  │ Redis (k8s) │  ← In-cluster Redis for caching
│ or managed   │  │ redis:6379  │     External/managed MySQL
└──────────────┘  └─────────────┘
```

### 19.2 File Structure

```
k8s/
├── deployment.yaml          # App pods: 3 replicas, probes, resource limits, envFrom
├── service.yaml             # ClusterIP service (internal load balancer)
├── ingress.yaml             # NGINX ingress (TLS, rate limiting, routing)
├── hpa.yaml                 # Horizontal Pod Autoscaler (3–10 replicas)
├── configmap.yaml           # Non-sensitive env vars (PORT, NODE_ENV, Firebase keys)
├── secret.yaml              # Sensitive env vars (DATABASE_URL, REDIS_URL, JWT_SECRET)
├── redis-deployment.yaml    # In-cluster Redis 7 with AOF persistence
└── redis-service.yaml       # Redis ClusterIP service
```

### 19.3 Deployment (`k8s/deployment.yaml`)

- **Name:** `babyland-app`
- **Replicas:** 3 (baseline), scaled 3–10 by HPA
- **Image:** `ghcr.io/misbah7172/babyland-ecommerce:latest`
- **Strategy:** RollingUpdate (`maxSurge: 1`, `maxUnavailable: 0`) — zero-downtime
- **Topology spread:** Pods distributed across nodes for HA
- **Environment:** Loaded via `envFrom` from ConfigMap + Secret

**Resource Requests & Limits (per pod):**

| Resource | Request (guaranteed) | Limit (ceiling) |
|----------|---------------------|-----------------|
| CPU | 250m | 500m |
| Memory | 512Mi | 1Gi |

**Health Probes (3-probe strategy):**

| Probe | Purpose | Path | Initial Delay | Period | Failure Threshold |
|-------|---------|------|---------------|--------|-------------------|
| **Startup** | Wait for `start.sh` + `prisma db push` + `next start` | `/api/health` | 10s | 5s | 30 (= 150s max) |
| **Liveness** | Detect stuck Node.js process → restart pod | `/api/health` | 0s* | 30s | 3 |
| **Readiness** | Gate traffic → only healthy pods in load balancer | `/api/health` | 0s* | 10s | 3 |

*Liveness/readiness only activate after the startup probe passes.

### 19.4 ConfigMap & Secret (`k8s/configmap.yaml`, `k8s/secret.yaml`)

**ConfigMap** (non-sensitive — safe to commit):

| Key | Value | Purpose |
|-----|-------|---------|
| `PORT` | `3000` | Next.js server port |
| `HOSTNAME` | `0.0.0.0` | Bind address |
| `NODE_ENV` | `production` | Runtime mode |
| `NEXT_PUBLIC_APP_URL` | `https://babyland.com` | SEO, sitemaps, OG tags |
| `NEXT_PUBLIC_FIREBASE_*` | (your values) | Firebase client config |

**Secret** (sensitive — create imperatively or use sealed-secrets):

| Key | Example | Purpose |
|-----|---------|---------|
| `DATABASE_URL` | `mysql://user:pass@host:3306/babyland` | MySQL connection |
| `REDIS_URL` | `redis://:pass@redis-service:6379` | Redis connection |
| `JWT_SECRET` | (random 32-byte string) | Auth token signing |

```bash
# Create secrets imperatively (recommended — avoids committing real values)
kubectl create secret generic babyland-secrets \
  --from-literal=DATABASE_URL='mysql://user:pass@mysql-host:3306/babyland' \
  --from-literal=REDIS_URL='redis://:yourpassword@redis-service:6379' \
  --from-literal=JWT_SECRET="$(openssl rand -base64 32)"
```

### 19.5 Service (`k8s/service.yaml`)

- **Name:** `babyland-service`
- **Type:** ClusterIP (internal only — Ingress handles external traffic)
- **Port mapping:** `80 → 3000` (Service port → Container port)
- **Selector:** `app: babyland` — automatically includes all ready pods
- Readiness probe gates: pods failing readiness are removed from endpoints

### 19.6 Ingress (`k8s/ingress.yaml`)

- **Name:** `babyland-ingress`
- **Controller:** NGINX Ingress Controller
- **Hosts:** `babyland.com`, `www.babyland.com`
- **TLS:** cert-manager with Let's Encrypt (`letsencrypt-prod` ClusterIssuer)

| Annotation | Value | Purpose |
|------------|-------|---------|
| `ssl-redirect` | `true` | Force HTTPS (all HTTP → 301 to HTTPS) |
| `proxy-body-size` | `10m` | Allow product image uploads |
| `proxy-*-timeout` | `60s` | SSR render tolerance |
| `limit-rps` | `60` | Rate limit: 60 req/s per IP |
| `limit-burst-multiplier` | `5` | Allow short bursts (300 req/s) |
| `enable-cors` | `true` | Cross-origin API access |
| gzip | `on` | ~70% bandwidth reduction for text assets |

### 19.7 Horizontal Pod Autoscaler (`k8s/hpa.yaml`)

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Min replicas | 3 | HA baseline — survives single node failure |
| Max replicas | 10 | Cost ceiling |
| CPU target | 60% | Headroom for burst traffic |
| Memory target | 75% | SSR can be memory-intensive |
| Scale-up window | 60s | React quickly to spikes |
| Scale-down window | 300s | Avoid flapping |

**How scaling works:**

```
desiredReplicas = ⌈ currentReplicas × (currentCPU / targetCPU) ⌉
Example: 3 pods at 80% CPU → ⌈ 3 × (80/60) ⌉ = 4 pods
```

**Capacity estimates:**

| Replicas | Est. Concurrent Users | Total CPU | Total Memory |
|----------|-----------------------|-----------|--------------|
| 3 (min) | ~1,500–2,000 | 750m–1.5 cores | 1.5–3 Gi |
| 5 | ~2,500–3,500 | 1.25–2.5 cores | 2.5–5 Gi |
| 7 | ~3,500–5,000 | 1.75–3.5 cores | 3.5–7 Gi |
| 10 (max) | ~5,000–7,000 | 2.5–5 cores | 5–10 Gi |

### 19.8 Redis Caching (`k8s/redis-deployment.yaml`, `k8s/redis-service.yaml`)

In-cluster Redis 7 for shared caching across all app pods.

| Setting | Value | Purpose |
|---------|-------|---------|
| Image | `redis:7-alpine` | Minimal footprint |
| Replicas | 1 | Redis is single-threaded |
| maxmemory | 256MB | LRU eviction when full |
| appendonly | yes | Persist writes to disk (AOF) |
| requirepass | yes | Password from `redis-secret` |
| Resources | 100m–250m CPU, 256–512Mi RAM | Modest requirements |

**Connection from app pods:**

The Next.js app connects via `REDIS_URL` env var (set in `babyland-secrets`):
```
REDIS_URL=redis://:yourpassword@redis-service:6379
```

If Redis is unavailable, the app falls back to per-pod in-memory cache (degraded performance, not an outage).

### 19.9 Prerequisites

```bash
# 1. NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.0/deploy/static/provider/cloud/deploy.yaml

# 2. cert-manager (automatic TLS certificates)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.4/cert-manager.yaml

# 3. Metrics Server (required for HPA CPU/memory metrics)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### 19.10 Deployment Commands

```bash
# ── Build & Push Docker Image ────────────────────────────────
docker build -t babyland-ecommerce:latest .
docker tag babyland-ecommerce:latest ghcr.io/misbah7172/babyland-ecommerce:latest
docker push ghcr.io/misbah7172/babyland-ecommerce:latest

# ── Deploy All Resources ─────────────────────────────────────
# Apply all K8s manifests at once (order doesn't matter with declarative apply)
kubectl apply -f k8s/

# Or apply individually in dependency order:
kubectl apply -f k8s/configmap.yaml         # Config first
kubectl apply -f k8s/secret.yaml            # Secrets
kubectl apply -f k8s/redis-deployment.yaml  # Redis (app depends on it)
kubectl apply -f k8s/redis-service.yaml     # Redis service
kubectl apply -f k8s/deployment.yaml        # App pods
kubectl apply -f k8s/service.yaml           # App service
kubectl apply -f k8s/ingress.yaml           # External routing
kubectl apply -f k8s/hpa.yaml               # Autoscaling

# ── Verify Everything ────────────────────────────────────────
kubectl get pods -l app=babyland              # App pods running?
kubectl get pods -l app=redis                # Redis running?
kubectl get svc                              # Services created?
kubectl get ingress babyland-ingress          # Ingress with external IP?
kubectl get hpa babyland-hpa                  # HPA tracking CPU?

# ── Monitor & Debug ──────────────────────────────────────────
kubectl get hpa babyland-hpa --watch          # Live scaling
kubectl logs -l app=babyland --tail=50 -f     # App logs
kubectl describe pod <pod-name>              # Pod events/errors
kubectl rollout status deployment/babyland-app # Rollout progress

# ── Rolling Restart (after image update) ─────────────────────
kubectl rollout restart deployment/babyland-app
```

### 19.11 Production Checklist

- [ ] Push Docker image to container registry (GHCR/DockerHub/ECR)
- [ ] Update `image:` in deployment.yaml to match registry path
- [ ] Create `babyland-secrets` with real DATABASE_URL, REDIS_URL, JWT_SECRET
- [ ] Fill in `babyland-config` ConfigMap with Firebase keys and app URL
- [ ] Replace `redis-secret` password with a strong random value
- [ ] Install NGINX Ingress Controller in the cluster
- [ ] Install cert-manager + create `letsencrypt-prod` ClusterIssuer
- [ ] Install Metrics Server for HPA
- [ ] Configure DNS: `babyland.com` A record → Ingress external IP
- [ ] Configure DNS: `www.babyland.com` A/CNAME → Ingress external IP
- [ ] Verify health: `curl -f http://<pod-ip>:3000/api/health`
- [ ] Verify autoscaling: `kubectl get hpa babyland-hpa --watch`
- [ ] Load test: confirm pods scale up under traffic

---

## Quick Start Commands

```bash
# 1. Clone and install
git clone <repo-url>
cd babyland-ecommerce
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your database, Firebase, and JWT credentials

# 3. Setup database
npx prisma generate
npx prisma db push
npx prisma db seed

# 4. Run development server
npm run dev
# App runs at http://localhost:3000
# Admin at http://localhost:3000/admin (login: admin@babyland.com / admin123)

# 5. Production build
npm run build
npm start

# 6. Docker (full stack)
docker compose up -d
# App: http://localhost
# Adminer: http://localhost:8080
```

---

## Firebase Setup Checklist

1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Sign-in methods → Enable Google + Facebook
3. Enable **Storage** (for image uploads if using Firebase storage)
4. Go to Project Settings → General → copy Web app config (6 values)
5. Go to Project Settings → Service Accounts → Generate new private key (for Admin SDK)
6. Set all Firebase environment variables in `.env`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Prisma connection failed | Check `DATABASE_URL` format: `mysql://user:pass@host:3306/dbname` |
| Redis connection refused | Redis is optional — app falls back to in-memory cache. Set `REDIS_URL` to empty string |
| Firebase auth not working | Ensure all 6 `NEXT_PUBLIC_FIREBASE_*` env vars are set |
| Image upload fails | Check `public/uploads/` directory exists and is writable |
| Admin access denied | Ensure user has `role: ADMIN` in database |
| Docker MySQL unhealthy | Wait 30s for MySQL to fully initialize, or check MySQL logs |
| Sharp build errors | Install `vips-dev` (Alpine) or `libvips-dev` (Debian) |
| Maintenance mode stuck | Check `SiteSetting` table for `group: 'security'`, key `maintenanceMode` — set value to `false` |
| Guest checkout disabled | Ensure `enableGuestCheckout` is `true` in `SiteSetting` (group `advanced`) |
| OTP verification failing | OTP codes are stored in-memory, expire after 10 minutes. Server restart clears them |
| Blacklist not working | IP/phone/email blacklists are comma-separated in `SiteSetting` group `security`. Cached 30s |
| Rate limiting not blocking | Ensure `rateLimitEnabled` is `true` in Admin → Settings → Security → DDoS/Rate Limiting. Settings cached 30s |
| Load test getting 429 errors | Disable rate limiting in Admin → Settings → Security before running load tests |
| Smooth scroll not working | Ensure `lenis` package is installed and `SmoothScroll` wraps content in `layout.tsx` |
| Messenger button missing | Set `enableMessenger: true` and `messengerPageId` in Admin → Settings → Social |
| Feature flags not loading | Check `/api/settings?groups=advanced,social` returns data. `StoreInitializer` fetches on mount |
| Railway env failing | The "responsible-flow" environment needs MySQL plugin + env vars (DATABASE_URL, JWT_SECRET). Compare with working env |
| K8s pods CrashLoopBackOff | Check `kubectl logs <pod>` — usually missing secrets or DB unreachable. Verify `babyland-secrets` exists |
| K8s HPA not scaling | Ensure Metrics Server is installed: `kubectl get apiservice v1beta1.metrics.k8s.io` |
| K8s Ingress no external IP | Check NGINX Ingress Controller is running: `kubectl get svc -n ingress-nginx` |
| K8s TLS cert not issued | Check cert-manager logs and ClusterIssuer: `kubectl describe clusterissuer letsencrypt-prod` |
| K8s health probes failing | Startup probe allows 150s (30×5s). Check `kubectl describe pod <name>` for probe failures |
| K8s Redis connection refused | Verify `redis-service` exists and `REDIS_URL` in `babyland-secrets` uses `redis-service:6379` |

---

## Phase 14: Azure Container Apps Deployment

### 14.1 Overview

Full production deployment on **Microsoft Azure** using Azure Container Apps (serverless containers), Azure Container Registry, Azure Cache for Redis, and a MariaDB sidecar container with persistent Azure Files storage.

**Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                   Azure Container Apps                       │
│                   (Korea Central region)                     │
│                                                             │
│  ┌─────────────────┐        ┌──────────────────────┐       │
│  │  babyland-app     │───────▶│  babyland-mysql        │       │
│  │  (Next.js 16)    │        │  (MariaDB 11)         │       │
│  │  Port 3000       │        │  Port 3306             │       │
│  └────────┬─────────┘        └──────────┬────────────┘       │
│           │                             │                    │
│           │                     Azure Files Mount            │
│           ▼                     /var/lib/mysql                │
│  ┌─────────────────┐        ┌──────────────────────┐       │
│  │  Azure Cache     │        │  Azure Storage        │       │
│  │  for Redis        │        │  (babylandstorage)     │       │
│  │  (Basic C0)       │        │  mariadb-data share   │       │
│  └─────────────────┘        └──────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

**Azure Resources:**

| Resource | Type | SKU | Region |
|----------|------|-----|--------|
| `babyland-rg` | Resource Group | — | Korea Central |
| `babylandacr` | Container Registry | Basic | Korea Central |
| `babyland-env` | Container Apps Environment | Consumption | Korea Central |
| `babyland-app` | Container App (Next.js) | Consumption | Korea Central |
| `babyland-mysql` | Container App (MariaDB) | Consumption | Korea Central |
| `babyland-redis` | Azure Cache for Redis | Basic C0 | Korea Central |
| `babylandstorage` | Storage Account | Standard LRS | Korea Central |

> **Note:** Azure for Students subscriptions are policy-restricted to specific regions: `koreacentral`, `centralindia`, `uaenorth`, `indonesiacentral`, `malaysiawest`. Korea Central was chosen for best availability.

### 14.2 Prerequisites

- Azure CLI installed and logged in (`az login`)
- Docker Desktop running
- Azure subscription (Azure for Students works)

### 14.3 Infrastructure Setup

#### Create Resource Group & Container Registry

```bash
az group create --name babyland-rg --location koreacentral

az acr create --resource-group babyland-rg --name babylandacr --sku Basic --admin-enabled true

# Login to ACR
az acr login --name babylandacr
```

#### Create Azure Cache for Redis

```bash
az redis create \
  --name babyland-redis \
  --resource-group babyland-rg \
  --location koreacentral \
  --sku Basic --vm-size c0
```

#### Create Storage Account & File Share (for MariaDB persistence)

```bash
az storage account create \
  --name babylandstorage \
  --resource-group babyland-rg \
  --location koreacentral \
  --sku Standard_LRS

az storage share create \
  --name mariadb-data \
  --account-name babylandstorage
```

#### Create Container Apps Environment

```bash
az containerapp env create \
  --name babyland-env \
  --resource-group babyland-rg \
  --location koreacentral

# Add Azure Files storage mount
STORAGE_KEY=$(az storage account keys list \
  --resource-group babyland-rg \
  --account-name babylandstorage \
  --query "[0].value" -o tsv)

az containerapp env storage set \
  --name babyland-env \
  --resource-group babyland-rg \
  --storage-name mariadbstorage \
  --azure-file-account-name babylandstorage \
  --azure-file-account-key "$STORAGE_KEY" \
  --azure-file-share-name mariadb-data \
  --access-mode ReadWrite
```

### 14.4 MariaDB Container App

MariaDB 11 is used instead of MySQL because the InnoDB engine requires `fallocate()` and `O_DIRECT` flags which Azure Files (CIFS) does not support. MariaDB works natively with Azure Files.

```bash
az containerapp create \
  --name babyland-mysql \
  --resource-group babyland-rg \
  --environment babyland-env \
  --image mariadb:11 \
  --cpu 0.5 --memory 1Gi \
  --min-replicas 1 --max-replicas 1 \
  --env-vars \
    MARIADB_ROOT_PASSWORD=<root-password> \
    MARIADB_DATABASE=babyland \
    MARIADB_USER=babyland_user \
    MARIADB_PASSWORD=<db-password> \
  --target-port 3306 \
  --ingress internal \
  --transport tcp
```

Then add the persistent volume mount:

```bash
az containerapp update \
  --name babyland-mysql \
  --resource-group babyland-rg \
  --set-env-vars "MARIADB_ROOT_PASSWORD=<root-password>" \
            "MARIADB_DATABASE=babyland" \
            "MARIADB_USER=babyland_user" \
            "MARIADB_PASSWORD=<db-password>" \
  --yaml mysql-volume.yaml
```

### 14.5 Build & Push Application Image

```bash
cd babyland-ecommerce

# Build with Firebase and App URL build args
docker build -t babylandacr.azurecr.io/babyland-app:v4 \
  --build-arg NEXT_PUBLIC_APP_URL=https://babyland-app.<env-id>.koreacentral.azurecontainerapps.io \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=<api-key> \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project-id> \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<project>.firebasestorage.app \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender-id> \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID=<app-id> \
  .

docker push babylandacr.azurecr.io/babyland-app:v4
```

### 14.6 Deploy Application Container App

```bash
ACR_PASSWORD=$(az acr credential show --name babylandacr --query "passwords[0].value" -o tsv)

az containerapp create \
  --name babyland-app \
  --resource-group babyland-rg \
  --environment babyland-env \
  --image babylandacr.azurecr.io/babyland-app:v4 \
  --registry-server babylandacr.azurecr.io \
  --registry-username babylandacr \
  --registry-password "$ACR_PASSWORD" \
  --cpu 1 --memory 2Gi \
  --min-replicas 1 --max-replicas 3 \
  --target-port 3000 \
  --ingress external \
  --env-vars \
    DATABASE_URL="mysql://babyland_user:<password>@babyland-mysql:3306/babyland" \
    REDIS_URL="rediss://:<redis-key>@babyland-redis.redis.cache.windows.net:6380" \
    JWT_SECRET="<generated-secret>" \
    NODE_ENV="production" \
    PORT="3000"
```

### 14.7 Update Deployment (New Image)

When code changes are made, rebuild and update the container:

```bash
# Build with new version tag
docker build -t babylandacr.azurecr.io/babyland-app:v5 --build-arg ... .

# Push to ACR
docker push babylandacr.azurecr.io/babyland-app:v5

# Update container app (creates new revision and pulls new image)
az containerapp update \
  --name babyland-app \
  --resource-group babyland-rg \
  --image babylandacr.azurecr.io/babyland-app:v5
```

> **Important:** `az containerapp revision restart` only restarts the existing revision — it does NOT pull a new image. Always use `az containerapp update --image` with a new tag to force a new image pull.

### 14.8 Admin User Creation

A one-time script creates the admin user in the deployed database:

```javascript
// prisma/seed-admin.js
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const { PrismaMariaDb } = require('@prisma/adapter-mariadb')

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST || 'babyland-mysql',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'babyland_user',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'babyland',
  connectionLimit: 2,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const hash = await bcrypt.hash('<admin-password>', 10)
  const existing = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  })
  if (existing) {
    await prisma.user.update({
      where: { email: 'admin@example.com' },
      data: { password: hash, role: 'ADMIN' },
    })
  } else {
    await prisma.user.create({
      data: { email: 'admin@example.com', password: hash, name: 'Admin User', role: 'ADMIN' },
    })
  }
}

main()
  .catch((e) => { console.error('Error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
```

Run via `az containerapp exec`:

```bash
az containerapp exec --name babyland-app --resource-group babyland-rg --command "node prisma/seed-admin.js"
```

---

## Phase 15: Azure Deployment — Bug Fixes & Lessons Learned

### 15.1 MySQL → MariaDB Migration

**Problem:** MySQL's InnoDB engine requires `fallocate()` and `O_DIRECT` system calls for tablespace operations. Azure Files uses the CIFS/SMB protocol which does not support these POSIX calls, causing MySQL to crash immediately on startup.

**Solution:** Switched to MariaDB 11, which has a more flexible InnoDB implementation that works with CIFS-mounted volumes. MariaDB is wire-compatible with MySQL — the Prisma `@prisma/adapter-mariadb` driver works without code changes.

### 15.2 Firebase Google Auth — Wrong App ID in Docker Build

**Problem:** The Docker image was built with incorrect `NEXT_PUBLIC_FIREBASE_APP_ID` build arg (a different Firebase project's ID was hardcoded), causing Firebase `auth/unauthorized-domain` errors when users tried Google sign-in.

**Solution:** Ensured all `--build-arg` values match the project's `.env` file exactly. Firebase public config values are embedded at build time by Next.js — they cannot be overridden at runtime via environment variables.

**Dockerfile change:**

```dockerfile
# Added missing build arg
ARG NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```

### 15.3 Firebase Popup Auth — COOP Header Blocking

**Problem:** Firebase's `signInWithPopup()` opens a new window for Google OAuth. The `Cross-Origin-Opener-Policy: same-origin` header prevents the popup from communicating back to the parent window, causing a silent auth failure.

**Solution:** Changed COOP header from `same-origin` to `same-origin-allow-popups` in `middleware.ts`:

```typescript
// middleware.ts — SECURITY_HEADERS
'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
```

### 15.4 Firebase Analytics Crash Guard

**Problem:** `getAnalytics(app)` throws if the Firebase Measurement ID is missing, the API key is restricted, or the request is blocked by an ad blocker. This crash prevented the entire Firebase module from loading.

**Solution:** Wrapped analytics initialization in try-catch in `lib/firebase.ts`:

```typescript
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app)
  } catch {
    console.warn('Firebase Analytics failed to initialize')
  }
}
```

### 15.5 Prisma MariaDB Adapter — `$transaction` + `upsert` Bug

**Problem:** The admin settings save API used `prisma.$transaction([upsert(), upsert(), ...])` which triggers a known Prisma MariaDB adapter bug: *"Transaction already closed: A rollback cannot be executed on a committed transaction"*. This caused all settings saves (Security, Social, General, etc.) to fail with a 500 error.

**Root cause:** The `@prisma/adapter-mariadb` driver commits the transaction after the first `upsert` operation, then fails when subsequent operations try to execute within the already-committed transaction.

**Solution:** Replaced batch `$transaction` + `upsert` with sequential `findUnique` + `create`/`update` in `app/api/admin/settings/route.ts`:

```typescript
// BEFORE (broken with MariaDB adapter):
const ops = Object.entries(settings).map(([key, value]) =>
  prisma.siteSetting.upsert({
    where: { group_key: { group, key } },
    create: { group, key, value: JSON.stringify(value) },
    update: { value: JSON.stringify(value) },
  })
)
await prisma.$transaction(ops)

// AFTER (works with MariaDB adapter):
for (const [key, value] of Object.entries(settings)) {
  const existing = await prisma.siteSetting.findUnique({
    where: { group_key: { group, key } },
  })
  if (existing) {
    await prisma.siteSetting.update({
      where: { group_key: { group, key } },
      data: { value: JSON.stringify(value) },
    })
  } else {
    await prisma.siteSetting.create({
      data: { group, key, value: JSON.stringify(value) },
    })
  }
}
```

### 15.6 Maintenance Mode — Self-Fetch via External URL

**Problem:** The middleware's maintenance mode check fetches security settings from `/api/settings?groups=security` using `request.nextUrl.origin` as the base URL. In Azure Container Apps, this resolves to the external ingress URL (e.g., `https://babyland-app.<env>.koreacentral.azurecontainerapps.io`). The container cannot reliably reach itself through the external load balancer within the 3-second timeout, causing the fetch to silently fail and default to `maintenanceEnabled: false`.

**Solution:** Changed the self-fetch URL to use localhost in `middleware.ts`:

```typescript
// BEFORE (fails in Azure Container Apps):
const baseUrl = request.nextUrl.origin
const res = await fetch(`${baseUrl}/api/settings?groups=security`, ...)

// AFTER (works everywhere):
const internalOrigin = `http://localhost:${process.env.PORT || 3000}`
const res = await fetch(`${internalOrigin}/api/settings?groups=security`, ...)
```

### 15.7 Settings Save — Circular JSON from MouseEvent

**Problem:** The `SettingsSaveBar` component used `onClick={onSave}`, which passes the browser's `MouseEvent` object as the first argument to `saveSettings(overrideSettings?)`. The hook then calls `JSON.stringify(overrideSettings || settings)`, and the MouseEvent contains circular DOM references (`_reactFiber` → `stateNode` → `HTMLButtonElement` → fiber → ...), causing: *"Converting circular structure to JSON → starting at object with constructor 'HTMLButtonElement'"*.

**Solution:** Wrapped the handler in an arrow function in `components/admin/settings/SettingsSaveBar.tsx`:

```tsx
// BEFORE (passes MouseEvent as overrideSettings):
<button onClick={onSave} ...>

// AFTER (no arguments passed):
<button onClick={() => onSave()} ...>
```

### 15.8 Error Reporting Improvement

**Problem:** The `useSettingsGroup` hook caught `TypeError` exceptions and displayed a generic "Network error — please check your connection" message. This masked the real error (the circular JSON error above was displayed as a network problem).

**Solution:** Updated `hooks/useSettingsGroup.ts` to show the actual error message and log to console:

```typescript
} catch (e: unknown) {
  console.error(`[settings:${group}] Save attempt ${attempt + 1} failed:`, e);
  if (attempt === 1) {
    const msg = e instanceof DOMException && e.name === 'AbortError'
      ? 'Request timed out — the server took too long to respond'
      : `Save failed — ${e instanceof Error ? e.message : String(e)}`;
    setError(msg);
  }
}
```

### 15.9 Deployment Checklist

| Step | Command | Notes |
|------|---------|-------|
| 1. Build image | `docker build -t babylandacr.azurecr.io/babyland-app:vN ...` | Include all `--build-arg` for Firebase |
| 2. Push to ACR | `docker push babylandacr.azurecr.io/babyland-app:vN` | Must be logged in via `az acr login` |
| 3. Update app | `az containerapp update --image ...` | Use new tag to force pull |
| 4. Verify health | `curl https://<app-url>/api/health` | Check uptime confirms new revision |
| 5. Test settings | Save from admin panel | Verify no errors in browser console |

### 15.10 Azure Deployment Troubleshooting

| Issue | Solution |
|-------|----------|
| MySQL crash on Azure Files | Use MariaDB 11 instead — InnoDB works with CIFS/SMB mounts |
| New code not deployed after restart | Use `az containerapp update --image <new-tag>` instead of `revision restart` |
| Firebase auth popup fails silently | Set `Cross-Origin-Opener-Policy: same-origin-allow-popups` |
| Firebase analytics crash | Wrap `getAnalytics()` in try-catch |
| Settings save returns 500 | Avoid `$transaction` + `upsert` with MariaDB adapter — use sequential find+create/update |
| Maintenance mode not working | Use `http://localhost:$PORT` for middleware self-fetch, not external URL |
| "Network error" on settings save | Check browser console for actual error — may be circular JSON from event leak |
| Container can't reach DB | Both must be in same Container Apps Environment; DB uses internal ingress |
| Redis connection refused | Use `rediss://` (with double s) for Azure Redis SSL on port 6380 |

### 15.11 Changed Files Summary

| File | Change | Reason |
|------|--------|--------|
| `Dockerfile` | Added `ARG NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Missing build arg for Firebase Analytics |
| `middleware.ts` | COOP header → `same-origin-allow-popups`; self-fetch → `localhost` | Firebase popup auth fix; maintenance mode fix |
| `lib/firebase.ts` | try-catch around `getAnalytics()` | Prevent crash when Analytics blocked |
| `app/api/admin/settings/route.ts` | Sequential find+create/update instead of `$transaction([upsert])` | Prisma MariaDB adapter transaction bug |
| `components/admin/settings/SettingsSaveBar.tsx` | `onClick={() => onSave()}` instead of `onClick={onSave}` | Prevent MouseEvent circular JSON error |
| `hooks/useSettingsGroup.ts` | Show actual error message + console.error logging | Better error diagnostics |
| `prisma/seed-admin.js` | New file — one-time admin user creation script | Create admin in deployed database |

---

*Built with Next.js 16 + Prisma 7 + MariaDB + Firebase + Zustand + Tailwind CSS 4 + Lenis*
*Last updated: March 2026*
