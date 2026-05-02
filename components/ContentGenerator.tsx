'use client';

import React, { useState } from 'react';
import { useCompletion } from 'ai/react';
import { Sparkles, Copy, Check, PenTool, Layout, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContentGenerator() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Facebook');
  const [tone, setTone] = useState('Chuyên nghiệp, sang trọng');
  const [copied, setCopied] = useState(false);

  const { completion, complete, isLoading } = useCompletion({
    api: '/api/content',
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    complete('', {
      body: { topic, platform, tone }
    });
  };

  const copyToClipboard = () => {
    if (!completion) return;
    navigator.clipboard.writeText(completion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-rose-100 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl text-white shadow-lg shadow-rose-200">
          <PenTool size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Trợ lý AI Viết Bài</h2>
          <p className="text-gray-500 text-sm">Tạo nội dung marketing chuẩn SEO, hút khách chỉ trong vài giây.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <form onSubmit={handleGenerate} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Chủ đề bài viết</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="VD: Chương trình khuyến mãi 8/3 giảm 50% gói trị mụn..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none min-h-[100px] resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nền tảng</label>
              <div className="relative">
                <Layout size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none appearance-none"
                >
                  <option value="Facebook">Facebook Post</option>
                  <option value="TikTok">TikTok Script (Kịch bản)</option>
                  <option value="Instagram">Instagram Caption</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Giọng điệu</label>
              <div className="relative">
                <MessageCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none appearance-none"
                >
                  <option value="Chuyên nghiệp, sang trọng">Chuyên nghiệp, sang trọng</option>
                  <option value="Gần gũi, thân thiện">Gần gũi, thân thiện</option>
                  <option value="Hài hước, bắt trend">Hài hước, bắt trend</option>
                  <option value="Đồng cảm, thấu hiểu">Đồng cảm, thấu hiểu</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Sparkles size={18} />
                </motion.span>
                Đang viết...
              </span>
            ) : (
              <>
                <Sparkles size={18} />
                Tạo bài viết ngay
              </>
            )}
          </button>
        </form>

        {/* Output Area */}
        <div className="relative flex flex-col h-full min-h-[300px]">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex justify-between items-end">
            Kết quả
            {completion && (
              <button
                onClick={copyToClipboard}
                className="text-xs font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Đã copy' : 'Copy bài viết'}
              </button>
            )}
          </label>
          
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-5 overflow-y-auto relative">
            {!completion && !isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 opacity-50">
                <PenTool size={48} className="mb-3" />
                <p className="text-sm">Nội dung sẽ hiển thị ở đây</p>
              </div>
            ) : (
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {completion}
                {isLoading && <span className="inline-block w-2 h-4 ml-1 bg-rose-400 animate-pulse"></span>}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
