import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaUploader } from "@/components/ui/MediaUploader";
import { CoffeeLabelGenerator } from "@/components/CoffeeLabelGenerator";

type CoffeeSize = {
  id?: number;
  product_id?: number;
  sort?: number | null;
  enabled?: boolean | null;
  label_ua?: string | null;
  label_ru?: string | null;
  weight?: number | null; // grams
  price?: number | null; // UAH
};

type CoffeeLabelData = {
  template: 'classic' | 'caramel' | 'emerald' | 'indigo' | 'crimson' | 'gold';
  size: 'small' | 'medium' | 'large';
  flavor_notes?: string[];
};

type CoffeeProduct = {
  id?: number;
  slug?: string | null;
  name_ua: string;
  name_ru: string;
  description_ua?: string | null;
  description_ru?: string | null;
  image_url?: string | null;
  origin?: string | null;
  roast?: string | null; // 'light' | 'medium' | 'dark'
  in_stock?: boolean | null;
  featured?: boolean | null;
  active?: boolean | null;
  metric_label_strength?: string | null;
  metric_label_acidity?: string | null;
  metric_label_roast?: string | null;
  metric_label_body?: string | null;
  strength_level?: number | null;
  acidity_level?: number | null;
  roast_level?: number | null;
  body_level?: number | null;
  label_data?: CoffeeLabelData | null;
  sizes?: CoffeeSize[];
};

