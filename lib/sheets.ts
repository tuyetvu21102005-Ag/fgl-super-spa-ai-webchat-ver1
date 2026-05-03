import { google } from 'googleapis';

const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID || process.env.GOOGLE_SHEETS_ID;

const auth = new google.auth.JWT(
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  undefined,
  GOOGLE_PRIVATE_KEY,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth });

export async function appendToSheet(range: string, values: any[]) {
  if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    console.warn('Google Sheets credentials missing. Skipping sync.');
    return;
  }

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });
    console.log(`Successfully appended data to ${range}`);
  } catch (error) {
    console.error('Error appending to Google Sheets:', error);
    throw error;
  }
}

/**
 * Append a new lead to the "Leads" sheet
 */
export async function syncLeadToSheets(data: any) {
  const { extracted_data, lead_temperature, lead_score } = data;
  const values = [
    new Date().toLocaleString('vi-VN'),
    extracted_data?.name || 'N/A',
    extracted_data?.phone || 'N/A',
    extracted_data?.service || 'N/A',
    lead_temperature || 'cold',
    lead_score || 0,
    data.pain_points?.join(', ') || '',
    'AI Webchat'
  ];
  return appendToSheet('Leads!A:H', values);
}

/**
 * Append a new booking to the "Bookings" sheet
 */
export async function syncBookingToSheets(data: any) {
  const { extracted_data } = data;
  const values = [
    new Date().toLocaleString('vi-VN'),
    extracted_data?.name || 'N/A',
    extracted_data?.phone || 'N/A',
    extracted_data?.service || 'N/A',
    extracted_data?.datetime || 'N/A',
    'Chờ xác nhận',
    'AI Webchat'
  ];
  return appendToSheet('Bookings!A:G', values);
}

/**
 * Tìm dòng dữ liệu theo số điện thoại
 */
export async function findRowIndexByPhone(sheetName: string, phone: string, phoneColumnIndex: number = 2): Promise<number | null> {
  if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) return null;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: `${sheetName}!A:G`,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return null;

    // Tìm dòng có sđt trùng khớp (dòng 1 là header, mảng index từ 0, dòng excel từ 1)
    // Chạy từ dưới lên để lấy booking gần nhất
    for (let i = rows.length - 1; i >= 0; i--) {
      if (rows[i][phoneColumnIndex] === phone) {
        return i + 1; // Google Sheets là 1-indexed
      }
    }
    return null;
  } catch (error) {
    console.error('Lỗi khi tìm số điện thoại trong Sheets:', error);
    return null;
  }
}

/**
 * Cập nhật lịch hẹn (Đổi giờ hoặc Hủy)
 */
export async function updateBookingInSheets(phone: string, updateData: { datetime?: string, status?: string }) {
  if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) return;

  const rowIndex = await findRowIndexByPhone('Bookings', phone, 2); // Cột C (index 2) là SĐT
  if (!rowIndex) {
    console.warn(`Không tìm thấy booking với SĐT ${phone} trên Sheets.`);
    return;
  }

  try {
    // Nếu cập nhật thời gian, cập nhật cột E. Nếu cập nhật trạng thái, cập nhật cột F.
    // Để đơn giản, ta sẽ gọi update từng ô, hoặc đọc cả dòng rồi update.
    // Ở đây ta update trực tiếp nếu có trường tương ứng
    if (updateData.datetime) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: `Bookings!E${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[updateData.datetime]] }
      });
    }

    if (updateData.status) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: `Bookings!F${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[updateData.status]] }
      });
    }

    console.log(`Đã cập nhật booking của ${phone} tại dòng ${rowIndex}`);
  } catch (error) {
    console.error('Lỗi khi cập nhật Booking trên Sheets:', error);
  }
}
