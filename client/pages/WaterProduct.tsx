import { ArrowRight, CheckCircle, Plus, Minus, Phone, Mail } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import AddToCartModal from "../components/AddToCartModal";
import { useToast } from "../hooks/use-toast";
import { useState } from "react";
import { useWaterProduct } from "../hooks/use-supabase";

export default function WaterProduct() {
  const { t } = useLanguage();
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const { toast } = useToast();
  const { id } = useParams();
  const { data: product, isLoading } = useWaterProduct(id || '');
  const [quantity, setQuantity] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [addedItem, setAddedItem] = useState<{name: string, image?: string, quantity: number} | null>(null);

  // Check if user has seen the modal before
  const hasSeenModal = () => {
    return localStorage.getItem('manifest_cart_modal_seen') === 'true';
  };

  const markModalAsSeen = () => {
    localStorage.setItem('manifest_cart_modal_seen', 'true');
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fcf4e4]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-lg">Завантаження...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#fcf4e4]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-lg">Продукт не знайдено</div>
        </div>
        <Footer />
      </div>
    );
  }


  const handleOrder = () => {
    const numericPrice = product.price;
    const itemName = product.name;
    
    addItem({
      productId: `water-${product.id}`,
      name: itemName,
      image: product.image,
      price: isNaN(numericPrice) ? 0 : numericPrice,
      quantity,
      type: 'water',
    });
    
    // Show toast notification
    toast({
      title: t('water.addedToCart'),
      description: `${itemName} ${t('water.addedToCartDesc')}`,
      duration: 3000,
    });
    
    // Only show modal if user hasn't seen it before
    if (!hasSeenModal()) {
      setAddedItem({
        name: itemName,
        image: product.image,
        quantity: quantity
      });
      setModalOpen(true);
      markModalAsSeen();
    }
  };

  return (
    <div className="min-h-screen bg-coffee-background">
      {/* Header */}
      <Header />

      {/* Breadcrumb */}
      <section className="pt-32 pb-8" style={{ backgroundColor: '#361c0c' }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-white/60">
            <Link to="/water" className="hover:text-white transition-colors">
              {t('nav.water')}
            </Link>
            <span>/</span>
            <span className="text-white">{product.name}</span>
          </nav>
        </div>
      </section>

      {/* Product Section */}
      <section className="py-16" style={{ backgroundColor: '#361c0c' }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Product Image */}
            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-lg">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl lg:text-5xl font-black mb-6 leading-tight font-coolvetica tracking-wider" style={{ color: '#fcf4e4' }}>
                  {product.name}
                </h1>
                <p className="text-xl font-medium leading-relaxed mb-8" style={{ color: '#fcf4e4' }}>
                  {product.description}
                </p>
              </div>

              {/* Price Display */}
              <div>
                <h3 className="text-2xl font-black mb-6" style={{ color: '#fcf4e4' }}>
                  Ціна
                </h3>
                <div className="text-4xl font-black mb-4" style={{ color: '#fcf4e4' }}>
                  ₴{product.price}
                </div>
                <div className="text-lg font-medium" style={{ color: '#fcf4e4' }}>
                  {product.volume}
                </div>
              </div>

               {/* Quantity */}
               <div>
                 <h3 className="text-2xl font-black mb-6" style={{ color: '#fcf4e4' }}>
                   {t('water.quantity')}
                 </h3>
                 <div className="flex items-center space-x-4">
                   <button 
                     onClick={() => setQuantity(Math.max(1, quantity - 1))}
                     className="w-10 h-10 rounded-full border-2 border-[#fcf4e4] flex items-center justify-center hover:bg-[#fcf4e4] hover:text-[#361c0c] transition-all duration-300 flex-shrink-0"
                     style={{ color: '#fcf4e4' }}
                   >
                     <Minus className="w-4 h-4" />
                   </button>
                   <span className="text-2xl font-black px-6" style={{ color: '#fcf4e4' }}>
                     {quantity}
                   </span>
                   <button 
                     onClick={() => setQuantity(quantity + 1)}
                     className="w-10 h-10 rounded-full border-2 border-[#fcf4e4] flex items-center justify-center hover:bg-[#fcf4e4] hover:text-[#361c0c] transition-all duration-300 flex-shrink-0"
                     style={{ color: '#fcf4e4' }}
                   >
                     <Plus className="w-4 h-4" />
                   </button>
                 </div>
               </div>

               {/* Order Button */}
               <div className="pt-8">
                 <button 
                   onClick={handleOrder}
                   className="w-full px-8 py-6 bg-transparent border-2 font-black text-xl hover:bg-[#fcf4e4] transition-all duration-300 group/btn"
                   style={{ borderColor: '#fcf4e4', color: '#fcf4e4' }}
                 >
                   <span className="flex items-center justify-center space-x-3 group-hover/btn:text-[#361c0c]">
                     <span>{t('water.addToBasket')}</span>
                     <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
                   </span>
                 </button>
               </div>

              {/* Contact Info */}
              <div className="pt-8 border-t border-white/20">
                <p className="text-lg font-medium mb-4" style={{ color: '#fcf4e4' }}>
                  {t('water.needHelp')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href="tel:+380501234567" 
                    className="flex items-center space-x-3 px-6 py-3 bg-transparent border border-[#fcf4e4] font-bold hover:bg-[#fcf4e4] hover:text-[#361c0c] transition-all duration-300"
                    style={{ color: '#fcf4e4' }}
                  >
                    <Phone className="w-5 h-5" />
                    <span>{t('water.callUs')}</span>
                  </a>
                  <a 
                    href="mailto:info@coffeemanifest.com" 
                    className="flex items-center space-x-3 px-6 py-3 bg-transparent border border-[#fcf4e4] font-bold hover:bg-[#fcf4e4] hover:text-[#361c0c] transition-all duration-300"
                    style={{ color: '#fcf4e4' }}
                  >
                    <Mail className="w-5 h-5" />
                    <span>{t('water.emailUs')}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Add to Cart Modal */}
      {addedItem && (
        <AddToCartModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onContinueShopping={() => setModalOpen(false)}
          itemName={addedItem.name}
          itemImage={addedItem.image}
          quantity={addedItem.quantity}
        />
      )}
    </div>
  );
}
