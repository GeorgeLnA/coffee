import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ContactSettings } from "@/hooks/use-supabase";
import { Checkbox } from "@/components/ui/checkbox";

export function ContactSettingsForm() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ContactSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      if (error) setError(error.message);
      setForm(
        (data as any) || {
          id: 1,
          title_ua: 'Наші контакти',
          title_ru: 'Наши контакты',
          phone_title_ua: 'Телефон',
          phone_title_ru: 'Телефон',
          phone1: '+380 67 000 24 18',
          phone_desc_ua: 'Зв\'яжіться з нами для замовлення',
          phone_desc_ru: 'Свяжитесь с нами для заказа',
          email_title_ua: 'Email',
          email_title_ru: 'Email',
          email1: 'info@coffeemanifest.com',
          email_desc_ua: 'Напишіть нам на пошту',
          email_desc_ru: 'Напишите нам на почту',
          trading_title_ua: 'Торгові точки',
          trading_title_ru: 'Торговые точки',
          trading_desc_ua: 'Наші фізичні точки продажу',
          trading_desc_ru: 'Наши физические точки продажи',
        }
      );
      setLoading(false);
    };
    load();
  }, []);

  const updateField = (key: keyof ContactSettings, value: string) => {
    if (!form) return;
    setForm({ ...form, [key]: value } as ContactSettings);
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    const payload: any = { ...form, id: 1 };
    // Optional: clear deprecated fields so they don't resurface
    payload.phone2 = null;
    payload.email2 = null;
    payload.hours_title_ua = null;
    payload.hours_title_ru = null;
    payload.hours_details_ua = null;
    payload.hours_details_ru = null;
    payload.hours_desc_ua = null;
    payload.hours_desc_ru = null;

    const { error } = await supabase
      .from('contact_settings')
      .upsert(payload, { onConflict: 'id' });
    setSaving(false);
    if (error) {
      setError(error.message);
    } else {
      try { await queryClient.invalidateQueries({ queryKey: ['contact-settings'] }); } catch {}
      alert('Збережено!');
    }
  };

  if (loading || !form) return <div>Завантаження…</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Контакти — налаштування</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Titles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Загальні налаштування</div>
            <div className="flex items-center gap-2">
              <Checkbox id="hide_contact_info" checked={(form as any).hide_contact_info || false} onCheckedChange={(checked) => setForm({ ...(form as any), hide_contact_info: Boolean(checked) } as any)} />
              <Label htmlFor="hide_contact_info">Сховати контакти</Label>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Заголовок (UA)</Label>
            <Input value={form.title_ua || ''} onChange={(e) => updateField('title_ua', e.target.value)} />
          </div>
          <div>
            <Label>Заголовок (RU)</Label>
            <Input value={form.title_ru || ''} onChange={(e) => updateField('title_ru', e.target.value)} />
          </div>
        </div>

        {/* Phone (single) */}
        <div className="space-y-3">
          <div className="font-semibold">Телефон</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Заголовок (UA)</Label>
              <Input value={form.phone_title_ua || ''} onChange={(e) => updateField('phone_title_ua', e.target.value)} />
            </div>
            <div>
              <Label>Заголовок (RU)</Label>
              <Input value={form.phone_title_ru || ''} onChange={(e) => updateField('phone_title_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Телефон</Label>
              <Input value={form.phone1 || ''} onChange={(e) => updateField('phone1', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Опис (UA)</Label>
              <Input value={form.phone_desc_ua || ''} onChange={(e) => updateField('phone_desc_ua', e.target.value)} />
            </div>
            <div>
              <Label>Опис (RU)</Label>
              <Input value={form.phone_desc_ru || ''} onChange={(e) => updateField('phone_desc_ru', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Email (single) */}
        <div className="space-y-3">
          <div className="font-semibold">Електронна пошта</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Заголовок (UA)</Label>
              <Input value={form.email_title_ua || ''} onChange={(e) => updateField('email_title_ua', e.target.value)} />
            </div>
            <div>
              <Label>Заголовок (RU)</Label>
              <Input value={form.email_title_ru || ''} onChange={(e) => updateField('email_title_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input value={form.email1 || ''} onChange={(e) => updateField('email1', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Опис (UA)</Label>
              <Input value={form.email_desc_ua || ''} onChange={(e) => updateField('email_desc_ua', e.target.value)} />
            </div>
            <div>
              <Label>Опис (RU)</Label>
              <Input value={form.email_desc_ru || ''} onChange={(e) => updateField('email_desc_ru', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Trading header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Торгові точки — заголовки</div>
            <div className="flex items-center gap-2">
              <Checkbox id="hide_trade_points" checked={(form as any).hide_trade_points || false} onCheckedChange={(checked) => setForm({ ...(form as any), hide_trade_points: Boolean(checked) } as any)} />
              <Label htmlFor="hide_trade_points">Сховати торгові точки</Label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Заголовок (UA)</Label>
              <Input value={form.trading_title_ua || ''} onChange={(e) => updateField('trading_title_ua', e.target.value)} />
            </div>
            <div>
              <Label>Заголовок (RU)</Label>
              <Input value={form.trading_title_ru || ''} onChange={(e) => updateField('trading_title_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Опис (UA)</Label>
              <Input value={form.trading_desc_ua || ''} onChange={(e) => updateField('trading_desc_ua', e.target.value)} />
            </div>
            <div>
              <Label>Опис (RU)</Label>
              <Input value={form.trading_desc_ru || ''} onChange={(e) => updateField('trading_desc_ru', e.target.value)} />
            </div>
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


