'use client';

import ChatWidget from '@/components/ChatWidget';
import { useEffect } from 'react';

export default function EmbedChatPage() {
  useEffect(() => {
    // Force body and html to be transparent for iframe embedding
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';
  }, []);

  return (
    <div className="min-h-screen bg-transparent flex items-end justify-end p-4 overflow-hidden">
      <ChatWidget isEmbed={true} />
      <style jsx global>{`
        body, html {
          background: transparent !important;
        }
      `}</style>
    </div>
  );
}
