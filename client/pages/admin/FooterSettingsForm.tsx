import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FooterSettings } from "@/hooks/use-supabase";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export function FooterSettingsForm() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FooterSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('footer_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      if (error) setError(error.message);
      setForm(
        (data as any) || {
          id: 1,
          description_ua: '',
          description_ru: '',
          facebook_url: '#',
          instagram_url: '#',
          telegram_url: '#',
          viber_url: '#',
          whatsapp_url: '#',
          show_facebook: true,
          show_instagram: true,
          show_telegram: true,
          show_viber: true,
          show_whatsapp: true,
          quick_links_title_ua: 'Швидкі посилання',
          quick_links_title_ru: 'Быстрые ссылки',
          contact_title_ua: 'Зв\'яжіться з нами',
          contact_title_ru: 'Свяжитесь с нами',
          phone_label_ua: 'Телефон',
          phone_label_ru: 'Телефон',
          phone_number: '067 000 24 18',
          phone_desc_ua: 'Дзвоніть будь-коли',
          phone_desc_ru: 'Звоните в любое время',
          email_label_ua: 'Email',
          email_label_ru: 'Email',
          email_address: 'info@coffeemanifest.com',
          email_desc_ua: 'Загальні питання',
          email_desc_ru: 'Общие вопросы',
          show_phone: true,
          show_email: true,
          show_address: false,
          copyright_text_ua: '© 2025 THE COFFEE MANIFEST. Усі права захищені.',
          copyright_text_ru: '© 2025 THE COFFEE MANIFEST. Все права защищены.',
          made_by_text: 'Site Credit - Lead and Allure',
          made_by_url: 'https://leadandallure.com',
        }
      );
      setLoading(false);
    };
    load();
  }, []);

  const updateField = (key: keyof FooterSettings, value: any) => {
    if (!form) return;
    setForm({ ...form, [key]: value } as FooterSettings);
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    const payload: any = { ...form, id: 1 };

    const { error } = await supabase
      .from('footer_settings')
      .upsert(payload, { onConflict: 'id' });
    setSaving(false);
    if (error) {
      setError(error.message);
    } else {
      try { await queryClient.invalidateQueries({ queryKey: ['footer-settings'] }); } catch {}
      alert('Збережено!');
    }
  };

  if (loading || !form) return <div>Завантаження…</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Футер — налаштування</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Brand Description */}
        <div className="space-y-4">
          <div className="font-semibold">Опис бренду</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Опис (UA)</Label>
              <Input value={form.description_ua || ''} onChange={(e) => updateField('description_ua', e.target.value)} />
            </div>
            <div>
              <Label>Опис (RU)</Label>
              <Input value={form.description_ru || ''} onChange={(e) => updateField('description_ru', e.target.value)} />
            </div>
          </div>
        </div>

        <Separator />

        {/* Social Links */}
        <div className="space-y-4">
          <div className="font-semibold">Соціальні мережі та месенджери</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox id="show_facebook" checked={form.show_facebook !== false} onCheckedChange={(checked) => updateField('show_facebook', checked)} />
                <Label htmlFor="show_facebook">Показати Facebook</Label>
              </div>
              <Input 
                placeholder="Facebook URL" 
                value={form.facebook_url || ''} 
                onChange={(e) => updateField('facebook_url', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox id="show_instagram" checked={form.show_instagram !== false} onCheckedChange={(checked) => updateField('show_instagram', checked)} />
                <Label htmlFor="show_instagram">Показати Instagram</Label>
              </div>
              <Input 
                placeholder="Instagram URL" 
                value={form.instagram_url || ''} 
                onChange={(e) => updateField('instagram_url', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox id="show_telegram" checked={form.show_telegram !== false} onCheckedChange={(checked) => updateField('show_telegram', checked)} />
                <Label htmlFor="show_telegram">Показати Telegram</Label>
              </div>
              <Input 
                placeholder="Telegram URL" 
                value={form.telegram_url || ''} 
                onChange={(e) => updateField('telegram_url', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox id="show_viber" checked={form.show_viber !== false} onCheckedChange={(checked) => updateField('show_viber', checked)} />
                <Label htmlFor="show_viber">Показати Viber</Label>
              </div>
              <Input 
                placeholder="Viber URL" 
                value={form.viber_url || ''} 
                onChange={(e) => updateField('viber_url', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox id="show_whatsapp" checked={form.show_whatsapp !== false} onCheckedChange={(checked) => updateField('show_whatsapp', checked)} />
                <Label htmlFor="show_whatsapp">Показати WhatsApp</Label>
              </div>
              <Input 
                placeholder="WhatsApp URL" 
                value={form.whatsapp_url || ''} 
                onChange={(e) => updateField('whatsapp_url', e.target.value)} 
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Quick Links */}
        <div className="space-y-4">
          <div className="font-semibold">Швидкі посилання</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Заголовок (UA)</Label>
              <Input value={form.quick_links_title_ua || ''} onChange={(e) => updateField('quick_links_title_ua', e.target.value)} />
            </div>
            <div>
              <Label>Заголовок (RU)</Label>
              <Input value={form.quick_links_title_ru || ''} onChange={(e) => updateField('quick_links_title_ru', e.target.value)} />
            </div>
          </div>
        </div>

        <Separator />

        {/* Contact Section */}
        <div className="space-y-4">
          <div className="font-semibold">Секція контактів</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Заголовок (UA)</Label>
              <Input value={form.contact_title_ua || ''} onChange={(e) => updateField('contact_title_ua', e.target.value)} />
            </div>
            <div>
              <Label>Заголовок (RU)</Label>
              <Input value={form.contact_title_ru || ''} onChange={(e) => updateField('contact_title_ru', e.target.value)} />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Checkbox id="show_phone" checked={form.show_phone !== false} onCheckedChange={(checked) => updateField('show_phone', checked)} />
              <Label htmlFor="show_phone" className="font-semibold">Показати телефон</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Мітка (UA)</Label>
                <Input value={form.phone_label_ua || ''} onChange={(e) => updateField('phone_label_ua', e.target.value)} />
              </div>
              <div>
                <Label>Мітка (RU)</Label>
                <Input value={form.phone_label_ru || ''} onChange={(e) => updateField('phone_label_ru', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Номер телефону</Label>
              <Input value={form.phone_number || ''} onChange={(e) => updateField('phone_number', e.target.value)} />
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

          {/* Email */}
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Checkbox id="show_email" checked={form.show_email !== false} onCheckedChange={(checked) => updateField('show_email', checked)} />
              <Label htmlFor="show_email" className="font-semibold">Показати email</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Мітка (UA)</Label>
                <Input value={form.email_label_ua || ''} onChange={(e) => updateField('email_label_ua', e.target.value)} />
              </div>
              <div>
                <Label>Мітка (RU)</Label>
                <Input value={form.email_label_ru || ''} onChange={(e) => updateField('email_label_ru', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Email адреса</Label>
              <Input value={form.email_address || ''} onChange={(e) => updateField('email_address', e.target.value)} />
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
        </div>

        {error && <div className="text-destructive">{error}</div>}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Збереження…' : 'Зберегти'}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

