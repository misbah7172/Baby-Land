export type SizeOption = 'NEWBORN' | 'M0_3' | 'M3_6' | 'M6_12' | 'M12_18' | 'M18_24' | 'ONE_SIZE';

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  discountPrice: string | null;
  stock: number;
  sku: string;
  material: string;
  featured: boolean;
  averageRating: number;
  category: { id: string; name: string; slug: string };
  images: Array<{ id: string; url: string; sortOrder: number }>;
  sizes: Array<{ id: string; size: SizeOption }>;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
};

export type CartItem = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: string;
  size: SizeOption | null;
};

export type CartPayload = {
  items: CartItem[];
  subtotal: string;
  itemCount: number;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  phone?: string | null;
};