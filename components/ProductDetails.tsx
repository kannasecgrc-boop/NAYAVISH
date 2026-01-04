
import React from 'react';
import { Product } from '../types';

interface ProductDetailsProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onBack: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onAddToCart, onBack }) => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-brand transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Shop
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="aspect-square rounded-[60px] overflow-hidden shadow-2xl border-8 border-white bg-gray-50">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div className="flex flex-col justify-center">
          <div className="mb-6">
            <span className="px-4 py-1.5 bg-brand/10 text-brand rounded-full text-[10px] font-black uppercase tracking-widest">{product.category}</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase mb-6 leading-none">{product.name}</h1>
          <p className="text-lg text-gray-500 font-medium leading-relaxed mb-10">{product.description}</p>
          
          <div className="flex items-center gap-6 mb-12">
            <div className="text-4xl font-black text-gray-900 tracking-tighter">₹{product.price}</div>
            {product.mrp > product.price && (
              <div className="text-xl text-gray-300 line-through font-bold">₹{product.mrp}</div>
            )}
            {product.discountPercentage > 0 && (
                 <div className="bg-red-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase">{product.discountPercentage}% OFF</div>
            )}
            <div className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">In Stock: {product.stock}</div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => onAddToCart(product)}
              disabled={product.stock <= 0}
              className="flex-1 py-6 bg-gray-900 text-white rounded-[32px] font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-brand hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20"
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 border-t border-gray-100 pt-12">
             <div className="text-center">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Shipping</p>
                <p className="font-black text-gray-900">2-4 DAYS</p>
             </div>
             <div className="text-center border-x border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Suitable For</p>
                <p className="font-black text-brand uppercase">All Skin Types</p>
             </div>
             <div className="text-center">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Net Qty</p>
                <p className="font-black text-gray-900 uppercase">100g / 50ml</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
