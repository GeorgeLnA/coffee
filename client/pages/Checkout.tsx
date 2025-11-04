import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../contexts/CartContext";
import { useState, useMemo, useEffect } from "react";
import { useDeliverySettings } from "../hooks/use-supabase";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";

type ShippingMethod = "nova_department" | "nova_courier" | "own_courier" | "nova_postomat";
type PaymentMethod = "liqpay" | "apple_pay" | "google_pay" | "cash";

export default function Checkout() {
  const { items, totalPrice } = useCart();
  const navigate = useNavigate();
  const { data: deliverySettings } = useDeliverySettings();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [cityRef, setCityRef] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("nova_department");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("liqpay");
  const [department, setDepartment] = useState("");
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if cart contains water items
  const hasWaterItems = useMemo(() => {
    return items.some(item => item.type === 'water');
  }, [items]);

  // Auto-set shipping method to own_courier if water is in cart
  useEffect(() => {
    if (hasWaterItems && shippingMethod !== 'own_courier') {
      setShippingMethod('own_courier');
      setCityRef('');
      setCity('');
      setCityQuery('');
      setSelectedWarehouse('');
      setWarehouses([]);
    }
  }, [hasWaterItems, shippingMethod]);

  const courierPrice = deliverySettings?.courier_price || 200;
  const freeDeliveryThreshold = deliverySettings?.free_delivery_threshold || 1500;

  const shippingPrice = useMemo(() => {
    if (totalPrice >= freeDeliveryThreshold) return 0;
    if (shippingMethod === "own_courier") return courierPrice;
    // Nova Poshta pricing handled on delivery, but show 0 here; final sum may vary
    return 0;
  }, [shippingMethod, totalPrice, freeDeliveryThreshold, courierPrice]);

  // Calculate price specifically for own_courier button display
  const ownCourierPrice = useMemo(() => {
    if (totalPrice >= freeDeliveryThreshold) return 0;
    return courierPrice;
  }, [totalPrice, freeDeliveryThreshold, courierPrice]);

  // Load warehouses when city is selected
  const loadWarehouses = async () => {
    if (!cityRef || (shippingMethod !== 'nova_department' && shippingMethod !== 'nova_postomat')) return;
    setLoadingWarehouses(true);
    try {
      console.log('Loading warehouses for cityRef:', cityRef);
      const typeParam = shippingMethod === 'nova_postomat' ? 'postomat' : 'department';
      const res = await fetch(`/api/warehouses?cityRef=${cityRef}&type=${typeParam}`);
      const data = await res.json();
      console.log('Warehouses API response:', data);
      
      if (data?.success && Array.isArray(data.data)) {
        setWarehouses(data.data);
      } else if (data.status === '200' && Array.isArray(data.data)) {
        setWarehouses(data.data);
      }
    } catch (err) {
      console.error('Failed to load warehouses:', err);
    } finally {
      setLoadingWarehouses(false);
    }
  };

  // Load warehouses when cityRef changes
  useEffect(() => {
    if (cityRef && (shippingMethod === 'nova_department' || shippingMethod === 'nova_postomat')) {
      setSelectedWarehouse(""); // Clear selection when switching between postomat/department
      loadWarehouses();
    }
  }, [cityRef, shippingMethod]);

  // Clear warehouse selection when switching shipping methods
  useEffect(() => {
    if (shippingMethod !== 'nova_department' && shippingMethod !== 'nova_postomat') {
      setSelectedWarehouse("");
      setWarehouses([]);
    }
  }, [shippingMethod]);

  // Debounced city search suggestions
  useEffect(() => {
    const q = cityQuery.trim();
    if (hasWaterItems || (shippingMethod !== 'nova_department' && shippingMethod !== 'nova_postomat')) {
      setSettlements([]);
      setShowCityDropdown(false);
      return;
    }
    // Don't show dropdown if city is already selected (we have cityRef)
    if (cityRef) {
      setShowCityDropdown(false);
      return;
    }
    if (q.length < 2) {
      setSettlements([]);
      setShowCityDropdown(false);
      return;
    }
    const t = setTimeout(async () => {
      try {
        console.log('Searching for city:', q);
        const res = await fetch(`/api/settlements?cityName=${encodeURIComponent(q)}`);
        const json = await res.json();
        console.log('Settlements response:', json);

        let results: any[] = [];
        const ok = (json?.success === true) || (json?.status === '200');
        if (ok && Array.isArray(json.data) && json.data.length > 0) {
          // Nova Poshta response may nest addresses under data[0].Addresses
          const firstEntry = json.data[0];
          if (Array.isArray(firstEntry?.Addresses)) {
            results = firstEntry.Addresses;
          } else {
            results = json.data;
          }
        }
        console.log('Parsed settlements:', results);
        setSettlements(results);
        // Only show dropdown if we don't have a cityRef selected
        setShowCityDropdown(results.length > 0 && !cityRef);
      } catch (err) {
        console.error('Error fetching settlements:', err);
        setSettlements([]);
        setShowCityDropdown(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [cityQuery, shippingMethod, cityRef, hasWaterItems]);

  function handleSelectSettlement(s: any) {
    const name = s?.Present || s?.Description || s?.MainDescription || s?.City || "";
    const ref = s?.Ref || s?.DeliveryCity || s?.SettlementRef || s?.RefAddress || "";
    setCity(name);
    setCityQuery(name);
    setCityRef(ref);
    setShowCityDropdown(false);
    setSettlements([]); // Clear settlements to prevent dropdown from showing again
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emailValid = /\S+@\S+\.\S+/.test(email);
    const phoneValid = phone.trim().length >= 7;
    let valid = !!fullName && phoneValid && emailValid;
    
    if (hasWaterItems) {
      // For water orders, only own_courier is allowed, need address
      valid = valid && !!address;
    } else {
      // For non-water orders, check based on shipping method
      if (shippingMethod === 'nova_department' || shippingMethod === 'nova_postomat') {
        valid = valid && !!cityRef && !!selectedWarehouse;
      } else {
        // For courier options, only address is required (no city)
        valid = valid && !!address;
      }
    }
    if (!valid) {
      toast({ title: "Помилка", description: "Заповніть ім'я, телефон, email та дані доставки", variant: "destructive" as any });
      return;
    }
    if (items.length === 0) {
      navigate("/basket");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Debug: Log what we're sending - VERIFY VARIANT IS IN ITEMS
      console.log('=== CHECKOUT SUBMIT DEBUG ===');
      console.log('Items being sent:', items.map((it: any) => ({ 
        name: it.name, 
        variant: it.variant, 
        hasVariant: !!it.variant,
        variantType: typeof it.variant,
        fullItem: it
      })));
      console.log('Shipping:', {
        method: shippingMethod,
        city,
        cityRef,
        address,
        warehouseRef: selectedWarehouse,
        department: department || null,
      });
      console.log('Payment method:', paymentMethod);
      
      const orderPayload = {
        customer: { fullName, phone, email },
        shipping: { 
          method: shippingMethod, 
          city, 
          cityRef, 
          address, 
          warehouseRef: selectedWarehouse, 
          department: department || null,
          price: shippingPrice 
        },
        payment: { method: paymentMethod },
        notes,
        items,
      };
      
      console.log('Full payload items:', JSON.stringify(orderPayload.items, null, 2));
      
      const res = await fetch("/api/orders/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Не вдалося створити замовлення");

      // Handle different payment methods
      if (paymentMethod === "cash" || data.paymentMethod === "cash") {
        // For cash payment, just show success message
        toast({ 
          title: "Замовлення оформлено!", 
          description: "Ваше замовлення прийнято. З вами зв'яжуться для підтвердження.",
          variant: "default" as any 
        });
        navigate("/");
        return;
      }

      // For online payments (LiqPay, Apple Pay, Google Pay), redirect to payment
      if (data.data && data.signature) {
        // Redirect to LiqPay page with prepared data/signature
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://www.liqpay.ua/api/3/checkout';
        form.style.display = 'none';

        const dataInput = document.createElement('input');
        dataInput.type = 'hidden';
        dataInput.name = 'data';
        dataInput.value = data.data;
        const signatureInput = document.createElement('input');
        signatureInput.type = 'hidden';
        signatureInput.name = 'signature';
        signatureInput.value = data.signature;
        form.appendChild(dataInput);
        form.appendChild(signatureInput);
        document.body.appendChild(form);
        form.submit();
      }
    } catch (err: any) {
      toast({ title: "Помилка", description: err?.message || "Сталася помилка", variant: "destructive" as any });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-coffee-background">
      <Header />
      <section className="pt-28 pb-16" style={{ backgroundColor: '#361c0c' }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-black mb-8 leading-tight font-coolvetica tracking-wider" style={{ color: '#fcf4e4' }}>
            Оформлення замовлення
          </h1>
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="font-bold mb-2" style={{ color: '#361c0c' }}>Контактні дані</div>
              <Input placeholder="ПІБ" value={fullName} onChange={e => setFullName(e.target.value)} className="mb-3" />
              <Input placeholder="Телефон" value={phone} onChange={e => setPhone(e.target.value)} className="mb-3" />
              <Input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mb-3" />
            </div>

            <div className="md:col-span-2">
              <div className="font-bold mb-2" style={{ color: '#361c0c' }}>Доставка</div>
              {hasWaterItems ? (
                <div className="mb-3">
                  <button type="button" className="border p-3 text-left w-full border-[#361c0c] bg-[#fcf4e4] cursor-default">
                    <div className="font-bold" style={{ color: '#361c0c' }}>Кур'єр (Київ)</div>
                    <div className="text-sm text-gray-600">{ownCourierPrice === 0 ? 'Безкоштовно' : `₴${ownCourierPrice}`}</div>
                    {hasWaterItems && (
                      <div className="text-xs text-gray-500 mt-1">Обов'язково для замовлень з водою</div>
                    )}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                  <button type="button" onClick={() => setShippingMethod('nova_department')} className={`border p-3 text-left ${shippingMethod==='nova_department' ? 'border-[#361c0c] bg-[#fcf4e4]' : 'border-gray-300 hover:border-gray-400'}`}>
                    <div className="font-bold" style={{ color: '#361c0c' }}>(Нова Пошта) у відділення</div>
                    <div className="text-sm text-gray-600">Оплата за тарифами перевізника</div>
                  </button>
                  <button type="button" onClick={() => setShippingMethod('nova_postomat')} className={`border p-3 text-left ${shippingMethod==='nova_postomat' ? 'border-[#361c0c] bg-[#fcf4e4]' : 'border-gray-300 hover:border-gray-400'}`}>
                    <div className="font-bold" style={{ color: '#361c0c' }}>Поштомат (Нова Пошта)</div>
                    <div className="text-sm text-gray-600">Оплата за тарифами перевізника</div>
                  </button>
                  <button type="button" onClick={() => setShippingMethod('nova_courier')} className={`border p-3 text-left ${shippingMethod==='nova_courier' ? 'border-[#361c0c] bg-[#fcf4e4]' : 'border-gray-300 hover:border-gray-400'}`}>
                    <div className="font-bold" style={{ color: '#361c0c' }}>(Нова Пошта) кур'єром</div>
                    <div className="text-sm text-gray-600">Оплата за тарифами перевізника</div>
                  </button>
                  <button type="button" onClick={() => setShippingMethod('own_courier')} className={`border p-3 text-left ${shippingMethod==='own_courier' ? 'border-[#361c0c] bg-[#fcf4e4]' : 'border-gray-300 hover:border-gray-400'}`}>
                    <div className="font-bold" style={{ color: '#361c0c' }}>Кур'єр (Київ)</div>
                    <div className="text-sm text-gray-600">{ownCourierPrice === 0 ? 'Безкоштовно' : `₴${ownCourierPrice}`}</div>
                  </button>
                </div>
              )}

              {!hasWaterItems && (
                <>
                  {/* City field only for Nova Poshta (postomat/department) */}
                  {(shippingMethod === 'nova_department' || shippingMethod === 'nova_postomat') && (
                    <>
                      <div className="relative mb-2">
                        <Input placeholder="Місто" value={cityQuery} onChange={e => { setCityQuery(e.target.value); setCityRef(""); setCity(""); }} />
                        {showCityDropdown && settlements.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-1 border border-gray-300 rounded bg-white shadow-lg max-h-56 overflow-auto z-50">
                            {settlements.slice(0, 12).map((s: any, i: number) => (
                              <button type="button" key={i} onClick={() => handleSelectSettlement(s)} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm">
                                {(s?.Present || s?.Description || s?.MainDescription || s?.City) as string}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {city && !cityRef && (
                        <div className="text-sm text-orange-600 mb-2">
                          Оберіть місто зі списку, щоб побачити {shippingMethod === 'nova_postomat' ? 'поштомати' : 'відділення'}
                        </div>
                      )}
                      <div className="mb-3">
                        <Select value={selectedWarehouse} onValueChange={(value) => {
                          setSelectedWarehouse(value);
                          // Extract department number from selected warehouse
                          const selectedWh = warehouses.find((wh: any) => wh.Ref === value);
                          if (selectedWh) {
                            // Extract number from Description (e.g., "Відділення №1" -> "1")
                            const desc = selectedWh.Description || '';
                            const match = desc.match(/№\s*(\d+)/i) || desc.match(/(\d+)/);
                            if (match) {
                              setDepartment(match[1]);
                            } else {
                              setDepartment('');
                            }
                          } else {
                            setDepartment('');
                          }
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder={loadingWarehouses ? "Завантаження..." : shippingMethod === 'nova_postomat' ? "Оберіть поштомат" : "Оберіть відділення"} />
                          </SelectTrigger>
                          <SelectContent>
                            {warehouses.length > 0 ? (
                              warehouses.map((wh: any) => (
                                <SelectItem key={wh.Ref} value={wh.Ref}>
                                  {wh.Description} - {wh.ShortAddress}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-data" disabled>
                                {cityRef ? (loadingWarehouses ? "Завантаження..." : shippingMethod === 'nova_postomat' ? "Немає доступних поштоматів" : "Немає доступних відділень") : "Спочатку оберіть місто"}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  {/* Address field for courier options (no city field) */}
                  {(shippingMethod === 'nova_courier' || shippingMethod === 'own_courier') && (
                    <Input placeholder="Адреса доставки" value={address} onChange={e => setAddress(e.target.value)} className="mb-3" />
                  )}
                </>
              )}
              {hasWaterItems && (
                <Input placeholder="Адреса доставки" value={address} onChange={e => setAddress(e.target.value)} className="mb-3" />
              )}
              <div className="text-sm text-gray-700 mb-4">
                Вартість доставки: {
                  shippingMethod === 'own_courier' 
                    ? (ownCourierPrice === 0 ? 'Безкоштовно' : `₴${ownCourierPrice}`)
                    : 'Оплата за тарифами перевізника'
                }
                {shippingMethod === 'own_courier' && ownCourierPrice > 0 && totalPrice < freeDeliveryThreshold && (
                  <div className="text-sm text-gray-700 mt-1">
                    Додайте товарів на ₴{(freeDeliveryThreshold - totalPrice).toFixed(2)} для безкоштовної доставки
                  </div>
                )}
              </div>
              
              <div className="font-bold mb-2" style={{ color: '#361c0c' }}>Спосіб оплати</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <button type="button" onClick={() => setPaymentMethod('liqpay')} className={`border p-3 text-left flex items-center gap-2 ${paymentMethod==='liqpay' ? 'border-[#361c0c] bg-[#fcf4e4]' : 'border-gray-300 hover:border-gray-400'}`}>
                  <img src="/unnamed (2).png" alt="LiqPay" className="w-6 h-6 object-contain" />
                  <div>
                    <div className="font-bold" style={{ color: '#361c0c' }}>LiqPay</div>
                    <div className="text-sm text-gray-600">Картка онлайн</div>
                  </div>
                </button>
                <button type="button" onClick={() => setPaymentMethod('apple_pay')} className={`border p-3 text-left flex items-center gap-2 ${paymentMethod==='apple_pay' ? 'border-[#361c0c] bg-[#fcf4e4]' : 'border-gray-300 hover:border-gray-400'}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="#000"/>
                  </svg>
                  <div>
                    <div className="font-bold" style={{ color: '#361c0c' }}>Apple Pay</div>
                    <div className="text-sm text-gray-600">Онлайн оплата</div>
                  </div>
                </button>
                <button type="button" onClick={() => setPaymentMethod('google_pay')} className={`border p-3 text-left flex items-center gap-2 ${paymentMethod==='google_pay' ? 'border-[#361c0c] bg-[#fcf4e4]' : 'border-gray-300 hover:border-gray-400'}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <div>
                    <div className="font-bold" style={{ color: '#361c0c' }}>Google Pay</div>
                    <div className="text-sm text-gray-600">Онлайн оплата</div>
                  </div>
                </button>
                <button type="button" onClick={() => setPaymentMethod('cash')} className={`border p-3 text-left ${paymentMethod==='cash' ? 'border-[#361c0c] bg-[#fcf4e4]' : 'border-gray-300 hover:border-gray-400'}`}>
                  <div className="font-bold" style={{ color: '#361c0c' }}>Готівка</div>
                  <div className="text-sm text-gray-600">При отриманні</div>
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="font-bold mb-2" style={{ color: '#361c0c' }}>Коментар</div>
              <Textarea placeholder="Примітки до замовлення" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            <aside className="order-1 md:order-none md:col-span-1 md:col-start-3 md:row-start-1 md:row-end-4 md:sticky md:top-28 self-start">
              <div className="border rounded-lg p-4 shadow-sm bg-white">
                <div className="font-bold mb-3" style={{ color: '#361c0c' }}>Підсумок замовлення</div>
                
                {/* Order Items List */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 text-sm">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-16 h-16 object-cover rounded flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{item.name}</div>
                          {item.variant && (
                            <div className="text-xs text-gray-500 mt-1">{item.variant}</div>
                          )}
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-gray-600">×{item.quantity}</span>
                            <span className="font-semibold text-gray-900">₴{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 text-sm text-gray-700 mb-4">
                  <div className="flex justify-between"><span>Товари</span><span>₴{totalPrice.toFixed(2)}</span></div>
                  <div className="flex justify-between items-start">
                    <span className="pr-2">Доставка</span>
                    <span className="text-right">
                      {shippingMethod === 'own_courier' 
                        ? (shippingPrice === 0 ? 'Безкоштовно' : `₴${shippingPrice.toFixed(2)}`)
                        : <span className="text-xs leading-tight">Оплата за тарифами<br />перевізника</span>
                      }
                    </span>
                  </div>
                  <div className="flex justify-between font-black" style={{ color: '#361c0c' }}><span>До сплати</span><span>₴{(totalPrice + shippingPrice).toFixed(2)}</span></div>
                </div>
                <button 
                  disabled={isSubmitting} 
                  type="submit" 
                  className="w-full px-6 py-3 font-black border-2 bg-transparent hover:bg-[#361c0c] hover:!text-white transition-all duration-300 disabled:opacity-60 group" 
                  style={{ borderColor: '#361c0c', color: '#361c0c' }}
                >
                  <span className="group-hover:text-white transition-colors">
                    {isSubmitting ? 'Зачекайте...' : 'Перейти до оплати'}
                  </span>
                </button>
              </div>
            </aside>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
}


