import { useState, useEffect } from 'react';

interface TelegramUser {
  first_name?: string;
  id?: number;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
  is_bot?: boolean;
  is_premium?: boolean;
}

interface TelegramChat {
  id: number;
  photo_url?: string;
  type: string;
  title: string;
  username?: string;
}

interface InitDataUnsafe {
  user?: TelegramUser;
  chat?: TelegramChat;
  chat_instance?: string;
  chat_type?: string;
  auth_date?: number;
  hash?: string;
  query_id?: string;
  receiver?: TelegramUser;
  start_param?: string;
}

interface TelegramWebApp {
  expand: () => void;
  initDataUnsafe: InitDataUnsafe;
  platform: string;
  requestFullscreen: () => void;
  exitFullscreen: () => void;
  isFullscreen: boolean;
  isOrientationLocked: boolean;
  isClosingConfirmationEnabled: boolean;
  isVerticalSwipesEnabled: boolean;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  enableVerticalSwipes: () => void;
  disableVerticalSwipes: () => void;
  onEvent: (event: string, callback: () => void) => void;
  offEvent: (event: string, callback: () => void) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function useTelegram() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [username, setUsername] = useState<string>('Гость');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [platform, setPlatform] = useState<string>('Неизвестно');
  const [userId, setUserId] = useState<string>('guest');

  useEffect(() => {
    const loadUserData = () => {
      if (window.Telegram && window.Telegram.WebApp) {
        const webApp = window.Telegram.WebApp;
        const initDataUnsafe = webApp.initDataUnsafe;
        const user = initDataUnsafe?.user;

        if (user) {
          setUsername(user.first_name || 'Гость');
          setPhotoUrl(user.photo_url || '');
          setIsPremium(user.is_premium || false);
          setUserId(user.id ? user.id.toString() : 'guest');
        } else {
          setUsername('Гость');
          setUserId('guest');
        }

        setPlatform(webApp.platform || 'Неизвестно');
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

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const webApp = window.Telegram.WebApp;
      const isMobile = ['ios', 'android'].some((p) => webApp.platform.toLowerCase().includes(p));
      if (isMobile) {
        webApp.requestFullscreen();
        webApp.enableClosingConfirmation();
        webApp.disableVerticalSwipes();
      } else {
        webApp.expand();
      }
      setIsFullscreen(webApp.isFullscreen);

      webApp.onEvent('fullscreenChanged', () => setIsFullscreen(webApp.isFullscreen));
    }
  }, [platform]);

  return {
    isFullscreen,
    username,
    photoUrl,
    isPremium,
    platform,
    userId,
  };
}