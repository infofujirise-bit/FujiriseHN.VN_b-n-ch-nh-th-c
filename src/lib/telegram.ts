import axios from 'axios';
import { supabase } from './supabase';


export const sendToTelegram = async (message: string, type: 'lead' | 'recruitment' | 'auth' | 'marketing' = 'lead') => {
  let TELEGRAM_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  let CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  try {
    const { data: settings } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
    if (settings?.content_dict?.api_config) {
      if (settings.content_dict.api_config.tgToken) TELEGRAM_TOKEN = settings.content_dict.api_config.tgToken;
      if (settings.content_dict.api_config.tgChatId) CHAT_ID = settings.content_dict.api_config.tgChatId;
    }
  } catch (e) {
    console.error("Could not fetch dynamic Telegram config");
  }

  if (!TELEGRAM_TOKEN || !CHAT_ID) {
    console.warn('TELEGRAM ERROR: VITE_TELEGRAM_BOT_TOKEN or VITE_TELEGRAM_CHAT_ID is missing.');
    return false;
  }
  
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    
    let emoji = '🔔';
    if (type === 'recruitment') emoji = '💼';
    if (type === 'auth') emoji = '🔐';
    if (type === 'marketing') emoji = '📊';

    const formattedMessage = `${emoji} <b>NOTIFY FROM FUJIRISE</b>\n${message}`;
    
    await axios.post(url, {
      chat_id: CHAT_ID,
      text: formattedMessage,
      parse_mode: 'HTML',
    });
    return true;
  } catch (error) {
    console.error('Telegram error:', error);
    return false;
  }
};

export const requestPasswordReset = async (email: string) => {
  const msg = `
<b>YÊU CẦU CẤP LẠI MẬT KHẨU</b>
----------------------------
<b>Email:</b> ${email}
----------------------------
<i>Vui lòng phản hồi qua email hoặc cấp quyền lại cho người dùng này.</i>
  `;
  return sendToTelegram(msg, 'auth');
};
