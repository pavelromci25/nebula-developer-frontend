// Определяем интерфейс для Telegram Web App
interface TelegramWebApp {
  initDataUnsafe: {
    user?: {
      id?: number;
    };
  };
}

interface Telegram {
  WebApp: TelegramWebApp;
}

// Расширяем глобальный интерфейс Window
declare global {
  interface Window {
    Telegram?: Telegram;
  }
}

export const useTelegram = () => {
  const tg = window.Telegram?.WebApp;
  return {
    userId: tg?.initDataUnsafe?.user?.id?.toString() || 'guest',
  };
};