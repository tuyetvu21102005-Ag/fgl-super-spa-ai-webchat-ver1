# Spa Intent Parser Skill

## Purpose
Phân tích tin nhắn người dùng để trích xuất ý định (intent) và dữ liệu có cấu trúc.

## Intent Classification
- **booking**: Khách muốn đặt lịch hẹn.
- **inquiry**: Khách hỏi về giá, dịch vụ, địa chỉ.
- **lead_capture**: Khách để lại thông tin (tên, SĐT).
- **content_gen**: (PRO) Yêu cầu tạo nội dung marketing.
- **loyalty**: (PRO) Kiểm tra điểm, đổi thưởng.
- **payment**: (PRO) Hỏi về thanh toán hoặc VietQR.
- **cancel_reschedule**: Khách muốn hủy hoặc đổi lịch.
- **general**: Trò chuyện thông thường.

## Lead Scoring Logic
- **Cold**: Chỉ hỏi thăm sơ sài, chưa có nhu cầu rõ ràng.
- **Warm**: Hỏi sâu về giá hoặc dịch vụ cụ thể.
- **Hot**: Để lại SĐT hoặc yêu cầu đặt lịch ngay.

## Extraction Logic
- **Name**: Trích xuất từ các câu chào hoặc giới thiệu.
- **Phone**: Nhận diện chuỗi 10-11 số tại Việt Nam.
- **Service**: Khớp với danh sách dịch vụ của spa.
- **DateTime**: Chuyển đổi ngôn ngữ tự nhiên (ví dụ: "chiều mai lúc 3h") sang định dạng chuẩn.

## Pain Point Detection
- Da mụn, sạm nám, mệt mỏi, cần thư giãn, v.v.
