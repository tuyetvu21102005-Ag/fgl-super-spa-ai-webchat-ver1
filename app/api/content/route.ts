import { OpenAI } from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

// Cấu hình DeepSeek API
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com/v1',
});

// export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { topic, platform, tone } = await req.json();

    if (!topic) {
      return new Response(JSON.stringify({ error: 'Topic is required' }), { status: 400 });
    }

    // Xây dựng System Prompt chuyên biệt cho Spa Marketing
    const systemPrompt = `
Bạn là một chuyên gia Content Marketing xuất sắc chuyên về lĩnh vực Spa và Làm đẹp (Glow Beauty Spa).
Nhiệm vụ của bạn là viết một bài đăng mạng xã hội thật thu hút, chuyển đổi cao dựa trên yêu cầu của người dùng.

THÔNG TIN SPA:
- Tên: Glow Beauty Spa
- Nổi bật: Dịch vụ chuẩn 5 sao, không gian sang trọng, chuyên gia tận tâm.

HƯỚNG DẪN VIẾT BÀI:
1. Nền tảng (Platform): ${platform || 'Facebook'}
   - Nếu là Facebook: Viết dài vừa phải, chia đoạn rõ ràng, dùng nhiều emoji, luôn có Call to Action (CTA) và Hashtag.
   - Nếu là TikTok (Kịch bản video): Chia thành các cảnh (Cảnh 1, Cảnh 2...) kèm mô tả hình ảnh và lời thoại (Voiceover). Cực kỳ ngắn gọn, bắt trend.
   - Nếu là Instagram: Đánh mạnh vào hình ảnh/cảm xúc, caption sành điệu, sang chảnh, hashtag chuẩn.
2. Giọng điệu (Tone): ${tone || 'Chuyên nghiệp và thu hút'}
3. Chủ đề (Topic): "${topic}"

CẤU TRÚC BẮT BUỘC (Đối với bài viết Text):
- Tiêu đề (Headline): Giật tít, thu hút sự chú ý ngay lập tức (In hoa, có emoji).
- Thân bài: Trình bày vấn đề (Pain point) -> Đưa ra giải pháp của Spa -> Lợi ích nhận được.
- Call to Action (CTA): Kêu gọi đặt lịch, nhắn tin, hoặc để lại SĐT.
- Thông tin liên hệ: Inbox fanpage hoặc Hotline.
- Hashtags: 5-7 hashtag liên quan.

Bắt đầu viết bài ngay bây giờ, không cần giải thích thêm.
`;

    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Hãy viết bài về: ${topic}` }
      ],
      temperature: 0.7,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);

  } catch (error) {
    console.error('Content API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
