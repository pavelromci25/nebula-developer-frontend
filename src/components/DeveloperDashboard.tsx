import { useState, useEffect } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { FaUser, FaPlus, FaEdit, FaChartBar, FaShoppingCart } from 'react-icons/fa';

interface Developer {
  userId: string;
  registrationDate: string;
  starsBalance: number;
  referralCode: string;
  apps: App[];
}

interface App {
  id: string;
  type: 'game' | 'app';
  name: string;
  shortDescription: string;
  longDescription?: string;
  categoryGame?: string;
  categoryApps?: string;
  additionalCategoriesGame?: string[];
  additionalCategoriesApps?: string[];
  categories?: string[];
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
  linkApp?: string;
  startPromoCatalog?: string;
  finishPromoCatalog?: string;
  startPromoCategory?: string;
  finishPromoCategory?: string;
  editCount?: number;
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

const gameCategories = ['Arcade', 'Sport', 'Card', 'Race'];
const appCategories = ['Useful', 'Business', 'Personal', 'Simple'];

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
    categoryGame: '',
    categoryApps: '',
    additionalCategoriesGame: [] as string[],
    additionalCategoriesApps: [] as string[],
    icon: '',
    gallery: [] as string[],
    video: '',
    platforms: [] as string[],
    ageRating: '',
    inAppPurchases: false,
    supportsTON: false,
    supportsTelegramStars: false,
    contactInfo: '',
    linkApp: '',
  });
  const [editingApp, setEditingApp] = useState<App | null>(null);

  console.log('DeveloperDashboard: userId=', userId, 'isTelegram=', isTelegram);

  useEffect(() => {
    const fetchDeveloper = async () => {
      try {
        console.log('Fetching developer data for userId:', userId);
        const response = await fetch(`https://nebula-server-ypun.onrender.com/api/developer/${userId}`);
        if (!response.ok) {
          throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Developer data:', data);
        setDeveloper(data);
        setError(null);
      } catch (error) {
        console.error('Ошибка при загрузке данных разработчика:', error);
        const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
        setError('Не удалось загрузить данные. Проверьте ваш userId или попробуйте позже: ' + errorMessage);
      }
    };

    if (isTelegram && userId !== 'guest') {
      fetchDeveloper();
    } else {
      console.log('Not fetching developer data: isTelegram=', isTelegram, 'userId=', userId);
    }
  }, [userId, isTelegram]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('Fetching stats for userId:', userId);
        const response = await fetch(`https://nebula-server-ypun.onrender.com/api/developer/${userId}/stats`);
        if (!response.ok) {
          throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Stats data:', data);
        setStats(data);
      } catch (error) {
        console.error('Ошибка при загрузке статистики:', error);
      }
    };

    if (isTelegram && userId !== 'guest') {
      fetchStats();
    } else {
      console.log('Not fetching stats: isTelegram=', isTelegram, 'userId=', userId);
    }
  }, [userId, isTelegram]);

  const handleAddApp = async () => {
    try {
      console.log('Adding new app:', newApp);
      const response = await fetch(`https://nebula-server-ypun.onrender.com/api/developer/${userId}/apps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newApp,
          categoryGame: newApp.type === 'game' ? newApp.categoryGame : undefined,
          categoryApps: newApp.type === 'app' ? newApp.categoryApps : undefined,
          additionalCategoriesGame: newApp.type === 'game' ? newApp.additionalCategoriesGame : undefined,
          additionalCategoriesApps: newApp.type === 'app' ? newApp.additionalCategoriesApps : undefined,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Ошибка: ${response.status} ${response.statusText} - ${errorData.error}`);
      }
      const addedApp = await response.json();
      console.log('Added app:', addedApp);
      setDeveloper(prev => prev ? { ...prev, apps: [...prev.apps, addedApp] } : prev);
      setNewApp({
        type: 'game',
        name: '',
        shortDescription: '',
        longDescription: '',
        categoryGame: '',
        categoryApps: '',
        additionalCategoriesGame: [],
        additionalCategoriesApps: [],
        icon: '',
        gallery: [],
        video: '',
        platforms: [],
        ageRating: '',
        inAppPurchases: false,
        supportsTON: false,
        supportsTelegramStars: false,
        contactInfo: '',
        linkApp: '',
      });
      alert('Приложение успешно добавлено и отправлено на модерацию!');
    } catch (error) {
      console.error('Ошибка при добавлении приложения:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      alert('Ошибка при добавлении приложения: ' + errorMessage);
    }
  };

  const handleEditApp = async () => {
    if (!editingApp) return;
    try {
      console.log('Editing app:', editingApp);
      const response = await fetch(`https://nebula-server-ypun.onrender.com/api/developer/${userId}/apps/${editingApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingApp,
          categoryGame: editingApp.type === 'game' ? editingApp.categoryGame : undefined,
          categoryApps: editingApp.type === 'app' ? editingApp.categoryApps : undefined,
          additionalCategoriesGame: editingApp.type === 'game' ? editingApp.additionalCategoriesGame : undefined,
          additionalCategoriesApps: editingApp.type === 'app' ? editingApp.additionalCategoriesApps : undefined,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Ошибка: ${response.status} ${response.statusText} - ${errorData.error}`);
      }
      const updatedApp = await response.json();
      console.log('Updated app:', updatedApp);
      setDeveloper(prev => prev ? {
        ...prev,
        apps: prev.apps.map(app => app.id === updatedApp.id ? updatedApp : app),
      } : prev);
      setEditingApp(null);
      alert('Приложение успешно обновлено и отправлено на повторную модерацию!');
    } catch (error) {
      console.error('Ошибка при обновлении приложения:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      alert('Ошибка при обновлении приложения: ' + errorMessage);
    }
  };

  const handlePromote = async (appId: string, type: 'catalog' | 'category') => {
    try {
      console.log('Promoting app:', { appId, type });
      const response = await fetch(`https://nebula-server-ypun.onrender.com/api/developer/${userId}/promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, type }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Ошибка: ${response.status} ${response.statusText} - ${errorData.error}`);
      }
      const result = await response.json();
      console.log('Promotion result:', result);
      alert(result.message);
      const developerResponse = await fetch(`https://nebula-server-ypun.onrender.com/api/developer/${userId}`);
      const updatedDeveloper = await developerResponse.json();
      console.log('Updated developer:', updatedDeveloper);
      setDeveloper(updatedDeveloper);
    } catch (error) {
      console.error('Ошибка при активации продвижения:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      alert('Ошибка при активации продвижения: ' + errorMessage);
    }
  };

  console.log('Rendering DeveloperDashboard: developer=', developer, 'error=', error);

  if (!isTelegram) {
    console.log('Not in Telegram environment');
    return (
      <div className="content">
        <h2>Ошибка</h2>
        <p>Это приложение должно быть запущено через Telegram.</p>
      </div>
    );
  }

  if (error) {
    console.log('Error state:', error);
    return (
      <div className="content">
        <h2>Ошибка</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!developer) {
    console.log('Loading state');
    return <div className="content">Загрузка...</div>;
  }

  console.log('Rendering main content');
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
              <p className="card-text"><strong>Баланс Stars:</strong> {developer.starsBalance || 0}</p>
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
                onChange={(e) => setNewApp({ ...newApp, type: e.target.value as 'game' | 'app', categoryGame: '', categoryApps: '', additionalCategoriesGame: [], additionalCategoriesApps: [] })}
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
              {newApp.type === 'game' ? (
                <>
                  <select
                    value={newApp.categoryGame}
                    onChange={(e) => setNewApp({ ...newApp, categoryGame: e.target.value })}
                    className="input"
                  >
                    <option value="">Выберите основную категорию</option>
                    {gameCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <select
                    multiple
                    value={newApp.additionalCategoriesGame}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      if (selected.length <= 2) {
                        setNewApp({ ...newApp, additionalCategoriesGame: selected });
                      }
                    }}
                    className="input"
                  >
                    {gameCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  <select
                    value={newApp.categoryApps}
                    onChange={(e) => setNewApp({ ...newApp, categoryApps: e.target.value })}
                    className="input"
                  >
                    <option value="">Выберите основную категорию</option>
                    {appCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <select
                    multiple
                    value={newApp.additionalCategoriesApps}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      if (selected.length <= 2) {
                        setNewApp({ ...newApp, additionalCategoriesApps: selected });
                      }
                    }}
                    className="input"
                  >
                    {appCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </>
              )}
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
              <input
                type="text"
                placeholder="Ссылка на приложение (https://t.me/...)"
                value={newApp.linkApp}
                onChange={(e) => setNewApp({ ...newApp, linkApp: e.target.value })}
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
                <p className="card-text"><strong>Количество редакций:</strong> {app.editCount || 0}</p>
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
                  onChange={(e) => setEditingApp({ ...editingApp, type: e.target.value as 'game' | 'app', categoryGame: '', categoryApps: '', additionalCategoriesGame: [], additionalCategoriesApps: [] })}
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
                {editingApp.type === 'game' ? (
                  <>
                    <select
                      value={editingApp.categoryGame || ''}
                      onChange={(e) => setEditingApp({ ...editingApp, categoryGame: e.target.value })}
                      className="input"
                    >
                      <option value="">Выберите основную категорию</option>
                      {gameCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <select
                      multiple
                      value={editingApp.additionalCategoriesGame || []}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        if (selected.length <= 2) {
                          setEditingApp({ ...editingApp, additionalCategoriesGame: selected });
                        }
                      }}
                      className="input"
                    >
                      {gameCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </>
                ) : (
                  <>
                    <select
                      value={editingApp.categoryApps || ''}
                      onChange={(e) => setEditingApp({ ...editingApp, categoryApps: e.target.value })}
                      className="input"
                    >
                      <option value="">Выберите основную категорию</option>
                      {appCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <select
                      multiple
                      value={editingApp.additionalCategoriesApps || []}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        if (selected.length <= 2) {
                          setEditingApp({ ...editingApp, additionalCategoriesApps: selected });
                        }
                      }}
                      className="input"
                    >
                      {appCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </>
                )}
                <input
                  type="text"
                  placeholder="Ссылка на приложение (https://t.me/...)"
                  value={editingApp.linkApp || ''}
                  onChange={(e) => setEditingApp({ ...editingApp, linkApp: e.target.value })}
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
                <p className="card-text"><strong>Stars:</strong> {stat.telegramStars}</p>
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
                {app.startPromoCatalog && app.finishPromoCatalog && (
                  <p className="card-text">
                    <strong>Продвижение в каталоге:</strong> с {new Date(app.startPromoCatalog).toLocaleString()} до {new Date(app.finishPromoCatalog).toLocaleString()}
                  </p>
                )}
                {app.startPromoCategory && app.finishPromoCategory && (
                  <p className="card-text">
                    <strong>Продвижение в категории:</strong> с {new Date(app.startPromoCategory).toLocaleString()} до {new Date(app.finishPromoCategory).toLocaleString()}
                  </p>
                )}
                <div className="section">
                  <h4 className="section-title">Продвижение в каталоге</h4>
                  <button className="button" onClick={() => handlePromote(app.id, 'catalog')}>1 минута (1 Star)</button>
                </div>
                <div className="section">
                  <h4 className="section-title">Продвижение в категории</h4>
                  <button className="button" onClick={() => handlePromote(app.id, 'category')}>2 минуты (2 Stars)</button>
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