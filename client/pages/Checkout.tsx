import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../contexts/CartContext";
import { useState, useMemo, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";

type ShippingMethod = "nova_department" | "nova_courier" | "own_courier";

export default function Checkout() {
  const { items, totalPrice } = useCart();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [cityRef, setCityRef] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("nova_department");
  const [department, setDepartment] = useState("");
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shippingPrice = useMemo(() => {
    if (totalPrice >= 1500) return 0;
    if (shippingMethod === "own_courier") return 200;
    // Nova Poshta pricing handled on delivery, but show 0 here; final sum may vary
    return 0;
  }, [shippingMethod, totalPrice]);

  // Load warehouses when city is selected
  const loadWarehouses = async () => {
    if (!cityRef || shippingMethod !== 'nova_department') return;
    setLoadingWarehouses(true);
    try {
      console.log('Loading warehouses for cityRef:', cityRef);
      const res = await fetch(`/api/warehouses?cityRef=${cityRef}`);
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
    if (cityRef && shippingMethod === 'nova_department') {
      loadWarehouses();
    }
  }, [cityRef, shippingMethod]);

  // Debounced city search suggestions
  useEffect(() => {
    const q = cityQuery.trim();
    if (shippingMethod !== 'nova_department') {
      setSettlements([]);
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
        setShowCityDropdown(results.length > 0);
      } catch (err) {
        console.error('Error fetching settlements:', err);
        setSettlements([]);
        setShowCityDropdown(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [cityQuery, shippingMethod]);

  function handleSelectSettlement(s: any) {
    const name = s?.Present || s?.Description || s?.MainDescription || s?.City || "";
    const ref = s?.Ref || s?.DeliveryCity || s?.SettlementRef || s?.RefAddress || "";
    setCity(name);
    setCityQuery(name);
    setCityRef(ref);
    setShowCityDropdown(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emailValid = /\S+@\S+\.\S+/.test(email);
    const phoneValid = phone.trim().length >= 7;
    let valid = !!fullName && phoneValid && emailValid;
    if (shippingMethod === 'nova_department') valid = valid && !!cityRef && !!selectedWarehouse;
    if (shippingMethod !== 'nova_department') valid = valid && !!city && !!address;
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
      const res = await fetch("/api/orders/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { fullName, phone, email },
          shipping: { method: shippingMethod, city, cityRef, address, warehouseRef: selectedWarehouse, price: shippingPrice },
          notes,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Не вдалося створити замовлення");

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
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <button type="button" onClick={() => setShippingMethod('nova_department')} className={`border p-3 text-left ${shippingMethod==='nova_department' ? 'border-[#361c0c] bg-[#fcf4e4]' : 'border-gray-300 hover:border-gray-400'}`}>
                  <div className="font-bold" style={{ color: '#361c0c' }}>НП у відділення</div>
                  <div className="text-sm text-gray-600">Оплата за тарифами перевізника</div>
                </button>
                <button type="button" onClick={() => setShippingMethod('nova_courier')} className={`border p-3 text-left ${shippingMethod==='nova_courier' ? 'border-[#361c0c] bg-[#fcf4e4]' : 'border-gray-300 hover:border-gray-400'}`}>
                  <div className="font-bold" style={{ color: '#361c0c' }}>НП кур'єром</div>
                  <div className="text-sm text-gray-600">Оплата за тарифами перевізника</div>
                </button>
                <button type="button" onClick={() => setShippingMethod('own_courier')} className={`border p-3 text-left ${shippingMethod==='own_courier' ? 'border-[#361c0c] bg-[#fcf4e4]' : 'border-gray-300 hover:border-gray-400'}`}>
                  <div className="font-bold" style={{ color: '#361c0c' }}>Кур'єр TCM (Київ)</div>
                  <div className="text-sm text-gray-600">₴200, безкоштовно від ₴1500</div>
                </button>
              </div>

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
              {shippingMethod === 'nova_department' && city && !cityRef && (
                <div className="text-sm text-orange-600 mb-2">
                  Оберіть місто зі списку, щоб побачити відділення
                </div>
              )}
              {shippingMethod === 'nova_department' && (
                <div className="mb-3">
                  <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingWarehouses ? "Завантаження..." : "Оберіть відділення"} />
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
                          {cityRef ? (loadingWarehouses ? "Завантаження..." : "Немає доступних відділень") : "Спочатку оберіть місто"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {(shippingMethod === 'nova_courier' || shippingMethod === 'own_courier') && (
                <Input placeholder="Адреса доставки" value={address} onChange={e => setAddress(e.target.value)} className="mb-3" />
              )}
              <div className="text-sm text-gray-700">Вартість доставки: {shippingPrice === 0 ? 'Безкоштовно' : `₴${shippingPrice}`}</div>
            </div>

            <div className="md:col-span-2">
              <div className="font-bold mb-2" style={{ color: '#361c0c' }}>Коментар</div>
              <Textarea placeholder="Зауваження до замовлення" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            <aside className="order-1 md:order-none md:col-span-1 md:col-start-3 md:row-start-1 md:row-end-4 md:sticky md:top-28 self-start">
              <div className="border rounded-lg p-4 shadow-sm bg-white">
                <div className="font-bold mb-3" style={{ color: '#361c0c' }}>Підсумок замовлення</div>
                <div className="space-y-1 text-sm text-gray-700 mb-4">
                  <div className="flex justify-between"><span>Товари</span><span>₴{totalPrice.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Доставка</span><span>{shippingPrice === 0 ? 'Безкоштовно' : `₴${shippingPrice.toFixed(2)}`}</span></div>
                  <div className="flex justify-between font-black" style={{ color: '#361c0c' }}><span>До сплати</span><span>₴{(totalPrice + shippingPrice).toFixed(2)}</span></div>
                </div>
                <button disabled={isSubmitting} type="submit" className="w-full px-6 py-3 font-black border-2 bg-transparent hover:bg-[#361c0c] hover:text-white transition-all duration-300 disabled:opacity-60" style={{ borderColor: '#361c0c', color: '#361c0c' }}>
                  {isSubmitting ? 'Зачекайте...' : 'Перейти до оплати'}
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


