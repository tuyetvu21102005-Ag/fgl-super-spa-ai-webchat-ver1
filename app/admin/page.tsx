'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Calendar, TrendingUp, RefreshCcw } from 'lucide-react';
import EmbedSnippet from '@/components/EmbedSnippet';
import ContentGenerator from '@/components/ContentGenerator';
import InventoryManager from '@/components/InventoryManager';

export default function AdminDashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!supabase) {
      console.warn('Supabase client not initialized. Check your environment variables.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: leadsData, error: leadsError } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      const { data: bookingsData, error: bookingsError } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      
      if (leadsError) console.error('Error fetching leads:', leadsError);
      if (bookingsError) console.error('Error fetching bookings:', bookingsError);

      setLeads(leadsData || []);
      setBookings(bookingsData || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Spa Admin Dashboard</h1>
            <p className="text-slate-500">Quản lý khách hàng và lịch hẹn từ AI Chat</p>
          </div>
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all"
          >
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl">
                <Users size={24} />
              </div>
              <h3 className="font-semibold text-slate-600">Tổng Lead</h3>
            </div>
            <p className="text-4xl font-bold text-slate-900">{leads.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
                <Calendar size={24} />
              </div>
              <h3 className="font-semibold text-slate-600">Lịch hẹn mới</h3>
            </div>
            <p className="text-4xl font-bold text-slate-900">{bookings.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-50 text-green-500 rounded-2xl">
                <TrendingUp size={24} />
              </div>
              <h3 className="font-semibold text-slate-600">Tỷ lệ chuyển đổi</h3>
            </div>
            <p className="text-4xl font-bold text-slate-900">
              {leads.length > 0 ? Math.round((bookings.length / leads.length) * 100) : 0}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Leads */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h2 className="font-bold text-xl text-slate-800">Khách hàng tiềm năng (Leads)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-sm">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Khách hàng</th>
                    <th className="px-6 py-4 font-semibold">Dịch vụ</th>
                    <th className="px-6 py-4 font-semibold">Độ nóng</th>
                    <th className="px-6 py-4 font-semibold">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{lead.name || 'N/A'}</p>
                        <p className="text-sm text-slate-500">{lead.phone}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{lead.service_interest || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          lead.temperature === 'hot' ? 'bg-rose-100 text-rose-600' :
                          lead.temperature === 'warm' ? 'bg-orange-100 text-orange-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {lead.temperature}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-700">{lead.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50">
              <h2 className="font-bold text-xl text-slate-800">Lịch hẹn gần đây</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-sm">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Khách hàng</th>
                    <th className="px-6 py-4 font-semibold">Dịch vụ</th>
                    <th className="px-6 py-4 font-semibold">Thời gian hẹn</th>
                    <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{booking.customer_name || 'N/A'}</p>
                        <p className="text-sm text-slate-500">{booking.phone}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{booking.service}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {booking.booking_time ? new Date(booking.booking_time).toLocaleString('vi-VN') : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold uppercase">
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Content Generator Section */}
        <div className="mt-12">
          <ContentGenerator />
        </div>

        {/* Inventory Manager Section */}
        <div className="mt-12">
          <InventoryManager />
        </div>

        {/* Embedding Section */}
        <div className="mt-12">
          <EmbedSnippet />
        </div>
      </div>
    </div>
  );
}