export function CoffeeProductsManager() {
  const [products, setProducts] = useState<CoffeeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProductForLabel, setSelectedProductForLabel] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('coffee_products')
      .select('*, coffee_sizes(*)')
      .order('id', { ascending: true });
    if (error) setError(error.message);
    const mapped: CoffeeProduct[] = (data as any || []).map((p: any) => ({
      ...p,
      sizes: (p.coffee_sizes || []).sort((a: any, b: any) => (a.sort ?? 0) - (b.sort ?? 0))
    }));
    setProducts(mapped);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addProduct = () => {
    setProducts([
      ...products,
      {
        name_ua: '',
        name_ru: '',
        description_ua: '',
        description_ru: '',
        image_url: '',
        origin: '',
        roast: 'medium',
        in_stock: true,
        featured: false,
        active: true,
        metric_label_strength: 'Міцність',
        metric_label_acidity: 'Кислотність',
        metric_label_roast: 'Обсмажування',
        metric_label_body: 'Насиченість',
        strength_level: 3,
        acidity_level: 3,
        roast_level: 3,
        body_level: 3,
        sizes: [
          { label_ua: '250 г', label_ru: '250 г', weight: 250, price: 0, enabled: true, sort: 1 },
        ],
      },
    ]);
  };

  const addSize = (pIdx: number) => {
    const next = [...products];
    const sizes = next[pIdx].sizes || [];
    const maxSort = sizes.reduce((m, s) => Math.max(m, s.sort ?? 0), 0);
    sizes.push({ label_ua: '', label_ru: '', weight: 250, price: 0, enabled: true, sort: maxSort + 1 });
    next[pIdx].sizes = sizes;
    setProducts(next);
  };

  const moveSize = (pIdx: number, sIdx: number, direction: 'up' | 'down') => {
    const next = [...products];
    const sizes = (next[pIdx].sizes || []).slice();
    if (direction === 'up' && sIdx > 0) {
      const tmp = sizes[sIdx - 1];
      sizes[sIdx - 1] = sizes[sIdx];
      sizes[sIdx] = tmp;
    } else if (direction === 'down' && sIdx < sizes.length - 1) {
      const tmp = sizes[sIdx + 1];
      sizes[sIdx + 1] = sizes[sIdx];
      sizes[sIdx] = tmp;
    }
    // reindex sort to keep contiguous
    next[pIdx].sizes = sizes.map((s, i) => ({ ...s, sort: i + 1 }));
    setProducts(next);
  };

  const updateProductField = (pIdx: number, key: keyof CoffeeProduct, value: any) => {
    const next = [...products];
    (next[pIdx] as any)[key] = value;
    setProducts(next);
  };

  const updateSizeField = (pIdx: number, sIdx: number, key: keyof CoffeeSize, value: any) => {
    const next = [...products];
    const sizes = next[pIdx].sizes ? [...next[pIdx].sizes!] : [];
    (sizes[sIdx] as any)[key] = value;
    next[pIdx].sizes = sizes;
    setProducts(next);
  };

  const removeSize = async (pIdx: number, sIdx: number) => {
    const size = products[pIdx].sizes?.[sIdx];
    if (size?.id) {
      await supabase.from('coffee_sizes').delete().eq('id', size.id);
    }
    const next = [...products];
    next[pIdx].sizes = (next[pIdx].sizes || []).filter((_, i) => i !== sIdx);
    setProducts(next);
  };

  const saveProduct = async (pIdx: number) => {
    setError(null);
    const p = products[pIdx];
    // Upsert product
    const productPayload = {
      id: p.id,
      slug: p.slug,
      name_ua: p.name_ua,
      name_ru: p.name_ru,
      description_ua: p.description_ua,
      description_ru: p.description_ru,
      image_url: p.image_url,
      origin: p.origin,
      roast: p.roast,
      in_stock: p.in_stock,
      featured: p.featured,
      active: p.active,
      metric_label_strength: p.metric_label_strength,
      metric_label_acidity: p.metric_label_acidity,
      metric_label_roast: p.metric_label_roast,
      metric_label_body: p.metric_label_body,
      strength_level: p.strength_level,
      acidity_level: p.acidity_level,
      roast_level: p.roast_level,
      body_level: p.body_level,
      label_data: p.label_data,
    };
    let productId = p.id;
    if (!productId) {
      const { data, error } = await supabase.from('coffee_products').insert(productPayload as any).select('id').single();
      if (error) return setError(error.message);
      productId = (data as any)?.id;
      products[pIdx].id = productId;
    } else {
      const { error } = await supabase.from('coffee_products').update(productPayload as any).eq('id', productId);
      if (error) return setError(error.message);
    }

    // Upsert sizes
    const sizes = (p.sizes || []).map((s, i) => ({ ...s, sort: i + 1 }));
    for (const s of sizes) {
      const sizePayload = {
        id: s.id,
        product_id: productId,
        sort: s.sort ?? null,
        enabled: s.enabled ?? true,
        label_ua: s.label_ua ?? '',
        label_ru: s.label_ru ?? '',
        weight: s.weight ?? null,
        price: s.price ?? null,
      };
      if (!s.id) {
        const { data, error } = await supabase.from('coffee_sizes').insert(sizePayload as any).select('id').single();
        if (error) return setError(error.message);
        s.id = (data as any)?.id;
      } else {
        const { error } = await supabase.from('coffee_sizes').update(sizePayload as any).eq('id', s.id);
        if (error) return setError(error.message);
      }
    }

    await load();
    try { await queryClient.invalidateQueries({ queryKey: ['coffee-products'] }); } catch {}
    alert('Збережено!');
  };

  const removeProduct = async (pIdx: number) => {
    const p = products[pIdx];
    if (p.id) {
      await supabase.from('coffee_sizes').delete().eq('product_id', p.id);
      await supabase.from('coffee_products').delete().eq('id', p.id);
    }
    const next = products.filter((_, i) => i !== pIdx);
    setProducts(next);
    try { await queryClient.invalidateQueries({ queryKey: ['coffee-products'] }); } catch {}
  };

  if (loading) return <div>Завантаження…</div>;

  const selectedProduct = selectedProductForLabel !== null ? products[selectedProductForLabel] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Кава</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addProduct}>Додати продукт</Button>
        </div>
      </div>

      {/* Label Generator */}
      {selectedProduct && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Генератор мітки для: {selectedProduct.name_ua}
            </h3>
            <Button 
              variant="outline" 
              onClick={() => setSelectedProductForLabel(null)}
            >
              Закрити
            </Button>
          </div>
          <CoffeeLabelGenerator
            coffeeName={selectedProduct.name_ua}
            strength={selectedProduct.strength_level || 3}
            acidity={selectedProduct.acidity_level || 3}
            roast={selectedProduct.roast_level || 3}
            body={selectedProduct.body_level || 3}
            onLabelDataChange={(data) => {
              // Update the product with new label data
              const updatedProducts = [...products];
              const productIndex = selectedProductForLabel;
              if (productIndex !== null) {
                updatedProducts[productIndex] = {
                  ...updatedProducts[productIndex],
                  strength_level: data.strength,
                  acidity_level: data.acidity,
                  roast_level: data.roast,
                  body_level: data.body,
                };
                setProducts(updatedProducts);
              }
            }}
            onApplyLabel={async (data) => {
              // Apply the label to the product
              const updatedProducts = [...products];
              const productIndex = selectedProductForLabel;
              if (productIndex !== null) {
                updatedProducts[productIndex] = {
                  ...updatedProducts[productIndex],
                  strength_level: data.strength,
                  acidity_level: data.acidity,
                  roast_level: data.roast,
                  body_level: data.body,
                  label_data: {
                    template: data.template,
                    size: data.size,
                    flavor_notes: data.flavor_notes || [],
                  },
                };
                setProducts(updatedProducts);
                setSelectedProductForLabel(null);
                try {
                  await saveProduct(productIndex);
                } catch {}
                alert('Мітку застосовано та збережено!');
              }
            }}
          />
        </div>
      )}

      {error && <div className="text-destructive">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((p, pIdx) => (
          <Card key={p.id ?? `new-${pIdx}`} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Продукт #{pIdx + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Назва (UA)</Label>
                  <Input value={p.name_ua} onChange={(e) => updateProductField(pIdx, 'name_ua', e.target.value)} />
                </div>
                <div>
                  <Label>Назва (RU)</Label>
                  <Input value={p.name_ru} onChange={(e) => updateProductField(pIdx, 'name_ru', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Опис (UA)</Label>
                  <Input value={p.description_ua ?? ''} onChange={(e) => updateProductField(pIdx, 'description_ua', e.target.value)} />
                </div>
                <div>
                  <Label>Опис (RU)</Label>
                  <Input value={p.description_ru ?? ''} onChange={(e) => updateProductField(pIdx, 'description_ru', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Походження</Label>
                  <Input value={p.origin ?? ''} onChange={(e) => updateProductField(pIdx, 'origin', e.target.value)} />
                </div>
                <div>
                  <Label>Обсмажування</Label>
                  <Input value={p.roast ?? ''} onChange={(e) => updateProductField(pIdx, 'roast', e.target.value)} placeholder="light | medium | dark" />
                </div>
                <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <Checkbox id={`active-${pIdx}`} checked={!!p.active} onCheckedChange={(v) => updateProductField(pIdx, 'active', !!v)} />
                    <Label htmlFor={`active-${pIdx}`}>Активний</Label>
                  </div>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <Checkbox id={`stock-${pIdx}`} checked={!!p.in_stock} onCheckedChange={(v) => updateProductField(pIdx, 'in_stock', !!v)} />
                    <Label htmlFor={`stock-${pIdx}`}>В наявності</Label>
                  </div>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <Checkbox id={`featured-${pIdx}`} checked={!!p.featured} onCheckedChange={(v) => updateProductField(pIdx, 'featured', !!v)} />
                    <Label htmlFor={`featured-${pIdx}`}>Рекомендований</Label>
                  </div>
                </div>
              </div>

              {/* Metrics controls */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Міцність</Label>
                  <Select value={(p.strength_level ?? 0).toString()} onValueChange={(v) => updateProductField(pIdx, 'strength_level', Number(v))}>
                    <SelectTrigger><SelectValue placeholder="Оберіть від 1 до 5" /></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5].map(n => (<SelectItem key={n} value={n.toString()}>{n}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Кислотність</Label>
                  <Select value={(p.acidity_level ?? 0).toString()} onValueChange={(v) => updateProductField(pIdx, 'acidity_level', Number(v))}>
                    <SelectTrigger><SelectValue placeholder="Оберіть від 1 до 5" /></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5].map(n => (<SelectItem key={n} value={n.toString()}>{n}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Обсмажування</Label>
                  <Select value={(p.roast_level ?? 0).toString()} onValueChange={(v) => updateProductField(pIdx, 'roast_level', Number(v))}>
                    <SelectTrigger><SelectValue placeholder="Оберіть від 1 до 5" /></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5].map(n => (<SelectItem key={n} value={n.toString()}>{n}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Насиченість</Label>
                  <Select value={(p.body_level ?? 0).toString()} onValueChange={(v) => updateProductField(pIdx, 'body_level', Number(v))}>
                    <SelectTrigger><SelectValue placeholder="Оберіть від 1 до 5" /></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5].map(n => (<SelectItem key={n} value={n.toString()}>{n}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <MediaUploader
                label="Зображення"
                value={p.image_url ?? ''}
                onChange={(url) => updateProductField(pIdx, 'image_url', url)}
                accept="image/*"
                folder="coffee"
                placeholder="https://...jpg"
              />

              {/* Sizes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Розміри та ціни</h3>
                  <Button variant="outline" onClick={() => addSize(pIdx)}>Додати розмір</Button>
                </div>
                <div className="space-y-4">
                  {(p.sizes || []).map((s, sIdx) => (
                    <div key={s.id ?? `size-${sIdx}`} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                      <div className="md:col-span-3">
                        <Label>Мітка</Label>
                        <Input
                          value={s.label_ua ?? s.label_ru ?? ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            const next = [...products];
                            const sizes = next[pIdx].sizes ? [...next[pIdx].sizes!] : [];
                            (sizes[sIdx] as any)['label_ua'] = value;
                            (sizes[sIdx] as any)['label_ru'] = value;
                            next[pIdx].sizes = sizes;
                            setProducts(next);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Вага (г)</Label>
                        <Input type="number" value={s.weight ?? 0} onChange={(e) => updateSizeField(pIdx, sIdx, 'weight', Number(e.target.value))} />
                      </div>
                      <div>
                        <Label>Ціна (₴)</Label>
                        <Input type="number" step="0.01" value={s.price ?? 0} onChange={(e) => updateSizeField(pIdx, sIdx, 'price', Number(e.target.value))} />
                      </div>
                      
                      <div className="text-right">
                        <Button variant="destructive" onClick={() => removeSize(pIdx, sIdx)}>Видалити</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => removeProduct(pIdx)}>Видалити продукт</Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => setSelectedProductForLabel(pIdx)}
                  >
                    Створити мітку
                  </Button>
                </div>
                <Button onClick={() => saveProduct(pIdx)}>Зберегти продукт</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


