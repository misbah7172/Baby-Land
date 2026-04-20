export type Language = 'en' | 'bn';

export const languageCookieName = 'babyland-lang';

export const translations = {
  en: {
    brand: 'Baby Land',
    nav: {
      home: 'Home',
      products: 'Products',
      cart: 'Cart',
      profile: 'Profile',
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout'
    },
    header: {
      language: 'ENG'
    },
    home: {
      badge: 'Comfort for Your Little One',
      title: 'Gentle Care, Trusted Quality',
      subtitle: 'Premium baby essentials designed with parents in mind. Soft, safe, and sourced from the most trusted brands for your peace of mind.',
      primaryCta: 'Explore Products',
      secondaryCta: 'View Categories',
      categoriesTitle: 'Shop by Category',
      featuredEyebrow: 'FEATURED COLLECTION',
      featuredTitle: "Parents' Top Picks",
      featuredDescription: 'Carefully chosen essentials that parents trust and babies love. Each product is selected for quality, safety, and comfort.',
      testimonialsTitle: 'Trusted by Parents',
      whyTitle: 'Why Baby Land?',
      ctaTitle: 'Ready to Comfort Your Baby?',
      ctaDescription: 'Start exploring our collection of premium baby products selected just for your little one.',
      ctaButton: 'Shop Now',
      reviewTitle: 'Real reviews from parents'
    },
    cart: {
      title: 'Your shopping bag',
      description: 'Guest carts live in Redis and logged-in carts persist in MySQL.',
      summary: 'Summary',
      items: 'Items',
      subtotal: 'Subtotal',
      checkout: 'Checkout',
      continue: 'Continue shopping',
      empty: 'Your cart is empty.',
      browse: 'Browse products'
    },
    login: {
      badge: 'Welcome Back',
      title: 'Sign in',
      subtitle: 'Access your account and continue shopping',
      email: 'Email address',
      password: 'Password',
      submit: 'Sign in',
      submitting: 'Signing in...',
      switchText: "Don't have an account?",
      switchLink: 'Sign up'
    },
    register: {
      badge: 'Join Baby Land',
      title: 'Create an account',
      subtitle: 'Get access to fast checkout and order history',
      name: 'Full name',
      email: 'Email address',
      password: 'Password',
      submit: 'Create account',
      submitting: 'Creating account...',
      switchText: 'Already have an account?',
      switchLink: 'Sign in'
    },
    profile: {
      eyebrow: 'Profile',
      title: 'Your account',
      description: 'View your user details and order history.',
      accountDetails: 'Account Details',
      name: 'Name',
      email: 'Email',
      role: 'Role',
      signOut: 'Sign out',
      orderHistory: 'Order History',
      loadingOrders: 'Loading orders...',
      noOrders: 'No orders yet.',
      startShopping: 'Start shopping'
    },
    product: {
      reviews: 'Reviews',
      noReviews: 'No reviews yet.',
      quickNote: 'Quick note'
    },
    reviewPrompt: {
      title: 'How was your order?',
      subtitle: 'Your delivered products are ready for a quick rating and review.',
      rating: 'Rating',
      comment: 'Share a short review',
      submit: 'Submit review',
      later: 'Maybe later'
    },
    footer: {
      aboutTitle: 'Baby Land',
      aboutDescription: 'Premium baby essentials designed with parents in mind. Safe, soft, and trusted.',
      shopTitle: 'Shop',
      shopAll: 'All Products',
      shopCategories: 'Categories',
      shopNew: 'New Arrivals',
      accountTitle: 'Account',
      accountSignIn: 'Sign In',
      accountRegister: 'Register',
      accountProfile: 'Profile',
      supportTitle: 'Support',
      supportContact: 'Contact Us',
      supportFaq: 'FAQ',
      supportPrivacy: 'Privacy Policy',
      rights: 'All rights reserved.'
    },
    status: {
      pending: 'Pending',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    }
  },
  bn: {
    brand: 'Baby Land',
    nav: {
      home: 'হোম',
      products: 'পণ্য',
      cart: 'কার্ট',
      profile: 'প্রোফাইল',
      login: 'লগইন',
      signup: 'সাইন আপ',
      logout: 'লগআউট'
    },
    header: {
      language: 'বাংলা'
    },
    home: {
      badge: 'আপনার ছোট্ট সোনার আরাম',
      title: 'মমতাময় যত্ন, বিশ্বস্ত মান',
      subtitle: 'পিতামাতার কথা মাথায় রেখে তৈরি প্রিমিয়াম বেবি এসেনশিয়াল। নরম, নিরাপদ, এবং বিশ্বস্ত ব্র্যান্ড থেকে সংগ্রহ করা।',
      primaryCta: 'পণ্য দেখুন',
      secondaryCta: 'ক্যাটাগরি দেখুন',
      categoriesTitle: 'ক্যাটাগরি অনুযায়ী কিনুন',
      featuredEyebrow: 'বাছাইকৃত সংগ্রহ',
      featuredTitle: 'পিতামাতাদের পছন্দের পণ্য',
      featuredDescription: 'মান, নিরাপত্তা ও আরামের ভিত্তিতে বাছাই করা পণ্য, যা পিতামাতারা ভরসা করেন এবং শিশুরা ভালোবাসে।',
      testimonialsTitle: 'পিতামাতাদের আস্থা',
      whyTitle: 'কেন Baby Land?',
      ctaTitle: 'আপনার শিশুর জন্য সেরা আরাম দিতে প্রস্তুত?',
      ctaDescription: 'আপনার ছোট্ট সোনার জন্য বাছাই করা প্রিমিয়াম বেবি পণ্যের সংগ্রহ ঘুরে দেখুন।',
      ctaButton: 'এখনই কিনুন',
      reviewTitle: 'পিতামাতাদের আসল রিভিউ'
    },
    cart: {
      title: 'আপনার কার্ট',
      description: 'গেস্ট কার্ট Redis-এ থাকে এবং লগইন করা কার্ট MySQL-এ সংরক্ষণ হয়।',
      summary: 'সারসংক্ষেপ',
      items: 'আইটেম',
      subtotal: 'উপমোট',
      checkout: 'চেকআউট',
      continue: 'কেনাকাটা চালিয়ে যান',
      empty: 'আপনার কার্ট খালি।',
      browse: 'পণ্য দেখুন'
    },
    login: {
      badge: 'আবার স্বাগতম',
      title: 'সাইন ইন করুন',
      subtitle: 'আপনার অ্যাকাউন্টে প্রবেশ করুন এবং কেনাকাটা চালিয়ে যান',
      email: 'ইমেইল ঠিকানা',
      password: 'পাসওয়ার্ড',
      submit: 'সাইন ইন',
      submitting: 'সাইন ইন করা হচ্ছে...',
      switchText: 'অ্যাকাউন্ট নেই?',
      switchLink: 'সাইন আপ করুন'
    },
    register: {
      badge: 'Baby Land-এ যোগ দিন',
      title: 'অ্যাকাউন্ট তৈরি করুন',
      subtitle: 'দ্রুত চেকআউট এবং অর্ডার হিস্ট্রি পান',
      name: 'পূর্ণ নাম',
      email: 'ইমেইল ঠিকানা',
      password: 'পাসওয়ার্ড',
      submit: 'অ্যাকাউন্ট তৈরি',
      submitting: 'অ্যাকাউন্ট তৈরি করা হচ্ছে...',
      switchText: 'ইতিমধ্যে অ্যাকাউন্ট আছে?',
      switchLink: 'সাইন ইন করুন'
    },
    profile: {
      eyebrow: 'প্রোফাইল',
      title: 'আপনার অ্যাকাউন্ট',
      description: 'আপনার তথ্য ও অর্ডার ইতিহাস দেখুন।',
      accountDetails: 'অ্যাকাউন্ট তথ্য',
      name: 'নাম',
      email: 'ইমেইল',
      role: 'ভূমিকা',
      signOut: 'সাইন আউট',
      orderHistory: 'অর্ডার ইতিহাস',
      loadingOrders: 'অর্ডার লোড হচ্ছে...',
      noOrders: 'এখনো কোনো অর্ডার নেই।',
      startShopping: 'কেনাকাটা শুরু করুন'
    },
    product: {
      reviews: 'রিভিউ',
      noReviews: 'এখনো কোনো রিভিউ নেই।',
      quickNote: 'ছোট্ট নোট'
    },
    reviewPrompt: {
      title: 'আপনার অর্ডার কেমন ছিল?',
      subtitle: 'ডেলিভার হওয়া পণ্যের জন্য দ্রুত রেটিং ও রিভিউ দিন।',
      rating: 'রেটিং',
      comment: 'সংক্ষিপ্ত রিভিউ লিখুন',
      submit: 'রিভিউ জমা দিন',
      later: 'পরে দেব'
    },
    footer: {
      aboutTitle: 'Baby Land',
      aboutDescription: 'পিতামাতার কথা মাথায় রেখে তৈরি প্রিমিয়াম বেবি এসেনশিয়াল। নিরাপদ, নরম, ও বিশ্বস্ত।',
      shopTitle: 'কেনাকাটা',
      shopAll: 'সব পণ্য',
      shopCategories: 'ক্যাটাগরি',
      shopNew: 'নতুন পণ্য',
      accountTitle: 'অ্যাকাউন্ট',
      accountSignIn: 'সাইন ইন',
      accountRegister: 'রেজিস্টার',
      accountProfile: 'প্রোফাইল',
      supportTitle: 'সাপোর্ট',
      supportContact: 'যোগাযোগ',
      supportFaq: 'প্রশ্নোত্তর',
      supportPrivacy: 'প্রাইভেসি পলিসি',
      rights: 'সর্বস্বত্ব সংরক্ষিত।'
    },
    status: {
      pending: 'অপেক্ষমাণ',
      shipped: 'পাঠানো হয়েছে',
      delivered: 'ডেলিভার হয়েছে',
      cancelled: 'বাতিল'
    }
  }
} as const;

export function getCopy(language: Language) {
  return translations[language];
}

export function normalizeLanguage(value: string | null | undefined): Language {
  return value === 'bn' ? 'bn' : 'en';
}