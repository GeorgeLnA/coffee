import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaUploader } from "@/components/ui/MediaUploader";

type WaterSettings = {
  id: number;
  why_title_ua: string | null;
  why_title_ru: string | null;
  why_desc_ua: string | null;
  why_desc_ru: string | null;
  benefit_natural_title_ua: string | null;
  benefit_natural_title_ru: string | null;
  benefit_natural_desc_ua: string | null;
  benefit_natural_desc_ru: string | null;
  benefit_tested_title_ua: string | null;
  benefit_tested_title_ru: string | null;
  benefit_tested_desc_ua: string | null;
  benefit_tested_desc_ru: string | null;
  benefit_quality_title_ua: string | null;
  benefit_quality_title_ru: string | null;
  benefit_quality_desc_ua: string | null;
  benefit_quality_desc_ru: string | null;
  cta_title_ua: string | null;
  cta_title_ru: string | null;
  cta_desc_ua: string | null;
  cta_desc_ru: string | null;
  cta_view_coffee_ua: string | null;
  cta_view_coffee_ru: string | null;
  cta_contact_ua: string | null;
  cta_contact_ru: string | null;
  test_pdf_url: string | null;
};

export function WaterSettingsForm() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<WaterSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('water_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      if (error) {
        setError(error.message);
      }
      setForm(data as any);
      setLoading(false);
    };
    load();
  }, []);

  const updateField = (field: keyof WaterSettings, value: any) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from('water_settings')
      .upsert({ ...form, updated_at: new Date().toISOString() });
    if (error) {
      setError(error.message);
    } else {
      queryClient.invalidateQueries({ queryKey: ['water_settings'] });
      alert('Налаштування збережено!');
    }
    setSaving(false);
  };

  if (loading) {
    return <div>Завантаження…</div>;
  }

  if (!form) {
    return <div>Помилка завантаження налаштувань</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Налаштування сторінки Вода</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Why Our Water Section */}
        <div className="space-y-4">
          <div className="font-semibold text-lg">Секція "Чому наша вода?"</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="why_title_ua">Заголовок (UA)</Label>
              <Input 
                id="why_title_ua" 
                value={form.why_title_ua || ""} 
                onChange={(e) => updateField("why_title_ua", e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="why_title_ru">Заголовок (RU)</Label>
              <Input 
                id="why_title_ru" 
                value={form.why_title_ru || ""} 
                onChange={(e) => updateField("why_title_ru", e.target.value)} 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="why_desc_ua">Опис (UA)</Label>
              <Input 
                id="why_desc_ua" 
                value={form.why_desc_ua || ""} 
                onChange={(e) => updateField("why_desc_ua", e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="why_desc_ru">Опис (RU)</Label>
              <Input 
                id="why_desc_ru" 
                value={form.why_desc_ru || ""} 
                onChange={(e) => updateField("why_desc_ru", e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* Benefit 1: Natural */}
        <div className="space-y-4">
          <div className="font-semibold text-lg">Перевага 1: Природна вода</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="benefit_natural_title_ua">Заголовок (UA)</Label>
              <Input 
                id="benefit_natural_title_ua" 
                value={form.benefit_natural_title_ua || ""} 
                onChange={(e) => updateField("benefit_natural_title_ua", e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="benefit_natural_title_ru">Заголовок (RU)</Label>
              <Input 
                id="benefit_natural_title_ru" 
                value={form.benefit_natural_title_ru || ""} 
                onChange={(e) => updateField("benefit_natural_title_ru", e.target.value)} 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="benefit_natural_desc_ua">Опис (UA)</Label>
              <Input 
                id="benefit_natural_desc_ua" 
                value={form.benefit_natural_desc_ua || ""} 
                onChange={(e) => updateField("benefit_natural_desc_ua", e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="benefit_natural_desc_ru">Опис (RU)</Label>
              <Input 
                id="benefit_natural_desc_ru" 
                value={form.benefit_natural_desc_ru || ""} 
                onChange={(e) => updateField("benefit_natural_desc_ru", e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* Benefit 2: Tested */}
        <div className="space-y-4">
          <div className="font-semibold text-lg">Перевага 2: Перевірена</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="benefit_tested_title_ua">Заголовок (UA)</Label>
              <Input 
                id="benefit_tested_title_ua" 
                value={form.benefit_tested_title_ua || ""} 
                onChange={(e) => updateField("benefit_tested_title_ua", e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="benefit_tested_title_ru">Заголовок (RU)</Label>
              <Input 
                id="benefit_tested_title_ru" 
                value={form.benefit_tested_title_ru || ""} 
                onChange={(e) => updateField("benefit_tested_title_ru", e.target.value)} 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="benefit_tested_desc_ua">Опис (UA)</Label>
              <Input 
                id="benefit_tested_desc_ua" 
                value={form.benefit_tested_desc_ua || ""} 
                onChange={(e) => updateField("benefit_tested_desc_ua", e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="benefit_tested_desc_ru">Опис (RU)</Label>
              <Input 
                id="benefit_tested_desc_ru" 
                value={form.benefit_tested_desc_ru || ""} 
                onChange={(e) => updateField("benefit_tested_desc_ru", e.target.value)} 
              />
            </div>
          </div>
          
          {/* PDF Upload */}
          <div>
            <MediaUploader
              label="PDF з доказами тестування"
              value={form.test_pdf_url}
              onChange={(url) => updateField("test_pdf_url", url || "")}
              accept=".pdf"
              folder="water"
              placeholder="https://...pdf або /path/to/file.pdf"
            />
          </div>
        </div>

        {/* Benefit 3: High Quality */}
        <div className="space-y-4">
          <div className="font-semibold text-lg">Перевага 3: Висока якість</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="benefit_quality_title_ua">Заголовок (UA)</Label>
              <Input 
                id="benefit_quality_title_ua" 
                value={form.benefit_quality_title_ua || ""} 
                onChange={(e) => updateField("benefit_quality_title_ua", e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="benefit_quality_title_ru">Заголовок (RU)</Label>
              <Input 
                id="benefit_quality_title_ru" 
                value={form.benefit_quality_title_ru || ""} 
                onChange={(e) => updateField("benefit_quality_title_ru", e.target.value)} 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="benefit_quality_desc_ua">Опис (UA)</Label>
              <Input 
                id="benefit_quality_desc_ua" 
                value={form.benefit_quality_desc_ua || ""} 
                onChange={(e) => updateField("benefit_quality_desc_ua", e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="benefit_quality_desc_ru">Опис (RU)</Label>
              <Input 
                id="benefit_quality_desc_ru" 
                value={form.benefit_quality_desc_ru || ""} 
                onChange={(e) => updateField("benefit_quality_desc_ru", e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="space-y-4">
          <div className="font-semibold text-lg">Секція CTA</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cta_title_ua">Заголовок (UA)</Label>
              <Input 
                id="cta_title_ua" 
                value={form.cta_title_ua || ""} 
                onChange={(e) => updateField("cta_title_ua", e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="cta_title_ru">Заголовок (RU)</Label>
              <Input 
                id="cta_title_ru" 
                value={form.cta_title_ru || ""} 
                onChange={(e) => updateField("cta_title_ru", e.target.value)} 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cta_desc_ua">Опис (UA)</Label>
              <Input 
                id="cta_desc_ua" 
                value={form.cta_desc_ua || ""} 
                onChange={(e) => updateField("cta_desc_ua", e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="cta_desc_ru">Опис (RU)</Label>
              <Input 
                id="cta_desc_ru" 
                value={form.cta_desc_ru || ""} 
                onChange={(e) => updateField("cta_desc_ru", e.target.value)} 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cta_view_coffee_ua">Кнопка "Переглянути каву" (UA)</Label>
              <Input 
                id="cta_view_coffee_ua" 
                value={form.cta_view_coffee_ua || ""} 
                onChange={(e) => updateField("cta_view_coffee_ua", e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="cta_view_coffee_ru">Кнопка "Переглянути каву" (RU)</Label>
              <Input 
                id="cta_view_coffee_ru" 
                value={form.cta_view_coffee_ru || ""} 
                onChange={(e) => updateField("cta_view_coffee_ru", e.target.value)} 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cta_contact_ua">Кнопка "Зв'язатися з нами" (UA)</Label>
              <Input 
                id="cta_contact_ua" 
                value={form.cta_contact_ua || ""} 
                onChange={(e) => updateField("cta_contact_ua", e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="cta_contact_ru">Кнопка "Зв'язатися з нами" (RU)</Label>
              <Input 
                id="cta_contact_ru" 
                value={form.cta_contact_ru || ""} 
                onChange={(e) => updateField("cta_contact_ru", e.target.value)} 
              />
            </div>
          </div>
        </div>

        {error && <div className="text-destructive">{error}</div>}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Збереження…' : 'Зберегти'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

