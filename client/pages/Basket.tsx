import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../contexts/CartContext";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Basket() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();

  return (
    <div className="min-h-screen bg-coffee-background">
      <Header />

      <section className="pt-28 pb-16" style={{ backgroundColor: '#361c0c' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-black mb-8 leading-tight font-coolvetica tracking-wider" style={{ color: '#fcf4e4' }}>
            Кошик
          </h1>
          {items.length === 0 ? (
            <div className="bg-white/10 p-8 rounded-lg" style={{ color: '#fcf4e4' }}>
              <p className="text-lg font-medium mb-6">Ваш кошик порожній.</p>
              <div className="flex gap-4">
                <Link to="/coffee" className="px-6 py-3 border-2 font-black hover:bg-[#fcf4e4] hover:text-[#361c0c] transition-all duration-300 group" style={{ borderColor: '#fcf4e4', color: '#fcf4e4' }}>
                  <span className="group-hover:text-[#361c0c] transition-colors">
                    До кави
                  </span>
                </Link>
                <Link to="/water" className="px-6 py-3 border-2 font-black hover:bg-[#fcf4e4] hover:text-[#361c0c] transition-all duration-300 group" style={{ borderColor: '#fcf4e4', color: '#fcf4e4' }}>
                  <span className="group-hover:text-[#361c0c] transition-colors">
                    До води
                  </span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-lg mb-1" style={{ color: '#361c0c' }}>{item.name}</div>
                        {item.variant && (
                          <div className="text-sm text-gray-600 mb-1">{item.variant}</div>
                        )}
                        <div className="text-sm text-gray-600">₴{item.price.toFixed(2)} за одиницю</div>
                      </div>
                      <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition-all duration-200">
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>
                          <div className="w-10 text-center font-bold text-gray-800">{item.quantity}</div>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition-all duration-200">
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right font-bold" style={{ color: '#361c0c' }}>
                            ₴{(item.quantity * item.price).toFixed(2)}
                          </div>
                          <button onClick={() => removeItem(item.id)} className="text-red-600 hover:text-red-700 p-1">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="lg:sticky lg:top-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold" style={{ color: '#361c0c' }}>Підсумок</span>
                    <span className="font-black" style={{ color: '#361c0c' }}>₴{totalPrice.toFixed(2)}</span>
                  </div>
                  <button className="w-full py-3 font-black border-2 bg-transparent hover:bg-[#361c0c] hover:text-white transition-all duration-300 group" style={{ borderColor: '#361c0c', color: '#361c0c' }}>
                    <span className="group-hover:text-white transition-colors">
                      Оформити замовлення
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}


