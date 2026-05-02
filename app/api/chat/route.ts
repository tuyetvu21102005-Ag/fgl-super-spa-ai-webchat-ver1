import { OpenAI } from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { sendTelegramMessage } from '@/lib/telegram';
import { supabaseAdmin } from '@/lib/supabase';
import { syncLeadToSheets, syncBookingToSheets, updateBookingInSheets } from '@/lib/sheets';

// DeepSeek API configuration via Vercel AI SDK (OpenAI compatible)
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com/v1',
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, sessionId, spaId, spaName, serviceList, priceList, address, hours } = await req.json();

    // 0. Save user message if sessionId is present
    if (sessionId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        try {
          let { data: session } = await supabaseAdmin
            .from('chat_sessions')
            .select('id')
            .eq('visitor_id', sessionId)
            .single();

          if (!session) {
            const { data: newSession } = await supabaseAdmin
              .from('chat_sessions')
              .insert({
                spa_id: spaId || 'default',
                visitor_id: sessionId,
                metadata: { spa_name: spaName }
              })
              .select()
              .single();
            session = newSession;
          }

          if (session) {
            await supabaseAdmin.from('chat_messages').insert({
              session_id: session.id,
              role: 'user',
              content: lastMessage.content,
            });
          }
        } catch (error) {
          console.error('Error saving user message:', error);
        }
      }
    }

    // 1. Prepare System Prompt (Enhanced with Consulting Skills)
    const systemPrompt = `
━━━ SYSTEM PROMPT — CHUYÊN GIA TƯ VẤN SPA AI ━━━

Bạn là một chuyên gia tư vấn sắc đẹp cao cấp của ${spaName || 'Glow Beauty Spa'}.
Tính cách: tinh tế, thấu cảm, chuyên nghiệp, nói tiếng Việt tự nhiên và duyên dáng.

── NHIỆM VỤ CHIẾN LƯỢC ──
1. TƯ VẤN THẤU CẢM: Luôn bắt đầu bằng việc công nhận cảm xúc hoặc vấn đề của khách (VD: "Em hiểu cảm giác lo lắng khi da bị mụn...").
2. ĐẶT CÂU HỎI ĐÀO SÂU: Thay vì chỉ trả lời giá, hãy hỏi về tình trạng da, thói quen sinh hoạt để tư vấn đúng gói.
3. KHÁM PHÁ PAIN POINTS: Tìm hiểu nỗi đau thực sự (mất tự tin, chuẩn bị đi tiệc, stress công việc...).
4. GIẢI QUYẾT PHẢN ĐỐI: Nếu khách chê đắt -> nhấn mạnh vào chất lượng dược phẩm và tay nghề chuyên gia.

── THÔNG TIN SPA ──
  Tên    : ${spaName || 'Glow Beauty Spa'}
  Địa chỉ: ${address || '123 Đường ABC, Quận 1, TP.HCM'}
  Giờ mở : ${hours || '9:00 - 21:00 hằng ngày'}
  SĐT    : ${process.env.SPA_PHONE || '0901234567'}

── DỊCH VỤ & GIÁ ──
  ${serviceList || 'Chăm sóc da, Massage, Triệt lông, Gội đầu dưỡng sinh'}
  ${priceList || 'Liên hệ để được tư vấn chi tiết'}

── NGUYÊN TẮC VÀNG ──
  - Không bao giờ trả lời quá 3 câu trong 1 lượt.
  - Sử dụng các từ ngữ thân mật nhưng lịch sự: "Dạ", "Chị ạ", "Mình ơi".
  - Luôn hướng tới mục tiêu cuối cùng: Đặt lịch tư vấn trực tiếp (Booking).
  - VIETQR: Nếu khách muốn đặt cọc hoặc thanh toán, hãy tạo link: https://img.vietqr.io/image/MB-0901234567-compact2.png?amount=100000&addInfo=DAT%20LICH%20[TEN_KHACH]
  - LOYALTY: Nếu khách hỏi điểm thành viên, hãy xin SĐT để tra cứu và báo họ số điểm hiện có (mặc định là 0 nếu chưa có lịch sử).

── LEAD SCORING ──
  - Cold: Khách hỏi giá chung chung. -> Cung cấp kiến thức, tặng tip chăm sóc da.
  - Warm: Khách hỏi chi tiết liệu trình, địa chỉ. -> Gợi ý đặt lịch khám da miễn phí.
  - Hot: Khách hỏi thời gian trống, muốn đặt ngay. -> Chốt lịch và xin SĐT gấp.

── JSON OUTPUT BẮT BUỘC ──
  Sau mỗi lượt, append block này ở cuối cùng:
  ---JSON_OUTPUT---
  {
    "intent": "booking | booking_change | booking_cancel | loyalty_check | payment_request | inquiry | lead_capture | general",
    "lead_score": 0,
    "lead_temperature": "cold|warm|hot",
    "pain_points": [],
    "competitor_mentions": [],
    "channel_source": "chat_widget",
    "extracted_data": {
      "name": "string or null",
      "phone": "string or null",
      "service": "string or null",
      "datetime": "string or null"
    },
    "action_required": {
      "save_to_sheets": false,
      "send_telegram": false,
      "create_booking": false,
      "update_booking": false,
      "cancel_booking": false,
      "check_loyalty": false,
      "generate_payment": false,
      "schedule_followup": false
    },
    "telegram_message": "🔔 **THÔNG BÁO MỚI** 🔔\n\n👤 Khách: {name}\n📞 SĐT: {phone}\n💆 Dịch vụ: {service}\n📅 Hẹn: {datetime}\n🌡️ Nhiệt độ: {lead_temperature}\n🔥 Score: {lead_score}/100\n\n💬 Tin nhắn: {last_user_message}",
    "insight_flag": "none|new_service_request|competitor_mention|price_objection"
  }
  ---END_JSON---
━━━ END SYSTEM PROMPT ━━━
`;

    // 2. Call DeepSeek
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    });

    // 3. Convert the response into a friendly text-stream
    const stream = OpenAIStream(response, {
      onCompletion: async (completion) => {
        // Parse JSON block for webhook
        const jsonMatch = completion.match(/---JSON_OUTPUT---([\s\S]*?)---END_JSON---/);
        let jsonData = null;
        if (jsonMatch) {
          try {
            jsonData = JSON.parse(jsonMatch[1].trim());
            console.log('Extracted JSON:', jsonData);
            
            // Trigger Telegram if required
            if (jsonData.action_required?.send_telegram && jsonData.telegram_message) {
              await sendTelegramMessage(jsonData.telegram_message);
            }

            // Save Lead if score is high or intent is lead_capture
            if (jsonData.extracted_data?.phone && (jsonData.lead_score > 30 || jsonData.intent === 'lead_capture')) {
              await supabaseAdmin.from('leads').upsert({
                spa_id: spaId || 'default',
                name: jsonData.extracted_data.name,
                phone: jsonData.extracted_data.phone,
                service_interest: jsonData.extracted_data.service,
                temperature: jsonData.lead_temperature,
                score: jsonData.lead_score,
                pain_points: jsonData.pain_points,
                competitor_mentions: jsonData.competitor_mentions,
              }, { onConflict: 'phone' });
              
              // Đồng bộ Google Sheets
              await syncLeadToSheets(jsonData);
            }

            // Create Booking if intent is booking
            if (jsonData.intent === 'booking' && jsonData.action_required?.create_booking) {
              await supabaseAdmin.from('bookings').insert({
                spa_id: spaId || 'default',
                customer_name: jsonData.extracted_data.name,
                phone: jsonData.extracted_data.phone,
                service: jsonData.extracted_data.service,
                booking_time: jsonData.extracted_data.datetime,
              });

              // Đồng bộ Google Sheets
              await syncBookingToSheets(jsonData);
            }

            // Update Booking if intent is booking_change
            if (jsonData.intent === 'booking_change' && jsonData.action_required?.update_booking && jsonData.extracted_data.phone) {
              await supabaseAdmin.from('bookings')
                .update({
                  booking_time: jsonData.extracted_data.datetime,
                  service: jsonData.extracted_data.service || undefined,
                  status: 'rescheduled'
                })
                .eq('phone', jsonData.extracted_data.phone)
                .eq('status', 'pending'); // Only update pending bookings
                
              // Đồng bộ Google Sheets
              await updateBookingInSheets(jsonData.extracted_data.phone, {
                datetime: jsonData.extracted_data.datetime,
                status: 'Rescheduled'
              });
            }

            // Cancel Booking if intent is booking_cancel
            if (jsonData.intent === 'booking_cancel' && jsonData.action_required?.cancel_booking && jsonData.extracted_data.phone) {
              await supabaseAdmin.from('bookings')
                .update({ status: 'cancelled' })
                .eq('phone', jsonData.extracted_data.phone)
                .eq('status', 'pending');
                
              // Đồng bộ Google Sheets
              await updateBookingInSheets(jsonData.extracted_data.phone, {
                status: 'Cancelled'
              });
            }

            // Loyalty Check if intent is loyalty_check
            if (jsonData.intent === 'loyalty_check' && jsonData.extracted_data.phone) {
              const { data: loyalty } = await supabaseAdmin
                .from('loyalty_points')
                .select('points')
                .eq('customer_phone', jsonData.extracted_data.phone)
                .single();
              
              // We could inject this back into the chat, but for now we just log it
              console.log('Loyalty Points for', jsonData.extracted_data.phone, ':', loyalty?.points || 0);
            }

            // Payment Request (VietQR) - Logic is handled by the AI generating the link
            if (jsonData.intent === 'payment_request' && jsonData.action_required?.generate_payment) {
              // The AI will formulate the VietQR URL in its text response
              // We just ensure the lead is captured
            }

          } catch (e) {
            console.error('Failed to parse JSON output:', e);
          }
        }

        // 4. Ensure session exists and Save message to Supabase
        if (sessionId) {
          try {
            // First, try to find the session or create it
            // We use spaId and sessionId (which acts as a visitor_id/lookup)
            let { data: session } = await supabaseAdmin
              .from('chat_sessions')
              .select('id')
              .eq('visitor_id', sessionId)
              .single();

            if (!session) {
              const { data: newSession, error: sessionError } = await supabaseAdmin
                .from('chat_sessions')
                .insert({
                  spa_id: spaId || 'default',
                  visitor_id: sessionId,
                  metadata: { spa_name: spaName }
                })
                .select()
                .single();
              
              if (sessionError) throw sessionError;
              session = newSession;
            }

            // Insert the assistant message
            await supabaseAdmin.from('chat_messages').insert({
              session_id: session.id,
              role: 'assistant',
              content: completion.replace(/---JSON_OUTPUT---[\s\S]*?---END_JSON---/, '').trim(),
              json_output: jsonData || {},
            });
          } catch (error) {
            console.error('Error saving message to Supabase:', error);
          }
        }
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
