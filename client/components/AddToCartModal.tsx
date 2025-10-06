import { X, ShoppingCart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueShopping: () => void;
  itemName: string;
  itemImage?: string;
  quantity: number;
}

export default function AddToCartModal({
  isOpen,
  onClose,
  onContinueShopping,
  itemName,
  itemImage,
  quantity
}: AddToCartModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full" style={{ backgroundColor: '#fcf4e4' }}>
          <ShoppingCart className="w-8 h-8" style={{ color: '#361c0c' }} />
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-black mb-2" style={{ color: '#361c0c' }}>
            {t('cart.addedToBasket')}
          </h3>
          
          {itemImage && (
            <div className="w-20 h-20 mx-auto mb-4 rounded-lg overflow-hidden">
              <img src={itemImage} alt={itemName} className="w-full h-full object-cover" />
            </div>
          )}
          
          <p className="text-lg font-medium" style={{ color: '#361c0c' }}>
            {itemName}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {t('cart.quantity')}: {quantity}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            to="/basket"
            className="block w-full px-6 py-3 bg-[#361c0c] text-white font-black text-lg hover:bg-[#fcf4e4] hover:text-[#361c0c] border-2 border-[#361c0c] transition-all duration-300 group"
            onClick={onClose}
          >
            <span className="flex items-center justify-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-white group-hover:text-[#361c0c] transition-colors" />
              <span className="text-white group-hover:text-[#361c0c] transition-colors">{t('cart.goToBasket')}</span>
              <ArrowRight className="w-5 h-5 text-white group-hover:text-[#361c0c] group-hover:translate-x-1 transition-all duration-300" />
            </span>
          </Link>
          
          <button
            onClick={onContinueShopping}
            className="w-full px-6 py-3 bg-transparent border-2 font-black text-lg hover:bg-[#361c0c] hover:text-white transition-all duration-300 group"
            style={{ borderColor: '#361c0c', color: '#361c0c' }}
          >
            <span className="group-hover:text-white transition-colors">
              {t('cart.continueShopping')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
