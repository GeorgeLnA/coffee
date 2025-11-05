import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaUploader } from "@/components/ui/MediaUploader";
import { Checkbox } from "@/components/ui/checkbox";

type HomeSettings = {
  id: number;
  hero_title_line1_ua: string | null;
  hero_title_line2_ua: string | null;
  hero_title_line3_ua: string | null;
  hero_title_line1_ru: string | null;
  hero_title_line2_ru: string | null;
  hero_title_line3_ru: string | null;
  hero_cta_text_ua: string | null;
  hero_cta_text_ru: string | null;
  hero_cta_link: string | null;
  hero_video_url: string | null;
  season_title_ua: string | null;
  season_title_ru: string | null;
  season_cta_text_ua: string | null;
  season_cta_text_ru: string | null;
  season_cta_link: string | null;
  video_title1_ua: string | null;
  video_title2_ua: string | null;
  video_desc_ua: string | null;
  video_feature1_ua: string | null;
  video_feature2_ua: string | null;
  video_feature3_ua: string | null;
  video_title1_ru: string | null;
  video_title2_ru: string | null;
  video_desc_ru: string | null;
  video_feature1_ru: string | null;
  video_feature2_ru: string | null;
  video_feature3_ru: string | null;
  video_url: string | null;
  about_badge_ua: string | null;
  about_badge_ru: string | null;
  about_title_ua: string | null;
  about_title_ru: string | null;
  about_desc1_ua: string | null;
  about_desc2_ua: string | null;
  about_desc1_ru: string | null;
  about_desc2_ru: string | null;
  about_cta_text_ua: string | null;
  about_cta_text_ru: string | null;
  about_cta_link: string | null;
  about_image_url: string | null;
};

