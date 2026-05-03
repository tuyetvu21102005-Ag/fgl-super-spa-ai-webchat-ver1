'use client';

import ChatWidget from '@/components/ChatWidget';
import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ChatEmbedContent() {
  const searchParams = useSearchParams();
  
  const spaName = searchParams.get('spaName') || 'An Spa';
  const spaId = searchParams.get('spaId') || 'an-spa-01';
  const address = searchParams.get('address') || 'Địa chỉ Spa';
  const hours = searchParams.get('hours') || '9:00 - 21:00';
  const phone = searchParams.get('phone') || '090.123.4567';

  useEffect(() => {
    // Force body and html to be transparent for iframe embedding
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';
  }, []);

  return (
    <div className="min-h-screen bg-transparent flex items-end justify-end p-4 overflow-hidden">
      <ChatWidget 
        isEmbed={true} 
        spaName={spaName}
        spaId={spaId}
        address={address}
        hours={hours}
        phone={phone}
      />
      <style jsx global>{`
        body, html {
          background: transparent !important;
        }
      `}</style>
    </div>
  );
}

export default function EmbedChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatEmbedContent />
    </Suspense>
  );
}
