import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Plus, Minus } from "lucide-react";

// Coffee bean icon component - simplified single path
const CoffeeBeanIcon = ({ className = "" }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 64 64" className={className}>
    <g transform="matrix(1,0,0,1,-1152,-256)">
      <g transform="matrix(0.866025,0.5,-0.5,0.866025,717.879,-387.292)">
        <g transform="matrix(1,0,0,1,0,-0.699553)">
          <path fill="currentColor" d="M737.673,328.231C738.494,328.056 739.334,328.427 739.757,329.152C739.955,329.463 740.106,329.722 740.106,329.722C740.106,329.722 745.206,338.581 739.429,352.782C737.079,358.559 736.492,366.083 738.435,371.679C738.697,372.426 738.482,373.258 737.89,373.784C737.298,374.31 736.447,374.426 735.735,374.077C730.192,371.375 722.028,365.058 722.021,352C722.015,340.226 728.812,330.279 737.673,328.231Z"/>
        </g>
        <g transform="matrix(-1,0,0,-1,1483.03,703.293)">
          <path fill="currentColor" d="M737.609,328.246C738.465,328.06 739.344,328.446 739.785,329.203C739.97,329.49 740.106,329.722 740.106,329.722C740.106,329.722 745.206,338.581 739.429,352.782C737.1,358.507 736.503,365.948 738.383,371.527C738.646,372.304 738.415,373.164 737.796,373.703C737.177,374.243 736.294,374.356 735.56,373.989C730.02,371.241 722.028,364.92 722.021,352C722.016,340.255 728.779,330.328 737.609,328.246Z"/>
        </g>
      </g>
    </g>
  </svg>
);
import Header from "../components/Header";
import Footer from "../components/Footer";
import { CoffeeProduct } from "@shared/api";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../hooks/use-toast";
import { useCoffeeProduct, useFilterOptions, translateProcessValue } from "../hooks/use-supabase";
import { getWeightString } from "../lib/weight";

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

