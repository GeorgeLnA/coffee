import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLanguage } from "../contexts/LanguageContext";
import { useLegalPage } from "../hooks/use-supabase";

export default function Delivery() {
  const { language } = useLanguage();
  const { data: page } = useLegalPage('delivery');
  const pick = (ua?: string | null, ru?: string | null, fallback: string = "") => 
    (language === 'ru' ? (ru ?? ua ?? fallback) : (ua ?? ru ?? fallback));

  const title = pick(page?.title_ua, page?.title_ru, language === 'ru' ? 'Доставка и оплата' : 'Доставка та оплата');
  const content = pick(page?.content_ua, page?.content_ru, '');

  return (
    <div className="min-h-screen bg-coffee-background">
      <Header />
      <main className="pt-40 pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h1 className="text-4xl font-black mb-8" style={{ color: '#361c0c' }}>{title}</h1>
          {content && (
            <div 
              className="text-gray-800 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}
            />
          )}
          {!content && (
            <div className="text-gray-800 leading-relaxed">
              <p>{language === 'ru' ? 'Содержимое страницы будет добавлено в ближайшее время.' : 'Зміст сторінки буде додано найближчим часом.'}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}


