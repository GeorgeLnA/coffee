import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DeliverySettings } from "@/hooks/use-supabase";

export function DeliverySettingsForm() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<DeliverySettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('delivery_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      if (error) setError(error.message);
      setForm(
        (data as any) || {
          id: 1,
          courier_price: 200.00,
          free_delivery_threshold: 1500.00,
        }
      );
      setLoading(false);
    };
    load();
  }, []);

  const updateField = (key: keyof DeliverySettings, value: any) => {
    if (!form) return;
    setForm({ ...form, [key]: value } as DeliverySettings);
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    const payload: any = { ...form, id: 1 };

    const { error } = await supabase
      .from('delivery_settings')
      .upsert(payload, { onConflict: 'id' });
    setSaving(false);
    if (error) {
      setError(error.message);
    } else {
      try { await queryClient.invalidateQueries({ queryKey: ['delivery-settings'] }); } catch {}
      alert('Збережено!');
    }
  };

  if (loading || !form) return <div>Завантаження…</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Налаштування доставки</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>Вартість кур'єрської доставки (₴)</Label>
            <Input 
              type="number" 
              step="0.01"
              value={form.courier_price || ''} 
              onChange={(e) => updateField('courier_price', parseFloat(e.target.value) || 0)} 
            />
            <p className="text-sm text-gray-500 mt-1">Вартість кур'єрської доставки по Києву</p>
          </div>
          <div>
            <Label>Мінімальна сума для безкоштовної доставки (₴)</Label>
            <Input 
              type="number" 
              step="0.01"
              value={form.free_delivery_threshold || ''} 
              onChange={(e) => updateField('free_delivery_threshold', parseFloat(e.target.value) || 0)} 
            />
            <p className="text-sm text-gray-500 mt-1">При замовленні на суму від цього значення доставка буде безкоштовною</p>
          </div>
        </div>

        {error && <div className="text-destructive">{error}</div>}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Збереження…' : 'Зберегти'}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

