import { ArrowRight, Calendar, User, Tag, Search, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BlogModal from "../components/BlogModal";
import { useLanguage } from "../contexts/LanguageContext";

export default function News() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const newsArticles = [
    {
      id: 1,
      title: t('news.article1.title'),
      excerpt: t('news.article1.excerpt'),
      content: `Кава також стала формою підтримки. Через щось настільки повсякденне, як чашка кави, кожен громадянин може відчути свій зв'язок з колективом. У часи випробувань кава об'єднує людей, дає відчуття звичайності та стабільності. Вона стає символом єдності та взаємної підтримки.`,
      image: "https://api.builder.io/api/v1/image/assets/TEMP/48fca8d935a28fbac0cc9a8942725c2a971d05a2?width=811",
      category: t('news.article1.category'),
      author: "THE COFFEE MANIFEST Team",
      date: "15 грудня 2024",
      readTime: "5 хв",
      trending: true
    },
    {
      id: 2,
      title: t('news.article2.title'),
      excerpt: t('news.article2.excerpt'),
      content: `У кавовій культурі йде постійна дискусія про найкращий спосіб розкрити аромат і смаковий профіль вашої улюбленої кави. Щоб допомогти вам вибрати, ми розглянемо обидва методи детально. Batch Brew пропонує консистентність та зручність, тоді як Pour Over дозволяє більше контролю над процесом заварювання.`,
      image: "https://api.builder.io/api/v1/image/assets/TEMP/8b7e355094a1a12ea7d37e5c5743479e75c0eaf5?width=811",
      category: t('news.article2.category'),
      author: "THE COFFEE MANIFEST Team",
      date: "12 грудня 2024",
      readTime: "7 хв",
      trending: false
    },
    {
      id: 3,
      title: t('news.article3.title'),
      excerpt: t('news.article3.excerpt'),
      content: `Секрет відмінної чашки кави полягає у високоякісних зернах та вмінні їх обсмажувати. Це етап, де народжується смак, розкриваються аромати та створюється унікальний профіль кожної кави. Наші майстри обсмажування використовують найсучасніше обладнання та багаторічний досвід для створення ідеального балансу смаку.`,
      image: "https://api.builder.io/api/v1/image/assets/TEMP/48fca8d935a28fbac0cc9a8942725c2a971d05a2?width=811",
      category: t('news.article3.category'),
      author: "THE COFFEE MANIFEST Team",
      date: "10 грудня 2024",
      readTime: "6 хв",
      trending: false
    }
  ];

  // Filter articles based on search and category
  const filteredArticles = newsArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const trendingArticle = newsArticles.find(article => article.trending);
  const regularArticles = filteredArticles.filter(article => !article.trending);

  const categories = ["all", ...Array.from(new Set(newsArticles.map(article => article.category)))];

  const openModal = (article: any) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  const getAllArticles = () => {
    return [trendingArticle, ...regularArticles].filter(Boolean);
  };

  const getCurrentArticleIndex = () => {
    if (!selectedArticle) return -1;
    return getAllArticles().findIndex(article => article.id === selectedArticle.id);
  };

  const goToPrevious = () => {
    const allArticles = getAllArticles();
    const currentIndex = getCurrentArticleIndex();
    if (currentIndex > 0) {
      setSelectedArticle(allArticles[currentIndex - 1]);
    }
  };

  const goToNext = () => {
    const allArticles = getAllArticles();
    const currentIndex = getCurrentArticleIndex();
    if (currentIndex < allArticles.length - 1) {
      setSelectedArticle(allArticles[currentIndex + 1]);
    }
  };

  const allArticles = getAllArticles();
  const currentIndex = getCurrentArticleIndex();

  return (
    <div className="min-h-screen bg-coffee-background">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden" style={{ backgroundColor: '#361c0c' }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl lg:text-7xl font-black mb-8 leading-tight font-coolvetica tracking-wider">
              <span style={{ color: '#fcf4e4' }}>{t('news.title1')}</span>
              <br />
              <span style={{ color: '#fcf4e4' }}>{t('news.title2')}</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-12 relative overflow-hidden" style={{ backgroundColor: '#fcf4e4' }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Пошук статей..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-lg focus:border-[#361c0c] focus:outline-none text-lg"
                style={{ backgroundColor: '#fcf4e4' }}
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                    selectedCategory === category
                      ? 'text-[#fcf4e4]'
                      : 'text-[#361c0c] hover:text-[#fcf4e4]'
                  }`}
                  style={{ 
                    backgroundColor: selectedCategory === category ? '#361c0c' : 'transparent',
                    border: '2px solid #361c0c'
                  }}
                >
                  {category === 'all' ? 'Всі' : category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trending Article */}
      {trendingArticle && (
        <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#fcf4e4' }}>
          <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-6 h-6" style={{ color: '#361c0c' }} />
              <h2 className="text-2xl font-black font-coolvetica tracking-wider" style={{ color: '#361c0c' }}>
                ТРЕНДОВА СТАТТЯ
              </h2>
            </div>
            
            <article className="group relative overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 flex flex-col lg:flex-row" style={{ backgroundColor: '#361c0c' }}>
              {/* Image */}
              <div className="relative overflow-hidden h-80 lg:h-96 lg:w-1/2">
                <img 
                  src={trendingArticle.image} 
                  alt={trendingArticle.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Category Badge */}
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-2 text-[#fcf4e4] font-black text-sm" style={{ backgroundColor: '#361c0c' }}>
                    {trendingArticle.category}
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-8 lg:p-12 flex flex-col justify-center lg:w-1/2">
                <h3 className="text-3xl lg:text-4xl font-black mb-6 leading-tight font-coolvetica tracking-wider" style={{ color: '#fcf4e4' }}>
                  {trendingArticle.title}
                </h3>
                <p className="text-lg font-medium leading-relaxed mb-8" style={{ color: '#fcf4e4' }}>
                  {trendingArticle.excerpt}
                </p>
                
                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm mb-8" style={{ color: '#fcf4e4' }}>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{trendingArticle.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{trendingArticle.readTime}</span>
                    </div>
                  </div>
                </div>
                
                {/* Read More Button */}
                <button 
                  onClick={() => openModal(trendingArticle)}
                  className="group/btn w-full lg:w-auto px-8 py-4 bg-transparent border-2 font-black text-lg hover:bg-[#fcf4e4] transition-all duration-300" 
                  style={{ borderColor: '#fcf4e4', color: '#fcf4e4' }}
                >
                  <span className="flex items-center justify-center space-x-3">
                    <span className="group-hover/btn:text-[#361c0c]">{t('news.learnMore')}</span>
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform group-hover/btn:text-[#361c0c]" />
                  </span>
                </button>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* Regular Articles */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#fcf4e4' }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl font-black mb-12 text-center" style={{ color: '#361c0c' }}>
            ВСІ СТАТТІ
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {regularArticles.map((article) => (
              <article 
                key={article.id} 
                className="group relative overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col" 
                style={{ backgroundColor: '#361c0c' }}
              >
                {/* Image */}
                <div className="relative overflow-hidden h-64">
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-2 text-white font-black text-sm" style={{ backgroundColor: '#361c0c' }}>
                      {article.category}
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-black mb-4 leading-tight font-coolvetica tracking-wider" style={{ color: '#fcf4e4' }}>
                    {article.title}
                  </h3>
                  <p className="font-medium leading-relaxed mb-6 flex-grow" style={{ color: '#fcf4e4' }}>
                    {article.excerpt}
                  </p>
                  
                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-white/60 mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{article.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Read More Button */}
                  <button 
                    onClick={() => openModal(article)}
                    className="group/btn w-full px-6 py-4 bg-transparent border-2 font-black text-lg hover:bg-[#fcf4e4] transition-all duration-300 mt-auto" 
                    style={{ borderColor: '#fcf4e4', color: '#fcf4e4' }}
                  >
                    <span className="flex items-center justify-center space-x-3">
                      <span className="group-hover/btn:text-[#361c0c]">{t('news.learnMore')}</span>
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform group-hover/btn:text-[#361c0c]" />
                    </span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Blog Modal */}
      <BlogModal
        isOpen={isModalOpen}
        onClose={closeModal}
        article={selectedArticle}
        onPrevious={goToPrevious}
        onNext={goToNext}
        hasPrevious={currentIndex > 0}
        hasNext={currentIndex < allArticles.length - 1}
      />
    </div>
  );
}
