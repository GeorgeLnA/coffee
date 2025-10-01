import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Plus, Minus } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { CoffeeProduct } from "@shared/api";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { useLanguage } from "../contexts/LanguageContext";

// Helper function to get translated description
const getCoffeeDescription = (coffeeId: string, language: string) => {
  const descriptions = {
    ua: {
      "1": "Насичений та повнотілий з нотами шоколаду та карамелі",
      "2": "Яскравий та квітковий з нотами цитрусових та ягід", 
      "3": "М'який та горіховий з низькою кислотністю",
      "4": "Винна кислотність з нотами чорної смородини",
      "5": "Складний з пряними та димчастими відтінками",
      "6": "М'який та гладкий без гіркоти",
      "7": "Чистий та яскравий з трав'яними нотами",
      "8": "Яскрава кислотність з медовою солодкістю",
      "9": "Повнотілий з земними та трав'яними нотами",
      "10": "Гладкий та м'який з тонкою солодкістю"
    },
    ru: {
      "1": "Насыщенный и полнотелый с нотами шоколада и карамели",
      "2": "Яркий и цветочный с нотами цитрусовых и ягод",
      "3": "Мягкий и ореховый с низкой кислотностью", 
      "4": "Винная кислотность с нотами черной смородины",
      "5": "Сложный с пряными и дымчатыми оттенками",
      "6": "Мягкий и гладкий без горечи",
      "7": "Чистый и яркий с травяными нотами",
      "8": "Яркая кислотность с медовой сладостью",
      "9": "Полнотелый с земляными и травяными нотами",
      "10": "Гладкий и мягкий с тонкой сладостью"
    }
  };
  return descriptions[language as keyof typeof descriptions]?.[coffeeId as keyof typeof descriptions.ua] || descriptions.ua[coffeeId as keyof typeof descriptions.ua];
};

// Helper function to translate flavor notes
const translateFlavorNote = (note: string, language: string) => {
  const translations = {
    ua: {
      "chocolate": "шоколад",
      "caramel": "карамель", 
      "nuts": "горіхи",
      "citrus": "цитрусові",
      "berry": "ягоди",
      "floral": "квітковий",
      "black currant": "чорна смородина",
      "wine": "вино",
      "spicy": "пряний",
      "smoky": "димчастий",
      "mild": "м'який",
      "smooth": "гладкий",
      "balanced": "збалансований",
      "herbal": "трав'яний",
      "clean": "чистий",
      "honey": "мед",
      "bright": "яскравий",
      "earthy": "земний",
      "full-bodied": "повнотілий",
      "sweet": "солодкий",
      "vanilla": "ваніль"
    },
    ru: {
      "chocolate": "шоколад",
      "caramel": "карамель",
      "nuts": "орехи", 
      "citrus": "цитрусовые",
      "berry": "ягоды",
      "floral": "цветочный",
      "black currant": "черная смородина",
      "wine": "вино",
      "spicy": "пряный",
      "smoky": "дымчатый",
      "mild": "мягкий",
      "smooth": "гладкий",
      "balanced": "сбалансированный",
      "herbal": "травяной",
      "clean": "чистый",
      "honey": "мед",
      "bright": "яркий",
      "earthy": "земляной",
      "full-bodied": "полнотелый",
      "sweet": "сладкий",
      "vanilla": "ваниль"
    }
  };
  return translations[language as keyof typeof translations]?.[note as keyof typeof translations.ua] || note;
};

// Helper function to translate origins
const translateOrigin = (origin: string, language: string) => {
  const translations = {
    ua: {
      "Colombia": "Колумбія",
      "Ethiopia": "Ефіопія",
      "Brazil": "Бразилія",
      "Kenya": "Кенія",
      "Guatemala": "Гватемала",
      "Jamaica": "Ямайка",
      "Peru": "Перу",
      "Costa Rica": "Коста-Рика",
      "Indonesia": "Індонезія",
      "Hawaii": "Гаваї"
    },
    ru: {
      "Colombia": "Колумбия",
      "Ethiopia": "Эфиопия",
      "Brazil": "Бразилия",
      "Kenya": "Кения",
      "Guatemala": "Гватемала",
      "Jamaica": "Ямайка",
      "Peru": "Перу",
      "Costa Rica": "Коста-Рика",
      "Indonesia": "Индонезия",
      "Hawaii": "Гавайи"
    }
  };
  return translations[language as keyof typeof translations]?.[origin as keyof typeof translations.ua] || origin;
};

