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
    // Lấy thời điểm 7 ngày trước
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // ==========================================
    // TỔNG HỢP & GỬI BÁO CÁO TUẦN
    // ==========================================
    
    // Lấy leads của 7 ngày qua
    const { data: weeklyLeads, error: leadsError } = await supabaseAdmin
      .from('leads')
      .select('*')
      .gte('created_at', lastWeek.toISOString())
      .lte('created_at', now.toISOString());

    // Lấy bookings được tạo trong 7 ngày qua
    const { data: weeklyBookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .gte('created_at', lastWeek.toISOString())
      .lte('created_at', now.toISOString());

    // Lấy danh sách sản phẩm sắp hết (Tồn kho <= 5)
    const { data: lowStockItems, error: inventoryError } = await supabaseAdmin
      .from('inventory')
      .select('*')
      .lte('quantity', 5);

    if (!leadsError && !bookingsError) {
      const totalLeads = weeklyLeads?.length || 0;
      const hotLeadsCount = weeklyLeads?.filter(l => l.temperature === 'hot').length || 0;
      const warmLeadsCount = weeklyLeads?.filter(l => l.temperature === 'warm').length || 0;
      
      const totalBookings = weeklyBookings?.length || 0;
      const completedBookings = weeklyBookings?.filter(b => b.status === 'completed').length || 0;
      const cancelledBookings = weeklyBookings?.filter(b => b.status === 'cancelled').length || 0;

      // Tính tỷ lệ chuyển đổi (Lead -> Booking)
      const conversionRate = totalLeads > 0 ? Math.round((totalBookings / totalLeads) * 100) : 0;
      
      const reportMessage = `📈 **BÁO CÁO TỔNG HỢP TUẦN** 📈
📅 Từ: ${lastWeek.toLocaleDateString('vi-VN')} đến ${now.toLocaleDateString('vi-VN')}
━━━━━━━━━━━━━━━━━━━━━━━
👥 **Khách hàng tiềm năng (Leads):**
- Tổng số Lead mới: ${totalLeads}
- Khách "Hot" (Sẵn sàng chốt): ${hotLeadsCount}
- Khách "Warm" (Đang phân vân): ${warmLeadsCount}

📅 **Lịch hẹn (Bookings):**
- Tổng số lịch hẹn: ${totalBookings}
- Lịch đã hoàn thành: ${completedBookings}
- Lịch đã hủy: ${cancelledBookings}

🎯 **Tỷ lệ chuyển đổi:** ${conversionRate}%

📦 **CẢNH BÁO KHO HÀNG SẮP HẾT:**
${!inventoryError && lowStockItems && lowStockItems.length > 0 
  ? lowStockItems.map(item => `- ${item.product_name} (Còn: ${item.quantity})`).join('\n')
  : '- Mọi sản phẩm đều còn đủ hàng.'}
━━━━━━━━━━━━━━━━━━━━━━━
💡 Chúc Spa có một tuần mới bùng nổ doanh số! ✨`;

      await sendTelegramMessage(reportMessage);
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Weekly Cron executed successfully'
    }), { status: 200 });

  } catch (error) {
    console.error('Weekly Cron Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
