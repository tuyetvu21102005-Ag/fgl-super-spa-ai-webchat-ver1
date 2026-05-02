'use client';

import React, { useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';

export default function EmbedSnippet() {
  const [copied, setCopied] = useState(false);
  
  const embedCode = `<!-- FGL Spa AI Webchat Embed Code -->
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = "${process.env.NEXT_PUBLIC_APP_URL || 'https://fgl-spa-ai.vercel.app'}/embed/chat";
    iframe.style.position = 'fixed';
    iframe.style.bottom = '20px';
    iframe.style.right = '20px';
    iframe.style.width = '450px';
    iframe.style.height = '750px';
    iframe.style.border = 'none';
    iframe.style.zIndex = '999999';
    iframe.style.colorScheme = 'light';
    iframe.allow = "clipboard-read; clipboard-write";
    document.body.appendChild(iframe);
  })();
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-rose-100 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-rose-50 rounded-2xl text-rose-500">
          <Code size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mã nhúng Webchat</h2>
          <p className="text-gray-500 text-sm">Sao chép mã này vào cuối thẻ &lt;body&gt; của landing page spa của bạn.</p>
        </div>
      </div>

      <div className="relative group">
        <pre className="bg-slate-900 text-slate-300 p-6 rounded-2xl overflow-x-auto text-sm font-mono leading-relaxed border border-slate-800">
          {embedCode}
        </pre>
        <button
          onClick={copyToClipboard}
          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl backdrop-blur-md transition-all flex items-center gap-2 border border-white/10 active:scale-95"
        >
          {copied ? (
            <>
              <Check size={16} className="text-green-400" />
              <span className="text-xs font-bold">Đã sao chép</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span className="text-xs font-bold">Sao chép mã</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
          <p className="text-xs font-bold text-rose-600 uppercase mb-1">Bước 1</p>
          <p className="text-sm text-gray-600">Mở file HTML của landing page.</p>
        </div>
        <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
          <p className="text-xs font-bold text-rose-600 uppercase mb-1">Bước 2</p>
          <p className="text-sm text-gray-600">Dán đoạn mã trên vào trước thẻ đóng &lt;/body&gt;.</p>
        </div>
        <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
          <p className="text-xs font-bold text-rose-600 uppercase mb-1">Bước 3</p>
          <p className="text-sm text-gray-600">Lưu lại và kiểm tra chatbot trên trang web.</p>
        </div>
      </div>
    </div>
  );
}
