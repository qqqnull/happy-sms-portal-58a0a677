import { useEffect } from 'react';

const WIDGET_SCRIPT_URL = 'https://clgfrowsysmiwbxyccag.supabase.co/storage/v1/object/public/widget/chat-widget.js';
const PRIMARY_COLOR = '#2563eb';
const TELEGRAM_URL = 'https://t.me/kfGlobalSms';

const LovableChatWidget = () => {
  useEffect(() => {
    if (document.getElementById('lovable-chat-widget-script')) return;
    if ((window as any).LovableChat) return;

    const script = document.createElement('script');
    script.id = 'lovable-chat-widget-script';
    script.src = WIDGET_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      const LovableChat = (window as any).LovableChat;
      if (LovableChat && LovableChat.init) {
        LovableChat.init({
          site: '2026sms',
          primaryColor: PRIMARY_COLOR,
          position: 'bottom-right',
          title: '在线客服',
          telegramUrl: TELEGRAM_URL,
          telegramLabel: 'Telegram 客服',
          chatLabel: '在线客服'
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      const scriptElement = document.getElementById('lovable-chat-widget-script');
      if (scriptElement) {
        document.body.removeChild(scriptElement);
      }
    };
  }, []);

  return null;
};

export default LovableChatWidget;
