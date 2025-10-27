import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "lucide-react";

type FilterOption = {
  id?: number;
  filter_type: 'origin' | 'roast';
  value: string;
  value_ru: string | null;
  sort: number | null;
  active: boolean;
};

export function FilterOptionsManager() {
  const [origins, setOrigins] = useState<FilterOption[]>([]);
  const [roasts, setRoasts] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('filter_options')
        .select('*')
        .order('filter_type', { ascending: true })
        .order('sort', { ascending: true, nullsFirst: true });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        const originsData = (data || []).filter(f => f.filter_type === 'origin');
        const roastsData = (data || []).filter(f => f.filter_type === 'roast');
        
        if (originsData.length === 0 && roastsData.length === 0) {
          // Seed default values
          await seedDefaults();
          const { data: reseededData } = await supabase
            .from('filter_options')
            .select('*')
            .order('filter_type', { ascending: true })
            .order('sort', { ascending: true, nullsFirst: true });
          const reseededOrigins = (reseededData || []).filter(f => f.filter_type === 'origin');
          const reseededRoasts = (reseededData || []).filter(f => f.filter_type === 'roast');
          setOrigins(reseededOrigins);
          setRoasts(reseededRoasts);
        } else {
          setOrigins(originsData);
          setRoasts(roastsData);
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const seedDefaults = async () => {
    const defaultOrigins = [
      { filter_type: 'origin', value: 'Колумбія', value_ru: 'Колумбия', sort: 1, active: true },
      { filter_type: 'origin', value: 'Ефіопія', value_ru: 'Эфиопия', sort: 2, active: true },
      { filter_type: 'origin', value: 'Бразилія', value_ru: 'Бразилия', sort: 3, active: true },
      { filter_type: 'origin', value: 'Кенія', value_ru: 'Кения', sort: 4, active: true },
      { filter_type: 'origin', value: 'Гватемала', value_ru: 'Гватемала', sort: 5, active: true },
      { filter_type: 'origin', value: 'Ямайка', value_ru: 'Ямайка', sort: 6, active: true },
      { filter_type: 'origin', value: 'Перу', value_ru: 'Перу', sort: 7, active: true },
      { filter_type: 'origin', value: 'Коста-Рика', value_ru: 'Коста-Рика', sort: 8, active: true },
      { filter_type: 'origin', value: 'Індонезія', value_ru: 'Индонезия', sort: 9, active: true },
      { filter_type: 'origin', value: 'Гаваї', value_ru: 'Гавайи', sort: 10, active: true },
    ];

    const defaultRoasts = [
      { filter_type: 'roast', value: 'Світле', value_ru: 'Светлое', sort: 1, active: true },
      { filter_type: 'roast', value: 'Середнє', value_ru: 'Среднее', sort: 2, active: true },
      { filter_type: 'roast', value: 'Темне', value_ru: 'Темное', sort: 3, active: true },
    ];

    await supabase.from('filter_options').insert([...defaultOrigins, ...defaultRoasts]);
  };

  const addOrigin = () => {
    const nextSort = origins.length > 0 ? Math.max(...origins.map(o => o.sort || 0)) + 1 : 1;
    setOrigins([...origins, { filter_type: 'origin', value: '', value_ru: '', sort: nextSort, active: true }]);
  };

  const addRoast = () => {
    const nextSort = roasts.length > 0 ? Math.max(...roasts.map(r => r.sort || 0)) + 1 : 1;
    setRoasts([...roasts, { filter_type: 'roast', value: '', value_ru: '', sort: nextSort, active: true }]);
  };

  const updateOrigin = (index: number, field: 'value' | 'value_ru', val: string) => {
    const next = [...origins];
    (next[index] as any)[field] = val;
    setOrigins(next);
  };

  const updateRoast = (index: number, field: 'value' | 'value_ru', val: string) => {
    const next = [...roasts];
    (next[index] as any)[field] = val;
    setRoasts(next);
  };

  const removeOrigin = (index: number, id?: number) => {
    if (id) {
      setDeletedIds((prev) => Array.from(new Set([...prev, id])));
    }
    setOrigins(origins.filter((_, i) => i !== index));
  };

  const removeRoast = (index: number, id?: number) => {
    if (id) {
      setDeletedIds((prev) => Array.from(new Set([...prev, id])));
    }
    setRoasts(roasts.filter((_, i) => i !== index));
  };

  const toggleOriginActive = (index: number) => {
    const next = [...origins];
    next[index].active = !next[index].active;
    setOrigins(next);
  };

  const toggleRoastActive = (index: number) => {
    const next = [...roasts];
    next[index].active = !next[index].active;
    setRoasts(next);
  };

  const saveAll = async () => {
    setError(null);
    
    try {
      // Get all items to save
      const allItems = [...origins, ...roasts];
      
      // Filter out items with empty values
      const validItems = allItems.filter(item => item.value.trim() !== '');
      
      // Split into inserts and updates
      const toInsert = validItems.filter((i) => !i.id);
      const toUpdate = validItems.filter((i) => i.id);

      // Insert new items and capture IDs
      if (toInsert.length) {
        const { error: insertError } = await supabase
          .from('filter_options')
          .insert(toInsert)
          .select('*');
        if (insertError) {
          setError(insertError.message);
          return;
        }
      }

      // Update existing items
      if (toUpdate.length) {
        for (const item of toUpdate) {
          const { error: updateError } = await supabase
            .from('filter_options')
            .update({ value: item.value, value_ru: item.value_ru, sort: item.sort, active: item.active })
            .eq('id', item.id);
          if (updateError) {
            setError(updateError.message);
            return;
          }
        }
      }

      // Process deletions explicitly requested by user
      if (deletedIds.length) {
        const { error: deleteError } = await supabase
          .from('filter_options')
          .delete()
          .in('id', deletedIds);
        if (deleteError) {
          setError(deleteError.message);
          return;
        }
        setDeletedIds([]);
      }

      await load();
      alert('Збережено!');
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <div>Завантаження…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Фільтри кави</h2>
        <Button onClick={saveAll}>Зберегти всі</Button>
      </div>

      {error && <div className="text-destructive">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Origins */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Країни походження</CardTitle>
              <Button variant="outline" size="sm" onClick={addOrigin}>
                <Plus className="w-4 h-4 mr-2" />
                Додати
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {origins.map((item, idx) => (
              <div key={item.id ?? `new-${idx}`} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={item.value}
                    onChange={(e) => updateOrigin(idx, 'value', e.target.value)}
                    placeholder="Українська назва"
                    className="flex-1"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeOrigin(idx, item.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={item.value_ru || ''}
                    onChange={(e) => updateOrigin(idx, 'value_ru', e.target.value)}
                    placeholder="Російська назва"
                    className="flex-1"
                  />
                  <div className="flex items-center gap-2 border-l pl-2">
                    <Checkbox
                      checked={item.active}
                      onCheckedChange={() => toggleOriginActive(idx)}
                    />
                    <Label className="text-sm">Активний</Label>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Roasts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Рівні обробки</CardTitle>
              <Button variant="outline" size="sm" onClick={addRoast}>
                <Plus className="w-4 h-4 mr-2" />
                Додати
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {roasts.map((item, idx) => (
              <div key={item.id ?? `new-${idx}`} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={item.value}
                    onChange={(e) => updateRoast(idx, 'value', e.target.value)}
                    placeholder="Українська назва"
                    className="flex-1"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeRoast(idx, item.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={item.value_ru || ''}
                    onChange={(e) => updateRoast(idx, 'value_ru', e.target.value)}
                    placeholder="Російська назва"
                    className="flex-1"
                  />
                  <div className="flex items-center gap-2 border-l pl-2">
                    <Checkbox
                      checked={item.active}
                      onCheckedChange={() => toggleRoastActive(idx)}
                    />
                    <Label className="text-sm">Активний</Label>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

