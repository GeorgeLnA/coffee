import { ArrowRight, CheckCircle, Plus, Minus, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FloatingContact from "../components/FloatingContact";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import AddToCartModal from "../components/AddToCartModal";
import { useState } from "react";

export default function WaterProduct() {
  const { t } = useLanguage();
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<'5L' | '20L'>('5L');
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

  const getCartItemForProduct = () => {
    return items.find(item => item.productId === `water-${selectedSize}`);
  };

  const handleQuantityChange = (change: number) => {
    const cartItem = getCartItemForProduct();
    if (cartItem) {
      const newQuantity = cartItem.quantity + change;
      if (newQuantity <= 0) {
        removeItem(cartItem.id);
      } else {
        updateQuantity(cartItem.id, newQuantity);
      }
    }
  };

  const waterProduct = {
    name: t('water.productName'),
    description: t('water.productDescription'),
    image: "/dreamstime_xl_12522351.jpg",
    features: [
      t('water.feature1'),
      t('water.feature2'),
      t('water.feature3'),
      t('water.feature4')
    ]
  };

  const sizes = [
    {
      size: '5L',
      price: '85₴',
      description: t('water.size5LDesc'),
      popular: true
    },
    {
      size: '20L',
      price: '250₴',
      description: t('water.size20LDesc'),
      popular: false
    }
  ];

  const selectedSizeData = sizes.find(s => s.size === selectedSize)!;

  const handleOrder = () => {
    const numericPrice = parseFloat(selectedSizeData.price.replace(/[^0-9.]/g, ''));
    const itemName = `${waterProduct.name} ${selectedSize}`;
    
    addItem({
      productId: `water-${selectedSize}`,
      name: itemName,
      image: waterProduct.image,
      price: isNaN(numericPrice) ? 0 : numericPrice,
      quantity,
      variant: selectedSize,
      type: 'water',
    });
    
    // Only show modal if user hasn't seen it before
    if (!hasSeenModal()) {
      setAddedItem({
        name: itemName,
        image: waterProduct.image,
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
            <span className="text-white">{waterProduct.name}</span>
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
                  src={waterProduct.image} 
                  alt={waterProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl lg:text-5xl font-black mb-6 leading-tight font-coolvetica tracking-wider" style={{ color: '#fcf4e4' }}>
                  {waterProduct.name}
                </h1>
                <p className="text-xl font-medium leading-relaxed mb-8" style={{ color: '#fcf4e4' }}>
                  {waterProduct.description}
                </p>
              </div>

              {/* Size Selection */}
              <div>
                <h3 className="text-2xl font-black mb-6" style={{ color: '#fcf4e4' }}>
                  {t('water.chooseSize')}
                </h3>
                <div className="space-y-4">
                  {sizes.map((size) => (
                    <div 
                      key={size.size}
                      className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                        selectedSize === size.size 
                          ? 'border-[#fcf4e4] bg-[#fcf4e4]/10' 
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      onClick={() => setSelectedSize(size.size as '5L' | '20L')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedSize === size.size 
                              ? 'border-[#fcf4e4] bg-[#fcf4e4]' 
                              : 'border-white/40'
                          }`}>
                            {selectedSize === size.size && (
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#361c0c' }}></div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-2xl font-black" style={{ color: '#fcf4e4' }}>
                              {size.size}
                            </h4>
                            <p className="text-lg font-medium" style={{ color: '#fcf4e4' }}>
                              {size.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-black mb-1" style={{ color: '#fcf4e4' }}>
                            {size.price}
                          </div>
                          {size.popular && (
                            <span className="px-3 py-1 text-sm font-bold rounded-full" style={{ backgroundColor: '#fcf4e4', color: '#361c0c' }}>
                              {t('water.popular')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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
                    className="w-12 h-12 rounded-full border-2 border-[#fcf4e4] flex items-center justify-center hover:bg-[#fcf4e4] hover:text-[#361c0c] transition-all duration-300"
                    style={{ color: '#fcf4e4' }}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-2xl font-black px-6" style={{ color: '#fcf4e4' }}>
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 rounded-full border-2 border-[#fcf4e4] flex items-center justify-center hover:bg-[#fcf4e4] hover:text-[#361c0c] transition-all duration-300"
                    style={{ color: '#fcf4e4' }}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>


              {/* Order Button */}
              <div className="pt-8">
                {(() => {
                  const cartItem = getCartItemForProduct();
                  const isInCart = cartItem && cartItem.quantity > 0;
                  
                  if (isInCart) {
                    return (
                      <div className="flex items-center justify-center space-x-4">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          className="w-12 h-12 flex items-center justify-center border-2 border-[#fcf4e4] text-[#fcf4e4] hover:bg-[#fcf4e4] hover:text-[#361c0c] transition-all duration-300"
                        >
                          <Minus className="w-6 h-6" />
                        </button>
                        <div className="w-16 text-center font-black text-2xl" style={{ color: '#fcf4e4' }}>
                          {cartItem!.quantity}
                        </div>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          className="w-12 h-12 flex items-center justify-center border-2 border-[#fcf4e4] text-[#fcf4e4] hover:bg-[#fcf4e4] hover:text-[#361c0c] transition-all duration-300"
                        >
                          <Plus className="w-6 h-6" />
                        </button>
                      </div>
                    );
                  } else {
                    return (
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
                    );
                  }
                })()}
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

      {/* Floating Contact Widget */}
      <FloatingContact />
      
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
