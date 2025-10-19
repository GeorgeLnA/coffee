import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Point = {
  id?: number;
  sort?: number | null;
  name_ua?: string | null;
  name_ru?: string | null;
  address?: string | null;
  hours_ua?: string | null;
  hours_ru?: string | null;
};

export function ContactTradePointsForm() {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('contact_trade_points')
      .select('*')
      .order('sort', { ascending: true, nullsFirst: true });
    if (error) setError(error.message);
    setItems((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addItem = () => {
    setItems([
      ...items,
      { name_ua: '', name_ru: '', address: '', hours_ua: '', hours_ru: '', sort: (items.length ? (items[items.length - 1].sort || 0) + 1 : 1) },
    ]);
  };

  const updateField = (index: number, key: keyof Point, value: any) => {
    const next = [...items];
    (next[index] as any)[key] = value;
    setItems(next);
  };

  const saveAll = async () => {
    setError(null);
    const toInsert = items.filter((i) => !i.id);
    const toUpdate = items.filter((i) => i.id);
    if (toInsert.length) {
      const { error } = await supabase.from('contact_trade_points').insert(toInsert as any);
      if (error) return setError(error.message);
    }
    if (toUpdate.length) {
      for (const row of toUpdate) {
        const { error } = await supabase.from('contact_trade_points').update(row as any).eq('id', row.id);
        if (error) return setError(error.message);
      }
    }
    await load();
    try { await queryClient.invalidateQueries({ queryKey: ['contact-points'] }); } catch {}
    alert('Збережено!');
  };

  const removeItem = async (id?: number) => {
    setError(null);
    if (!id) { setItems(items.slice(0, -1)); return; }
    const { error } = await supabase.from('contact_trade_points').delete().eq('id', id);
    if (error) return setError(error.message);
    await load();
    try { await queryClient.invalidateQueries({ queryKey: ['contact-points'] }); } catch {}
  };

  if (loading) return <div>Завантаження…</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Торгові точки</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={addItem}>Додати точку</Button>
          <Button onClick={saveAll}>Зберегти всі</Button>
        </div>
        {error && <div className="text-destructive">{error}</div>}
        <div className="space-y-6">
          {items.map((item, idx) => (
            <div key={item.id ?? `new-${idx}`} className="grid grid-cols-1 md:grid-cols-3 gap-4 border rounded-md p-4">
              <div>
                <Label>Порядок</Label>
                <Input type="number" value={item.sort ?? ''} onChange={(e) => updateField(idx, 'sort', Number(e.target.value))} />
              </div>
              <div>
                <Label>Назва (UA)</Label>
                <Input value={item.name_ua || ''} onChange={(e) => updateField(idx, 'name_ua', e.target.value)} />
              </div>
              <div>
                <Label>Назва (RU)</Label>
                <Input value={item.name_ru || ''} onChange={(e) => updateField(idx, 'name_ru', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label>Адреса</Label>
                <Input value={item.address || ''} onChange={(e) => updateField(idx, 'address', e.target.value)} />
              </div>
              <div>
                <Label>Години (UA)</Label>
                <Input value={item.hours_ua || ''} onChange={(e) => updateField(idx, 'hours_ua', e.target.value)} />
              </div>
              <div>
                <Label>Часы (RU)</Label>
                <Input value={item.hours_ru || ''} onChange={(e) => updateField(idx, 'hours_ru', e.target.value)} />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <Button variant="destructive" onClick={() => removeItem(item.id)}>Видалити</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


