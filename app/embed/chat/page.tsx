'use client';

import ChatWidget from '@/components/ChatWidget';

export default function EmbedChatPage() {
  return (
    <div className="min-h-screen bg-transparent flex items-end justify-end p-4">
      <ChatWidget isEmbed={true} />
    </div>
  );
}
