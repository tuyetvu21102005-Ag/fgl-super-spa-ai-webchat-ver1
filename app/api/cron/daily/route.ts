import { supabaseAdmin } from '@/lib/supabase';
import { sendTelegramMessage } from '@/lib/telegram';

export const runtime = 'edge';

export async function GET(req: Request) {
  // Xác thực Cron Secret (Bảo mật)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Trong môi trường production, bỏ comment dòng dưới
    // return new Response('Unauthorized', { status: 401 });
  }

  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let remindersSent = 0;
    let reportSent = false;

    // ==========================================
    // TÁC VỤ 1: GỬI NHẮC LỊCH CHO NGÀY MAI
    // ==========================================
    const { data: upcomingBookings, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('status', 'pending')
      .eq('reminder_sent', false)
      .gte('booking_time', now.toISOString())
      .lte('booking_time', tomorrow.toISOString());

    if (!bookingError && upcomingBookings && upcomingBookings.length > 0) {
      await Promise.all(upcomingBookings.map(async (booking) => {
        const timeStr = new Date(booking.booking_time).toLocaleString('vi-VN');
        const message = `⏰ **NHẮC LỊCH HẸN SẮP TỚI** ⏰\n\n👤 Khách: ${booking.customer_name}\n📞 SĐT: ${booking.phone}\n💆 Dịch vụ: ${booking.service}\n📅 Thời gian: ${timeStr}\n\nChủ spa hãy liên hệ xác nhận với khách nhé!`;
        
        await sendTelegramMessage(message);
        
        // Đánh dấu là đã nhắc
        await supabaseAdmin
          .from('bookings')
          .update({ reminder_sent: true })
          .eq('id', booking.id);
      }));
      remindersSent = upcomingBookings.length;
    }

    // ==========================================
    // TÁC VỤ 2: TỔNG HỢP & GỬI BÁO CÁO NGÀY HÔM QUA
    // ==========================================
    
    // Lấy leads của 24h qua
    const { data: recentLeads, error: leadsError } = await supabaseAdmin
      .from('leads')
      .select('*')
      .gte('created_at', yesterday.toISOString())
      .lte('created_at', now.toISOString());

    // Lấy bookings được tạo trong 24h qua
    const { data: recentBookings, error: recentBookingsError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .gte('created_at', yesterday.toISOString())
      .lte('created_at', now.toISOString());

    if (!leadsError && !recentBookingsError) {
      const totalLeads = recentLeads?.length || 0;
      const hotLeads = recentLeads?.filter(l => l.temperature === 'hot') || [];
      const totalBookings = recentBookings?.length || 0;
      
      const reportMessage = `📊 **BÁO CÁO NGÀY ${yesterday.toLocaleDateString('vi-VN')}** 📊
━━━━━━━━━━━━━━━━━━━━━━━
💬 Khách hàng mới (Leads): ${totalLeads}
🔥 Khách "Hot" cần chốt: ${hotLeads.length}
✅ Lịch hẹn mới (Bookings): ${totalBookings}

📌 **Danh sách Khách Hot:**
${hotLeads.map(l => `- ${l.name} (${l.phone}): ${l.service_interest}`).join('\n') || '- (Không có)'}

💡 **Gợi ý:** Hãy gọi lại cho các khách "Hot" trong hôm nay để chốt lịch nhé!
━━━━━━━━━━━━━━━━━━━━━━━`;

      await sendTelegramMessage(reportMessage);
      reportSent = true;
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Master Cron executed successfully',
      remindersSent,
      reportSent
    }), { status: 200 });

  } catch (error) {
    console.error('Master Cron Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
