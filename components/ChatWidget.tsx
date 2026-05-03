'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles, MapPin, Clock, Phone } from 'lucide-react';
import { useChat } from 'ai/react';
import { motion, AnimatePresence } from 'framer-motion';
import BookingSelector from './BookingSelector';

export default function ChatWidget({ 
  isEmbed = false,
  spaName = 'An Spa',
  spaId = 'an-spa-01',
  address = 'Địa chỉ Spa',
  hours = '9:00 - 21:00',
  phone = '090.123.4567'
}: { 
  isEmbed?: boolean;
  spaName?: string;
  spaId?: string;
  address?: string;
  hours?: string;
  phone?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showBookingSelector, setShowBookingSelector] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Show welcome bubble after 3 seconds
    const timer = setTimeout(() => {
      if (!isOpen) setShowWelcome(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    // Generate or retrieve session ID
    let storedSessionId = localStorage.getItem('spa_chat_session_id');
    if (!storedSessionId) {
      storedSessionId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('spa_chat_session_id', storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: '/api/chat',
    body: {
      sessionId,
      spaId,
      spaName,
      address,
      hours,
      serviceList: 'Chăm sóc da chuyên sâu, Massage body đá nóng, Triệt lông vĩnh viễn, Gội đầu dưỡng sinh thảo dược',
      priceList: 'Chăm sóc da: 500k, Massage: 400k, Gội đầu: 200k'
    },
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: `Chào bạn! Mình là trợ lý AI của ${spaName}. Mình có thể giúp gì cho bạn hôm nay? ✨`,
      },
    ],
  });

  // Effect to check for booking intent and show selector
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && !isLoading) {
      const jsonMatch = lastMessage.content.match(/---JSON_OUTPUT---([\s\S]*?)---END_JSON---/);
      if (jsonMatch) {
        try {
          const jsonData = JSON.parse(jsonMatch[1].trim());
          if (jsonData.intent === 'booking' && !jsonData.extracted_data?.datetime) {
            setShowBookingSelector(true);
          } else {
            setShowBookingSelector(false);
          }
        } catch (e) {
          console.error('Error parsing JSON from message:', e);
        }
      }
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, showBookingSelector]);

  const quickActions = [
    { label: 'Đặt lịch ngay', message: 'Tôi muốn đặt lịch tư vấn' },
    { label: 'Bảng giá dịch vụ', message: 'Cho tôi xem bảng giá dịch vụ' },
    { label: 'Địa chỉ & Giờ mở cửa', message: 'Địa chỉ spa ở đâu và mấy giờ đóng cửa?' },
  ];

  const handleQuickAction = (message: string) => {
    // We can just call setInput if useChat provides it, but handleInputChange works too
    handleInputChange({ target: { value: message } } as React.ChangeEvent<HTMLInputElement>);
    setTimeout(() => {
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) form.requestSubmit();
    }, 50);
  };

  const handleBookingSelect = (datetime: string) => {
    setShowBookingSelector(false);
    append({
      role: 'user',
      content: `Tôi chọn thời gian: ${datetime}. Vui lòng xác nhận lịch hẹn này cho tôi.`,
    });
  };

  return (
    <div className={`${isEmbed ? 'relative' : 'fixed bottom-6 right-6'} z-50 flex flex-col items-end`}>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="mb-4 w-[95vw] md:w-[420px] h-[650px] max-h-[85vh] bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col border border-white/40 z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 p-6 text-white relative overflow-hidden">
              {/* Background patterns */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-400/20 rounded-full -ml-10 -mb-10 blur-xl"></div>
              
              <div className="relative flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
                      <Bot size={32} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-rose-600 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl tracking-tight leading-tight">{spaName} AI</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Online</span>
                      <p className="text-xs text-rose-100/80">Chuyên gia tư vấn</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/10 p-2.5 rounded-2xl transition-all active:scale-90"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Info bar */}
            <div className="bg-rose-50/50 px-6 py-2 flex items-center gap-4 border-b border-rose-100/50 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5 whitespace-nowrap text-[11px] text-rose-600 font-medium">
                <MapPin size={12} />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-1.5 whitespace-nowrap text-[11px] text-rose-600 font-medium border-l border-rose-200/50 pl-4">
                <Clock size={12} />
                <span>{hours}</span>
              </div>
              <div className="flex items-center gap-1.5 whitespace-nowrap text-[11px] text-rose-600 font-medium border-l border-rose-200/50 pl-4">
                <Phone size={12} />
                <span>{phone}</span>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-gradient-to-b from-white to-rose-50/20"
            >
              {messages.map((m, idx) => {
                const displayContent = m.content.split('---JSON_OUTPUT---')[0].trim();
                if (!displayContent && m.role === 'assistant') return null;

                const isBot = m.role === 'assistant';

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    key={m.id || idx}
                    className={`flex ${!isBot ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`group relative max-w-[85%] p-4 rounded-[1.5rem] shadow-sm transition-all hover:shadow-md ${
                      !isBot 
                        ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 border border-rose-100 rounded-tl-none'
                    }`}>
                      <p className="text-[14px] leading-relaxed whitespace-pre-wrap font-medium">
                        {displayContent}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              
              {/* Custom Component: Booking Selector */}
              {showBookingSelector && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full"
                >
                  <BookingSelector onSelect={handleBookingSelect} />
                </motion.div>
              )}

              {/* Quick Actions for Assistant */}
              {messages[messages.length - 1]?.role === 'assistant' && !isLoading && !showBookingSelector && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickAction(action.message)}
                      className="text-xs bg-white border border-rose-200 text-rose-600 px-4 py-2 rounded-full hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-sm active:scale-95"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-rose-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex gap-1">
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1.5 h-1.5 bg-rose-400 rounded-full"></motion.span>
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-rose-400 rounded-full"></motion.span>
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-rose-400 rounded-full"></motion.span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-rose-50">
              <form 
                onSubmit={handleSubmit}
                className="relative flex items-center"
              >
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Nhập tin nhắn của bạn..."
                  className="w-full bg-rose-50/50 border border-rose-100/50 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 transition-all outline-none pr-14 placeholder:text-gray-400"
                />
                <button 
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:opacity-30 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-rose-500/20 active:scale-90"
                >
                  <Send size={18} />
                </button>
              </form>
              
              <div className="mt-3 flex justify-center items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity">
                <Sparkles size={10} className="text-rose-500" />
                <p className="text-[9px] uppercase tracking-[0.1em] font-bold text-gray-500">
                  AI-Powered by FGL Ecosystem
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Bubble */}
      <AnimatePresence>
        {showWelcome && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            onClick={() => setIsOpen(true)}
            className="mb-4 mr-2 bg-white p-4 rounded-2xl rounded-br-none shadow-xl border border-rose-100 cursor-pointer hover:bg-rose-50 transition-colors relative"
          >
            <button 
              onClick={(e) => { e.stopPropagation(); setShowWelcome(false); }}
              className="absolute -top-2 -left-2 bg-gray-100 text-gray-500 rounded-full p-1 hover:bg-gray-200"
            >
              <X size={12} />
            </button>
            <p className="text-sm font-medium text-gray-800 pr-4">
              Chào bạn! Mình có thể giúp gì cho bạn hôm nay? ✨
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setShowWelcome(false);
        }}
        className={`w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-full shadow-[0_10px_30px_rgba(244,63,94,0.4)] flex items-center justify-center hover:shadow-rose-500/20 transition-all ring-4 ring-white relative z-50`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={30} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="relative"
            >
              <MessageCircle size={30} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-rose-500 text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">1</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

