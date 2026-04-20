'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  createAdminCategory,
  createAdminProduct,
  deleteAdminCategory,
  deleteAdminProduct,
  deleteAdminReview,
  getAdminAnalytics,
  getAdminCategories,
  getAdminHomepageSettings,
  getAdminOrderDetail,
  getAdminOrders,
  getAdminProducts,
  getAdminReviews,
  getAdminUsers,
  updateAdminCategory,
  updateAdminHomepageSettings,
  updateAdminProduct,
  updateAdminUserRole,
  uploadAdminImage,
  updateAdminOrderStatus
} from '@/lib/api';

type AdminOrder = {
  id: string;
  orderStatus: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalPrice: string;
  createdAt: string;
  user: { name: string; email: string } | null;
  items: Array<{ id: string; productName: string; quantity: number; price: string }>;
};

type AdminOrderDetail = {
  id: string;
  orderStatus: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalPrice: string;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: string;
    product: { id: string; name: string; slug: string };
  }>;
  statusLog: Array<{
    id: string;
    status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    note: string | null;
    createdAt: string;
  }>;
};

type AdminCategory = { id: string; name: string; slug: string };

type AdminProduct = {
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
  category: { id: string; name: string; slug: string };
  images: Array<{ id: string; url: string; sortOrder: number }>;
  sizes: Array<{ id: string; size: 'NEWBORN' | 'M0_3' | 'M3_6' | 'M6_12' | 'M12_18' | 'M18_24' | 'ONE_SIZE' }>;
};

type DashboardAnalytics = {
  totalOrders: number;
  totalSales: string;
  topProducts: Array<{ productId: string; productName: string; _sum: { quantity: number | null } }>;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt: string;
  _count: { orders: number; reviews: number };
};

type AdminReview = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
  product: { id: string; name: string; slug: string };
};

type HomepageSettings = {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  heroImageUrl: string;
};

const sizeOptions: Array<'NEWBORN' | 'M0_3' | 'M3_6' | 'M6_12' | 'M12_18' | 'M18_24' | 'ONE_SIZE'> = [
  'NEWBORN',
  'M0_3',
  'M3_6',
  'M6_12',
  'M12_18',
  'M18_24',
  'ONE_SIZE'
];

const orderStatusOptions: Array<'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'> = ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function readInputValue(event: unknown) {
  return (event as { target: { value: string } }).target.value;
}

function readInputChecked(event: unknown) {
  return (event as { target: { checked: boolean } }).target.checked;
}

function createEmptyProductForm(categoryId?: string) {
  return {
    name: '',
    slug: '',
    description: '',
    price: '',
    discountPrice: '',
    categoryId: categoryId || '',
    stock: '0',
    sku: '',
    material: '',
    imageUrls: '',
    sizes: 'ONE_SIZE',
    featured: false
  };
}

