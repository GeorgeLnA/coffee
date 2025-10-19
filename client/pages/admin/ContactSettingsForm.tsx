import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ContactSettings } from "@/hooks/use-supabase";

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
          phone1: '+380 50 123 45 67',
          phone2: '+380 44 123 45 67',
          phone_desc_ua: 'Зв\'яжіться з нами для замовлення',
          phone_desc_ru: 'Свяжитесь с нами для заказа',
          email_title_ua: 'Email',
          email_title_ru: 'Email',
          email1: 'info@coffeemanifest.com',
          email2: 'orders@coffeemanifest.com',
          email_desc_ua: 'Напишіть нам на пошту',
          email_desc_ru: 'Напишите нам на почту',
          hours_title_ua: 'Графік роботи',
          hours_title_ru: 'График работы',
          hours_details_ua: 'Пн-Пт: 8:00 - 20:00, Сб-Нд: 9:00 - 18:00',
          hours_details_ru: 'Пн-Пт: 8:00 - 20:00, Сб-Вс: 9:00 - 18:00',
          hours_desc_ua: 'Коли ми працюємо',
          hours_desc_ru: 'Когда мы работаем',
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
    const { error } = await supabase
      .from('contact_settings')
      .upsert({ ...form, id: 1 }, { onConflict: 'id' });
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

        {/* Phones */}
        <div className="space-y-3">
          <div className="font-semibold">Телефони</div>
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
              <Label>Телефон 1</Label>
              <Input value={form.phone1 || ''} onChange={(e) => updateField('phone1', e.target.value)} />
            </div>
            <div>
              <Label>Телефон 2</Label>
              <Input value={form.phone2 || ''} onChange={(e) => updateField('phone2', e.target.value)} />
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

        {/* Emails */}
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
              <Label>Email 1</Label>
              <Input value={form.email1 || ''} onChange={(e) => updateField('email1', e.target.value)} />
            </div>
            <div>
              <Label>Email 2</Label>
              <Input value={form.email2 || ''} onChange={(e) => updateField('email2', e.target.value)} />
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

        {/* Hours */}
        <div className="space-y-3">
          <div className="font-semibold">Графік роботи</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Заголовок (UA)</Label>
              <Input value={form.hours_title_ua || ''} onChange={(e) => updateField('hours_title_ua', e.target.value)} />
            </div>
            <div>
              <Label>Заголовок (RU)</Label>
              <Input value={form.hours_title_ru || ''} onChange={(e) => updateField('hours_title_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Деталі (UA)</Label>
              <Input value={form.hours_details_ua || ''} onChange={(e) => updateField('hours_details_ua', e.target.value)} />
            </div>
            <div>
              <Label>Деталі (RU)</Label>
              <Input value={form.hours_details_ru || ''} onChange={(e) => updateField('hours_details_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Опис (UA)</Label>
              <Input value={form.hours_desc_ua || ''} onChange={(e) => updateField('hours_desc_ua', e.target.value)} />
            </div>
            <div>
              <Label>Опис (RU)</Label>
              <Input value={form.hours_desc_ru || ''} onChange={(e) => updateField('hours_desc_ru', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Trading header */}
        <div className="space-y-3">
          <div className="font-semibold">Торгові точки — заголовки</div>
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


