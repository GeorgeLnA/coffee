import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaUploader } from "@/components/ui/MediaUploader";

type FP = {
  id?: number;
  sort?: number | null;
  status?: string | null;
  title_ua: string;
  description_ua: string | null;
  title_ru: string;
  description_ru: string | null;
  image_url: string | null;
  hover_image_url: string | null;
  link_url: string | null;
};

export function FeaturedProductsManager() {
  const [items, setItems] = useState<FP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const MAX_ITEMS = 3;
  const hasUnsaved = items.some((i) => !i.id);
  const canAdd = items.length < MAX_ITEMS && !hasUnsaved;

  const getNextSort = () => {
    const maxSort = items.reduce((max, i) => Math.max(max, i.sort ?? 0), 0);
    return maxSort + 1;
  };

  const seedDefaults = async () => {
    const defaults: FP[] = [
      {
        sort: 1,
        status: 'published',
        title_ua: 'COLOMBIA SUPREMO',
        title_ru: 'COLOMBIA SUPREMO',
        description_ua: '',
        description_ru: 'Премиум кофейные зерна с нотами сливы и шоколада',
        image_url: '/250-g_Original.PNG',
        hover_image_url: '/woocommerce-placeholder_Original.PNG',
        link_url: '/coffee',
      },
      {
        sort: 2,
        status: 'published',
        title_ua: 'ETHIOPIA GUJI',
        title_ru: 'ETHIOPIA GUJI',
        description_ua: '',
        description_ru: 'Органический кофе с нотами черной смородины',
        image_url: '/250-g_Original.PNG',
        hover_image_url: '/woocommerce-placeholder_Original.PNG',
        link_url: '/coffee',
      },
      {
        sort: 3,
        status: 'published',
        title_ua: 'BRAZIL SANTOS',
        title_ru: 'BRAZIL SANTOS',
        description_ua: '',
        description_ru: 'Классический бразильский кофе с мягким вкусом',
        image_url: '/250-g_Original.PNG',
        hover_image_url: '/woocommerce-placeholder_Original.PNG',
        link_url: '/coffee',
      },
    ];
    await supabase.from('featured_products').insert(defaults);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('featured_products')
      .select('*')
      .order('sort', { ascending: true, nullsFirst: true })
      .limit(MAX_ITEMS);
    if (error) setError(error.message);
    if (!error && (!data || data.length === 0)) {
      try {
        await seedDefaults();
        const { data: seeded } = await supabase
          .from('featured_products')
          .select('*')
          .order('sort', { ascending: true, nullsFirst: true })
          .limit(MAX_ITEMS);
        setItems((seeded as any) || []);
      } catch (e: any) {
        setItems([]);
      }
    } else {
      setItems((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addItem = () => {
    if (!canAdd) return;
    setItems([
      ...items,
      {
        title_ua: '',
        description_ua: '',
        title_ru: '',
        description_ru: '',
        image_url: '',
        hover_image_url: '',
        link_url: '',
        sort: getNextSort(),
        status: 'published',
      },
    ]);
  };

  const duplicateItem = (index: number) => {
    if (items.length >= MAX_ITEMS) return;
    const base = items[index];
    const copy: FP = {
      sort: getNextSort(),
      status: base.status ?? 'published',
      title_ua: base.title_ua || '',
      description_ua: base.description_ua ?? '',
      title_ru: base.title_ru || '',
      description_ru: base.description_ru ?? '',
      image_url: base.image_url ?? '',
      hover_image_url: base.hover_image_url ?? '',
      link_url: base.link_url ?? '',
    };
    setItems([...items, copy]);
  };

  const updateField = (index: number, key: keyof FP, value: any) => {
    const next = [...items];
    (next[index] as any)[key] = value;
    setItems(next);
  };

  const saveAll = async () => {
    setError(null);
    // Split into inserts and updates
    const toInsert = items.filter((i) => !i.id);
    const toUpdate = items.filter((i) => i.id);

    // Enforce UI-side cap as a safeguard
    const existingCount = toUpdate.length;
    if (existingCount + toInsert.length > MAX_ITEMS) {
      setError(`Максимум ${MAX_ITEMS} слайди. Видаліть зайві перед збереженням.`);
      return;
    }

    if (toInsert.length) {
      const { error } = await supabase.from('featured_products').insert(toInsert as any);
      if (error) return setError(error.message);
    }
    if (toUpdate.length) {
      for (const row of toUpdate) {
        const { error } = await supabase
          .from('featured_products')
          .update(row as any)
          .eq('id', row.id);
        if (error) return setError(error.message);
      }
    }
    await load();
    alert('Збережено!');
    try { await queryClient.invalidateQueries({ queryKey: ['featured-slides'] }); } catch {}
  };

  const removeItem = async (id?: number) => {
    setError(null);
    if (!id) {
      // remove unsaved item from UI
      setItems(items.slice(0, -1));
      return;
    }
    const { error } = await supabase.from('featured_products').delete().eq('id', id);
    if (error) return setError(error.message);
    await load();
    try { await queryClient.invalidateQueries({ queryKey: ['featured-slides'] }); } catch {}
  };

  if (loading) return <div>Завантаження…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Сезонні слайди</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addItem} disabled={!canAdd}>Додати слайд</Button>
          <Button onClick={saveAll}>Зберегти всі</Button>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">Максимум {MAX_ITEMS} слайди.</div>

      {error && <div className="text-destructive">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item, idx) => (
          <Card key={item.id ?? `new-${idx}`}>
            <CardHeader>
              <CardTitle>Слайд #{idx + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Порядок</Label>
                  <Input type="number" value={item.sort ?? ''} onChange={(e) => updateField(idx, 'sort', Number(e.target.value))} />
                </div>
                <div className="md:col-span-2">
                  <Label>Статус</Label>
                  <Input value={item.status ?? ''} onChange={(e) => updateField(idx, 'status', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Заголовок (UA)</Label>
                  <Input value={item.title_ua} onChange={(e) => updateField(idx, 'title_ua', e.target.value)} />
                </div>
                <div>
                  <Label>Заголовок (RU)</Label>
                  <Input value={item.title_ru} onChange={(e) => updateField(idx, 'title_ru', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Опис (UA)</Label>
                  <Input value={item.description_ua ?? ''} onChange={(e) => updateField(idx, 'description_ua', e.target.value)} />
                </div>
                <div>
                  <Label>Опис (RU)</Label>
                  <Input value={item.description_ru ?? ''} onChange={(e) => updateField(idx, 'description_ru', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MediaUploader
                  label="Зображення"
                  value={item.image_url}
                  onChange={(url) => updateField(idx, 'image_url', url)}
                  accept="image/*"
                  folder="featured"
                  placeholder="https://...jpg"
                />
                <MediaUploader
                  label="Зображення (hover)"
                  value={item.hover_image_url}
                  onChange={(url) => updateField(idx, 'hover_image_url', url)}
                  accept="image/*"
                  folder="featured"
                  placeholder="https://...jpg"
                />
              </div>
              <div>
                <Label>Посилання</Label>
                <Input placeholder="/coffee" value={item.link_url ?? ''} onChange={(e) => updateField(idx, 'link_url', e.target.value)} />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => duplicateItem(idx)} disabled={items.length >= MAX_ITEMS}>Дублювати</Button>
                <Button variant="destructive" onClick={() => removeItem(item.id)}>Видалити</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