// Placeholder coffee data (same as in Coffee.tsx)
const placeholderCoffees: CoffeeProduct[] = [
  {
    id: "1",
    name: "Colombia Supremo",
    origin: "Colombia",
    roast: "medium",
    price: 249.90,
    image: "/250-g_Original.PNG",
    description: "",
    weight: 250,
    flavorNotes: ["chocolate", "caramel", "nuts"],
    acidity: "medium",
    body: "full",
    process: "washed",
    elevation: 1800,
    inStock: true,
  },
  {
    id: "2",
    name: "Ethiopia Guji Organic",
    origin: "Ethiopia",
    roast: "light",
    price: 149.90,
    image: "/500_Manifestcoffee_Original.PNG",
    description: "",
    weight: 250,
    flavorNotes: ["citrus", "berry", "floral"],
    acidity: "high",
    body: "light",
    process: "natural",
    elevation: 2200,
    inStock: true,
  },
  {
    id: "3",
    name: "Brazil Santos",
    origin: "Brazil",
    roast: "dark",
    price: 199.90,
    image: "/250-g_Original.PNG",
    description: "",
    weight: 250,
    flavorNotes: ["nuts", "chocolate", "vanilla"],
    acidity: "low",
    body: "medium",
    process: "semi-washed",
    elevation: 1200,
    inStock: true,
  },
  {
    id: "4",
    name: "Kenya AA",
    origin: "Kenya",
    roast: "medium",
    price: 279.90,
    image: "/500_Manifestcoffee_Original.PNG",
    description: "",
    weight: 250,
    flavorNotes: ["black currant", "wine", "citrus"],
    acidity: "high",
    body: "full",
    process: "washed",
    elevation: 1600,
    inStock: false,
  },
  {
    id: "5",
    name: "Guatemala Antigua",
    origin: "Guatemala",
    roast: "medium",
    price: 269.90,
    image: "/250-g_Original.PNG",
    description: "",
    weight: 250,
    flavorNotes: ["spicy", "smoky", "chocolate"],
    acidity: "medium",
    body: "full",
    process: "washed",
    elevation: 1500,
    inStock: true,
  },
  {
    id: "6",
    name: "Jamaica Blue Mountain",
    origin: "Jamaica",
    roast: "medium",
    price: 899.90,
    image: "/500_Manifestcoffee_Original.PNG",
    description: "",
    weight: 250,
    flavorNotes: ["mild", "smooth", "balanced"],
    acidity: "low",
    body: "medium",
    process: "washed",
    elevation: 1000,
    inStock: true,
  },
  {
    id: "7",
    name: "Peru Organic",
    origin: "Peru",
    roast: "light",
    price: 229.90,
    image: "/250-g_Original.PNG",
    description: "",
    weight: 250,
    flavorNotes: ["herbal", "citrus", "clean"],
    acidity: "medium",
    body: "light",
    process: "natural",
    elevation: 1800,
    inStock: true,
  },
  {
    id: "8",
    name: "Costa Rica Tarrazú",
    origin: "Costa Rica",
    roast: "medium",
    price: 259.90,
    image: "/500_Manifestcoffee_Original.PNG",
    description: "",
    weight: 250,
    flavorNotes: ["honey", "citrus", "bright"],
    acidity: "high",
    body: "medium",
    process: "honey",
    elevation: 1400,
    inStock: true,
  },
  {
    id: "9",
    name: "Sumatra Mandheling",
    origin: "Indonesia",
    roast: "dark",
    price: 239.90,
    image: "/250-g_Original.PNG",
    description: "",
    weight: 250,
    flavorNotes: ["earthy", "herbal", "full-bodied"],
    acidity: "low",
    body: "full",
    process: "semi-washed",
    elevation: 1000,
    inStock: false,
  },
  {
    id: "10",
    name: "Hawaii Kona",
    origin: "Hawaii",
    roast: "medium",
    price: 699.90,
    image: "/500_Manifestcoffee_Original.PNG",
    description: "",
    weight: 250,
    flavorNotes: ["smooth", "sweet", "mild"],
    acidity: "low",
    body: "medium",
    process: "washed",
    elevation: 800,
    inStock: true,
  },
];

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  const [selectedWeight, setSelectedWeight] = useState<'250g' | '500g'>('250g');
  const [selectedGrind, setSelectedGrind] = useState<'beans' | 'ground'>('beans');
  const [quantity, setQuantity] = useState(1);

  // Scroll to top when component mounts or product ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Find the product by ID
  const product = placeholderCoffees.find(coffee => coffee.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-coffee-background">
        <Header />
        <div className="pt-20 px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-black mb-8" style={{ color: '#3b0b0b' }}>
              Product not found
            </h1>
            <Link to="/coffee" className="inline-block px-8 py-4 bg-[#3b0b0b] text-white font-bold hover:bg-[#2a0808] transition-colors">
              Back to Coffee
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate price based on weight selection
  const basePrice = product.price;
  const finalPrice = useMemo(() => {
    const multiplier = selectedWeight === '500g' ? 1.8 : 1; // 500g costs 1.8x more than 250g
    return basePrice * multiplier * quantity;
  }, [basePrice, selectedWeight, quantity]);

  // Additional product images (placeholder - you can add real images)
  const additionalImages = [
    product.image,
    "/250-g_Original.PNG",
    "/500_Manifestcoffee_Original.PNG",
  ];

  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="min-h-screen bg-coffee-background">
      <Header />
      
      <div className="pt-20">
        <div className="max-w-8xl mx-auto px-6 py-16">
          {/* Back Button */}
          <div className="mb-8">
            <Button
              onClick={() => navigate('/coffee')}
              variant="ghost"
              className="flex items-center space-x-2 text-[#3b0b0b] hover:text-[#2a0808]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('product.backToCoffee')}</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-[4/5] overflow-hidden rounded-lg">
                <img
                  src={additionalImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-3 gap-4">
                {additionalImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "aspect-square overflow-hidden rounded-lg border-2 transition-colors",
                      selectedImage === index 
                        ? "border-[#3b0b0b]" 
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-8">
              {/* Stock Status */}
              {!product.inStock && (
                <div className="inline-block px-4 py-2 bg-red-500 text-white text-sm font-medium rounded">
                  {t('coffee.outOfStock')}
                </div>
              )}

              {/* Product Name */}
              <div>
                <h1 className="text-4xl font-black font-coolvetica tracking-wider mb-2" style={{ color: '#3b0b0b' }}>
                  {product.name}
                </h1>
                <p className="text-lg text-gray-600">
                  {translateOrigin(product.origin, language)} • {product.roast === 'light' ? t('product.roastLight') : product.roast === 'medium' ? t('product.roastMedium') : t('product.roastDark')} {t('coffee.roast')}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-black" style={{ color: '#3b0b0b' }}>
                  ₴{finalPrice.toFixed(2)}
                </span>
                {selectedWeight === '500g' && (
                  <span className="text-sm text-gray-500">
                    (₴{(finalPrice / quantity / 1.8).toFixed(2)} per 250g)
                  </span>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold mb-3" style={{ color: '#3b0b0b' }}>
                  {t('product.description')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {getCoffeeDescription(product.id, language)}
                </p>
              </div>

              {/* Flavor Notes */}
              <div>
                <h3 className="text-lg font-bold mb-3" style={{ color: '#3b0b0b' }}>
                  {t('product.flavorNotes')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.flavorNotes.map((note) => (
                    <span
                      key={note}
                      className="px-3 py-1 text-sm font-medium rounded-full"
                      style={{ backgroundColor: '#fcf4e4', color: '#3b0b0b' }}
                    >
                      {translateFlavorNote(note, language)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Coffee Characteristics */}
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#3b0b0b' }}>
                  {t('product.characteristics')}
                </h3>
                
                <div className="space-y-4">
                  {/* Strength */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700 font-medium">{t('coffee.strength')}:</span>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-3 h-3 rounded-full ${
                            level <= (product.body === 'full' ? 5 : product.body === 'medium' ? 3 : 2)
                              ? 'bg-orange-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Acidity */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700 font-medium">{t('coffee.acidity')}:</span>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-3 h-3 rounded-full ${
                            level <= (product.acidity === 'high' ? 5 : product.acidity === 'medium' ? 3 : 2)
                              ? 'bg-orange-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Roast Level */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700 font-medium">{t('coffee.roast')}:</span>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-3 h-3 rounded-full ${
                            level <= (product.roast === 'dark' ? 5 : product.roast === 'medium' ? 3 : 2)
                              ? 'bg-orange-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Body */}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-700 font-medium">{t('coffee.body')}:</span>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-3 h-3 rounded-full ${
                            level <= (product.body === 'full' ? 5 : product.body === 'medium' ? 3 : 2)
                              ? 'bg-orange-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Weight Selection */}
              <div>
                <h3 className="text-lg font-bold mb-3" style={{ color: '#3b0b0b' }}>
                  {t('product.weight')}
                </h3>
                <div className="flex space-x-4">
                  {(['250g', '500g'] as const).map((weight) => (
                    <button
                      key={weight}
                      onClick={() => setSelectedWeight(weight)}
                      className={cn(
                        "px-6 py-3 border-2 font-medium transition-colors",
                        selectedWeight === weight
                          ? "border-[#3b0b0b] text-[#3b0b0b]"
                          : "border-gray-300 text-gray-600 hover:border-gray-400"
                      )}
                    >
                      {weight === '250g' ? t('product.weight250g') : t('product.weight500g')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grind Selection */}
              <div>
                <h3 className="text-lg font-bold mb-3" style={{ color: '#3b0b0b' }}>
                  {t('product.grindType')}
                </h3>
                <div className="flex space-x-4">
                  {(['beans', 'ground'] as const).map((grind) => (
                    <button
                      key={grind}
                      onClick={() => setSelectedGrind(grind)}
                      className={cn(
                        "px-6 py-3 border-2 font-medium transition-colors",
                        selectedGrind === grind
                          ? "border-[#3b0b0b] text-[#3b0b0b]"
                          : "border-gray-300 text-gray-600 hover:border-gray-400"
                      )}
                    >
                      {grind === 'beans' ? t('product.grindBeans') : t('product.grindGround')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <h3 className="text-lg font-bold mb-3" style={{ color: '#3b0b0b' }}>
                  {t('product.quantity')}
                </h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-gray-400 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-medium w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-gray-400 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                disabled={!product.inStock}
                className="w-full px-8 py-4 bg-[#3b0b0b] text-white font-black text-lg hover:bg-[#2a0808] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.inStock ? t('coffee.addToCart') : t('coffee.outOfStock')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
