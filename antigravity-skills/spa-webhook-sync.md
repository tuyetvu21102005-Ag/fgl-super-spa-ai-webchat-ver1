# Spa Webhook Sync Skill

## Purpose
Xử lý dữ liệu JSON trích xuất từ AI và đồng bộ hóa với các dịch vụ bên thứ ba.

## Data Flow
1. Nhận `---JSON_OUTPUT---` từ AI Chat API.
2. Kiểm tra `action_required`.
3. Thực hiện song song các tác vụ:
   - **Supabase**: Lưu `chat_messages`, upsert `leads` hoặc `bookings`.
   - **Google Sheets**: Append dữ liệu vào tab tương ứng (CRM backup).
   - **Telegram**: Gửi tin nhắn thông báo cho chủ spa.

## Implementation Details
- Sử dụng `Promise.allSettled` để đảm bảo một dịch vụ lỗi không làm dừng các dịch vụ khác.
- **Retry Logic**: Đối với Telegram, thử lại tối đa 3 lần nếu gặp lỗi mạng.
- **Deduplication**: Kiểm tra SĐT để không tạo lead trùng lặp.

## Error Handling
- Log lỗi chi tiết vào Supabase `metadata` để tracking.
- Trả về status summary cho API caller.