export function HomeSettingsForm() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<HomeSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("homepage_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (error) {
        setError(error.message);
      } else {
        setForm(
          (data as any) || {
            id: 1,
            hero_title_line1_ua: "THE",
            hero_title_line2_ua: "COFFEE",
            hero_title_line3_ua: "MANIFEST",
            hero_title_line1_ru: "THE",
            hero_title_line2_ru: "COFFEE",
            hero_title_line3_ru: "MANIFEST",
            hero_cta_text_ua: "ЗАМОВИТИ КАВУ",
            hero_cta_text_ru: "ЗАКАЗАТЬ КОФЕ",
            hero_cta_link: "/coffee",
            hero_video_url: null,
            season_title_ua: "ХІТИ ЦЬОГО СЕЗОНУ",
            season_title_ru: "ХИТЫ ЭТОГО СЕЗОНА",
            season_cta_text_ua: "ДІЗНАТИСЯ БІЛЬШЕ",
            season_cta_text_ru: "УЗНАТЬ БОЛЬШЕ",
            season_cta_link: "/coffee",
            video_title1_ua: "СТВОРЕНО",
            video_title2_ua: "ДОСКОНАЛІСТЬ",
            video_desc_ua: "",
            video_feature1_ua: "",
            video_feature2_ua: "",
            video_feature3_ua: "",
            video_title1_ru: "СОЗДАНО",
            video_title2_ru: "СОВЕРШЕНСТВО",
            video_desc_ru: "",
            video_feature1_ru: "",
            video_feature2_ru: "",
            video_feature3_ru: "",
            video_url: null,
            about_badge_ua: "Про нас",
            about_badge_ru: "О нас",
            about_title_ua: "THE COFFEE MANIFEST",
            about_title_ru: "THE COFFEE MANIFEST",
            about_desc1_ua: "",
            about_desc2_ua: "",
            about_desc1_ru: "",
            about_desc2_ru: "",
            about_cta_text_ua: "ДІЗНАТИСЯ БІЛЬШЕ",
            about_cta_text_ru: "УЗНАТЬ БОЛЬШЕ",
            about_cta_link: "/about",
            about_image_url: null,
          }
        );
      }
      setLoading(false);
    };
    load();
  }, []);

  const updateField = (key: keyof HomeSettings, value: any) => {
    if (!form) return;
    setForm({ ...form, [key]: value });
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    
    console.log('Saving form data:', form);
    
    try {
      // Try to insert or update using upsert
      const { data, error } = await supabase
        .from("homepage_settings")
        .upsert({ ...form, id: 1 }, { onConflict: "id" })
        .select();
      
      console.log('Save result:', { data, error });
      
      if (error) {
        setError(error.message);
        console.error('Save error:', error);
      } else {
        console.log('Save successful!');
        // Invalidate and refetch to ensure live updates
        await queryClient.invalidateQueries({ queryKey: ['homepage-settings'] });
        await queryClient.refetchQueries({ queryKey: ['homepage-settings'] });
        // Optionally show success message
        alert('Settings saved successfully!');
      }
    } catch (err: any) {
      console.error('Save exception:', err);
      setError(err.message || 'Failed to save');
    }
    
    setSaving(false);
  };

  if (loading || !form) {
    return <div>Завантаження…</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Головна сторінка</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">

        {/* SEASON */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Сезонний блок</div>
            <div className="flex items-center gap-2">
              <Checkbox id="hide_season" checked={!!form.hide_season} onCheckedChange={(checked) => updateField('hide_season' as any, Boolean(checked))} />
              <Label htmlFor="hide_season">Сховати</Label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="season_title_ua">Заголовок (UA)</Label>
              <Input id="season_title_ua" value={form.season_title_ua || ""} onChange={(e) => updateField("season_title_ua", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="season_title_ru">Заголовок (RU)</Label>
              <Input id="season_title_ru" value={form.season_title_ru || ""} onChange={(e) => updateField("season_title_ru", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="season_cta_text_ua">Текст кнопки (UA)</Label>
              <Input id="season_cta_text_ua" value={form.season_cta_text_ua || ""} onChange={(e) => updateField("season_cta_text_ua", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="season_cta_text_ru">Текст кнопки (RU)</Label>
              <Input id="season_cta_text_ru" value={form.season_cta_text_ru || ""} onChange={(e) => updateField("season_cta_text_ru", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="season_cta_link">Посилання</Label>
              <Input id="season_cta_link" value={form.season_cta_link || ""} onChange={(e) => updateField("season_cta_link", e.target.value)} />
            </div>
          </div>
        </div>

        {/* VIDEO UA */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Відео (UA)</div>
            <div className="flex items-center gap-2">
              <Checkbox id="hide_video" checked={!!form.hide_video} onCheckedChange={(checked) => updateField('hide_video' as any, Boolean(checked))} />
              <Label htmlFor="hide_video">Сховати</Label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="video_title1_ua">Заголовок 1</Label>
              <Input id="video_title1_ua" value={form.video_title1_ua || ""} onChange={(e) => updateField("video_title1_ua", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="video_title2_ua">Заголовок 2</Label>
              <Input id="video_title2_ua" value={form.video_title2_ua || ""} onChange={(e) => updateField("video_title2_ua", e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="video_desc_ua">Опис</Label>
            <Input id="video_desc_ua" value={form.video_desc_ua || ""} onChange={(e) => updateField("video_desc_ua", e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="video_feature1_ua">Особливість 1</Label>
              <Input id="video_feature1_ua" value={form.video_feature1_ua || ""} onChange={(e) => updateField("video_feature1_ua", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="video_feature2_ua">Особливість 2</Label>
              <Input id="video_feature2_ua" value={form.video_feature2_ua || ""} onChange={(e) => updateField("video_feature2_ua", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="video_feature3_ua">Особливість 3</Label>
              <Input id="video_feature3_ua" value={form.video_feature3_ua || ""} onChange={(e) => updateField("video_feature3_ua", e.target.value)} />
            </div>
          </div>
        </div>

        {/* VIDEO RU */}
        <div className="space-y-4">
          <div className="font-semibold">Відео (RU)</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="video_title1_ru">Заголовок 1</Label>
              <Input id="video_title1_ru" value={form.video_title1_ru || ""} onChange={(e) => updateField("video_title1_ru", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="video_title2_ru">Заголовок 2</Label>
              <Input id="video_title2_ru" value={form.video_title2_ru || ""} onChange={(e) => updateField("video_title2_ru", e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="video_desc_ru">Опис</Label>
            <Input id="video_desc_ru" value={form.video_desc_ru || ""} onChange={(e) => updateField("video_desc_ru", e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="video_feature1_ru">Особливість 1</Label>
              <Input id="video_feature1_ru" value={form.video_feature1_ru || ""} onChange={(e) => updateField("video_feature1_ru", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="video_feature2_ru">Особливість 2</Label>
              <Input id="video_feature2_ru" value={form.video_feature2_ru || ""} onChange={(e) => updateField("video_feature2_ru", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="video_feature3_ru">Особливість 3</Label>
              <Input id="video_feature3_ru" value={form.video_feature3_ru || ""} onChange={(e) => updateField("video_feature3_ru", e.target.value)} />
            </div>
          </div>
        </div>

        {/* VIDEO MEDIA */}
        <MediaUploader
          label="Відео (URL або завантаження)"
          value={form.video_url}
          onChange={(url) => updateField("video_url", url || "")}
          accept="video/*"
          folder="homepage"
          placeholder="https://...mp4"
        />

        {/* ABOUT */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Про нас</div>
            <div className="flex items-center gap-2">
              <Checkbox id="hide_about" checked={!!form.hide_about} onCheckedChange={(checked) => updateField('hide_about' as any, Boolean(checked))} />
              <Label htmlFor="hide_about">Сховати</Label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="about_badge_ua">Бейдж (UA)</Label>
              <Input id="about_badge_ua" value={form.about_badge_ua || ""} onChange={(e) => updateField("about_badge_ua", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="about_badge_ru">Бейдж (RU)</Label>
              <Input id="about_badge_ru" value={form.about_badge_ru || ""} onChange={(e) => updateField("about_badge_ru", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="about_title_ua">Заголовок (UA)</Label>
              <Input id="about_title_ua" value={form.about_title_ua || ""} onChange={(e) => updateField("about_title_ua", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="about_title_ru">Заголовок (RU)</Label>
              <Input id="about_title_ru" value={form.about_title_ru || ""} onChange={(e) => updateField("about_title_ru", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="about_desc1_ua">Опис 1 (UA)</Label>
              <Input id="about_desc1_ua" value={form.about_desc1_ua || ""} onChange={(e) => updateField("about_desc1_ua", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="about_desc1_ru">Опис 1 (RU)</Label>
              <Input id="about_desc1_ru" value={form.about_desc1_ru || ""} onChange={(e) => updateField("about_desc1_ru", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="about_desc2_ua">Опис 2 (UA)</Label>
              <Input id="about_desc2_ua" value={form.about_desc2_ua || ""} onChange={(e) => updateField("about_desc2_ua", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="about_desc2_ru">Опис 2 (RU)</Label>
              <Input id="about_desc2_ru" value={form.about_desc2_ru || ""} onChange={(e) => updateField("about_desc2_ru", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="about_cta_text_ua">Текст кнопки (UA)</Label>
              <Input id="about_cta_text_ua" value={form.about_cta_text_ua || ""} onChange={(e) => updateField("about_cta_text_ua", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="about_cta_text_ru">Текст кнопки (RU)</Label>
              <Input id="about_cta_text_ru" value={form.about_cta_text_ru || ""} onChange={(e) => updateField("about_cta_text_ru", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="about_cta_link">Посилання</Label>
              <Input id="about_cta_link" value={form.about_cta_link || ""} onChange={(e) => updateField("about_cta_link", e.target.value)} />
            </div>
            <div>
              <MediaUploader
                label="Зображення (URL або завантаження)"
                value={form.about_image_url}
                onChange={(url) => updateField("about_image_url", url || "")}
                accept="image/*"
                folder="about"
                placeholder="https://...jpg"
              />
            </div>
          </div>
        </div>

        {/* CAFES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Наші кафе</div>
            <div className="flex items-center gap-2">
              <Checkbox id="hide_cafes" checked={!!form.hide_cafes} onCheckedChange={(checked) => updateField('hide_cafes' as any, Boolean(checked))} />
              <Label htmlFor="hide_cafes">Сховати</Label>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Секція з картою та списком кафе
          </div>
        </div>

        {/* NEWS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Новини</div>
            <div className="flex items-center gap-2">
              <Checkbox id="hide_news" checked={!!form.hide_news} onCheckedChange={(checked) => updateField('hide_news' as any, Boolean(checked))} />
              <Label htmlFor="hide_news">Сховати</Label>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Секція з новинними статтями
          </div>
        </div>

        {error && <div className="text-destructive">{error}</div>}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Збереження…" : "Зберегти"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}



