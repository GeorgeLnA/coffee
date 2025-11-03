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
import { ChevronUp, ChevronDown, Plus, Trash2 } from "lucide-react";

type WaterProduct = {
  id?: number;
  sort?: number | null;
  name_ua: string;
  name_ru: string;
  description_ua?: string | null;
  description_ru?: string | null;
  image_url?: string | null;
  volume?: string | null;
  price?: number | null;
  active?: boolean | null;
  features_ua?: string[] | null;
  features_ru?: string[] | null;
};

export function WaterProductsManager() {
  const [products, setProducts] = useState<WaterProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const load = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('water_products')
        .select('*, water_sizes(*)')
        .order('sort', { ascending: true, nullsFirst: false });
      
      if (error) throw error;
      
      const mappedData = (data || []).map((p: any) => ({
        id: p.id,
        sort: p.sort,
        name_ua: p.name_ua,
        name_ru: p.name_ru,
        description_ua: p.description_ua,
        description_ru: p.description_ru,
        image_url: p.image_url,
        volume: p.volume,
        price: p.price,
        active: p.active,
        features_ua: p.features_ua || [],
        features_ru: p.features_ru || [],
      }));
      
      setProducts(mappedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateProductField = (pIdx: number, field: keyof WaterProduct, value: any) => {
    const updated = [...products];
    (updated[pIdx] as any)[field] = value;
    setProducts(updated);
  };


  const saveProduct = async (pIdx: number, event?: React.MouseEvent, suppressAlert: boolean = false) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setError(null);
    const p = products[pIdx];
    
    // Upsert product
    const productPayload = {
      id: p.id,
      sort: p.sort,
      name_ua: p.name_ua,
      name_ru: p.name_ru,
      description_ua: p.description_ua,
      description_ru: p.description_ru,
      image_url: p.image_url,
      volume: p.volume,
      price: p.price,
      active: p.active,
      features_ua: (p.features_ua || null) as any,
      features_ru: (p.features_ru || null) as any,
    };
    
    let productId = p.id;
    if (!productId) {
      const { data, error } = await supabase.from('water_products').insert(productPayload as any).select('id').single();
      if (error) return setError(error.message);
      productId = (data as any)?.id;
      products[pIdx].id = productId;
    } else {
      const { error } = await supabase.from('water_products').update(productPayload as any).eq('id', productId);
      if (error) return setError(error.message);
    }


    try { await queryClient.invalidateQueries({ queryKey: ['water-products'] }); } catch {}
    if (!suppressAlert) {
      alert('Збережено!');
    }
  };

  const removeProduct = async (pIdx: number, event: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const p = products[pIdx];
    if (!p.id) return;
    
    const { error } = await supabase.from('water_products').delete().eq('id', p.id);
    if (error) return setError(error.message);
    
    const updated = products.filter((_, i) => i !== pIdx);
    setProducts(updated);
    try { await queryClient.invalidateQueries({ queryKey: ['water-products'] }); } catch {}
  };

  const addProduct = async (event: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const maxSort = Math.max(...products.map(p => p.sort || 0), 0);
    const newProduct: WaterProduct = {
      name_ua: '',
      name_ru: '',
      description_ua: '',
      description_ru: '',
      image_url: '',
      volume: '',
      price: null,
      active: true,
      features_ua: [],
      features_ru: [],
      sort: maxSort + 1,
    };
    setProducts([...products, newProduct]);
  };


  const moveProduct = async (pIdx: number, direction: 'up' | 'down', event: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const newIdx = direction === 'up' ? pIdx - 1 : pIdx + 1;
    if (newIdx < 0 || newIdx >= products.length) return;
    
    const updated = [...products];
    [updated[pIdx], updated[newIdx]] = [updated[newIdx], updated[pIdx]];
    setProducts(updated);
    
    // Update sort values
    updated.forEach((p, i) => {
      p.sort = i + 1;
    });
    
    // Save all products with new sort order
    try {
      const updates = updated.map(p => ({
        id: p.id,
        sort: p.sort
      }));
      
      // First set all to null to avoid unique constraint issues
      await supabase.from('water_products').update({ sort: null }).in('id', updates.map(u => u.id).filter(Boolean));
      
      // Then update with new sort values
      for (const update of updates) {
        if (update.id) {
          await supabase.from('water_products').update({ sort: update.sort }).eq('id', update.id);
        }
      }
      
      try { await queryClient.invalidateQueries({ queryKey: ['water-products'] }); } catch {}
    } catch (err: any) {
      setError('Помилка оновлення порядку: ' + err.message);
    }
  };

  const duplicateProduct = async (pIdx: number, event: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const originalProduct = products[pIdx];
    const maxSort = Math.max(...products.map(p => p.sort || 0), 0);
    
    const duplicatedProduct: WaterProduct = {
      ...originalProduct,
      id: undefined,
      name_ua: `${originalProduct.name_ua} (копія)`,
      name_ru: `${originalProduct.name_ru} (копія)`,
      sort: maxSort + 1,
    };
    
    const newProducts = [...products];
    newProducts.splice(pIdx + 1, 0, duplicatedProduct);
    setProducts(newProducts);
  };

  if (loading) return <div>Завантаження...</div>;
  if (error) return <div className="text-red-500">Помилка: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Управління водою</h2>
        <Button onClick={addProduct}>
          <Plus className="w-4 h-4 mr-2" />
          Додати продукт
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((p, pIdx) => (
          <Card key={pIdx} className="relative">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <CardTitle className="text-lg">
                  {p.name_ua || 'Новий продукт'} {p.sort && `(Позиція: ${p.sort})`}
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => moveProduct(pIdx, 'up', e)}
                    disabled={pIdx === 0}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => moveProduct(pIdx, 'down', e)}
                    disabled={pIdx === products.length - 1}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => duplicateProduct(pIdx, e)}
                    className="hidden md:inline-flex"
                  >
                    Дублювати
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => removeProduct(pIdx, e)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Об'єм</Label>
                  <Input value={p.volume ?? ''} onChange={(e) => updateProductField(pIdx, 'volume', e.target.value)} placeholder="5L" />
                </div>
                <div>
                  <Label>Ціна (₴)</Label>
                  <Input type="number" value={p.price ?? ''} onChange={(e) => updateProductField(pIdx, 'price', parseFloat(e.target.value) || 0)} placeholder="0" />
                </div>
              </div>

              <div>
                <Label>Зображення</Label>
                <MediaUploader
                  value={p.image_url || ''}
                  onChange={(url) => updateProductField(pIdx, 'image_url', url)}
                  accept="image/*"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`active-${pIdx}`}
                    checked={p.active !== false}
                    onCheckedChange={(checked) => updateProductField(pIdx, 'active', checked)}
                  />
                  <Label htmlFor={`active-${pIdx}`}>Активний</Label>
                </div>
              </div>

              {/* Features */}
              <div>
                <Label>Особливості (UA) - через кому</Label>
                <Input 
                  value={(p.features_ua || []).join(', ')} 
                  onChange={(e) => updateProductField(pIdx, 'features_ua', e.target.value.split(',').map(f => f.trim()).filter(f => f))} 
                  placeholder="Природна вода, Без хімічних добавок"
                />
              </div>

              <div>
                <Label>Особливості (RU) - через кому</Label>
                <Input 
                  value={(p.features_ru || []).join(', ')} 
                  onChange={(e) => updateProductField(pIdx, 'features_ru', e.target.value.split(',').map(f => f.trim()).filter(f => f))} 
                  placeholder="Природная вода, Без химических добавок"
                />
              </div>


              <div className="flex justify-end">
                <Button onClick={(e) => saveProduct(pIdx, e)}>
                  Зберегти
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
