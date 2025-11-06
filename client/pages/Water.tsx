import { ArrowRight, Droplets, CheckCircle, Star, Plus, Minus, ShoppingCart, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../hooks/use-toast";
import { useWaterProducts, useWaterSettings } from "../hooks/use-supabase";

export default function Water() {
  const { t, language } = useLanguage();
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const { toast } = useToast();
  const { data: waterProducts = [], isLoading } = useWaterProducts();
  const { data: settings, isLoading: isSettingsLoading } = useWaterSettings();

  const benefits = settings ? [
    {
      icon: <Droplets className="w-8 h-8" />,
      title: (language === 'ua' ? settings.benefit_natural_title_ua : settings.benefit_natural_title_ru) || t('water.natural'),
      description: (language === 'ua' ? settings.benefit_natural_desc_ua : settings.benefit_natural_desc_ru) || t('water.naturalDesc')
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: (language === 'ua' ? settings.benefit_tested_title_ua : settings.benefit_tested_title_ru) || t('water.tested'),
      description: (language === 'ua' ? settings.benefit_tested_desc_ua : settings.benefit_tested_desc_ru) || t('water.testedDesc'),
      downloadLink: settings.test_pdf_url || '/water-tests-proof.pdf'
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: (language === 'ua' ? settings.benefit_quality_title_ua : settings.benefit_quality_title_ru) || t('water.highQuality'),
      description: (language === 'ua' ? settings.benefit_quality_desc_ua : settings.benefit_quality_desc_ru) || t('water.highQualityDesc')
    }
  ] : [
    {
      icon: <Droplets className="w-8 h-8" />,
      title: t('water.natural'),
      description: t('water.naturalDesc')
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: t('water.tested'),
      description: t('water.testedDesc'),
      downloadLink: '/water-tests-proof.pdf'
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: t('water.highQuality'),
      description: t('water.highQualityDesc')
    }
  ];

  return (
    <div className="min-h-screen bg-coffee-background">
      {/* Header */}
      <Header />

       {/* Hero Section */}
       <section className="pt-32 pb-20 relative overflow-hidden" style={{ backgroundColor: '#361c0c' }}>
         <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
           <div className="text-center">
             <h1 className="text-5xl lg:text-7xl font-black mb-8 leading-tight font-coolvetica tracking-wider">
               <span style={{ color: '#fcf4e4' }}>{t('water.title')}</span>
             </h1>
           </div>
         </div>
       </section>

       {/* Products Section */}
       <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#361c0c' }}>
         <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
           <div className="text-center mb-16">
             <h2 className="text-4xl font-black mb-6" style={{ color: '#fcf4e4' }}>
               {t('water.chooseSize')}
             </h2>
           </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-stretch">
           {isLoading ? (
             <div className="col-span-2 text-center py-12">
               <div className="text-lg">Завантаження...</div>
             </div>
           ) : waterProducts.length === 0 ? (
             <div className="col-span-2 text-center py-12">
               <div className="text-lg">Немає доступних продуктів</div>
             </div>
           ) : (
             waterProducts.filter(product => product.active).map((product) => (
             <Link 
               key={product.id}
               to={`/water/${product.id}`}
               className="group relative overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 flex flex-col"
               style={{ backgroundColor: '#fcf4e4' }}
             >
                {/* Popular Badge */}
                {product.popular && (
                  <div className="absolute top-6 right-6 z-10">
                    <span className="px-4 py-2 text-[#fcf4e4] font-black text-sm rounded-lg" style={{ backgroundColor: '#361c0c' }}>
                      {t('water.popular')}
                    </span>
                  </div>
                )}

                {/* Product Image */}
                <div className="relative h-80 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                 {/* Product Content */}
                 <div className="p-8 flex flex-col flex-grow">
                   <div className="flex items-center justify-between mb-4">
                     <h3 className="text-3xl font-black" style={{ color: '#361c0c' }}>
                       {product.name}
                     </h3>
                     <span className="text-2xl font-black" style={{ color: '#361c0c' }}>
                       ₴{product.price}
                     </span>
                   </div>

                   <p className="text-lg font-medium mb-6 leading-relaxed flex-grow" style={{ color: '#361c0c' }}>
                     {product.description}
                   </p>

                   {/* Features */}
                   <div className="mb-8">
                     <h4 className="text-xl font-black mb-4" style={{ color: '#361c0c' }}>
                       {t('water.features')}
                     </h4>
                     <ul className="space-y-2">
                       {product.features.map((feature, index) => (
                         <li key={index} className="flex items-center space-x-3">
                           <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#361c0c' }} />
                           <span className="font-medium" style={{ color: '#361c0c' }}>
                             {feature}
                           </span>
                         </li>
                       ))}
                     </ul>
                   </div>

                  {/* Inline Cart Controls */}
                  {(() => {
                    const productId = `water-${product.id}`;
                    const cartItem = items.find(it => it.productId === productId);
                    const isInCart = cartItem && cartItem.quantity > 0;

                    const handleCardQuantityChange = (e: React.MouseEvent, change: number) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!cartItem) return;
                      const newQuantity = cartItem.quantity + change;
                      if (newQuantity <= 0) {
                        removeItem(cartItem.id);
                      } else {
                        updateQuantity(cartItem.id, newQuantity);
                      }
                    };

                    const handleAddFromCard = (e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const numericPrice = product.price;
                      addItem({
                        productId,
                        name: product.name,
                        image: product.image,
                        price: isNaN(numericPrice) ? 0 : numericPrice,
                        quantity: 1,
                        type: 'water',
                      });
                      toast({
                        title: t('water.addedToCart'),
                        description: `${product.name} ${t('water.addedToCartDesc')}`,
                        duration: 2000,
                      });
                    };

                    if (isInCart) {
                      return (
                        <div className="mt-auto pt-4 flex items-center justify-center space-x-3">
                          <button
                            onClick={(e) => handleCardQuantityChange(e, -1)}
                            className="w-10 h-10 flex items-center justify-center border-2 border-[#361c0c] text-[#361c0c] hover:bg-[#361c0c] hover:text-white transition-all duration-300"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <div className="w-12 text-center font-black text-lg" style={{ color: '#361c0c' }}>
                            {cartItem!.quantity}
                          </div>
                          <button
                            onClick={(e) => handleCardQuantityChange(e, 1)}
                            className="w-10 h-10 flex items-center justify-center border-2 border-[#361c0c] text-[#361c0c] hover:bg-[#361c0c] hover:text-white transition-all duration-300"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    }

                    return (
                      <button 
                        onClick={handleAddFromCard}
                        className="mt-auto block w-full px-8 py-4 bg-transparent border-2 font-black text-lg hover:bg-[#361c0c] transition-all duration-300 group/btn text-center"
                        style={{ borderColor: '#361c0c', color: '#361c0c' }}
                      >
                        <span className="flex items-center justify-center space-x-3">
                          <ShoppingCart className="w-5 h-5" />
                          <span className="group-hover/btn:text-[#fcf4e4]">{t('water.addToBasket')}</span>
                          <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform group-hover/btn:text-[#fcf4e4]" />
                        </span>
                      </button>
                    );
                  })()}
                 </div>
             </Link>
             ))
           )}
          </div>
         </div>
       </section>

       {/* Benefits Section */}
       <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#fcf4e4' }}>
         <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-6" style={{ color: '#361c0c' }}>
              {settings ? (language === 'ua' ? settings.why_title_ua : settings.why_title_ru) || t('water.whyOurWater') : t('water.whyOurWater')}
            </h2>
            <p className="text-lg font-medium max-w-2xl mx-auto" style={{ color: '#361c0c' }}>
              {settings ? (language === 'ua' ? settings.why_desc_ua : settings.why_desc_ru) || t('water.whyOurWaterDesc') : t('water.whyOurWaterDesc')}
            </p>
          </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {benefits.map((benefit, index) => (
               <div key={index} className="text-center group">
                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: '#361c0c' }}>
                   <div style={{ color: '#fcf4e4' }}>
                     {benefit.icon}
                   </div>
                 </div>
                 <h3 className="text-2xl font-black mb-4" style={{ color: '#361c0c' }}>
                   {benefit.title}
                 </h3>
                <p className="text-lg font-medium leading-relaxed" style={{ color: '#361c0c' }}>
                  {benefit.description}
                </p>
                {benefit.downloadLink && (
                  <a 
                    href={benefit.downloadLink}
                    download
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm font-bold hover:bg-[#361c0c] transition-all duration-300 border-2 group/btn"
                    style={{ borderColor: '#361c0c', color: '#361c0c' }}
                  >
                    <FileText className="w-4 h-4 group-hover/btn:text-[#fcf4e4]" />
                    <span className="group-hover/btn:text-[#fcf4e4]">{t('water.downloadProof')}</span>
                  </a>
                )}
              </div>
            ))}
          </div>
         </div>
       </section>

       {/* CTA Section */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#fcf4e4' }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h2 className="text-4xl font-black mb-6" style={{ color: '#361c0c' }}>
              {settings ? (language === 'ua' ? settings.cta_title_ua : settings.cta_title_ru) || t('water.readyToOrder') : t('water.readyToOrder')}
            </h2>
            <p className="text-xl font-medium mb-8 max-w-2xl mx-auto" style={{ color: '#361c0c' }}>
              {settings ? (language === 'ua' ? settings.cta_desc_ua : settings.cta_desc_ru) || t('water.readyToOrderDesc') : t('water.readyToOrderDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/coffee" 
                className="px-8 py-4 bg-transparent border-2 font-black text-lg hover:bg-[#361c0c] transition-all duration-300 group"
                style={{ borderColor: '#361c0c' }}
              >
                <span className="text-[#361c0c] group-hover:text-white transition-colors duration-300">
                  {settings ? (language === 'ua' ? settings.cta_view_coffee_ua : settings.cta_view_coffee_ru) || t('water.viewCoffee') : t('water.viewCoffee')}
                </span>
              </Link>
              <Link 
                to="/contact" 
                className="px-8 py-4 bg-[#361c0c] text-[#fcf4e4] font-black text-lg hover:bg-[#fcf4e4] hover:text-[#361c0c] hover:border-[#361c0c] border-2 border-transparent transition-all duration-300"
              >
                {settings ? (language === 'ua' ? settings.cta_contact_ua : settings.cta_contact_ru) || t('water.contactUs') : t('water.contactUs')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
