import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LegalPage } from "@/hooks/use-supabase";
import { Separator } from "@/components/ui/separator";

type PageType = 'delivery' | 'terms' | 'returns';

const pageLabels: Record<PageType, { ua: string; ru: string }> = {
  delivery: { ua: 'Доставка та оплата', ru: 'Доставка и оплата' },
  terms: { ua: 'Умови використання', ru: 'Условия использования' },
  returns: { ua: 'Політика повернення', ru: 'Политика возврата' },
};

export function LegalPagesForm({ pageType }: { pageType: PageType }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<LegalPage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('legal_pages')
        .select('*')
        .eq('page_type', pageType)
        .maybeSingle();
      if (error) setError(error.message);
      setForm(
        (data as any) || {
          id: null,
          page_type: pageType,
          title_ua: pageLabels[pageType].ua,
          title_ru: pageLabels[pageType].ru,
          content_ua: '',
          content_ru: '',
        }
      );
      setLoading(false);
    };
    load();
  }, [pageType]);

  const updateField = (key: keyof LegalPage, value: any) => {
    if (!form) return;
    setForm({ ...form, [key]: value } as LegalPage);
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    
    const payload: any = { ...form, page_type: pageType };
    
    const { error } = await supabase
      .from('legal_pages')
      .upsert(payload, { onConflict: 'page_type' });
    setSaving(false);
    if (error) {
      setError(error.message);
    } else {
      try { await queryClient.invalidateQueries({ queryKey: ['legal-page', pageType] }); } catch {}
      alert('Збережено!');
    }
  };

  if (loading || !form) return <div>Завантаження…</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{pageLabels[pageType].ua}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Headers */}
        <div className="space-y-4">
          <div className="font-semibold">Заголовки</div>
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
        </div>

        <Separator />

        {/* Content */}
        <div className="space-y-4">
          <div className="font-semibold">Контент</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Контент (UA)</Label>
              <Textarea 
                value={form.content_ua || ''} 
                onChange={(e) => updateField('content_ua', e.target.value)}
                className="min-h-[400px]"
                placeholder="Введіть текст сторінки..."
              />
            </div>
            <div>
              <Label>Контент (RU)</Label>
              <Textarea 
                value={form.content_ru || ''} 
                onChange={(e) => updateField('content_ru', e.target.value)}
                className="min-h-[400px]"
                placeholder="Введите текст страницы..."
              />
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

