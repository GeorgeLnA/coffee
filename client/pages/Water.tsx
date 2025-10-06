import { ArrowRight, Droplets, CheckCircle, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FloatingContact from "../components/FloatingContact";
import { useLanguage } from "../contexts/LanguageContext";

export default function Water() {
  const { t } = useLanguage();

  const waterProducts = [
    {
      id: 1,
      name: t('water.product1Name'),
      description: t('water.product1Desc'),
      price: "85₴",
      volume: "5L",
      features: [
        t('water.product1Feature1'),
        t('water.product1Feature2'),
        t('water.product1Feature3'),
        t('water.product1Feature4')
      ],
      image: "/dreamstime_xl_12522351.jpg",
      popular: true
    },
    {
      id: 2,
      name: t('water.product2Name'),
      description: t('water.product2Desc'),
      price: "250₴",
      volume: "20L",
      features: [
        t('water.product2Feature1'),
        t('water.product2Feature2'),
        t('water.product2Feature3'),
        t('water.product2Feature4')
      ],
      image: "/dreamstime_xl_12522351.jpg",
      popular: false
    }
  ];

  const benefits = [
    {
      icon: <Droplets className="w-8 h-8" />,
      title: t('water.natural'),
      description: t('water.naturalDesc')
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: t('water.tested'),
      description: t('water.testedDesc')
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
            {waterProducts.map((product) => (
              <div key={product.id} className="group relative overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 flex flex-col" style={{ backgroundColor: '#fcf4e4' }}>
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
                       {product.price}
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

                   {/* Order Button */}
                   <Link to={`/water/${product.id}`} className="block w-full px-8 py-4 bg-transparent border-2 font-black text-lg hover:bg-[#361c0c] transition-all duration-300 group/btn mt-auto text-center" style={{ borderColor: '#361c0c', color: '#361c0c' }}>
                     <span className="flex items-center justify-center space-x-3">
                       <span className="group-hover/btn:text-[#fcf4e4]">{t('water.addToBasket')}</span>
                       <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform group-hover/btn:text-[#fcf4e4]" />
                     </span>
                   </Link>
                 </div>
              </div>
            ))}
          </div>
         </div>
       </section>

       {/* Benefits Section */}
       <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#fcf4e4' }}>
         <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
           <div className="text-center mb-16">
             <h2 className="text-4xl font-black mb-6" style={{ color: '#361c0c' }}>
               {t('water.whyOurWater')}
             </h2>
             <p className="text-lg font-medium max-w-2xl mx-auto" style={{ color: '#361c0c' }}>
               {t('water.whyOurWaterDesc')}
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
              {t('water.readyToOrder')}
            </h2>
            <p className="text-xl font-medium mb-8 max-w-2xl mx-auto" style={{ color: '#361c0c' }}>
              {t('water.readyToOrderDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/coffee" 
                className="px-8 py-4 bg-transparent border-2 font-black text-lg hover:bg-[#361c0c] hover:text-white transition-all duration-300"
                style={{ borderColor: '#361c0c', color: '#361c0c' }}
              >
{t('water.viewCoffee')}
              </Link>
              <a 
                href="#contacts" 
                className="px-8 py-4 bg-[#361c0c] text-[#fcf4e4] font-black text-lg hover:bg-[#fcf4e4] hover:text-[#361c0c] hover:border-[#361c0c] border-2 border-transparent transition-all duration-300"
              >
{t('water.contactUs')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Floating Contact Widget */}
      <FloatingContact />
    </div>
  );
}
