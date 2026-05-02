const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendTelegramMessage(message: string) {
  if (!BOT_TOKEN || !CHAT_ID || CHAT_ID === 'your_telegram_chat_id_here') {
    console.warn('Telegram BOT_TOKEN or CHAT_ID not configured properly.');
    return;
  }

  // Enhanced formatting if it looks like a lead/booking notification
  let formattedMessage = message;
  if (message.includes('🔔') || message.includes('🔥')) {
    // Keep as is or add more flair
  } else {
    formattedMessage = `🤖 **AI UPDATE**\n\n${message}`;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}
