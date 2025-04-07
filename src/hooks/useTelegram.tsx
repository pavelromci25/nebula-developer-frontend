import { useState, useEffect } from 'react';

interface TelegramUser {
  id?: number;
}

interface InitDataUnsafe {
  user?: TelegramUser;
}

interface TelegramWebApp {
  initDataUnsafe: InitDataUnsafe;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function useTelegram() {
  const [userId, setUserId] = useState<string>('guest');
  const [isTelegram, setIsTelegram] = useState<boolean>(false);

  useEffect(() => {
    const loadUserData = () => {
      if (window.Telegram && window.Telegram.WebApp) {
        const webApp = window.Telegram.WebApp;
        const initDataUnsafe = webApp.initDataUnsafe;
        const user = initDataUnsafe?.user;

        if (user && user.id) {
          setUserId(user.id.toString());
          setIsTelegram(true);
        } else {
          setUserId('guest');
          setIsTelegram(false);
        }
      } else {
        setUserId('guest');
        setIsTelegram(false);
      }
    };

    loadUserData();

    const script = document.querySelector('script[src="https://telegram.org/js/telegram-web-app.js"]');
    if (script && !window.Telegram?.WebApp) {
      const loadHandler = () => loadUserData();
      script.addEventListener('load', loadHandler);
      return () => script.removeEventListener('load', loadHandler);
    }
  }, []);

  return {
    userId,
    isTelegram,
  };
}