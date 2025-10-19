import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Plus, Minus } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { CoffeeProduct } from "@shared/api";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../hooks/use-toast";
import { useCoffeeProduct } from "../hooks/use-supabase";

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
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const [selectedWeight, setSelectedWeight] = useState<'250g' | '500g' | '1kg'>('250g');
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [selectedGrind, setSelectedGrind] = useState<'beans' | 'ground'>('beans');
  const [quantity, setQuantity] = useState(1);

  // Scroll to top when component mounts or product ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Always call hooks unconditionally to keep hooks order stable
  const { data: productData } = useCoffeeProduct(id || '0');
  const product = productData || null;

  const notFound = !product;

  // Sizes from Supabase (if any)
  const sizesOptions = useMemo(() => {
    const sizes = (productData && (productData as any).sizes) ? (productData as any).sizes : [];
    const sorted = [...sizes].sort((a: any, b: any) => (a.sort ?? 0) - (b.sort ?? 0));
    return sorted.map((s: any) => ({
      label: s.label_ua || s.label_ru || (s.weight ? `${s.weight}g` : ''),
      weight: s.weight,
      price: s.price || 0,
    }));
  }, [productData]);

  // Calculate price based on selected size (Supabase) or fallback static weights
  const basePrice = useMemo(() => {
    if (sizesOptions.length) {
      const current = sizesOptions[selectedSizeIdx] || sizesOptions[0];
      return current?.price || 0;
    }
    return product?.price || 0;
  }, [sizesOptions, selectedSizeIdx, product]);

  const finalPrice = useMemo(() => {
    if (sizesOptions.length) {
      return (basePrice || 0) * quantity;
    }
    let multiplier = 1;
    if (selectedWeight === '500g') multiplier = 2.2;
    if (selectedWeight === '1kg') multiplier = 3.2;
    return (basePrice || 0) * multiplier * quantity;
  }, [basePrice, selectedWeight, quantity, sizesOptions.length]);

  // Additional product images (placeholder - you can add real images)
  const additionalImages = [
    product?.image || "/250-g_Original.PNG",
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
              className="flex items-center space-x-2 text-[#361c0c] hover:text-[#2a0808]"
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
                  alt={product?.name || ''}
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
                        ? "border-[#361c0c]" 
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <img
                      src={image}
                      alt={`${product?.name || ''} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-8">
              {/* Stock Status */}
              {!notFound && !product!.inStock && (
                <div className="inline-block px-4 py-2 bg-red-500 text-white text-sm font-medium rounded">
                  {t('coffee.outOfStock')}
                </div>
              )}

              {/* Product Name */}
              <div>
                <h1 className="text-4xl font-black font-coolvetica tracking-wider mb-2" style={{ color: '#361c0c' }}>
                  {product?.name || 'Product not found'}
                </h1>
                {!notFound && (
                  <p className="text-lg text-gray-600">
                    {translateOrigin(product!.origin, language)} • {product!.roast === 'light' ? t('product.roastLight') : product!.roast === 'medium' ? t('product.roastMedium') : t('product.roastDark')} {t('coffee.roast')}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-black" style={{ color: '#361c0c' }}>
                  ₴{finalPrice.toFixed(2)}
                </span>
                {selectedWeight === '500g' && (
                  <span className="text-sm text-gray-500">
                    (₴{(finalPrice / quantity / 2.2).toFixed(2)} per 250g)
                  </span>
                )}
                {selectedWeight === '1kg' && (
                  <span className="text-sm text-gray-500">
                    (₴{(finalPrice / quantity / 3.2).toFixed(2)} per 250g)
                  </span>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold mb-3" style={{ color: '#361c0c' }}>
                  {t('product.description')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {!notFound ? getCoffeeDescription(product!.id, language) : ''}
                </p>
              </div>

              {/* Flavor Notes */}
              <div>
                <h3 className="text-lg font-bold mb-3" style={{ color: '#361c0c' }}>
                  {t('product.flavorNotes')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {!notFound && product!.flavorNotes.map((note) => (
                    <span
                      key={note}
                      className="px-3 py-1 text-sm font-medium rounded-full"
                      style={{ backgroundColor: '#fcf4e4', color: '#361c0c' }}
                    >
                      {translateFlavorNote(note, language)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Coffee Characteristics */}
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#361c0c' }}>
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
                            level <= (product && (product.body === 'full' ? 5 : product.body === 'medium' ? 3 : 2))
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
                            level <= (product && (product.acidity === 'high' ? 5 : product.acidity === 'medium' ? 3 : 2))
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
                            level <= (product && (product.roast === 'dark' ? 5 : product.roast === 'medium' ? 3 : 2))
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
                            level <= (product && (product.body === 'full' ? 5 : product.body === 'medium' ? 3 : 2))
                              ? 'bg-orange-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Size Selection (from Supabase) or fallback weight selection */}
              <div>
                <h3 className="text-lg font-bold mb-3" style={{ color: '#361c0c' }}>
                  {t('product.weight')}
                </h3>
                {sizesOptions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {sizesOptions.map((opt, idx) => (
                      <div key={idx} className="relative">
                        <button
                          onClick={() => setSelectedSizeIdx(idx)}
                          className={cn(
                            "w-full px-6 py-4 border-2 font-medium transition-all duration-300 relative group",
                            selectedSizeIdx === idx
                              ? "border-[#361c0c] text-[#361c0c] bg-[#361c0c]/5"
                              : "border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                          )}
                        >
                          <div className="text-center">
                            <div className="text-lg font-bold mb-1">{opt.label}</div>
                            <div className="text-sm text-gray-500 mb-2">₴{(opt.price).toFixed(2)}</div>
                          </div>
                          {selectedSizeIdx === idx && (
                            <div className="absolute top-2 right-2">
                              <div className="w-6 h-6 bg-[#361c0c] rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            </div>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {(['250g', '500g', '1kg'] as const).map((weight) => (
                      <div key={weight} className="relative">
                        <button
                          onClick={() => setSelectedWeight(weight)}
                          className={cn(
                            "w-full px-6 py-4 border-2 font-medium transition-all duration-300 relative group",
                            selectedWeight === weight
                              ? "border-[#361c0c] text-[#361c0c] bg-[#361c0c]/5"
                              : "border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50",
                            weight === '500g' && "border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-lg hover:shadow-xl"
                          )}
                        >
                          <div className="text-center">
                            <div className="text-lg font-bold mb-1">
                              {weight === '250g' ? t('product.weight250g') : 
                               weight === '500g' ? t('product.weight500g') : 
                               t('product.weight1kg')}
                            </div>
                            <div className="text-sm text-gray-500 mb-2">
                              ₴{(basePrice * (weight === '500g' ? 2.2 : weight === '1kg' ? 3.2 : 1)).toFixed(2)}
                            </div>
                            {weight === '500g' && (
                              <div className="inline-flex items-center space-x-1 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                                <span>{t('product.giftPackaging')}</span>
                              </div>
                            )}
                          </div>
                          {selectedWeight === weight && (
                            <div className="absolute top-2 right-2">
                              <div className="w-6 h-6 bg-[#361c0c] rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            </div>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Elegant gift packaging description for 500g */}
                {sizesOptions.length === 0 && selectedWeight === '500g' && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl shadow-sm">
                    <h4 className="text-lg font-bold text-amber-800 mb-2">{t('product.giftPackagingTitle')}</h4>
                    <p className="text-amber-700 leading-relaxed">{t('product.giftPackagingDesc')}</p>
                  </div>
                )}
              </div>

              {/* Grind Selection */}
              <div>
                <h3 className="text-lg font-bold mb-3" style={{ color: '#361c0c' }}>
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
                          ? "border-[#361c0c] text-[#361c0c]"
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
                <h3 className="text-lg font-bold mb-3" style={{ color: '#361c0c' }}>
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
                disabled={notFound || !product!.inStock}
                onClick={() => {
                  if (!notFound && product!.inStock) {
                    addItem({
                      productId: product!.id,
                      name: product!.name,
                      image: product!.image,
                      price: finalPrice / quantity, // unit price
                      quantity: quantity,
                      variant: `${sizesOptions.length ? (sizesOptions[selectedSizeIdx]?.label || '') : selectedWeight} ${selectedGrind === 'beans' ? t('product.grindBeans') : t('product.grindGround')}`,
                      type: 'coffee'
                    });
                    
                    // Show toast notification
                    toast({
                      title: t('coffee.addedToCart'),
                      description: `${product.name} ${t('coffee.addedToCartDesc')}`,
                      duration: 3000,
                    });
                  }
                }}
                className="w-full px-8 py-4 bg-[#361c0c] text-white font-black text-lg hover:bg-[#2a0808] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {!notFound && product!.inStock ? t('coffee.addToCart') : t('coffee.outOfStock')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