function createDefaultHomepageSettings(): HomepageSettings {
  return {
    heroBadge: 'Comfort for Your Little One',
    heroTitle: 'Gentle Care, Trusted Quality',
    heroSubtitle: 'Premium baby essentials designed with parents in mind. Soft, safe, and sourced from the most trusted brands for your peace of mind.',
    primaryCtaLabel: 'Explore Products',
    secondaryCtaLabel: 'View Categories',
    heroImageUrl: ''
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState(process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'Admin');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'categories' | 'users' | 'reviews'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings>(createDefaultHomepageSettings());
  const [newCategory, setNewCategory] = useState({ name: '', slug: '' });
  const [newProduct, setNewProduct] = useState(createEmptyProductForm());
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadMessage, setImageUploadMessage] = useState('');
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [heroImageMessage, setHeroImageMessage] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<AdminOrderDetail | null>(null);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);

  useEffect(() => {
    const storedEmail = (globalThis as { sessionStorage?: { getItem: (key: string) => string | null } }).sessionStorage?.getItem('admin-auth-email');
    if (storedEmail) {
      setAdminEmail(storedEmail);
    }

    loadAdminData().catch(() => {
      setMessage('Failed to load admin data. Please check admin credentials in env and refresh.');
    });
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const [analyticsResult, ordersResult, productsResult, categoriesResult, usersResult, reviewsResult, homepageSettingsResult] = await Promise.all([
        getAdminAnalytics(),
        getAdminOrders(),
        getAdminProducts(),
        getAdminCategories(),
        getAdminUsers(),
        getAdminReviews(),
        getAdminHomepageSettings()
      ]);

      setAnalytics(analyticsResult);
      setOrders(ordersResult.orders || []);
      setProducts(productsResult.products || []);
      setCategories(categoriesResult.categories || []);
      setUsers(usersResult.users || []);
      setReviews(reviewsResult.reviews || []);
      setHomepageSettings({
        heroBadge: typeof homepageSettingsResult.settings.heroBadge === 'string' ? homepageSettingsResult.settings.heroBadge : createDefaultHomepageSettings().heroBadge,
        heroTitle: typeof homepageSettingsResult.settings.heroTitle === 'string' ? homepageSettingsResult.settings.heroTitle : createDefaultHomepageSettings().heroTitle,
        heroSubtitle: typeof homepageSettingsResult.settings.heroSubtitle === 'string' ? homepageSettingsResult.settings.heroSubtitle : createDefaultHomepageSettings().heroSubtitle,
        primaryCtaLabel: typeof homepageSettingsResult.settings.primaryCtaLabel === 'string' ? homepageSettingsResult.settings.primaryCtaLabel : createDefaultHomepageSettings().primaryCtaLabel,
        secondaryCtaLabel: typeof homepageSettingsResult.settings.secondaryCtaLabel === 'string' ? homepageSettingsResult.settings.secondaryCtaLabel : createDefaultHomepageSettings().secondaryCtaLabel,
        heroImageUrl: typeof homepageSettingsResult.settings.heroImageUrl === 'string' ? homepageSettingsResult.settings.heroImageUrl : createDefaultHomepageSettings().heroImageUrl
      });
      if (!editingProductId && !newProduct.categoryId && (categoriesResult.categories || []).length > 0) {
        setNewProduct((prev) => ({ ...prev, categoryId: categoriesResult.categories[0]!.id }));
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    (globalThis as { sessionStorage?: { removeItem: (key: string) => void } }).sessionStorage?.removeItem('admin-authenticated');
    (globalThis as { sessionStorage?: { removeItem: (key: string) => void } }).sessionStorage?.removeItem('admin-auth-email');
    router.push(`/${process.env.NEXT_PUBLIC_ADMIN_PATH || '458901'}`);
    router.refresh();
  };

  const handleCreateCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (editingCategoryId) {
        await updateAdminCategory(editingCategoryId, {
          name: newCategory.name,
          slug: newCategory.slug || toSlug(newCategory.name)
        });
        setMessage('Category updated successfully.');
      } else {
        await createAdminCategory({
          name: newCategory.name,
          slug: newCategory.slug || toSlug(newCategory.name)
        });
        setMessage('Category created successfully.');
      }

      setEditingCategoryId(null);
      setNewCategory({ name: '', slug: '' });
      const categoriesResult = await getAdminCategories();
      setCategories(categoriesResult.categories || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save category');
    }
  };

  const handleEditCategory = (category: AdminCategory) => {
    setEditingCategoryId(category.id);
    setNewCategory({ name: category.name, slug: category.slug });
    setMessage('Editing category. Update fields and click Save Category.');
  };

  const handleCancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setNewCategory({ name: '', slug: '' });
    setMessage('Category edit cancelled.');
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteAdminCategory(categoryId);
      setMessage('Category deleted successfully.');
      const categoriesResult = await getAdminCategories();
      setCategories(categoriesResult.categories || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete category');
    }
  };

  const buildProductPayload = () => ({
    name: newProduct.name,
    slug: newProduct.slug || toSlug(newProduct.name),
    description: newProduct.description,
    price: Number(newProduct.price),
    discountPrice: newProduct.discountPrice ? Number(newProduct.discountPrice) : null,
    categoryId: newProduct.categoryId,
    stock: Number(newProduct.stock),
    sku: newProduct.sku,
    material: newProduct.material,
    featured: newProduct.featured,
    imageUrls: newProduct.imageUrls
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean),
    sizes: newProduct.sizes
      .split(',')
      .map((size) => size.trim())
      .filter((size): size is 'NEWBORN' | 'M0_3' | 'M3_6' | 'M6_12' | 'M12_18' | 'M18_24' | 'ONE_SIZE' =>
        sizeOptions.includes(size as 'NEWBORN' | 'M0_3' | 'M3_6' | 'M6_12' | 'M12_18' | 'M18_24' | 'ONE_SIZE')
      )
  });

  const handleSubmitProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (editingProductId) {
        await updateAdminProduct(editingProductId, buildProductPayload());
        setMessage('Product updated successfully.');
      } else {
        await createAdminProduct(buildProductPayload());
        setMessage('Product created successfully.');
      }

      setEditingProductId(null);
      setNewProduct(createEmptyProductForm(categories[0]?.id));
      const productsResult = await getAdminProducts();
      setProducts(productsResult.products || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save product');
    }
  };

  const handleEditProduct = (product: AdminProduct) => {
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || '',
      categoryId: product.category?.id || '',
      stock: String(product.stock),
      sku: product.sku,
      material: product.material,
      imageUrls: product.images.map((image) => image.url).join(', '),
      sizes: product.sizes.map((size) => size.size).join(','),
      featured: product.featured
    });
    setMessage('Editing product. Update fields and click Save Changes.');
  };

  const handleCancelEditProduct = () => {
    setEditingProductId(null);
    setNewProduct(createEmptyProductForm(categories[0]?.id));
    setMessage('Edit cancelled.');
  };

  const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target as unknown as { files?: Array<{ name: string }>; value: string };
    const file = fileInput.files?.[0] as unknown as Blob & { name?: string } | undefined;
    if (!file) {
      return;
    }

    setUploadingImage(true);
    setImageUploadMessage('');

    try {
      const result = await uploadAdminImage(file, file.name || 'upload.jpg');
      setNewProduct((prev) => ({
        ...prev,
        imageUrls: prev.imageUrls ? `${prev.imageUrls}, ${result.url}` : result.url
      }));
      setImageUploadMessage('Image uploaded and added to product images.');
    } catch (error) {
      setImageUploadMessage(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      fileInput.value = '';
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteAdminProduct(productId);
      setMessage('Product deleted successfully.');
      const productsResult = await getAdminProducts();
      setProducts(productsResult.products || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete product');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, orderStatus: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED') => {
    try {
      await updateAdminOrderStatus(orderId, { orderStatus });
      setMessage('Order status updated.');
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, orderStatus } : order)));
      if (selectedOrderDetail?.id === orderId) {
        setSelectedOrderDetail((prev) => (prev ? { ...prev, orderStatus } : prev));
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to update order status');
    }
  };

  const handleUpdateUserRole = async (userId: string, role: 'CUSTOMER' | 'ADMIN') => {
    try {
      await updateAdminUserRole(userId, role);
      setMessage('User role updated.');
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role } : user)));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to update user role');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteAdminReview(reviewId);
      setMessage('Review removed successfully.');
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to remove review');
    }
  };

  const handleSaveHomepageSettings = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const result = await updateAdminHomepageSettings(homepageSettings);
      setHomepageSettings({
        heroBadge: typeof result.settings.heroBadge === 'string' ? result.settings.heroBadge : homepageSettings.heroBadge,
        heroTitle: typeof result.settings.heroTitle === 'string' ? result.settings.heroTitle : homepageSettings.heroTitle,
        heroSubtitle: typeof result.settings.heroSubtitle === 'string' ? result.settings.heroSubtitle : homepageSettings.heroSubtitle,
        primaryCtaLabel: typeof result.settings.primaryCtaLabel === 'string' ? result.settings.primaryCtaLabel : homepageSettings.primaryCtaLabel,
        secondaryCtaLabel: typeof result.settings.secondaryCtaLabel === 'string' ? result.settings.secondaryCtaLabel : homepageSettings.secondaryCtaLabel,
        heroImageUrl: typeof result.settings.heroImageUrl === 'string' ? result.settings.heroImageUrl : homepageSettings.heroImageUrl
      });
      setMessage('Homepage hero updated successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to update homepage hero');
    }
  };

  const handleUploadHeroImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target as unknown as { files?: Array<{ name: string }>; value: string };
    const file = fileInput.files?.[0] as unknown as Blob & { name?: string } | undefined;
    if (!file) {
      return;
    }

    setUploadingHeroImage(true);
    setHeroImageMessage('');

    try {
      const result = await uploadAdminImage(file, file.name || 'hero-image.jpg');
      setHomepageSettings((prev) => ({ ...prev, heroImageUrl: result.url }));
      setHeroImageMessage('Hero image uploaded. Click Save Homepage Hero to publish it.');
    } catch (error) {
      setHeroImageMessage(error instanceof Error ? error.message : 'Failed to upload hero image');
    } finally {
      setUploadingHeroImage(false);
      fileInput.value = '';
    }
  };

  const handleOpenOrderDetail = async (orderId: string) => {
    setSelectedOrderId(orderId);
    setLoadingOrderDetail(true);

    try {
      const result = await getAdminOrderDetail(orderId);
      setSelectedOrderDetail(result.order);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load order details');
      setSelectedOrderId(null);
    } finally {
      setLoadingOrderDetail(false);
    }
  };

  const handleCloseOrderDetail = () => {
    setSelectedOrderId(null);
    setSelectedOrderDetail(null);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-[#FADADD]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#333333]">Admin Panel</h1>
            <p className="text-sm text-[#777777]">Welcome, {adminEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-[#FFB6A3] text-white px-6 py-2 rounded-2xl hover:opacity-90 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-wrap gap-3">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'orders', label: 'Orders' },
            { id: 'products', label: 'Products' },
            { id: 'categories', label: 'Categories' },
            { id: 'users', label: 'Users' },
            { id: 'reviews', label: 'Reviews' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as 'dashboard' | 'orders' | 'products' | 'categories' | 'users' | 'reviews')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                activeTab === tab.id ? 'bg-[#FFB6A3] text-white' : 'bg-white text-[#555555] hover:bg-[#FFE9E2]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {message ? (
          <div className="mt-6 rounded-2xl border border-[#FADADD] bg-white p-4 text-sm text-[#555555]">
            {message}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-8 rounded-2xl bg-white p-8 text-center text-[#777777]">Loading admin data...</div>
        ) : null}

        {!loading && activeTab === 'dashboard' ? (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-semibold text-[#333333]">Total Orders</h2>
              <p className="text-4xl font-bold text-[#FFB6A3] mt-4">{analytics?.totalOrders || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-semibold text-[#333333]">Total Sales</h2>
              <p className="text-4xl font-bold text-[#8FC9A3] mt-4">৳{analytics?.totalSales || '0.00'}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-semibold text-[#333333]">Products</h2>
              <p className="text-4xl font-bold text-[#9EB3FF] mt-4">{products.length}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm md:col-span-2 lg:col-span-3">
              <h3 className="text-lg font-semibold text-[#333333]">Top Selling Products</h3>
              <div className="mt-4 space-y-3 text-sm text-[#555555]">
                {(analytics?.topProducts || []).map((item) => (
                  <div key={item.productId} className="flex items-center justify-between rounded-xl bg-[#FFF8F0] p-3">
                    <span>{item.productName}</span>
                    <span className="font-semibold">{item._sum.quantity || 0} sold</span>
                  </div>
                ))}
                {analytics?.topProducts?.length ? null : <p>No sales data yet.</p>}
              </div>
            </div>

            <form onSubmit={handleSaveHomepageSettings} className="bg-white p-6 rounded-2xl shadow-sm md:col-span-2 lg:col-span-3 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[#333333]">Homepage Hero Customization</h3>
                <p className="text-sm text-[#777777] mt-1">Update the hero badge, heading, supporting text, CTAs, and hero image shown on the homepage.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={homepageSettings.heroBadge}
                  onChange={(event) => setHomepageSettings((prev) => ({ ...prev, heroBadge: readInputValue(event) }))}
                  placeholder="Hero badge"
                  className="w-full rounded-xl border border-[#FADADD] px-4 py-2"
                />
                <input
                  value={homepageSettings.primaryCtaLabel}
                  onChange={(event) => setHomepageSettings((prev) => ({ ...prev, primaryCtaLabel: readInputValue(event) }))}
                  placeholder="Primary CTA label"
                  className="w-full rounded-xl border border-[#FADADD] px-4 py-2"
                />
              </div>
              <input
                value={homepageSettings.heroTitle}
                onChange={(event) => setHomepageSettings((prev) => ({ ...prev, heroTitle: readInputValue(event) }))}
                placeholder="Hero title"
                className="w-full rounded-xl border border-[#FADADD] px-4 py-2"
              />
              <textarea
                value={homepageSettings.heroSubtitle}
                onChange={(event) => setHomepageSettings((prev) => ({ ...prev, heroSubtitle: readInputValue(event) }))}
                placeholder="Hero subtitle"
                className="w-full rounded-xl border border-[#FADADD] px-4 py-2"
                rows={3}
              />
              <input
                value={homepageSettings.secondaryCtaLabel}
                onChange={(event) => setHomepageSettings((prev) => ({ ...prev, secondaryCtaLabel: readInputValue(event) }))}
                placeholder="Secondary CTA label"
                className="w-full rounded-xl border border-[#FADADD] px-4 py-2"
              />
              <div className="space-y-2 rounded-2xl border border-[#FADADD] bg-[#FFF8F0] p-4">
                <p className="text-sm font-semibold text-[#333333]">Hero Image</p>
                <input
                  value={homepageSettings.heroImageUrl}
                  onChange={(event) => setHomepageSettings((prev) => ({ ...prev, heroImageUrl: readInputValue(event) }))}
                  placeholder="Hero image URL"
                  className="w-full rounded-xl border border-[#FADADD] px-4 py-2"
                />
                <input type="file" accept="image/*" onChange={handleUploadHeroImage} className="w-full rounded-xl border border-dashed border-[#FADADD] px-4 py-2 bg-white" />
                <p className="text-xs text-[#777777]">{uploadingHeroImage ? 'Uploading hero image...' : 'Upload or paste an image URL. Save to publish.'}</p>
                {heroImageMessage ? <p className="text-xs text-[#2d7a5e]">{heroImageMessage}</p> : null}
                {homepageSettings.heroImageUrl ? (
                  <div className="rounded-xl bg-white p-2">
                    <img src={homepageSettings.heroImageUrl} alt="Hero preview" className="h-40 w-full rounded-lg object-cover" />
                  </div>
                ) : null}
              </div>
              <button type="submit" className="rounded-xl bg-[#FFB6A3] px-5 py-2 font-semibold text-white">
                Save Homepage Hero
              </button>
            </form>
          </div>
        ) : null}

        {!loading && activeTab === 'orders' ? (
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#333333]">Order Management</h2>
            <div className="mt-4 space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-[#FADADD] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-[#333333]">Order: {order.id}</p>
                      <p className="text-sm text-[#777777]">{order.user?.email || 'Guest user'} • ৳{order.totalPrice}</p>
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                      <button
                        type="button"
                        onClick={() => handleOpenOrderDetail(order.id)}
                        className="px-4 py-2 rounded-xl bg-[#9EB3FF] text-white text-sm hover:opacity-90 transition"
                      >
                        View Details
                      </button>
                      <select
                        value={order.orderStatus}
                        onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                          handleUpdateOrderStatus(order.id, readInputValue(event) as 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED')
                        }
                        className="rounded-xl border border-[#FADADD] px-4 py-2"
                      >
                        {orderStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              {orders.length ? null : <p className="text-[#777777]">No orders found.</p>}
            </div>
          </div>
        ) : null}

        {selectedOrderDetail ? (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
              <div className="sticky top-0 bg-white border-b border-[#FADADD] p-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-[#333333]">Order #{selectedOrderDetail.id}</h3>
                <button
                  type="button"
                  onClick={handleCloseOrderDetail}
                  className="text-[#777777] hover:text-[#333333] text-xl"
                >
                  ✕
                </button>
              </div>

              {loadingOrderDetail ? (
                <div className="p-8 text-center text-[#777777]">Loading order details...</div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* Customer Info */}
                  <div className="border-b border-[#FADADD] pb-4">
                    <h4 className="font-semibold text-[#333333] mb-2">Customer</h4>
                    <p className="text-[#555555]">{selectedOrderDetail.user?.name || 'Guest'}</p>
                    <p className="text-sm text-[#777777]">{selectedOrderDetail.user?.email || 'No email'}</p>
                  </div>

                  {/* Order Items */}
                  <div className="border-b border-[#FADADD] pb-4">
                    <h4 className="font-semibold text-[#333333] mb-3">Items</h4>
                    <div className="space-y-2">
                      {selectedOrderDetail.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-[#FFF8F0] rounded-xl p-3">
                          <div>
                            <p className="font-medium text-[#333333]">{item.productName}</p>
                            <p className="text-sm text-[#777777]">Qty: {item.quantity} × ৳{item.price}</p>
                          </div>
                          <p className="font-semibold text-[#333333]">৳{(Number(item.price) * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="border-b border-[#FADADD] pb-4">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold text-[#333333]">Total:</p>
                      <p className="text-2xl font-bold text-[#FFB6A3]">৳{selectedOrderDetail.totalPrice}</p>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="border-b border-[#FADADD] pb-4">
                    <h4 className="font-semibold text-[#333333] mb-3">Status History</h4>
                    <div className="space-y-3">
                      {selectedOrderDetail.statusLog.map((log, index) => (
                        <div key={log.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-[#FFB6A3] mt-1.5" />
                            {index < selectedOrderDetail.statusLog.length - 1 && <div className="w-0.5 h-12 bg-[#FADADD]" />}
                          </div>
                          <div className="flex-1 pb-2">
                            <p className="font-semibold text-[#333333]">{log.status}</p>
                            <p className="text-xs text-[#777777]">{new Date(log.createdAt).toLocaleString()}</p>
                            {log.note && <p className="text-sm text-[#555555] mt-1">{log.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={handleCloseOrderDetail}
                    className="w-full py-3 rounded-xl bg-[#FFB6A3] text-white font-semibold hover:opacity-90 transition"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {!loading && activeTab === 'products' ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <form onSubmit={handleSubmitProduct} className="rounded-2xl bg-white p-6 shadow-sm space-y-3">
              <h2 className="text-xl font-semibold text-[#333333]">{editingProductId ? 'Edit Product' : 'Add Product'}</h2>
              <input value={newProduct.name} onChange={(event) => setNewProduct((prev) => ({ ...prev, name: readInputValue(event) }))} placeholder="Name" className="w-full rounded-xl border border-[#FADADD] px-4 py-2" required />
              <input value={newProduct.slug} onChange={(event) => setNewProduct((prev) => ({ ...prev, slug: readInputValue(event) }))} placeholder="Slug (optional)" className="w-full rounded-xl border border-[#FADADD] px-4 py-2" />
              <textarea value={newProduct.description} onChange={(event) => setNewProduct((prev) => ({ ...prev, description: readInputValue(event) }))} placeholder="Description" className="w-full rounded-xl border border-[#FADADD] px-4 py-2" rows={3} required />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" step="0.01" value={newProduct.price} onChange={(event) => setNewProduct((prev) => ({ ...prev, price: readInputValue(event) }))} placeholder="Price" className="w-full rounded-xl border border-[#FADADD] px-4 py-2" required />
                <input type="number" step="0.01" value={newProduct.discountPrice} onChange={(event) => setNewProduct((prev) => ({ ...prev, discountPrice: readInputValue(event) }))} placeholder="Discount price" className="w-full rounded-xl border border-[#FADADD] px-4 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={newProduct.categoryId} onChange={(event) => setNewProduct((prev) => ({ ...prev, categoryId: readInputValue(event) }))} className="w-full rounded-xl border border-[#FADADD] px-4 py-2" required>
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <input type="number" value={newProduct.stock} onChange={(event) => setNewProduct((prev) => ({ ...prev, stock: readInputValue(event) }))} placeholder="Stock" className="w-full rounded-xl border border-[#FADADD] px-4 py-2" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input value={newProduct.sku} onChange={(event) => setNewProduct((prev) => ({ ...prev, sku: readInputValue(event) }))} placeholder="SKU" className="w-full rounded-xl border border-[#FADADD] px-4 py-2" required />
                <input value={newProduct.material} onChange={(event) => setNewProduct((prev) => ({ ...prev, material: readInputValue(event) }))} placeholder="Material" className="w-full rounded-xl border border-[#FADADD] px-4 py-2" required />
              </div>
              <div className="space-y-2">
                <input type="file" accept="image/*" onChange={handleUploadImage} className="w-full rounded-xl border border-dashed border-[#FADADD] px-4 py-2" />
                <p className="text-xs text-[#777777]">{uploadingImage ? 'Uploading image...' : 'Upload stores the image in Railway database storage and adds the URL below.'}</p>
                {imageUploadMessage ? <p className="text-xs text-[#2d7a5e]">{imageUploadMessage}</p> : null}
              </div>
              <textarea value={newProduct.imageUrls} onChange={(event) => setNewProduct((prev) => ({ ...prev, imageUrls: readInputValue(event) }))} placeholder="Image URLs (comma separated)" className="w-full rounded-xl border border-[#FADADD] px-4 py-2" rows={3} />
              <input value={newProduct.sizes} onChange={(event) => setNewProduct((prev) => ({ ...prev, sizes: readInputValue(event) }))} placeholder="Sizes e.g. ONE_SIZE or NEWBORN,M0_3" className="w-full rounded-xl border border-[#FADADD] px-4 py-2" />
              <label className="flex items-center gap-2 text-sm text-[#555555]">
                <input type="checkbox" checked={newProduct.featured} onChange={(event) => setNewProduct((prev) => ({ ...prev, featured: readInputChecked(event) }))} />
                Featured product
              </label>
              {newProduct.imageUrls ? (
                <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[#FADADD] bg-[#FFF8F0] p-3">
                  {newProduct.imageUrls
                    .split(',')
                    .map((url) => url.trim())
                    .filter(Boolean)
                    .map((url) => (
                      <div key={url} className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-xs text-[#555555]">
                        <span className="truncate">{url}</span>
                        <button
                          type="button"
                          onClick={() => setNewProduct((prev) => ({ ...prev, imageUrls: prev.imageUrls.split(',').map((item) => item.trim()).filter((item) => item && item !== url).join(', ') }))}
                          className="shrink-0 rounded-full bg-[#FBE5E3] px-2 py-1 text-[11px] text-[#a94442]"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="rounded-xl bg-[#FFB6A3] px-5 py-2 font-semibold text-white">
                  {editingProductId ? 'Save Changes' : 'Create Product'}
                </button>
                {editingProductId ? (
                  <button
                    type="button"
                    onClick={handleCancelEditProduct}
                    className="rounded-xl bg-[#FADADD] px-5 py-2 font-semibold text-[#333333]"
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>
            </form>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#333333]">Product List</h2>
              <div className="mt-4 space-y-3 max-h-[560px] overflow-y-auto pr-1">
                {products.map((product) => (
                  <div key={product.id} className="rounded-xl border border-[#FADADD] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#333333]">{product.name}</p>
                        <p className="text-xs text-[#777777]">{product.sku} • ৳{product.price} • stock {product.stock}</p>
                        <p className="text-xs text-[#777777]">Category: {product.category?.name || 'N/A'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditProduct(product)}
                          className="rounded-lg bg-[#E8F2FF] px-3 py-1 text-xs text-[#2f5f9e] hover:opacity-80"
                        >
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDeleteProduct(product.id)} className="rounded-lg bg-[#FBE5E3] px-3 py-1 text-xs text-[#a94442] hover:opacity-80">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
                {products.length ? null : <p className="text-[#777777]">No products found.</p>}
              </div>
            </div>
          </div>
        ) : null}

        {!loading && activeTab === 'categories' ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <form onSubmit={handleCreateCategory} className="rounded-2xl bg-white p-6 shadow-sm space-y-3">
              <h2 className="text-xl font-semibold text-[#333333]">{editingCategoryId ? 'Edit Category' : 'Add Category'}</h2>
              <input value={newCategory.name} onChange={(event) => setNewCategory((prev) => ({ ...prev, name: readInputValue(event), slug: prev.slug || toSlug(readInputValue(event)) }))} placeholder="Category name" className="w-full rounded-xl border border-[#FADADD] px-4 py-2" required />
              <input value={newCategory.slug} onChange={(event) => setNewCategory((prev) => ({ ...prev, slug: readInputValue(event) }))} placeholder="Category slug" className="w-full rounded-xl border border-[#FADADD] px-4 py-2" required />
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="rounded-xl bg-[#FFB6A3] px-5 py-2 font-semibold text-white">
                  {editingCategoryId ? 'Save Category' : 'Create Category'}
                </button>
                {editingCategoryId ? (
                  <button type="button" onClick={handleCancelCategoryEdit} className="rounded-xl bg-[#FADADD] px-5 py-2 font-semibold text-[#333333]">
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#333333]">Category List</h2>
              <div className="mt-4 space-y-3">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between rounded-xl border border-[#FADADD] p-3">
                    <div>
                      <p className="font-semibold text-[#333333]">{category.name}</p>
                      <p className="text-xs text-[#777777]">{category.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => handleEditCategory(category)} className="rounded-lg bg-[#E8F2FF] px-3 py-1 text-xs text-[#2f5f9e] hover:opacity-80">Edit</button>
                      <button type="button" onClick={() => handleDeleteCategory(category.id)} className="rounded-lg bg-[#FBE5E3] px-3 py-1 text-xs text-[#a94442] hover:opacity-80">Delete</button>
                    </div>
                  </div>
                ))}
                {categories.length ? null : <p className="text-[#777777]">No categories found.</p>}
              </div>
            </div>
          </div>
        ) : null}

        {!loading && activeTab === 'users' ? (
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#333333]">Users Management</h2>
            <div className="mt-4 space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex flex-col gap-3 rounded-xl border border-[#FADADD] p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-[#333333]">{user.name}</p>
                    <p className="text-xs text-[#777777]">{user.email}</p>
                    <p className="text-xs text-[#777777]">Orders: {user._count.orders} • Reviews: {user._count.reviews}</p>
                  </div>
                  <select
                    value={user.role}
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                      handleUpdateUserRole(user.id, readInputValue(event) as 'CUSTOMER' | 'ADMIN')
                    }
                    className="rounded-xl border border-[#FADADD] px-4 py-2"
                  >
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              ))}
              {users.length ? null : <p className="text-[#777777]">No users found.</p>}
            </div>
          </div>
        ) : null}

        {!loading && activeTab === 'reviews' ? (
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#333333]">Reviews Management</h2>
            <div className="mt-4 space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-xl border border-[#FADADD] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#333333]">{review.product.name} • {review.rating}/5</p>
                      <p className="text-xs text-[#777777]">By {review.user.name} ({review.user.email})</p>
                      <p className="mt-2 text-sm text-[#555555]">{review.comment || 'No comment provided.'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteReview(review.id)}
                      className="rounded-lg bg-[#FBE5E3] px-3 py-1 text-xs text-[#a94442] hover:opacity-80"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {reviews.length ? null : <p className="text-[#777777]">No reviews found.</p>}
            </div>
          </div>
        ) : null}

        <div className="mt-10 rounded-2xl bg-white p-5 text-sm text-[#666666]">
          Admin panel now supports dashboard analytics, order control, product create/update, category create/update, users role management, and reviews moderation.
        </div>
      </main>
    </div>
  );
}