// Helper function to translate origins - now also handles reverse lookup (UA/RU -> EN)
const translateOrigin = (origin: string, language: string) => {
  const translations = {
    ua: {
      "Colombia": "Колумбія",
      "Колумбія": "Колумбія", // Handle reverse
      "Колумбия": "Колумбія", // Handle RU
      "Ethiopia": "Ефіопія",
      "Ефіопія": "Ефіопія",
      "Эфиопия": "Ефіопія",
      "Brazil": "Бразилія",
      "Бразилія": "Бразилія",
      "Бразилия": "Бразилія",
      "Kenya": "Кенія",
      "Кенія": "Кенія",
      "Кения": "Кенія",
      "Guatemala": "Гватемала",
      "Гватемала": "Гватемала",
      "Jamaica": "Ямайка",
      "Ямайка": "Ямайка",
      "Peru": "Перу",
      "Перу": "Перу",
      "Costa Rica": "Коста-Рика",
      "Коста-Рика": "Коста-Рика",
      "Indonesia": "Індонезія",
      "Індонезія": "Індонезія",
      "Индонезия": "Індонезія",
      "Hawaii": "Гаваї",
      "Гаваї": "Гаваї",
      "Гавайи": "Гаваї"
    },
    ru: {
      "Colombia": "Колумбия",
      "Колумбія": "Колумбия", // Handle UA
      "Колумбия": "Колумбия", // Handle reverse
      "Ethiopia": "Эфиопия",
      "Ефіопія": "Эфиопия",
      "Эфиопия": "Эфиопия",
      "Brazil": "Бразилия",
      "Бразилія": "Бразилия",
      "Бразилия": "Бразилия",
      "Kenya": "Кения",
      "Кенія": "Кения",
      "Кения": "Кения",
      "Guatemala": "Гватемала",
      "Гватемала": "Гватемала",
      "Jamaica": "Ямайка",
      "Ямайка": "Ямайка",
      "Peru": "Перу",
      "Перу": "Перу",
      "Costa Rica": "Коста-Рика",
      "Коста-Рика": "Коста-Рика",
      "Indonesia": "Индонезия",
      "Індонезія": "Индонезия",
      "Индонезия": "Индонезия",
      "Hawaii": "Гавайи",
      "Гаваї": "Гавайи",
      "Гавайи": "Гавайи"
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
  const { data: filterOptions } = useFilterOptions(language);
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const [selectedWeight, setSelectedWeight] = useState<'250g' | '500g' | '1kg'>('250g');
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [selectedGrind, setSelectedGrind] = useState<'beans' | 'ground'>('beans');
  const [quantity, setQuantity] = useState(1);

  // Always call hooks unconditionally to keep hooks order stable
  const { data: productData } = useCoffeeProduct(id || '0');
  const product = productData || null;

  // Scroll to top when component mounts or product ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Update SEO meta tags
  useEffect(() => {
    if (!product) return;

    // Keywords from product data
    const keywords = language === 'ru' 
      ? (product.seo_keywords_ru || []).join(', ')
      : (product.seo_keywords_ua || []).join(', ');

    // Update meta keywords tag
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords || `${product.name}, кава, ${product.origin}, ${product.roast}`);

    // Update page title
    document.title = `${product.name} - THE COFFEE MANIFEST`;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', product.description || `Premium ${product.name} coffee from ${product.origin}`);
  }, [product, language]);

  const notFound = !product;

  // Sizes from Supabase (if any)
  const sizesOptions = useMemo(() => {
    const sizes = (productData && (productData as any).sizes) ? (productData as any).sizes : [];
    const sorted = [...sizes].sort((a: any, b: any) => (a.sort ?? 0) - (b.sort ?? 0));
    return sorted.map((s: any) => ({
      label: s.label_ua || s.label_ru || (s.weight ? `${s.weight}g` : ''),
      weight: s.weight,
      price: s.price || 0,
      image: s.image_url || null,
      special: s.special || false,
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

  // Image to show: prefer selected size image, fall back to product image
  const currentImage = useMemo(() => {
    if (sizesOptions.length) {
      const current = sizesOptions[selectedSizeIdx] || sizesOptions[0];
      return current?.image || product?.image || "/250-g_Original.PNG";
    }
    return product?.image || "/250-g_Original.PNG";
  }, [sizesOptions, selectedSizeIdx, product]);

  const variantLabel = useMemo(() => {
    const grindText = (selectedGrind || 'beans') === 'beans' ? t('product.grindBeans') : t('product.grindGround');

    const fallbackWeight = getWeightString(selectedWeight, '') || selectedWeight || '250g';

    if (!sizesOptions.length) {
      return `${fallbackWeight} - ${grindText}`;
    }

    const current = sizesOptions[selectedSizeIdx] || sizesOptions[0];
    const weightFromSize = getWeightString(current?.weight, '');
    const weightFromLabel = getWeightString(current?.label, '');
    const baseWeight = weightFromSize || weightFromLabel || fallbackWeight;

    return `${baseWeight} - ${grindText}`;
  }, [selectedGrind, selectedSizeIdx, selectedWeight, sizesOptions, t]);

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
            <div>
              <div className="relative">
                {/* Main Image */}
                <div className="aspect-[4/5] overflow-hidden rounded-lg">
                  <img
                    src={currentImage}
                    alt={product?.name || ''}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Label image overlay - scales with image container */}
                {!notFound && (product as any)?.label_image_url && (
                  <div className="absolute top-2 right-2" style={{ width: 'clamp(120px, 30%, 250px)' }}>
                    <img src={(product as any).label_image_url} alt="label" className="w-full h-auto" />
                  </div>
                )}
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
                  <>
                    {(() => {
                      const { processPairs = [] } = filterOptions || {};
                      const rawProcess = (product!.processRaw || product!.process || '').trim();
                      const normalize = (s: string) => (s || '').trim().toLowerCase();
                      const pair = processPairs.find(
                        (p: { ua: string; ru: string }) =>
                          normalize(p.ua) === normalize(rawProcess) ||
                          normalize(p.ru) === normalize(rawProcess)
                      );
                      return (
                        <p className="text-lg text-gray-600">
                          {translateOrigin(product!.origin, language)}
                          {pair
                            ? ` ${language === 'ru' ? pair.ru : pair.ua}`
                            : ''}
                        </p>
                      );
                    })()}
                    {(() => {
                      const { processPairs = [] } = filterOptions || {};
                      const rawProcess = (product!.processRaw || product!.process || '').trim();
                      if (!rawProcess) return null;
                      const normalize = (s: string) => (s || '').trim().toLowerCase();
                      const pair = processPairs.find(
                        (p: { ua: string; ru: string }) =>
                          normalize(p.ua) === normalize(rawProcess) ||
                          normalize(p.ru) === normalize(rawProcess)
                      );
                      const resolved =
                        pair
                          ? language === 'ru'
                            ? pair.ru
                            : pair.ua
                          : translateProcessValue(rawProcess, language === 'ru' ? 'ru' : 'ua') || rawProcess;
                      return (
                        <p className="text-sm text-gray-500 mt-1">
                          <span className="font-medium">{t('product.process')}:</span>{" "}
                          {resolved}
                        </p>
                      );
                    })()}
                  </>
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
              
              <div>
                <h3 className="text-lg font-bold mb-3" style={{ color: '#361c0c' }}>
                  {t('product.description')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {!notFound ? product!.description : ''}
                </p>
              </div>

              {/* Aftertaste */}
              <div>
                <h3 className="text-lg font-bold mb-3" style={{ color: '#361c0c' }}>
                  {language === 'ru' ? 'Послевкусие' : 'Післясмак'}
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
              {!notFound && product && (
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#361c0c' }}>
                  {t('product.characteristics')}
                </h3>
                
                {/* metric rows */}
                <div className="space-y-4">
                  {[{label: t('coffee.strength'), value: product.strength_level ?? 3}, {label: t('coffee.acidity'), value: product.acidity_level ?? 3}, {label: t('product.roastLevel'), value: product.roast_level ?? 3}, {label: t('coffee.body'), value: product.body_level ?? 3}].map((metric, idx) => (
                    <div key={idx} className={`flex items-center justify-between py-2 ${idx < 3 ? 'border-b border-gray-100' : ''}`}>
                      <span className="text-gray-700 font-medium">{metric.label}:</span>
                      <div className="flex space-x-2">
                        {[1,2,3,4,5].map(level => (
                          <CoffeeBeanIcon
                            key={level}
                            className={level <= (typeof metric.value === 'number' ? metric.value : 0) 
                              ? "text-[#361c0c]" 
                              : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* Size Selection (from Supabase) or fallback weight selection */}
              <div>
                <h3 className="text-lg font-bold mb-3" style={{ color: '#361c0c' }}>
                  {t('product.weight')}
                </h3>
                {sizesOptions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sizesOptions.map((opt, idx) => (
                      <div key={idx} className="relative">
                        <button
                          onClick={() => setSelectedSizeIdx(idx)}
                          className={cn(
                            "w-full px-8 py-6 border-2 font-medium transition-all duration-300 relative group",
                            selectedSizeIdx === idx
                              ? "border-[#361c0c] text-[#361c0c] bg-[#361c0c]/5"
                              : "border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50",
                            opt.special && "border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-lg hover:shadow-xl"
                          )}
                        >
                          <div className="text-center">
                            <div className="text-lg font-bold mb-1">{opt.label}</div>
                            <div className="text-sm text-gray-500 mb-2">₴{(opt.price).toFixed(2)}</div>
                            {opt.special && (
                              <div className="inline-flex items-center space-x-1 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                                <span>🎁 {language === 'ru' ? 'Подарочная упаковка' : 'Подарункове пакування'}</span>
                              </div>
                            )}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(['250g', '500g', '1kg'] as const).map((weight) => (
                      <div key={weight} className="relative">
                        <button
                          onClick={() => setSelectedWeight(weight)}
                          className={cn(
                            "w-full px-8 py-6 border-2 font-medium transition-all duration-300 relative group",
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
                      variant: variantLabel,
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
