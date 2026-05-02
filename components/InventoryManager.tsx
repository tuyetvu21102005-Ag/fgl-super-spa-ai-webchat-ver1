'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, AlertCircle, Plus, Save } from 'lucide-react';

export default function InventoryManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ name: '', quantity: 0, price: 0 });

  const fetchInventory = async () => {
    setLoading(true);
    const { data } = await supabase.from('inventory').select('*').order('product_name');
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name) return;

    await supabase.from('inventory').insert({
      spa_id: 'default',
      product_name: newItem.name,
      quantity: newItem.quantity,
      price: newItem.price,
    });

    setNewItem({ name: '', quantity: 0, price: 0 });
    fetchInventory();
  };

  const updateQuantity = async (id: string, newQuantity: number) => {
    await supabase.from('inventory').update({ quantity: newQuantity }).eq('id', id);
    fetchInventory(); // Hoặc cập nhật state cục bộ cho nhanh
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl shadow-sm border border-amber-100">
          <Package size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Kho Hàng</h2>
          <p className="text-gray-500 text-sm">Theo dõi số lượng mỹ phẩm và sản phẩm tại Spa.</p>
        </div>
      </div>

      {/* Add New Item */}
      <form onSubmit={handleAddItem} className="flex gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200 items-end">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Tên sản phẩm</label>
          <input 
            type="text" 
            value={newItem.name} 
            onChange={e => setNewItem({...newItem, name: e.target.value})}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-amber-400 text-sm"
            placeholder="VD: Serum vitamin C"
            required
          />
        </div>
        <div className="w-24">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Số lượng</label>
          <input 
            type="number" 
            value={newItem.quantity} 
            onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-amber-400 text-sm"
          />
        </div>
        <div className="w-32">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Giá bán (VNĐ)</label>
          <input 
            type="number" 
            value={newItem.price} 
            onChange={e => setNewItem({...newItem, price: Number(e.target.value)})}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-amber-400 text-sm"
          />
        </div>
        <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
          <Plus size={16} /> Thêm
        </button>
      </form>

      {/* Inventory List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm">
            <tr>
              <th className="px-4 py-3 font-semibold rounded-l-xl">Sản phẩm</th>
              <th className="px-4 py-3 font-semibold">Giá bán</th>
              <th className="px-4 py-3 font-semibold">Tồn kho</th>
              <th className="px-4 py-3 font-semibold rounded-r-xl">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={4} className="py-4 text-center text-slate-400 text-sm">Đang tải...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} className="py-4 text-center text-slate-400 text-sm">Chưa có sản phẩm nào trong kho.</td></tr>
            ) : items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800 flex items-center gap-2">
                  {item.quantity <= 5 && <AlertCircle size={16} className="text-red-500" />}
                  {item.product_name}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-md text-sm font-bold ${item.quantity <= 5 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-700'}`}>
                    {item.quantity}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-sm">-</button>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-sm">+</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
