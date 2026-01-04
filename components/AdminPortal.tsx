
import React, { useState, useEffect, useRef } from 'react';
import { Product, Order, User, StoreSettings, OrderStatus } from '../types';
import { storageService } from '../services/storageService';

interface AdminPortalProps {
  products: Product[];
  orders: Order[];
  registeredUsers: User[];
  storeSettings: StoreSettings;
  onUpdateSettings: (settings: StoreSettings) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateProduct: (product: Product) => void;
  onUpdateOrderStatus: (id: string, status: OrderStatus) => void;
  onUpdateUsers: (users: User[]) => void;
  onClose: () => void;
  onPreview: () => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ 
  products, 
  orders, 
  registeredUsers, 
  storeSettings,
  onUpdateSettings,
  onAddProduct, 
  onDeleteProduct, 
  onUpdateProduct,
  onUpdateOrderStatus,
  onUpdateUsers,
  onClose,
  onPreview
}) => {
  const hasPendingOrders = orders.some(o => o.status === 'Pending');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'orders' | 'users' | 'settings' | 'logs'>('dashboard');
  
  const [tempSettings, setTempSettings] = useState<StoreSettings>(storeSettings);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);

  // Add/Edit Product Form State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    mrp: '',
    discount: '',
    category: 'Skincare',
    image: '',
    stock: '50',
    isRecommended: false
  });

  // State for adding a new badge
  const [newBadgeText, setNewBadgeText] = useState('');
  const [newBadgeLink, setNewBadgeLink] = useState('');
  
  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem('nayavish_logs') || '[]');
    setSystemLogs(logs);
  }, [activeTab]);

  const handleStockChange = (p: Product, value: string) => {
    const num = parseInt(value) || 0;
    onUpdateProduct({ ...p, stock: num });
  };

  const handleAddBadge = () => {
    if (!newBadgeText.trim() || !newBadgeLink.trim()) return;
    setTempSettings({
      ...tempSettings,
      customBadges: [...(tempSettings.customBadges || []), { text: newBadgeText.trim(), link: newBadgeLink.trim() }]
    });
    setNewBadgeText('');
    setNewBadgeLink('');
  };

  const handleRemoveBadge = (index: number) => {
    const updated = [...(tempSettings.customBadges || [])];
    updated.splice(index, 1);
    setTempSettings({ ...tempSettings, customBadges: updated });
  };
  
  // --- Auto-Calculation Logic ---
  
  const handleMrpChange = (val: string) => {
     // When MRP changes, keep Discount % constant and update Price
     const mrp = parseFloat(val);
     const disc = parseFloat(productForm.discount);
     let newPrice = productForm.price;

     if (!isNaN(mrp) && !isNaN(disc)) {
         newPrice = Math.round(mrp * (1 - disc / 100)).toString();
     }
     setProductForm({ ...productForm, mrp: val, price: newPrice });
  };

  const handleDiscountChange = (val: string) => {
     // When Discount changes, update Price based on MRP
     const disc = parseFloat(val);
     const mrp = parseFloat(productForm.mrp);
     let newPrice = productForm.price;

     if (!isNaN(mrp) && !isNaN(disc)) {
         newPrice = Math.round(mrp * (1 - disc / 100)).toString();
     }
     setProductForm({ ...productForm, discount: val, price: newPrice });
  };

  const handlePriceChange = (val: string) => {
     // When Price changes, update Discount based on MRP
     const price = parseFloat(val);
     const mrp = parseFloat(productForm.mrp);
     let newDisc = productForm.discount;

     if (!isNaN(price) && !isNaN(mrp) && mrp > 0) {
         newDisc = Math.round(((mrp - price) / mrp) * 100).toString();
     }
     setProductForm({ ...productForm, price: val, discount: newDisc });
  };

  // ------------------------------

  const openAddModal = () => {
    setEditingProductId(null);
    setProductForm({
      name: '', description: '', price: '', mrp: '', discount: '', category: 'Skincare', image: '', stock: '50', isRecommended: false
    });
    setIsProductModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      mrp: product.mrp.toString(),
      discount: product.discountPercentage.toString(),
      category: product.category,
      image: product.image,
      stock: product.stock.toString(),
      isRecommended: product.isRecommended || false
    });
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(productForm.price) || 0;
    const mrp = parseFloat(productForm.mrp) || price;
    const discount = parseFloat(productForm.discount) || 0;

    const productData: Product = {
      id: editingProductId || `prod-${Date.now()}`,
      name: productForm.name,
      description: productForm.description,
      price: price,
      mrp: mrp,
      discountPercentage: discount,
      category: productForm.category,
      image: productForm.image || 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=800',
      rating: 5.0,
      stock: parseInt(productForm.stock) || 0,
      isActive: true,
      isRecommended: productForm.isRecommended
    };

    if (editingProductId) {
      onUpdateProduct(productData);
      alert('Product updated successfully!');
    } else {
      onAddProduct(productData);
      alert('New product added to inventory!');
    }

    setIsProductModalOpen(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(tempSettings);
    alert('All Changes Saved & Live!');
  };

  // Analytics Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'Delivered').length;
  const totalProfit = totalRevenue * 0.40; // Higher profit margin for cosmetics

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Admin Portal</h1>
          <p className="text-gray-400 font-medium text-sm">Managing {storeSettings.storeName}</p>
        </div>
        <div className="flex gap-4">
           <button onClick={onPreview} className="px-6 py-4 bg-white border border-gray-200 text-gray-900 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:border-brand hover:text-brand transition-all shadow-sm">Preview App</button>
           <button onClick={onClose} className="px-8 py-4 bg-gray-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-brand transition-all shadow-xl">Logout Admin</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        {[
          { id: 'dashboard', label: 'Analytics' },
          { id: 'orders', label: 'Workflows' },
          { id: 'users', label: 'Customers' },
          { id: 'inventory', label: 'Catalog' },
          { id: 'settings', label: 'Store Config' },
          { id: 'logs', label: 'System Logs' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`relative px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-brand text-white shadow-lg' : 'bg-white border border-gray-100 text-gray-400'}`}
          >
            {tab.label}
            {tab.id === 'orders' && hasPendingOrders && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-brand text-[8px] text-white items-center justify-center">
                  {orders.filter(o => o.status === 'Pending').length}
                </span>
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-[50px] overflow-hidden shadow-sm min-h-[500px]">
        {activeTab === 'dashboard' && (
          <div className="p-10">
            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-8">Business Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-green-50 rounded-3xl border border-green-100">
                 <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">Total Sales</p>
                 <p className="text-4xl font-black text-gray-900 tracking-tighter">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                 <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Est. Profit (40%)</p>
                 <p className="text-4xl font-black text-gray-900 tracking-tighter">₹{totalProfit.toLocaleString()}</p>
              </div>
              <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100">
                 <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2">Orders Fulfilled</p>
                 <p className="text-4xl font-black text-gray-900 tracking-tighter">{completedOrders} <span className="text-lg text-gray-400">/ {totalOrders}</span></p>
              </div>
              <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100">
                 <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">Registered Users</p>
                 <p className="text-4xl font-black text-gray-900 tracking-tighter">{registeredUsers.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* --- ORDER MANAGEMENT TAB (ADDED) --- */}
        {activeTab === 'orders' && (
          <div className="p-10">
            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-8">Order Workflows</h3>
            <div className="overflow-x-auto rounded-[32px] border border-gray-100">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-6">Order ID</th>
                    <th className="px-8 py-6">Customer</th>
                    <th className="px-8 py-6">Items Summary</th>
                    <th className="px-8 py-6">Total Bill</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.length === 0 ? (
                    <tr><td colSpan={6} className="p-20 text-center font-bold text-gray-400">No active orders found.</td></tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.id} className={order.status === 'Pending' ? 'bg-orange-50/30' : ''}>
                        <td className="px-8 py-6">
                           <span className="font-black text-gray-900 text-sm">{order.id}</span>
                           <p className="text-[9px] text-gray-400 font-bold mt-1">{new Date(order.date).toLocaleTimeString()}</p>
                        </td>
                        <td className="px-8 py-6">
                           <p className="font-bold text-gray-900 text-sm">{order.customerName}</p>
                           <p className="text-[10px] text-gray-500">{order.shippingAddress}</p>
                           <p className="text-[9px] font-black text-brand uppercase tracking-wider mt-1">{order.paymentMethod}</p>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex flex-col gap-1">
                              {order.items.map((item, idx) => (
                                 <span key={idx} className="text-xs text-gray-600">
                                    <span className="font-black">{item.quantity}x</span> {item.name}
                                 </span>
                              ))}
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="font-black text-lg text-gray-900">₹{order.total}</span>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                              order.status === 'Pending' ? 'bg-orange-100 text-orange-600' :
                              order.status === 'Accepted' ? 'bg-blue-100 text-blue-600' :
                              order.status === 'Preparing' ? 'bg-purple-100 text-purple-600' :
                              order.status === 'Out for Delivery' ? 'bg-yellow-100 text-yellow-600' :
                              order.status === 'Delivered' ? 'bg-green-100 text-green-600' :
                              'bg-gray-100 text-gray-400'
                           }`}>
                              {order.status === 'Preparing' ? 'Packing' : order.status}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex justify-end gap-2">
                              {order.status === 'Pending' && (
                                <>
                                  <button onClick={() => onUpdateOrderStatus(order.id, 'Cancelled')} className="px-4 py-2 bg-white border border-gray-200 text-red-500 rounded-xl text-[9px] font-black uppercase hover:bg-red-50">Reject</button>
                                  <button onClick={() => onUpdateOrderStatus(order.id, 'Accepted')} className="px-4 py-2 bg-green-500 text-white rounded-xl text-[9px] font-black uppercase hover:bg-green-600 shadow-lg">Confirm</button>
                                </>
                              )}
                              {order.status === 'Accepted' && (
                                <button onClick={() => onUpdateOrderStatus(order.id, 'Preparing')} className="px-4 py-2 bg-brand text-white rounded-xl text-[9px] font-black uppercase hover:bg-gray-800 shadow-lg">Start Packing</button>
                              )}
                              {order.status === 'Preparing' && (
                                <button onClick={() => onUpdateOrderStatus(order.id, 'Out for Delivery')} className="px-4 py-2 bg-yellow-500 text-white rounded-xl text-[9px] font-black uppercase hover:bg-yellow-600 shadow-lg">Dispatch</button>
                              )}
                              {order.status === 'Out for Delivery' && (
                                <button onClick={() => onUpdateOrderStatus(order.id, 'Delivered')} className="px-4 py-2 bg-green-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-green-700 shadow-lg">Mark Delivered</button>
                              )}
                              {(order.status === 'Delivered' || order.status === 'Cancelled') && (
                                 <span className="text-[10px] font-bold text-gray-300 uppercase">Archived</span>
                              )}
                           </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="p-10">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Customer Database ({registeredUsers.length})</h3>
             </div>
             
             <div className="overflow-x-auto rounded-[32px] border border-gray-100 max-h-[600px] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky top-0 z-10">
                    <tr>
                      <th className="px-10 py-6 bg-gray-50">Customer</th>
                      <th className="px-10 py-6 bg-gray-50">Contact</th>
                      <th className="px-10 py-6 bg-gray-50">Address</th>
                      <th className="px-10 py-6 bg-gray-50">Login Creds</th>
                      <th className="px-10 py-6 bg-gray-50">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {registeredUsers.length === 0 ? (
                       <tr><td colSpan={5} className="p-20 text-center font-bold text-gray-400">No users registered yet.</td></tr>
                    ) : (
                      registeredUsers.map(u => (
                        <tr key={u.id}>
                          <td className="px-10 py-6 flex items-center gap-4">
                            <img src={u.avatar} className="w-10 h-10 rounded-full bg-gray-100" alt="" />
                            <span className="font-bold text-gray-900">{u.name}</span>
                          </td>
                          <td className="px-10 py-6">
                            <p className="text-sm font-bold text-gray-900">{u.email}</p>
                            <p className="text-xs text-gray-500">{u.phone}</p>
                          </td>
                          <td className="px-10 py-6 text-sm text-gray-600 max-w-xs truncate" title={u.address}>{u.address}</td>
                          <td className="px-10 py-6">
                            {u.password ? (
                                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{u.password}</span>
                            ) : (
                                <span className="text-[10px] text-gray-300 font-black uppercase">OTP Access</span>
                            )}
                          </td>
                          <td className="px-10 py-6 text-xs font-bold text-gray-400">{new Date(u.joinedAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="p-10">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Product Catalog</h3>
               <button onClick={openAddModal} className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand shadow-lg transition-all flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                 Add Product
               </button>
            </div>
            
            {/* Add/Edit Product Modal */}
            {isProductModalOpen && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsProductModalOpen(false)} />
                <div className="relative bg-white rounded-[40px] p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                   <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6">{editingProductId ? 'Edit Product' : 'Add New Product'}</h3>
                   <form onSubmit={handleProductSubmit} className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Product Name</label>
                        <input required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 ring-brand outline-none font-bold" placeholder="e.g. Saffron Night Cream" />
                      </div>
                      
                      {/* Price / MRP / Discount Row */}
                      <div className="grid grid-cols-3 gap-4">
                         <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">MRP (₹)</label>
                            <input type="number" value={productForm.mrp} onChange={e => handleMrpChange(e.target.value)} className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 ring-brand outline-none font-bold" placeholder="1000" />
                         </div>
                         <div>
                            <label className="block text-[10px] font-bold text-brand uppercase tracking-widest mb-1.5 ml-1">Discount (%)</label>
                            <input type="number" value={productForm.discount} onChange={e => handleDiscountChange(e.target.value)} className="w-full px-5 py-3 bg-gray-50 border-2 border-brand/20 rounded-2xl focus:ring-4 ring-brand outline-none font-bold text-brand" placeholder="15" />
                         </div>
                         <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Selling Price (₹)</label>
                            <input required type="number" value={productForm.price} onChange={e => handlePriceChange(e.target.value)} className="w-full px-5 py-3 bg-gray-900 text-white border border-gray-900 rounded-2xl focus:ring-4 ring-gray-200 outline-none font-bold" placeholder="850" />
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                            <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 ring-brand outline-none font-bold appearance-none">
                              {['Skincare', 'Haircare', 'Makeup', 'Wellness', 'Fragrance', 'Combos'].map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                         </div>
                         <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Initial Stock</label>
                            <input type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 ring-brand outline-none font-bold" />
                         </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Image URL</label>
                        <input value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 ring-brand outline-none font-bold text-xs font-mono" placeholder="https://..." />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Description (Benefits/Ingredients)</label>
                        <textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 ring-brand outline-none font-bold h-24 resize-none" placeholder="Describe benefits, usage, and key ingredients..." />
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                        <input 
                            type="checkbox" 
                            id="isRecommended" 
                            checked={productForm.isRecommended} 
                            onChange={e => setProductForm({...productForm, isRecommended: e.target.checked})} 
                            className="w-5 h-5 text-brand rounded focus:ring-brand border-gray-300 cursor-pointer" 
                        />
                        <label htmlFor="isRecommended" className="cursor-pointer">
                            <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Highlight as Expert Pick</p>
                            <p className="text-[10px] text-gray-500 font-bold">This product will be featured in the main recommendation section.</p>
                        </label>
                      </div>

                      <div className="flex gap-4 pt-4">
                         <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 py-4 border-2 border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50">Cancel</button>
                         <button type="submit" className="flex-[2] py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-brand">{editingProductId ? 'Update Product' : 'Add Product'}</button>
                      </div>
                   </form>
                </div>
              </div>
            )}

            <div className="overflow-x-auto rounded-[32px] border border-gray-100">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-10 py-6">Product Name</th>
                    <th className="px-10 py-6">Stock Quantity</th>
                    <th className="px-10 py-6">Visibility</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(p => (
                    <tr key={p.id} className={!p.isActive ? 'bg-gray-50/50' : ''}>
                      <td className="px-10 py-6 flex items-center gap-4">
                        <img src={p.image} className={`w-14 h-14 rounded-2xl object-cover ${!p.isActive ? 'grayscale opacity-30' : ''}`} alt={p.name} />
                        <div>
                          <p className={`font-black uppercase tracking-tight text-sm ${!p.isActive ? 'text-gray-400' : 'text-gray-900'} flex items-center gap-2`}>
                             {p.name}
                             {p.isRecommended && (
                                <span className="bg-orange-100 text-orange-600 text-[8px] px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    Expert Pick
                                </span>
                             )}
                          </p>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            {p.category} • ₹{p.price}
                            {p.discountPercentage > 0 && <span className="text-red-500 ml-1">(-{p.discountPercentage}%)</span>}
                          </p>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          <input 
                            type="number" 
                            value={p.stock}
                            onChange={(e) => handleStockChange(p, e.target.value)}
                            className="w-24 px-4 py-2 bg-gray-100 rounded-xl font-black text-center focus:ring-4 ring-brand/5 outline-none border border-transparent focus:border-brand/20"
                          />
                          <span className="text-[9px] font-black text-gray-400 uppercase">Available</span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <button 
                          onClick={() => onUpdateProduct({ ...p, isActive: !p.isActive })}
                          className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                            p.isActive ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-900 text-white shadow-lg'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                           <button onClick={() => openEditModal(p)} className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-brand hover:text-white rounded-full transition-colors" title="Edit Item">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                           </button>
                           <button onClick={() => onDeleteProduct(p.id)} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-colors" title="Delete Item">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-12">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Full Application Customization</h3>
                <span className="bg-brand/10 text-brand px-4 py-2 rounded-xl text-[10px] font-black uppercase">V2.0.1 (Beauty Edition)</span>
             </div>
             
             {/* --- DATABASE STATUS INDICATOR (AUTOMATIC STORAGE) --- */}
             <div className="mb-12 p-8 bg-green-50 border border-green-100 rounded-[32px] flex items-center gap-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-sm">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/></svg>
                </div>
                <div>
                   <h4 className="text-lg font-black text-green-900 uppercase tracking-tight">Dedicated Database Active</h4>
                   <p className="text-xs text-green-700 font-medium">Your application data (Users, Products, Orders) is being automatically persisted to secure local storage in real-time. No manual actions required.</p>
                </div>
             </div>

             <form className="space-y-12" onSubmit={handleSaveSettings}>
                
                {/* Branding Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="col-span-1 md:col-span-2 border-b border-gray-100 pb-2 mb-2">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Global Branding</h4>
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Store Name (Top Bar)</label>
                       <input value={tempSettings.storeName} onChange={e => setTempSettings({...tempSettings, storeName: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-brand font-bold outline-none" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Theme Color (Brand Identity)</label>
                       <div className="flex gap-4 items-center">
                         <input type="color" value={tempSettings.themeColor} onChange={e => setTempSettings({...tempSettings, themeColor: e.target.value})} className="w-12 h-12 rounded-xl cursor-pointer border-0" />
                         <input value={tempSettings.themeColor} onChange={e => setTempSettings({...tempSettings, themeColor: e.target.value})} className="flex-1 px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-brand font-bold outline-none" />
                       </div>
                    </div>
                </div>

                {/* Homepage Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="col-span-1 md:col-span-2 border-b border-gray-100 pb-2 mb-2">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Home Page & Banners</h4>
                    </div>
                    <div className="md:col-span-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Main Hero Image URL</label>
                       <input value={tempSettings.heroImage || ''} onChange={e => setTempSettings({...tempSettings, heroImage: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-brand font-bold outline-none text-xs font-mono" placeholder="https://..." />
                       <div className="mt-2 h-32 w-full rounded-2xl overflow-hidden bg-gray-100 relative">
                           {tempSettings.heroImage && <img src={tempSettings.heroImage} className="w-full h-full object-cover opacity-50" />}
                           <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase text-gray-500">Preview Image</span>
                       </div>
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Hero Title (Big Text)</label>
                       <input value={tempSettings.heroTitle} onChange={e => setTempSettings({...tempSettings, heroTitle: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-brand font-bold outline-none" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Hero Subtitle</label>
                       <input value={tempSettings.heroSubtitle} onChange={e => setTempSettings({...tempSettings, heroSubtitle: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-brand font-bold outline-none" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Collection Section Title</label>
                       <input value={tempSettings.chefSectionTitle || "Expert Recommendations"} onChange={e => setTempSettings({...tempSettings, chefSectionTitle: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-brand font-bold outline-none" />
                    </div>
                </div>

                {/* Operations Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="col-span-1 md:col-span-2 border-b border-gray-100 pb-2 mb-2">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Store Operations</h4>
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Shipping Fee (₹)</label>
                       <input type="number" value={tempSettings.deliveryFee || 0} onChange={e => setTempSettings({...tempSettings, deliveryFee: parseInt(e.target.value)})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-brand font-bold outline-none" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Support Phone</label>
                       <input value={tempSettings.supportPhone} onChange={e => setTempSettings({...tempSettings, supportPhone: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-brand font-bold outline-none" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">WhatsApp Number (Sales)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">+91</span>
                            <input 
                                value={tempSettings.whatsappNumber} 
                                onChange={e => setTempSettings({...tempSettings, whatsappNumber: e.target.value})} 
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-brand font-bold outline-none" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Support Email</label>
                        <input 
                            value={tempSettings.supportEmail} 
                            onChange={e => setTempSettings({...tempSettings, supportEmail: e.target.value})} 
                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-brand font-bold outline-none" 
                        />
                    </div>
                    <div className="md:col-span-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Head Office Address</label>
                       <textarea value={tempSettings.officeAddress} onChange={e => setTempSettings({...tempSettings, officeAddress: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-brand font-bold outline-none h-24 resize-none" />
                    </div>
                </div>
                
                 {/* Promotions Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="col-span-1 md:col-span-2 border-b border-gray-100 pb-2 mb-2">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Promotions & Offers</h4>
                    </div>
                    <div className="md:col-span-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Daily Highlight / Banner Text (Context)</label>
                       <input value={tempSettings.bannerHighlight} onChange={e => setTempSettings({...tempSettings, bannerHighlight: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-brand font-bold outline-none" placeholder="e.g. 50% OFF on Hair Oil" />
                    </div>
                    <div className="md:col-span-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Promotion Card Background Image (Optional)</label>
                       <input value={tempSettings.promoImage || ''} onChange={e => setTempSettings({...tempSettings, promoImage: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-brand font-bold outline-none text-xs font-mono" placeholder="https://..." />
                       {tempSettings.promoImage && (
                          <div className="mt-2 h-20 w-32 rounded-xl overflow-hidden relative border border-gray-200">
                             <img src={tempSettings.promoImage} className="w-full h-full object-cover" alt="Preview" />
                             <span className="absolute inset-0 bg-black/20 flex items-center justify-center text-[8px] font-black text-white uppercase">Preview</span>
                          </div>
                       )}
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Card Background Color</label>
                       <div className="flex gap-3 items-center">
                          <input type="color" value={tempSettings.promoBackgroundColor || '#ffffff'} onChange={e => setTempSettings({...tempSettings, promoBackgroundColor: e.target.value})} className="w-10 h-10 rounded-xl cursor-pointer border-0" />
                          <div className="flex-1 relative">
                             <input value={tempSettings.promoBackgroundColor || ''} onChange={e => setTempSettings({...tempSettings, promoBackgroundColor: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:border-brand font-bold outline-none text-xs" placeholder="Empty for Glass Effect" />
                             {tempSettings.promoBackgroundColor && (
                                <button type="button" onClick={() => setTempSettings({...tempSettings, promoBackgroundColor: ''})} className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-red-400 uppercase">Clear</button>
                             )}
                          </div>
                       </div>
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Text Color</label>
                       <div className="flex gap-3 items-center">
                          <input type="color" value={tempSettings.promoTextColor || '#ffffff'} onChange={e => setTempSettings({...tempSettings, promoTextColor: e.target.value})} className="w-10 h-10 rounded-xl cursor-pointer border-0" />
                          <input value={tempSettings.promoTextColor || ''} onChange={e => setTempSettings({...tempSettings, promoTextColor: e.target.value})} className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:border-brand font-bold outline-none text-xs" placeholder="#ffffff" />
                       </div>
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Free Shipping Threshold (₹)</label>
                       <input type="number" value={tempSettings.freeDeliveryThreshold} onChange={e => setTempSettings({...tempSettings, freeDeliveryThreshold: parseInt(e.target.value)})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-brand font-bold outline-none" />
                       <p className="text-[9px] text-gray-400 mt-2 font-bold">Orders above this amount will have ₹0 shipping.</p>
                    </div>
                </div>

                {/* Custom User Badges Section - NEW */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="col-span-1 md:col-span-2 border-b border-gray-100 pb-2 mb-2">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Custom UI Badges (Service Highlights)</h4>
                    </div>
                    <div className="md:col-span-2">
                       <div className="flex flex-col md:flex-row gap-4 mb-4">
                          <input 
                            value={newBadgeText} 
                            onChange={e => setNewBadgeText(e.target.value)} 
                            className="flex-1 px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-brand font-bold outline-none" 
                            placeholder="Badge Text (e.g. 'Cruelty Free')" 
                          />
                          <input 
                            value={newBadgeLink} 
                            onChange={e => setNewBadgeLink(e.target.value)} 
                            className="flex-1 px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-brand font-bold outline-none font-mono text-xs" 
                            placeholder="Link URL (e.g. https://about...)" 
                          />
                          <button 
                            type="button" 
                            onClick={handleAddBadge} 
                            className="px-6 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase shadow-lg hover:bg-brand transition-all"
                          >
                            + Add
                          </button>
                       </div>
                       
                       <div className="flex flex-wrap gap-3">
                          {(tempSettings.customBadges || []).map((badge, idx) => (
                             <div key={idx} className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                <div className="flex flex-col">
                                   <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{badge.text}</span>
                                   <span className="text-[8px] text-gray-400 font-mono max-w-[150px] truncate">{badge.link}</span>
                                </div>
                                <button type="button" onClick={() => handleRemoveBadge(idx)} className="text-red-400 hover:text-red-600 font-black px-2 ml-2">
                                   -
                                </button>
                             </div>
                          ))}
                          {(tempSettings.customBadges || []).length === 0 && (
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No custom highlights added yet.</p>
                          )}
                       </div>
                    </div>
                </div>

                {/* Operating Hours Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="col-span-1 md:col-span-2 border-b border-gray-100 pb-2 mb-2">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Business Hours</h4>
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Daily Opening Times</label>
                       <input value={tempSettings.operatingHoursLunch} onChange={e => setTempSettings({...tempSettings, operatingHoursLunch: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-brand font-bold outline-none" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Off Days / Notes</label>
                       <input value={tempSettings.operatingHoursDinner} onChange={e => setTempSettings({...tempSettings, operatingHoursDinner: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-brand font-bold outline-none" />
                    </div>
                    <div className="md:col-span-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Service Tagline</label>
                       <input value={tempSettings.operatingDays} onChange={e => setTempSettings({...tempSettings, operatingDays: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-brand font-bold outline-none" />
                    </div>
                </div>

                <button type="submit" className="w-full py-6 bg-gray-900 text-white rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl hover:bg-brand transition-all">Save & Publish All Changes</button>
             </form>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="p-10">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-6">System Logs</h3>
            <div className="space-y-4">
              {systemLogs.length === 0 ? (
                <p className="text-gray-400 text-center font-bold uppercase text-xs py-10">No recent logs</p>
              ) : (
                systemLogs.map(log => (
                  <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 bg-brand/10 text-brand rounded-lg text-[9px] font-black uppercase">{log.type}</span>
                      <span className="font-bold text-gray-900 text-sm">Target: {log.target}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-green-600 uppercase mb-0.5">{log.status}</p>
                      <p className="text-[9px] text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPortal;
