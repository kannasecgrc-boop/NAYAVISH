
import { Product, User, Order, StoreSettings } from '../types';
import { MOCK_PRODUCTS } from '../constants';

const KEYS = {
  PRODUCTS: 'nayavish_products',
  ORDERS: 'nayavish_orders',
  USERS: 'nayavish_users',
  SETTINGS: 'nayavish_settings',
  CURRENT_USER: 'nayavish_current_user',
  LOGS: 'nayavish_logs'
};

export const storageService = {
  // --- LOADERS ---
  loadProducts: (): Product[] => {
    const saved = localStorage.getItem(KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : MOCK_PRODUCTS;
  },

  loadOrders: (): Order[] => {
    const saved = localStorage.getItem(KEYS.ORDERS);
    return saved ? JSON.parse(saved) : [];
  },

  loadUsers: (): User[] => {
    const saved = localStorage.getItem(KEYS.USERS);
    return saved ? JSON.parse(saved) : [];
  },

  loadSettings: (): StoreSettings => {
    const saved = localStorage.getItem(KEYS.SETTINGS);
    const defaultSettings: StoreSettings = {
      storeName: 'NAYAVISH COSMETICS',
      themeColor: '#be185d', // Pink/Rose color for cosmetics
      heroTitle: 'Radiate Natural Beauty.',
      heroSubtitle: 'Handmade, Ayurvedic, and Organic formulations crafted by experienced grandmoms for your skin and hair.',
      heroImage: 'https://images.unsplash.com/photo-1596462502278-27bfdd403cc2?auto=format&fit=crop&q=80&w=1920',
      chefSectionTitle: "Expert Recommendations",
      deliveryFee: 60,
      supportEmail: 'care@nayavish.com',
      supportPhone: '9876543210',
      whatsappNumber: '9876543210',
      officeAddress: 'Nayavish Beauty House, Green Valley, Hyderabad - 500034',
      aboutUs: 'Bringing ancient Ayurvedic beauty secrets to the modern world.',
      operatingHoursLunch: '10:00 AM - 08:00 PM', // Reused field for General Hours
      operatingHoursDinner: 'Closed on Sundays',    // Reused field for Days off
      operatingDays: 'Nationwide Delivery',
      bannerHighlight: '✨ GLOW UP SALE: Flat 20% OFF on Haircare Kits!',
      promoImage: '',
      promoBackgroundColor: '#fbcfe8',
      promoTextColor: '#831843',
      freeDeliveryThreshold: 999,
      customBadges: [
        { text: 'Cruelty Free', link: '#' },
        { text: '100% Organic', link: '#' },
        { text: 'Handmade', link: '#' }
      ]
    };
    
    // Merge saved settings with defaults to ensure new fields (like promoImage) exist
    if (saved) {
        const parsed = JSON.parse(saved);
        // Migration fix for old badges
        if (parsed.customBadges && parsed.customBadges.length > 0 && typeof parsed.customBadges[0] === 'string') {
             parsed.customBadges = defaultSettings.customBadges;
        }
        return { ...defaultSettings, ...parsed };
    }
    return defaultSettings;
  },

  loadCurrentUser: (): User | null => {
    const saved = localStorage.getItem(KEYS.CURRENT_USER);
    return saved ? JSON.parse(saved) : null;
  },

  // --- SAVERS ---
  saveProducts: (products: Product[]) => localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products)),
  saveOrders: (orders: Order[]) => localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders)),
  saveUsers: (users: User[]) => localStorage.setItem(KEYS.USERS, JSON.stringify(users)),
  saveSettings: (settings: StoreSettings) => localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings)),
  saveCurrentUser: (user: User | null) => localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user)),

  // --- DATABASE MANAGEMENT ---
  
  // Creates a complete JSON backup of the system
  createBackup: () => {
    const data = {
      timestamp: new Date().toISOString(),
      version: '1.0.3',
      products: JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]'),
      orders: JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]'),
      users: JSON.parse(localStorage.getItem(KEYS.USERS) || '[]'),
      settings: JSON.parse(localStorage.getItem(KEYS.SETTINGS) || '{}'),
      logs: JSON.parse(localStorage.getItem(KEYS.LOGS) || '[]')
    };
    return JSON.stringify(data, null, 2);
  },

  // Restores data from a JSON object
  restoreBackup: (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      
      // Basic validation
      if (!data.products || !data.users || !data.settings) {
        throw new Error("Invalid backup file format");
      }

      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(data.products));
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(data.orders));
      localStorage.setItem(KEYS.USERS, JSON.stringify(data.users));
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data.settings));
      if (data.logs) localStorage.setItem(KEYS.LOGS, JSON.stringify(data.logs));

      return { success: true, data };
    } catch (error) {
      console.error("Restore failed", error);
      return { success: false, error };
    }
  },

  // Hard Reset (For Admin debugging)
  clearDatabase: () => {
    localStorage.removeItem(KEYS.PRODUCTS);
    localStorage.removeItem(KEYS.ORDERS);
    localStorage.removeItem(KEYS.USERS);
    localStorage.removeItem(KEYS.SETTINGS);
    localStorage.removeItem(KEYS.LOGS);
    window.location.reload();
  }
};
