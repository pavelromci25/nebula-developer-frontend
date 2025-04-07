import { useState, useEffect } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { FaUser, FaPlus, FaEdit, FaChartBar, FaShoppingCart } from 'react-icons/fa';

interface Developer {
  userId: string;
  registrationDate: string;
  telegramStarsBalance: number;
  referralCode: string;
  apps: App[];
}

interface App {
  id: string;
  type: 'game' | 'app';
  name: string;
  shortDescription: string;
  longDescription?: string;
  category: string;
  additionalCategories: string[];
  categories: string[];
  icon: string;
  banner?: string;
  gallery: string[];
  video?: string;
  developerId: string;
  platforms: string[];
  ageRating: string;
  inAppPurchases: boolean;
  supportsTON: boolean;
  supportsTelegramStars: boolean;
  contactInfo: string;
  status: 'added' | 'onModeration' | 'rejected';
  rejectionReason?: string;
}

interface Stat {
  appId: string;
  name: string;
  clicks: number;
  telegramStars: number;
  complaints: number;
  catalogRank: number;
  categoryRank: number;
  additionalCategoryRanks: { category: string; rank: number }[];
  platforms: string[];
}

const DeveloperDashboard: React.FC = () => {
  const { userId, isTelegram } = useTelegram();
  const [activeTab, setActiveTab] = useState('profile');
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [stats, setStats] = useState<Stat[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newApp, setNewApp] = useState({
    type: 'game' as 'game' | 'app',
    name: '',
    shortDescription: '',
    longDescription: '',
    category: '',
    additionalCategories: [] as string[],
    icon: '',
    gallery: [] as string[],
    video: '',
    platforms: [] as string[],
    ageRating: '',
    inAppPurchases: false,
    supportsTON: false,
    supportsTelegramStars: false,
    contactInfo: '',
  });
  const [editingApp, setEditingApp] = useState<App | null>(null);

  useEffect(() => {
    const fetchDeveloper = async () => {
      try {
        const response = await fetch(`https://nebula-server-ypun.onrender.com/api/developer/${userId}`);
        if (!response.ok) {
          throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setDeveloper(data);
        setError(null);
      } catch (error) {
        console.error('Ошибка при загрузке данных разработчика:', error);
        setError('Не удалось загрузить данные. Проверьте ваш userId или попробуйте позже.');
      }
    };

    if (isTelegram && userId !== 'guest') {
      fetchDeveloper();
    }
  }, [userId, isTelegram]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`https://nebula-server-ypun.onrender.com/api/developer/${userId}/stats`);
        if (!response.ok) {
          throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Ошибка при загрузке статистики:', error);
      }
    };

    if (isTelegram && userId !== 'guest') {
      fetchStats();
    }
  }, [userId, isTelegram]);

  const handleAddApp = async () => {
    try {
      const response = await fetch(`https://nebula-server-ypun.onrender.com/api/developer/${userId}/apps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp),
      });
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
      }
      const addedApp = await response.json();
      setDeveloper(prev => prev ? { ...prev, apps: [...prev.apps, addedApp] } : prev);
      setNewApp({
        type: 'game',
        name: '',
        shortDescription: '',
        longDescription: '',
        category: '',
        additionalCategories: [],
        icon: '',
        gallery: [],
        video: '',
        platforms: [],
        ageRating: '',
        inAppPurchases: false,
        supportsTON: false,
        supportsTelegramStars: false,
        contactInfo: '',
      });
      alert('Приложение успешно добавлено и отправлено на модерацию!');
    } catch (error) {
      console.error('Ошибка при добавлении приложения:', error);
      alert('Ошибка при добавлении приложения.');
    }
  };

  const handleEditApp = async () => {
    if (!editingApp) return;
    try {
      const response = await fetch(`https://nebula-server-ypun.onrender.com/api/developer/${userId}/apps/${editingApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingApp),
      });
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
      }
      const updatedApp = await response.json();
      setDeveloper(prev => prev ? {
        ...prev,
        apps: prev.apps.map(app => app.id === updatedApp.id ? updatedApp : app),
      } : prev);
      setEditingApp(null);
      alert('Приложение успешно обновлено!');
    } catch (error) {
      console.error('Ошибка при обновлении приложения:', error);
      alert('Ошибка при обновлении приложения.');
    }
  };

  const handlePromote = async (appId: string, type: 'catalog' | 'category', duration: number) => {
    try {
      const response = await fetch(`https://nebula-server-ypun.onrender.com/api/developer/${userId}/promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, type, duration }),
      });
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      alert(result.message);
      const developerResponse = await fetch(`https://nebula-server-ypun.onrender.com/api/developer/${userId}`);
      const updatedDeveloper = await developerResponse.json();
      setDeveloper(updatedDeveloper);
    } catch (error) {
      console.error('Ошибка при активации продвижения:', error);
      alert('Ошибка при активации продвижения.');
    }
  };

  if (!isTelegram) {
    return (
      <div className="content">
        <h2>Ошибка</h2>
        <p>Это приложение должно быть запущено через Telegram.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content">
        <h2>Ошибка</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!developer) {
    return <div className="content">Загрузка...</div>;
  }

  return (
    <div className="content slide-in">
      <div className="bottom-menu">
        <button
          className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FaUser className="menu-icon" />
          Профиль
        </button>
        <button
          className={`menu-item ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          <FaPlus className="menu-icon" />
          Добавить
        </button>
        <button
          className={`menu-item ${activeTab === 'edit' ? 'active' : ''}`}
          onClick={() => setActiveTab('edit')}
        >
          <FaEdit className="menu-icon" />
          Редактор
        </button>
        <button
          className={`menu-item ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <FaChartBar className="menu-icon" />
          Статистика
        </button>
        <button
          className={`menu-item ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          <FaShoppingCart className="menu-icon" />
          Услуги
        </button>
      </div>

      {activeTab === 'profile' && (
        <div>
          <section className="section">
            <h2 className="section-title">Профиль разработчика</h2>
            <div className="card">
              <p className="card-text"><strong>Дата регистрации:</strong> {new Date(developer.registrationDate).toLocaleDateString()}</p>
              <p className="card-text"><strong>Количество приложений:</strong> {developer.apps.length}</p>
              <p className="card-text"><strong>Баланс Telegram Stars:</strong> {developer.telegramStarsBalance || 0}</p>
              <p className="card-text"><strong>Реферальный код:</strong> {developer.referralCode}</p>
              <button className="button" onClick={() => window.open('https://t.me/admin_contact', '_blank')}>
                Связаться с администрацией
              </button>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'add' && (
        <div>
          <section className="section">
            <h2 className="section-title">Добавить приложение</h2>
            <div className="card">
              <select
                value={newApp.type}
                onChange={(e) => setNewApp({ ...newApp, type: e.target.value as 'game' | 'app' })}
                className="input"
              >
                <option value="game">Игра</option>
                <option value="app">Приложение</option>
              </select>
              <input
                type="text"
                placeholder="Название"
                value={newApp.name}
                onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
                className="input"
              />
              <textarea
                placeholder="Короткое описание (до 100 символов)"
                value={newApp.shortDescription}
                onChange={(e) => setNewApp({ ...newApp, shortDescription: e.target.value.slice(0, 100) })}
                className="input"
              />
              <textarea
                placeholder="Полное описание"
                value={newApp.longDescription}
                onChange={(e) => setNewApp({ ...newApp, longDescription: e.target.value })}
                className="input"
              />
              <input
                type="text"
                placeholder="URL аватарки"
                value={newApp.icon}
                onChange={(e) => setNewApp({ ...newApp, icon: e.target.value })}
                className="input"
              />
              <input
                type="text"
                placeholder="URL скриншотов (через запятую)"
                value={newApp.gallery.join(', ')}
                onChange={(e) => setNewApp({ ...newApp, gallery: e.target.value.split(',').map(s => s.trim()) })}
                className="input"
              />
              <input
                type="text"
                placeholder="URL видео (опционально)"
                value={newApp.video}
                onChange={(e) => setNewApp({ ...newApp, video: e.target.value })}
                className="input"
              />
              <input
                type="text"
                placeholder="Основная категория"
                value={newApp.category}
                onChange={(e) => setNewApp({ ...newApp, category: e.target.value })}
                className="input"
              />
              <input
                type="text"
                placeholder="Дополнительные категории (через запятую)"
                value={newApp.additionalCategories.join(', ')}
                onChange={(e) => setNewApp({ ...newApp, additionalCategories: e.target.value.split(',').map(s => s.trim()) })}
                className="input"
              />
              <input
                type="text"
                placeholder="Платформы (через запятую)"
                value={newApp.platforms.join(', ')}
                onChange={(e) => setNewApp({ ...newApp, platforms: e.target.value.split(',').map(s => s.trim()) })}
                className="input"
              />
              <input
                type="text"
                placeholder="Возрастной рейтинг"
                value={newApp.ageRating}
                onChange={(e) => setNewApp({ ...newApp, ageRating: e.target.value })}
                className="input"
              />
              <input
                type="text"
                placeholder="Контакты для связи"
                value={newApp.contactInfo}
                onChange={(e) => setNewApp({ ...newApp, contactInfo: e.target.value })}
                className="input"
              />
              <label>
                <input
                  type="checkbox"
                  checked={newApp.inAppPurchases}
                  onChange={(e) => setNewApp({ ...newApp, inAppPurchases: e.target.checked })}
                />
                Внутриигровые покупки
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={newApp.supportsTON}
                  onChange={(e) => setNewApp({ ...newApp, supportsTON: e.target.checked })}
                />
                Поддержка TON кошелька
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={newApp.supportsTelegramStars}
                  onChange={(e) => setNewApp({ ...newApp, supportsTelegramStars: e.target.checked })}
                />
                Поддержка Telegram Stars
              </label>
              <button className="button" onClick={handleAddApp}>Добавить приложение</button>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'edit' && (
        <div>
          <section className="section">
            <h2 className="section-title">Редактор приложений</h2>
            {developer.apps.map(app => (
              <div key={app.id} className="card">
                <h3 className="card-title">{app.name}</h3>
                <p className="card-text"><strong>Статус:</strong> {app.status}</p>
                {app.rejectionReason && <p className="card-text"><strong>Причина отклонения:</strong> {app.rejectionReason}</p>}
                <button className="button" onClick={() => setEditingApp(app)}>Редактировать</button>
              </div>
            ))}
          </section>
          {editingApp && (
            <section className="section">
              <h2 className="section-title">Редактировать приложение</h2>
              <div className="card">
                <select
                  value={editingApp.type}
                  onChange={(e) => setEditingApp({ ...editingApp, type: e.target.value as 'game' | 'app' })}
                  className="input"
                >
                  <option value="game">Игра</option>
                  <option value="app">Приложение</option>
                </select>
                <input
                  type="text"
                  placeholder="Название"
                  value={editingApp.name}
                  onChange={(e) => setEditingApp({ ...editingApp, name: e.target.value })}
                  className="input"
                />
                <textarea
                  placeholder="Короткое описание (до 100 символов)"
                  value={editingApp.shortDescription}
                  onChange={(e) => setEditingApp({ ...editingApp, shortDescription: e.target.value.slice(0, 100) })}
                  className="input"
                />
                <textarea
                  placeholder="Полное описание"
                  value={editingApp.longDescription || ''}
                  onChange={(e) => setEditingApp({ ...editingApp, longDescription: e.target.value })}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="URL аватарки"
                  value={editingApp.icon}
                  onChange={(e) => setEditingApp({ ...editingApp, icon: e.target.value })}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="URL скриншотов (через запятую)"
                  value={editingApp.gallery.join(', ')}
                  onChange={(e) => setEditingApp({ ...editingApp, gallery: e.target.value.split(',').map(s => s.trim()) })}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="URL видео (опционально)"
                  value={editingApp.video || ''}
                  onChange={(e) => setEditingApp({ ...editingApp, video: e.target.value })}
                  className="input"
                />
                <button className="button" onClick={handleEditApp}>Сохранить изменения</button>
                <button className="button" onClick={() => setEditingApp(null)}>Отмена</button>
              </div>
            </section>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div>
          <section className="section">
            <h2 className="section-title">Статистика</h2>
            {stats.map(stat => (
              <div key={stat.appId} className="card">
                <h3 className="card-title">{stat.name}</h3>
                <p className="card-text"><strong>Переходы:</strong> {stat.clicks}</p>
                <p className="card-text"><strong>Telegram Stars:</strong> {stat.telegramStars}</p>
                <p className="card-text"><strong>Жалобы:</strong> {stat.complaints}</p>
                <p className="card-text"><strong>Место в каталоге:</strong> #{stat.catalogRank}</p>
                <p className="card-text"><strong>Место в основной категории:</strong> #{stat.categoryRank}</p>
                {stat.additionalCategoryRanks.map(rank => (
                  <p key={rank.category} className="card-text"><strong>Место в {rank.category}:</strong> #{rank.rank}</p>
                ))}
                <p className="card-text"><strong>Платформы:</strong> {stat.platforms.join(', ')}</p>
              </div>
            ))}
          </section>
        </div>
      )}

      {activeTab === 'services' && (
        <div>
          <section className="section">
            <h2 className="section-title">Услуги</h2>
            {developer.apps.map(app => (
              <div key={app.id} className="card">
                <h3 className="card-title">{app.name}</h3>
                <div className="section">
                  <h4 className="section-title">Продвижение в каталоге</h4>
                  <button className="button" onClick={() => handlePromote(app.id, 'catalog', 3)}>3 дня (50 Stars)</button>
                  <button className="button" onClick={() => handlePromote(app.id, 'catalog', 14)}>14 дней (200 Stars)</button>
                  <button className="button" onClick={() => handlePromote(app.id, 'catalog', 30)}>30 дней (500 Stars)</button>
                </div>
                <div className="section">
                  <h4 className="section-title">Продвижение в категории</h4>
                  <button className="button" onClick={() => handlePromote(app.id, 'category', 3)}>3 дня (50 Stars)</button>
                  <button className="button" onClick={() => handlePromote(app.id, 'category', 14)}>14 дней (200 Stars)</button>
                  <button className="button" onClick={() => handlePromote(app.id, 'category', 30)}>30 дней (500 Stars)</button>
                </div>
              </div>
            ))}
          </section>
        </div>
      )}
    </div>
  );
};

export default DeveloperDashboard;