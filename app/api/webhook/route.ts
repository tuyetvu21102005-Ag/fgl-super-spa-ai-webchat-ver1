import { supabase } from '@/lib/supabase';
import { syncLeadToSheets, syncBookingToSheets } from '@/lib/sheets';

// Helper to format Telegram messages based on insight rules
function formatTelegramMessage(data: any): string {
  const { lead_temperature, lead_score, extracted_data, intent, pain_points, insight_flag } = data;
  const name = extracted_data?.name || 'Khách chưa rõ tên';
  const phone = extracted_data?.phone || 'Chưa cung cấp';
  const service = extracted_data?.service || 'Chưa xác định';
  const datetime = extracted_data?.datetime || 'Chưa chọn thời gian';
  const painPointsStr = pain_points?.length ? pain_points.join(', ') : 'Không có';

  // 1. Hot Lead - Instant Notify
  if (lead_temperature === 'hot' || intent === 'booking') {
    return `🔥 KHÁCH HOT — CẦN GỌI NGAY\n━━━━━━━━━━━━━━━━━━━━━━━\n👤 Tên    : ${name}\n📞 SĐT    : ${phone}\n💆 Quan tâm: ${service}\n📅 Muốn đặt: ${datetime}\n🌡️ Score  : ${lead_score}/100\n💬 Vấn đề : ${painPointsStr}\n🚩 Insight: ${insight_flag || 'Không có'}\n━━━━━━━━━━━━━━━━━━━━━━━\n⚡ Gọi lại trong 30 phút để chốt!`;
  }
  
  // 2. Warm Lead - Batch/Delayed Notify
  if (lead_temperature === 'warm') {
    return `🌡️ KHÁCH WARM — CẦN TƯ VẤN THÊM\n━━━━━━━━━━━━━━━━━━━━━━━\n👤 Tên    : ${name}\n📞 SĐT    : ${phone}\n💆 Quan tâm: ${service}\n🌡️ Score  : ${lead_score}/100\n💬 Vấn đề : ${painPointsStr}\n━━━━━━━━━━━━━━━━━━━━━━━\nĐang tự động nurture. Cần chuyên viên kiểm tra!`;
  }

  // 3. Fallback
  return `ℹ️ THÔNG TIN MỚI TỪ WIDGET\nKhách: ${name}\nSĐT: ${phone}\nIntent: ${intent}\nScore: ${lead_score}`;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { action_required, spa_id = 'default_spa' } = data;

    const results = await Promise.allSettled([
      // 1. Sync to Supabase
      saveToSupabase(data, spa_id),
      
      // 2. Sync to Google Sheets
      action_required?.save_to_sheets 
        ? (action_required.create_booking ? syncBookingToSheets(data) : syncLeadToSheets(data)) 
        : Promise.resolve(),
      
      // 3. Notify Telegram (if required OR if it's a hot/booking lead)
      (action_required?.send_telegram || data.lead_temperature === 'hot' || data.intent === 'booking') 
        ? sendTelegramNotification(formatTelegramMessage(data)) 
        : Promise.resolve()
    ]);

    return new Response(JSON.stringify({ 
      status: 'success', 
      results: results.map(r => r.status) 
    }), { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

async function saveToSupabase(data: any, spaId: string) {
  const { action_required, extracted_data, lead_temperature, lead_score, pain_points, competitor_mentions } = data;

  if (action_required?.create_booking) {
    return supabase.from('bookings').insert({
      spa_id: spaId,
      customer_name: extracted_data?.name,
      phone: extracted_data?.phone,
      service: extracted_data?.service,
      booking_time: extracted_data?.datetime
    });
  }

  // Save/Upsert Lead if there's actionable info (phone or name) or explicit request
  if (action_required?.schedule_followup || extracted_data?.phone || extracted_data?.name) {
    return supabase.from('leads').insert({
      spa_id: spaId,
      name: extracted_data?.name,
      phone: extracted_data?.phone,
      service_interest: extracted_data?.service,
      temperature: lead_temperature || 'cold',
      score: lead_score || 0,
      pain_points: pain_points || [],
      competitor_mentions: competitor_mentions || []
    });
  }
}

// Removed mock saveToSheets

async function sendTelegramNotification(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!token || !chatId || !message) {
    console.warn('Telegram missing token/chatId or message. Skipping.');
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        // Using standard parsing for simple format, or switch to Markdown if strictly defined
      })
    });
    return res.json();
  } catch (e) {
    console.error('Telegram Notify Error:', e);
  }
}
