
import { Product } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'cos-1',
    name: 'Kumkumadi Radiance Night Serum',
    description: 'A miraculous blend of saffron and 24 ayurvedic herbs. Brightens skin tone and reduces pigmentation overnight.',
    mrp: 1200,
    price: 899,
    discountPercentage: 25,
    category: 'Skincare',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    stock: 50,
    isActive: true,
    isRecommended: true
  },
  {
    id: 'cos-2',
    name: 'Hibiscus & Onion Hair Oil',
    description: 'Cold-pressed herbal oil to control hair fall and boost volume. Handmade by Grameena grandmoms.',
    mrp: 650,
    price: 499,
    discountPercentage: 23,
    category: 'Haircare',
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=800',
    rating: 5.0,
    stock: 30,
    isActive: true,
    isRecommended: true
  },
  {
    id: 'cos-3',
    name: 'Rose & Beetroot Lip Tint',
    description: '100% natural, chemical-free lip and cheek tint for a natural flushed look. Long-lasting hydration.',
    mrp: 450,
    price: 299,
    discountPercentage: 33,
    category: 'Makeup',
    image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    stock: 100,
    isActive: true
  },
  {
    id: 'cos-4',
    name: 'Turmeric & Sandalwood Face Pack',
    description: 'Traditional Ubtan recipe for tan removal and instant glow. Suitable for all skin types.',
    mrp: 500,
    price: 350,
    discountPercentage: 30,
    category: 'Skincare',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    stock: 45,
    isActive: true,
    isRecommended: false
  },
  {
    id: 'cos-5',
    name: 'Organic Jasmine Mist Toner',
    description: 'Pure steam-distilled jasmine water to tighten pores and refresh skin instantly.',
    mrp: 399,
    price: 249,
    discountPercentage: 37,
    category: 'Fragrance',
    image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=800',
    rating: 4.6,
    stock: 20,
    isActive: true,
    isRecommended: false
  }
];

export const CATEGORIES = [
  'All',
  'Skincare',
  'Haircare',
  'Makeup',
  'Wellness',
  'Fragrance',
  'Combos'
];
