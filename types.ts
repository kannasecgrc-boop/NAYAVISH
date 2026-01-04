
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  joinedAt: string;
  password?: string; // Added for data storage requirement
}

export interface StoreSettings {
  storeName: string;
  themeColor: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  chefSectionTitle: string;
  deliveryFee: number;
  supportEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  officeAddress: string;
  aboutUs: string;
  openingHours: string;      // Renamed from operatingHoursLunch
  supportAvailability: string; // Renamed from operatingHoursDinner
  operatingDays: string;
  bannerHighlight: string;
  promoImage: string; // New: Promotion background image
  promoBackgroundColor: string; // New: Promotion card bg color
  promoTextColor: string; // New: Promotion text color
  freeDeliveryThreshold: number;
  customBadges: { text: string; link: string }[]; // Updated: Stores text and link URL
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  mrp: number;
  discountPercentage: number;
  category: string;
  image: string;
  rating: number;
  stock: number;
  isActive: boolean;
  isRecommended?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export enum View {
  HOME = 'HOME',
  SHOP = 'SHOP',
  PRODUCT_DETAILS = 'PRODUCT_DETAILS',
  CHECKOUT = 'CHECKOUT',
  ORDER_SUCCESS = 'ORDER_SUCCESS',
  PROFILE = 'PROFILE',
  ADMIN = 'ADMIN'
}

export interface OrderDetails {
  fullName: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  paymentMethod: 'COD' | 'UPI' | 'Card';
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
}

export type OrderStatus = 'Pending' | 'Accepted' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  date: string;
  status: OrderStatus;
  shippingAddress: string;
  paymentMethod: 'COD' | 'UPI' | 'Card';
}
