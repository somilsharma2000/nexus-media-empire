/**
 * Telegram alert helper — sends a message to the admin via the Bot API.
 * Falls back to console.log when env vars are not configured.
 */
export async function sendTelegramAlert(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_USER_ID;

  if (!token || !chatId) {
    console.log('[TELEGRAM ALERT]', message);
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
  } catch (err) {
    console.error('[TELEGRAM] Failed to send alert:', err);
  }
}
