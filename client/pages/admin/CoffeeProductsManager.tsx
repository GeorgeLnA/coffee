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
import { ChevronUp, ChevronDown } from "lucide-react";

type CoffeeSize = {
  id?: number;
  product_id?: number;
  sort?: number | null;
  enabled?: boolean | null;
  label_ua?: string | null;
  label_ru?: string | null;
  weight?: number | null; // grams
  price?: number | null; // UAH
  image_url?: string | null;
  special?: boolean | null; // special styling like gift package
};

type CoffeeLabelData = {
  template: 'classic' | 'caramel' | 'emerald' | 'indigo' | 'crimson' | 'gold' | 'custom';
  size: 'small' | 'medium' | 'large';
  flavor_notes?: string[];
  pattern?: 'dots' | 'stripes' | 'grid' | 'geometric' | 'waves' | 'stars' | 'leaves' | 'diamonds' | 'lines';
  customColors?: { bg: string; text: string; accent: string };
};

type CoffeeProduct = {
  id?: number;
  slug?: string | null;
  sort?: number | null;
  name_ua: string;
  name_ru: string;
  description_ua?: string | null;
  description_ru?: string | null;
  image_url?: string | null;
  origin?: string | null;
  roast?: string | null; // 'light' | 'medium' | 'dark'
  in_stock?: boolean | null;
  custom_label?: string | null;
  custom_label_color?: string | null;
  custom_label_text_color?: string | null;
  active?: boolean | null;
  flavor_notes_array?: string[] | null;
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
      .order('sort', { ascending: true, nullsFirst: false });
    if (error) setError(error.message);
    const mapped: CoffeeProduct[] = (data as any || []).map((p: any) => {
      // Sync flavor_notes_array with label_data.flavor_notes
      let flavorNotesArray = p.flavor_notes_array || [];
      
      // If label_data has flavor_notes, use those (they take priority)
      if (p.label_data?.flavor_notes && Array.isArray(p.label_data.flavor_notes) && p.label_data.flavor_notes.length > 0) {
        flavorNotesArray = p.label_data.flavor_notes;
      }
      // If no label_data flavor_notes but we have flavor_notes_array, keep it
      else if (p.flavor_notes_array && Array.isArray(p.flavor_notes_array) && p.flavor_notes_array.length > 0) {
        flavorNotesArray = p.flavor_notes_array;
      }
      
      return {
        ...p,
        flavor_notes_array: flavorNotesArray,
        sizes: (p.coffee_sizes || []).sort((a: any, b: any) => (a.sort ?? 0) - (b.sort ?? 0))
      };
    });
    setProducts(mapped);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Sync flavor_notes_array with label_data whenever products change
  useEffect(() => {
    const syncedProducts = products.map(p => {
      if (p.flavor_notes_array && p.flavor_notes_array.length > 0 && p.label_data) {
        return {
          ...p,
          label_data: {
            ...p.label_data,
            flavor_notes: p.flavor_notes_array
          }
        };
      }
      return p;
    });
    
    // Only update if there's actually a change to avoid infinite loops
    const hasChanges = syncedProducts.some((p, idx) => 
      p.label_data?.flavor_notes !== products[idx]?.label_data?.flavor_notes
    );
    
    if (hasChanges) {
      setProducts(syncedProducts);
    }
  }, [products.map(p => p.flavor_notes_array).join(',')]);

  const addProduct = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const maxSort = Math.max(...products.map(p => p.sort || 0), 0);
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
        custom_label: null,
        active: true,
        flavor_notes_array: [],
        sort: maxSort + 1,
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

  const addSize = (pIdx: number, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
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

  const removeSize = async (pIdx: number, sIdx: number, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const size = products[pIdx].sizes?.[sIdx];
    if (size?.id) {
      await supabase.from('coffee_sizes').delete().eq('id', size.id);
    }
    const next = [...products];
    next[pIdx].sizes = (next[pIdx].sizes || []).filter((_, i) => i !== sIdx);
    setProducts(next);
  };

  const saveProduct = async (pIdx: number, event?: React.MouseEvent, override?: CoffeeProduct, suppressAlert?: boolean) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setError(null);
    const p = override ?? products[pIdx];
    
    // Sync flavor_notes_array with label_data before saving
    let syncedLabelData = p.label_data;
    if (p.flavor_notes_array && p.flavor_notes_array.length > 0) {
      syncedLabelData = {
        ...p.label_data,
        flavor_notes: p.flavor_notes_array
      };
    }
    
    // Upsert product
    const productPayload = {
      id: p.id,
      slug: p.slug,
      sort: p.sort,
      name_ua: p.name_ua,
      name_ru: p.name_ru,
      description_ua: p.description_ua,
      description_ru: p.description_ru,
      image_url: p.image_url,
      origin: p.origin,
      roast: p.roast,
      in_stock: p.in_stock,
      custom_label: p.custom_label,
      custom_label_color: p.custom_label_color,
      custom_label_text_color: p.custom_label_text_color,
      active: p.active,
      flavor_notes_array: (p.flavor_notes_array || null) as any,
      metric_label_strength: p.metric_label_strength,
      metric_label_acidity: p.metric_label_acidity,
      metric_label_roast: p.metric_label_roast,
      metric_label_body: p.metric_label_body,
      strength_level: p.strength_level,
      acidity_level: p.acidity_level,
      roast_level: p.roast_level,
      body_level: p.body_level,
      label_data: syncedLabelData,
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
        image_url: s.image_url ?? null,
        special: s.special ?? null,
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

    // Only invalidate queries, don't reload the entire page
    try { await queryClient.invalidateQueries({ queryKey: ['coffee-products'] }); } catch {}
    if (!suppressAlert) {
      alert('Збережено!');
    }
  };

  const removeProduct = async (pIdx: number, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const p = products[pIdx];
    if (p.id) {
      await supabase.from('coffee_sizes').delete().eq('product_id', p.id);
      await supabase.from('coffee_products').delete().eq('id', p.id);
    }
    const next = products.filter((_, i) => i !== pIdx);
    setProducts(next);
    try { await queryClient.invalidateQueries({ queryKey: ['coffee-products'] }); } catch {}
  };

  const duplicateProduct = (pIdx: number, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const originalProduct = products[pIdx];
    const maxSort = Math.max(...products.map(p => p.sort || 0), 0);
    
    const duplicatedProduct: CoffeeProduct = {
      ...originalProduct,
      id: undefined, // Remove ID so it creates a new product
      name_ua: `${originalProduct.name_ua} (копія)`,
      name_ru: `${originalProduct.name_ru} (копія)`,
      sort: maxSort + 1,
      sizes: originalProduct.sizes?.map(size => ({
        ...size,
        id: undefined, // Remove ID so it creates new sizes
        product_id: undefined
      })) || []
    };
    
    // Insert the duplicated product right after the original one
    const newProducts = [...products];
    newProducts.splice(pIdx + 1, 0, duplicatedProduct);
    setProducts(newProducts);
  };

  const moveProduct = async (pIdx: number, direction: 'up' | 'down', event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    // Calculate target index
    const targetIdx = direction === 'up' ? pIdx - 1 : pIdx + 1;
    if (targetIdx < 0 || targetIdx >= products.length) return;

    // Reorder array immutably
    const reordered = [...products];
    const [moved] = reordered.splice(pIdx, 1);
    reordered.splice(targetIdx, 0, moved);

    // Renumber sort to be contiguous and unique (1..n)
    const renumbered = reordered.map((p, i) => ({ ...p, sort: i + 1 }));
    setProducts(renumbered);

    // Persist robustly with two-phase update to avoid unique conflicts:
    // 1) set sort = null for all affected ids (partial unique index ignores nulls)
    // 2) assign unique 1..n values sequentially
    const ids = renumbered.filter(p => !!p.id).map(p => p.id!) as number[];
    const assignments = renumbered
      .filter(p => !!p.id)
      .map(p => ({ id: p.id as number, sort: p.sort as number }));
    try {
      if (ids.length) {
        const { error: nullAllError } = await supabase
          .from('coffee_products')
          .update({ sort: null as any })
          .in('id', ids);
        if (nullAllError) throw nullAllError;

        for (const rec of assignments) {
          const { error: updError } = await supabase
            .from('coffee_products')
            .update({ sort: rec.sort })
            .eq('id', rec.id);
          if (updError) throw updError;
        }
      }
      await queryClient.invalidateQueries({ queryKey: ['coffee-products'] });
    } catch (error) {
      console.error('Error updating sort order:', error);
      setError('Не вдалося зберегти порядок. Спробуйте ще раз.');
    }
  };

  if (loading) return <div>Завантаження…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Кава</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={(e) => addProduct(e)}>Додати продукт</Button>
        </div>
      </div>

      {error && <div className="text-destructive">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((p, pIdx) => (
          <div key={p.id ?? `new-${pIdx}`} className="space-y-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Продукт #{pIdx + 1} {p.sort !== null && p.sort !== undefined && `(Позиція: ${p.sort})`}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => moveProduct(pIdx, 'up', e)}
                      disabled={pIdx === 0}
                      className="p-1 h-8 w-8"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => moveProduct(pIdx, 'down', e)}
                      disabled={pIdx === products.length - 1}
                      className="p-1 h-8 w-8"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Назва (UA)</Label>
                    <Input value={p.name_ua} onChange={(e) => updateProductField(pIdx, 'name_ua', e.target.value)} />
                  </div>
                  <div>
                    <Label>Назва (RU)</Label>
                    <Input value={p.name_ru} onChange={(e) => updateProductField(pIdx, 'name_ru', e.target.value)} />
                  </div>
                  <div>
                    <Label>Slug (URL)</Label>
                    <Input value={p.slug ?? ''} onChange={(e) => updateProductField(pIdx, 'slug', e.target.value)} placeholder="guatemala-antigua" />
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


              {/* Flavor notes (comma-separated -> array) */}
              <div>
                <Label>Післясмак (через кому)</Label>
                <Input
                  placeholder="шоколад, карамель, горіхи"
                  value={(p.flavor_notes_array || []).join(', ')}
                  onChange={(e) => {
                    const raw = e.target.value || '';
                    const arr = raw
                      .split(',')
                      .map(s => s.trim())
                      .filter(Boolean);
                    
                    // Update both flavor_notes_array and label_data
                    const next = [...products];
                    next[pIdx].flavor_notes_array = arr;
                    
                    // Sync with label_data if it exists
                    if (next[pIdx].label_data) {
                      next[pIdx].label_data = {
                        ...next[pIdx].label_data,
                        flavor_notes: arr
                      };
                    }
                    
                    setProducts(next);
                  }}
                />
              </div>

              {/* Custom Label with Color Picker */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Кастомна мітка</Label>
                  <Input
                    placeholder="Наприклад: Рекомендований, Новий, Популярний..."
                    value={p.custom_label ?? ''}
                    onChange={(e) => updateProductField(pIdx, 'custom_label', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Колір мітки</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={p.custom_label_color ?? '#f59e0b'}
                        onChange={(e) => updateProductField(pIdx, 'custom_label_color', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <Input
                        value={p.custom_label_color ?? '#f59e0b'}
                        onChange={(e) => updateProductField(pIdx, 'custom_label_color', e.target.value)}
                        placeholder="#f59e0b"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Колір тексту</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={p.custom_label_text_color ?? '#92400e'}
                        onChange={(e) => updateProductField(pIdx, 'custom_label_text_color', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <Input
                        value={p.custom_label_text_color ?? '#92400e'}
                        onChange={(e) => updateProductField(pIdx, 'custom_label_text_color', e.target.value)}
                        placeholder="#92400e"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Цей текст з'явиться як мітка на сторінці кави</p>
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
                    <Button variant="outline" onClick={(e) => addSize(pIdx, e)}>Додати розмір</Button>
                  </div>
                  <div className="space-y-4">
                    {(p.sizes || []).map((s, sIdx) => (
                      <div key={s.id ?? `size-${sIdx}`} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
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
                        </div>

                        <div>
                          <Label>Зображення розміру</Label>
                          <MediaUploader
                            value={s.image_url ?? ''}
                            onChange={(url) => updateSizeField(pIdx, sIdx, 'image_url', url)}
                            accept="image/*"
                            folder="coffee/sizes"
                            placeholder="https://...jpg"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id={`special-${pIdx}-${sIdx}`} 
                            checked={!!s.special} 
                            onCheckedChange={(v) => updateSizeField(pIdx, sIdx, 'special', !!v)} 
                          />
                          <Label htmlFor={`special-${pIdx}-${sIdx}`}>Подарункове пакування</Label>
                        </div>
                        
                        <div className="text-right">
                          <Button variant="destructive" onClick={(e) => removeSize(pIdx, sIdx, e)}>Видалити</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Create Label Button */}
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedProductForLabel(pIdx)}
                    className="px-12 py-3 bg-white text-gray-900 border-gray-300 hover:bg-gray-50 w-64"
                  >
                    Створити мітку
                  </Button>
                </div>

                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={(e) => removeProduct(pIdx, e)}>Видалити продукт</Button>
                    <Button 
                      variant="secondary" 
                      onClick={(e) => duplicateProduct(pIdx, e)}
                    >
                      Дублювати
                    </Button>
                  </div>
                  <Button onClick={(e) => saveProduct(pIdx, e)}>Зберегти продукт</Button>
                </div>
              </CardContent>
            </Card>

            {/* Label Generator - appears right under the clicked product card */}
            {selectedProductForLabel === pIdx && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Генератор мітки для: {p.name_ua}
                  </h3>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedProductForLabel(null)}
                  >
                    Закрити
                  </Button>
                </div>
                <CoffeeLabelGenerator
                  coffeeName={p.name_ua}
                  strength={p.strength_level || 3}
                  acidity={p.acidity_level || 3}
                  roast={p.roast_level || 3}
                  body={p.body_level || 3}
                  initialFlavorNotes={p.flavor_notes_array || []}
                  onLabelDataChange={(data) => {
                    // Update the product with new label data
                    const updatedProducts = [...products];
                    updatedProducts[pIdx] = {
                      ...updatedProducts[pIdx],
                      strength_level: data.strength,
                      acidity_level: data.acidity,
                      roast_level: data.roast,
                      body_level: data.body,
                    };
                    setProducts(updatedProducts);
                  }}
                  onApplyLabel={async (data) => {
                    // Apply the label to the product and sync flavor notes
                    const updatedProducts = [...products];
                    const flavorNotes = data.flavor_notes || [];
                    
                    // Rich label_data so patterns and colors render correctly
                    const labelData: any = {
                      template: data.template,
                      size: data.size,
                      flavor_notes: flavorNotes,
                    };

                    // Include valid pattern
                    const validPatterns = ['dots', 'stripes', 'grid', 'geometric', 'waves', 'stars', 'leaves', 'diamonds', 'lines'];
                    if (data.pattern && validPatterns.includes(data.pattern)) {
                      labelData.pattern = data.pattern;
                    }

                    // Include custom colors when template is custom; fall back to safe defaults
                    if (data.template === 'custom') {
                      const bg = data.customColors?.bg || '#2F2A26';
                      const text = data.customColors?.text || '#FFFFFF';
                      const accent = data.customColors?.accent || '#D3B58F';
                      labelData.customColors = { bg, text, accent };
                    }
                    
                    const nextProduct: CoffeeProduct = {
                      ...updatedProducts[pIdx],
                      strength_level: data.strength,
                      acidity_level: data.acidity,
                      roast_level: data.roast,
                      body_level: data.body,
                      flavor_notes_array: flavorNotes, // Sync with aftertaste field
                      label_data: labelData,
                    };
                    updatedProducts[pIdx] = nextProduct;
                    setProducts(updatedProducts);
                    // Keep modal open - don't close it
                    try {
                      // Save with the latest in-memory product to avoid stale first-save
                      await saveProduct(pIdx, undefined, nextProduct, true);
                      alert('Мітку застосовано та збережено!');
                    } catch (error) {
                      alert('Помилка збереження: ' + error);
                    }
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


