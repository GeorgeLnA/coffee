import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'ua' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  ua: {
    // Header
    'nav.coffee': 'Кава',
    'nav.water': 'Вода',
    'nav.drinks': 'Напої',
    'nav.more': 'Більше',
    'nav.about': 'Про нас',
    'nav.contacts': 'Контакти',
    'nav.cooperation': 'Співпраця',
    'nav.coffee-machines': 'Кавомашини',
    'nav.privacy-policy': 'Політика конфіденційності',
    'nav.news': 'Новини',
    'auth.signin': 'Увійти',
    'cart.badge': '3',
    
    // Hero
    'hero.title': 'THE COFFEE MANIFEST',
    'hero.cta': 'ЗАМОВИТИ КАВУ',
    
    // Season Hits
    'season.title': 'ХІТИ ЦЬОГО СЕЗОНУ',
    'season.colombia.title': 'COLOMBIA SUPREMO',
    'season.colombia.desc': 'Преміум кавові зерна з нотами сливи та шоколаду',
    'season.ethiopia.title': 'ETHIOPIA GUJI',
    'season.ethiopia.desc': 'Органічна кава з нотами чорної смородини',
    'season.brazil.title': 'BRAZIL SANTOS',
    'season.brazil.desc': 'Класична бразильська кава з м\'яким смаком',
    'season.learnMore': 'ДІЗНАТИСЯ БІЛЬШЕ',
    
    // Video Section
    'video.title1': 'СТВОРЕНО',
    'video.title2': 'ДОСКОНАЛІСТЬ',
    'video.desc': 'Кожна чашка розповідає історію пристрасті, точності та досконалості. Від моменту вибору найкращих зерен до фінального наливання ми забезпечуємо, що кожна деталь створена з турботою.',
    'video.feature1': 'Преміум якість зерен',
    'video.feature2': 'Експертний процес обсмажування',
    'video.feature3': 'Досконалі техніки заварювання',
    'video.watch': 'ПОСПОСТЕРІГАЙТЕ НАШ ПРОЦЕС',
    
    // About Section
    'about.badge': 'Про нас',
    'about.title': 'THE COFFEE MANIFEST',
    'about.desc1': 'Ми не просто українська мережа кав\'ярень третьої хвилі. Ми повноцінна кавова компанія, яка швидко та пристрасно розвивається.',
    'about.desc2': 'Ми не просто продаємо каву — ми ретельно відбираємо зелені кавові зерна, обсмажуємо їх на високоякісному обладнанні та докладаємо всіх зусиль, щоб ви могли насолоджуватися розкошшю ароматного гарячого напою в чашці вдома, в офісі або в нашому закладі.',
    'about.learnMore': 'ДІЗНАТИСЯ БІЛЬШЕ',
    'about.caption.title': 'Наша історія',
    'about.caption.desc': 'Познайомтеся з пристрасною командою THE COFFEE MANIFEST',
    
    // Cafes Section
    'cafes.title1': 'НАШІ',
    'cafes.title2': 'КАВ\'ЯРНІ',
    'cafes.cafe1.name': 'Cafe (Golden Gate)',
    'cafes.cafe1.address': 'Yaroslaviv Val, 15, Kyiv',
    'cafes.cafe1.hours': '7:00 - 22:00',
    'cafes.cafe2.name': 'Cafe (CHICAGO Central House)',
    'cafes.cafe2.address': 'St. Antonovycha, 44, Kyiv',
    'cafes.cafe2.hours': '8:00 - 23:00',
    'cafes.cafe3.name': 'Cafe (BTC Maidan Plaza)',
    'cafes.cafe3.address': 'Maidan Nezalezhnosti, 2, Kyiv',
    'cafes.cafe3.hours': '7:30 - 21:30',
    'cafes.viewAll': 'ПЕРЕГЛЯНУТИ ВСІ КАВ\'ЯРНІ',
    
    // News Section
    'news.title1': 'НОВИНИ З',
    'news.title2': 'КАВОВОГО СВІТУ',
    'news.article1.title': 'Кава для військових: як простий напій…',
    'news.article1.excerpt': 'Кава також стала формою підтримки. Через щось настільки повсякденне, як чашка кави, кожен громадянин може відчути свій зв\'язок з колективом…',
    'news.article1.category': 'Спільнота',
    'news.article2.title': 'Batch Brew проти Pour Over: Порівняння методів…',
    'news.article2.excerpt': 'У кавовій культурі йде постійна дискусія про найкращий спосіб розкрити аромат і смаковий профіль вашої улюбленої кави. Щоб допомогти вам вибрати…',
    'news.article2.category': 'Заварювання',
    'news.article3.title': 'Як ми обсмажуємо нашу каву',
    'news.article3.excerpt': 'Секрет відмінної чашки кави полягає у високоякісних зернах та вмінні їх обсмажувати. Це етап, де народжується смак, розкриваються аромати…',
    'news.article3.category': 'Процес',
    'news.learnMore': 'ДІЗНАТИСЯ БІЛЬШЕ',
    'news.viewAll': 'ПЕРЕГЛЯНУТИ ВСІ НОВИНИ',
    
    // Mobile Menu
    'mobile.search': 'Пошук',
    'mobile.cart': 'Кошик',
    'mobile.more': 'Більше',
    'mobile.less': 'Менше',
    
    // Coffee Page
    'coffee.filters': 'ФІЛЬТРИ',
    'coffee.clearAll': 'Очистити все',
    'coffee.search': 'Пошук кави...',
    'coffee.priceRange': 'Діапазон цін',
    'coffee.origins': 'Походження',
    'coffee.roastLevel': 'Рівень обсмажування',
    'coffee.availability': 'Доступність',
    'coffee.inStockOnly': 'Тільки в наявності',
    'coffee.showFilters': 'Показати',
    'coffee.hideFilters': 'Приховати',
    'coffee.found': 'кави знайдено',
    'coffee.addToCart': 'Додати в кошик',
    'coffee.outOfStock': 'Немає в наявності',
    'coffee.noCoffeeFound': 'Каву не знайдено',
    'coffee.tryAdjustingFilters': 'Спробуйте налаштувати фільтри для отримання більшої кількості результатів',
    'coffee.strength': 'Міцність',
    'coffee.acidity': 'Кислотність',
    'coffee.roast': 'Обсмажування',
    'coffee.body': 'Насиченість',
    'coffee.sort.default': 'За замовчуванням',
    'coffee.sort.priceLow': 'Ціна: від низької',
    'coffee.sort.priceHigh': 'Ціна: від високої',
    'coffee.sort.nameAsc': 'Назва: А-Я',
    'coffee.sort.nameDesc': 'Назва: Я-А',
    'coffee.sort.originAsc': 'Походження: А-Я',
    'coffee.sort.originDesc': 'Походження: Я-А',
    
    // Product Page
    'product.process': 'Процес',
    'product.elevation': 'Висота',
    'product.acidity': 'Кислотність',
    'product.body': 'Насиченість',
    'product.description': 'Опис',
    'product.flavorNotes': 'Смакові ноти',
    'product.weight': 'Вага',
    'product.grindType': 'Тип помелу',
    'product.quantity': 'Кількість',
    'product.backToCoffee': 'Назад до кави',
    'product.weight250g': '250г',
    'product.weight500g': '500г',
    'product.grindBeans': 'Зерна',
    'product.grindGround': 'Мелена',
    'product.roastLight': 'Світла',
    'product.roastMedium': 'Середня',
    'product.roastDark': 'Темна',
    'product.acidityLow': 'Низька',
    'product.acidityMedium': 'Середня',
    'product.acidityHigh': 'Висока',
    'product.bodyLight': 'Легка',
    'product.bodyMedium': 'Середня',
    'product.bodyFull': 'Повна',
    'product.characteristics': 'Характеристики кави',
    
    // Origins
    'origin.colombia': 'Колумбія',
    'origin.ethiopia': 'Ефіопія',
    'origin.brazil': 'Бразилія',
    'origin.kenya': 'Кенія',
    'origin.guatemala': 'Гватемала',
    'origin.jamaica': 'Ямайка',
    'origin.peru': 'Перу',
    'origin.costa_rica': 'Коста-Рика',
    'origin.indonesia': 'Індонезія',
    'origin.hawaii': 'Гаваї',
    
    // Footer
    'footer.description': 'Де кожна чашка розповідає історію пристрасті, точності та досконалості.',
    'footer.quickLinks': 'ШВИДКІ ПОСИЛАННЯ',
    'footer.blog': 'Блог',
    'footer.contacts': 'Контакти',
    'footer.about': 'Про нас',
    'footer.delivery': 'Доставка',
    'footer.vacancies': 'Вакансії',
    'footer.faq': 'Часті питання',
    'footer.contactUs': 'ЗВ\'ЯЖІТЬСЯ З НАМИ',
    'footer.callAnytime': 'Дзвоніть будь-коли',
    'footer.writeUs': 'Напишіть нам',
    'footer.visitCafes': 'Відвідайте наші кафе',
    'footer.hoursUpdates': 'ГОДИНИ РОБОТИ ТА НОВИНИ',
    'footer.stayInformed': 'Залишайтесь в курсі',
    'footer.newsletterDesc': 'Отримуйте останні новини та спеціальні пропозиції',
    'footer.emailPlaceholder': 'Ваша електронна пошта',
    'footer.subscribe': 'Підписатися',
    'footer.rightsReserved': 'Всі права захищені',
  },
  ru: {
    // Header
    'nav.coffee': 'Кофе',
    'nav.water': 'Вода',
    'nav.drinks': 'Напитки',
    'nav.more': 'Больше',
    'nav.about': 'О нас',
    'nav.contacts': 'Контакты',
    'nav.cooperation': 'Сотрудничество',
    'nav.coffee-machines': 'Кофемашины',
    'nav.privacy-policy': 'Политика конфиденциальности',
    'nav.news': 'Новости',
    'auth.signin': 'Войти',
    'cart.badge': '3',
    
    // Hero
    'hero.title': 'THE COFFEE MANIFEST',
    'hero.cta': 'ЗАКАЗАТЬ КОФЕ',
    
    // Season Hits
    'season.title': 'ХИТЫ ЭТОГО СЕЗОНА',
    'season.colombia.title': 'COLOMBIA SUPREMO',
    'season.colombia.desc': 'Премиум кофейные зерна с нотами сливы и шоколада',
    'season.ethiopia.title': 'ETHIOPIA GUJI',
    'season.ethiopia.desc': 'Органический кофе с нотами черной смородины',
    'season.brazil.title': 'BRAZIL SANTOS',
    'season.brazil.desc': 'Классический бразильский кофе с мягким вкусом',
    'season.learnMore': 'УЗНАТЬ БОЛЬШЕ',
    
    // Video Section
    'video.title1': 'СОЗДАНО',
    'video.title2': 'СОВЕРШЕНСТВО',
    'video.desc': 'Каждая чашка рассказывает историю страсти, точности и совершенства. От момента выбора лучших зерен до финального наливания мы обеспечиваем, что каждая деталь создана с заботой.',
    'video.feature1': 'Премиум качество зерен',
    'video.feature2': 'Экспертный процесс обжарки',
    'video.feature3': 'Совершенные техники заваривания',
    'video.watch': 'ПОСМОТРЕТЬ НАШ ПРОЦЕСС',
    
    // About Section
    'about.badge': 'О нас',
    'about.title': 'THE COFFEE MANIFEST',
    'about.desc1': 'Мы не просто украинская сеть кофеен третьей волны. Мы полноценная кофейная компания, которая быстро и страстно развивается.',
    'about.desc2': 'Мы не просто продаем кофе — мы тщательно отбираем зеленые кофейные зерна, обжариваем их на высококачественном оборудовании и прилагаем все усилия, чтобы вы могли наслаждаться роскошью ароматного горячего напитка в чашке дома, в офисе или в нашем заведении.',
    'about.learnMore': 'УЗНАТЬ БОЛЬШЕ',
    'about.caption.title': 'Наша история',
    'about.caption.desc': 'Познакомьтесь со страстной командой THE COFFEE MANIFEST',
    
    // Cafes Section
    'cafes.title1': 'НАШИ',
    'cafes.title2': 'КОФЕЙНИ',
    'cafes.cafe1.name': 'Cafe (Golden Gate)',
    'cafes.cafe1.address': 'Yaroslaviv Val, 15, Kyiv',
    'cafes.cafe1.hours': '7:00 - 22:00',
    'cafes.cafe2.name': 'Cafe (CHICAGO Central House)',
    'cafes.cafe2.address': 'St. Antonovycha, 44, Kyiv',
    'cafes.cafe2.hours': '8:00 - 23:00',
    'cafes.cafe3.name': 'Cafe (BTC Maidan Plaza)',
    'cafes.cafe3.address': 'Maidan Nezalezhnosti, 2, Kyiv',
    'cafes.cafe3.hours': '7:30 - 21:30',
    'cafes.viewAll': 'ПОСМОТРЕТЬ ВСЕ КОФЕЙНИ',
    
    // News Section
    'news.title1': 'НОВОСТИ ИЗ',
    'news.title2': 'КОФЕЙНОГО МИРА',
    'news.article1.title': 'Кофе для военных: как простой напиток…',
    'news.article1.excerpt': 'Кофе также стал формой поддержки. Через что-то настолько повседневное, как чашка кофе, каждый гражданин может почувствовать свою связь с коллективом…',
    'news.article1.category': 'Сообщество',
    'news.article2.title': 'Batch Brew против Pour Over: Сравнение методов…',
    'news.article2.excerpt': 'В кофейной культуре идет постоянная дискуссия о лучшем способе раскрыть аромат и вкусовой профиль вашего любимого кофе. Чтобы помочь вам выбрать…',
    'news.article2.category': 'Заваривание',
    'news.article3.title': 'Как мы обжариваем наш кофе',
    'news.article3.excerpt': 'Секрет отличной чашки кофе заключается в высококачественных зернах и умении их обжаривать. Это этап, где рождается вкус, раскрываются ароматы…',
    'news.article3.category': 'Процесс',
    'news.learnMore': 'УЗНАТЬ БОЛЬШЕ',
    'news.viewAll': 'ПОСМОТРЕТЬ ВСЕ НОВОСТИ',
    
    // Mobile Menu
    'mobile.search': 'Поиск',
    'mobile.cart': 'Корзина',
    'mobile.more': 'Больше',
    'mobile.less': 'Меньше',
    
    // Coffee Page
    'coffee.filters': 'ФИЛЬТРЫ',
    'coffee.clearAll': 'Очистить все',
    'coffee.search': 'Поиск кофе...',
    'coffee.priceRange': 'Диапазон цен',
    'coffee.origins': 'Происхождение',
    'coffee.roastLevel': 'Уровень обжарки',
    'coffee.availability': 'Доступность',
    'coffee.inStockOnly': 'Только в наличии',
    'coffee.showFilters': 'Показать',
    'coffee.hideFilters': 'Скрыть',
    'coffee.found': 'кофе найдено',
    'coffee.addToCart': 'Добавить в корзину',
    'coffee.outOfStock': 'Нет в наличии',
    'coffee.noCoffeeFound': 'Кофе не найдено',
    'coffee.tryAdjustingFilters': 'Попробуйте настроить фильтры для получения большего количества результатов',
    'coffee.strength': 'Крепость',
    'coffee.acidity': 'Кислотность',
    'coffee.roast': 'Обжарка',
    'coffee.body': 'Насыщенность',
    'coffee.sort.default': 'По умолчанию',
    'coffee.sort.priceLow': 'Цена: от низкой',
    'coffee.sort.priceHigh': 'Цена: от высокой',
    'coffee.sort.nameAsc': 'Название: А-Я',
    'coffee.sort.nameDesc': 'Название: Я-А',
    'coffee.sort.originAsc': 'Происхождение: А-Я',
    'coffee.sort.originDesc': 'Происхождение: Я-А',
    
    // Product Page
    'product.process': 'Процесс',
    'product.elevation': 'Высота',
    'product.acidity': 'Кислотность',
    'product.body': 'Насыщенность',
    'product.description': 'Описание',
    'product.flavorNotes': 'Вкусовые ноты',
    'product.weight': 'Вес',
    'product.grindType': 'Тип помола',
    'product.quantity': 'Количество',
    'product.backToCoffee': 'Назад к кофе',
    'product.weight250g': '250г',
    'product.weight500g': '500г',
    'product.grindBeans': 'Зерна',
    'product.grindGround': 'Молотый',
    'product.roastLight': 'Светлая',
    'product.roastMedium': 'Средняя',
    'product.roastDark': 'Темная',
    'product.acidityLow': 'Низкая',
    'product.acidityMedium': 'Средняя',
    'product.acidityHigh': 'Высокая',
    'product.bodyLight': 'Легкая',
    'product.bodyMedium': 'Средняя',
    'product.bodyFull': 'Полная',
    'product.characteristics': 'Характеристики кофе',
    
    // Origins
    'origin.colombia': 'Колумбия',
    'origin.ethiopia': 'Эфиопия',
    'origin.brazil': 'Бразилия',
    'origin.kenya': 'Кения',
    'origin.guatemala': 'Гватемала',
    'origin.jamaica': 'Ямайка',
    'origin.peru': 'Перу',
    'origin.costa_rica': 'Коста-Рика',
    'origin.indonesia': 'Индонезия',
    'origin.hawaii': 'Гавайи',
    
    // Footer
    'footer.description': 'Где каждая чашка рассказывает историю страсти, точности и совершенства.',
    'footer.quickLinks': 'БЫСТРЫЕ ССЫЛКИ',
    'footer.blog': 'Блог',
    'footer.contacts': 'Контакты',
    'footer.about': 'О нас',
    'footer.delivery': 'Доставка',
    'footer.vacancies': 'Вакансии',
    'footer.faq': 'Частые вопросы',
    'footer.contactUs': 'СВЯЖИТЕСЬ С НАМИ',
    'footer.callAnytime': 'Звоните в любое время',
    'footer.writeUs': 'Напишите нам',
    'footer.visitCafes': 'Посетите наши кафе',
    'footer.hoursUpdates': 'ЧАСЫ РАБОТЫ И НОВОСТИ',
    'footer.stayInformed': 'Оставайтесь в курсе',
    'footer.newsletterDesc': 'Получайте последние новости и специальные предложения',
    'footer.emailPlaceholder': 'Ваш электронный адрес',
    'footer.subscribe': 'Подписаться',
    'footer.rightsReserved': 'Все права защищены',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ua');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.ua] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
