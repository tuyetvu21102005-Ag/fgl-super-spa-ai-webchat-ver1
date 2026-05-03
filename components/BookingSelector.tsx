'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface BookingSelectorProps {
  onSelect: (datetime: string) => void;
}

export default function BookingSelector({ onSelect }: BookingSelectorProps) {
  const [step, setStep] = useState<'date' | 'time'>('date');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  // Time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30', '20:00'
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setStep('time');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      const finalDateTime = `${selectedDate.toLocaleDateString('en-CA')} ${time}`;
      onSelect(finalDateTime);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-rose-100 shadow-xl overflow-hidden my-4 max-w-full">
      <div className="bg-rose-50 px-5 py-3 flex items-center justify-between border-b border-rose-100">
        <h4 className="text-sm font-bold text-rose-700 flex items-center gap-2">
          {step === 'date' ? <CalendarIcon size={16} /> : <Clock size={16} />}
          {step === 'date' ? 'Chọn ngày hẹn' : 'Chọn giờ hẹn'}
        </h4>
        {step === 'time' && (
          <button 
            onClick={() => setStep('date')}
            className="text-[10px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 uppercase tracking-wider"
          >
            <ChevronLeft size={12} /> Quay lại
          </button>
        )}
      </div>

      <div className="p-4">
        {step === 'date' ? (
          <div className="grid grid-cols-4 gap-2">
            {dates.map((date, i) => {
              const isToday = i === 0;
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              
              return (
                <button
                  key={i}
                  onClick={() => handleDateSelect(date)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                    isSelected 
                      ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-200' 
                      : 'bg-white border-rose-50 hover:border-rose-200 hover:bg-rose-50/50'
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase mb-1 ${isSelected ? 'text-rose-100' : 'text-rose-400'}`}>
                    {isToday ? 'Hôm nay' : date.toLocaleDateString('vi-VN', { weekday: 'short' })}
                  </span>
                  <span className="text-lg font-black leading-none">
                    {date.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-rose-50/50 p-2 rounded-xl border border-rose-100/50 mb-4">
              <div className="bg-white p-2 rounded-lg text-rose-500 shadow-sm">
                <CalendarIcon size={14} />
              </div>
              <p className="text-xs font-bold text-gray-700">
                Ngày đã chọn: <span className="text-rose-600">{formatDate(selectedDate!)}</span>
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  className="py-2.5 px-2 rounded-xl text-xs font-bold border border-rose-50 bg-white hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-all active:scale-95"
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-rose-50/30 p-3 flex justify-center">
        <p className="text-[10px] text-gray-400 font-medium">
          * Vui lòng chọn thời gian phù hợp với bạn
        </p>
      </div>
    </div>
  );
}
