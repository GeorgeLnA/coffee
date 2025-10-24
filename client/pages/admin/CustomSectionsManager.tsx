import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MediaUploader } from "@/components/ui/MediaUploader";
import { DBPageSection } from "@/hooks/use-supabase";

const ANCHOR_OPTIONS = {
  home: [
    { value: 'after-season', label: 'Після сезонного блоку' },
    { value: 'after-video', label: 'Після відео' },
    { value: 'after-about', label: 'Після "Про нас"' },
    { value: 'after-cafes', label: 'Після кафе' },
    { value: 'after-news', label: 'Після новин' },
  ],
  office: [
    { value: 'after-hero', label: 'Після героя' },
    { value: 'after-supply', label: 'Після постачання' },
    { value: 'after-benefits', label: 'Після переваг' },
    { value: 'after-cta', label: 'Після CTA' },
  ],
  contact: [
    { value: 'after-contact', label: 'Після контактів' },
    { value: 'after-trade', label: 'Після торгових точок' },
  ],
};

export function CustomSectionsManager() {
  const queryClient = useQueryClient();
  const [sections, setSections] = useState<DBPageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<'home' | 'office' | 'contact'>('home');

  const loadSections = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('page_sections')
      .select('*')
      .eq('page', selectedPage)
      .order('anchor_key', { ascending: true })
      .order('sort', { ascending: true });
    if (error) setError(error.message);
    setSections((data as DBPageSection[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadSections();
  }, [selectedPage]);

  const addSection = () => {
    const newSection: Partial<DBPageSection> = {
      page: selectedPage,
      anchor_key: ANCHOR_OPTIONS[selectedPage][0]?.value || '',
      sort: sections.length,
      active: false,
      title_ua: '',
      title_ru: '',
      body_ua: '',
      body_ru: '',
      media_url: null,
      media_type: 'none',
      button_text_ua: '',
      button_text_ru: '',
      button_url: '',
      bg_color: '#ffffff',
      text_color: '#111827',
      accent_color: '#361c0c',
      layout: 'text-left',
      full_width: false,
    };
    setSections([...sections, newSection as DBPageSection]);
  };

  const updateSection = (index: number, field: keyof DBPageSection, value: any) => {
    const updated = [...sections];
    (updated[index] as any)[field] = value;
    setSections(updated);
  };

  const removeSection = async (id?: number) => {
    if (!id) {
      setSections(sections.slice(0, -1));
      return;
    }
    setError(null);
    const { error } = await supabase.from('page_sections').delete().eq('id', id);
    if (error) setError(error.message);
    await loadSections();
    try { await queryClient.invalidateQueries({ queryKey: ['page-sections', selectedPage] }); } catch {}
  };

  const hasRenderableContent = (s: Partial<DBPageSection>) => {
    return !!(
      (s.title_ua && s.title_ua.trim()) ||
      (s.title_ru && s.title_ru.trim()) ||
      (s.body_ua && s.body_ua.trim()) ||
      (s.body_ru && s.body_ru.trim()) ||
      (s.media_url && s.media_url.trim()) ||
      (s.button_text_ua && s.button_text_ua.trim()) ||
      (s.button_text_ru && s.button_text_ru.trim())
    );
  };

  const saveAll = async () => {
    setSaving(true);
    setError(null);
    
    // Only insert new sections that actually have some content
    const toInsert = sections.filter(s => !s.id && hasRenderableContent(s));
    const toUpdate = sections.filter(s => s.id);
    
    try {
      if (toInsert.length) {
        const { error } = await supabase.from('page_sections').insert(toInsert);
        if (error) throw error;
      }
      
      for (const section of toUpdate) {
        const { error } = await supabase
          .from('page_sections')
          .update(section)
          .eq('id', section.id);
        if (error) throw error;
      }
      
      await loadSections();
      try { await queryClient.invalidateQueries({ queryKey: ['page-sections', selectedPage] }); } catch {}
      alert('Збережено!');
    } catch (err: any) {
      setError(err.message);
    }
    
    setSaving(false);
  };

  if (loading) return <div>Завантаження…</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Кастомні секції</CardTitle>
        <div className="flex items-center gap-4">
          <Select value={selectedPage} onValueChange={(value: any) => setSelectedPage(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="home">Головна</SelectItem>
              <SelectItem value="office">Офіс</SelectItem>
              <SelectItem value="contact">Контакти</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={addSection}>Додати секцію</Button>
          <Button onClick={saveAll} disabled={saving}>
            {saving ? 'Збереження…' : 'Зберегти всі'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && <div className="text-destructive">{error}</div>}
        
        {sections.map((section, index) => (
          <div key={section.id || `new-${index}`} className="border rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Секція {index + 1}</h3>
              <Button variant="destructive" onClick={() => removeSection(section.id)}>
                Видалити
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Позиція</Label>
                <Select 
                  value={section.anchor_key} 
                  onValueChange={(value) => updateSection(index, 'anchor_key', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ANCHOR_OPTIONS[selectedPage].map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Порядок</Label>
                <Input 
                  type="number" 
                  value={section.sort || 0} 
                  onChange={(e) => updateSection(index, 'sort', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox 
                checked={section.active !== false} 
                onCheckedChange={(checked) => updateSection(index, 'active', checked)}
              />
              <Label>Активна</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Заголовок (UA)</Label>
                <Input 
                  value={section.title_ua || ''} 
                  onChange={(e) => updateSection(index, 'title_ua', e.target.value)}
                />
              </div>
              <div>
                <Label>Заголовок (RU)</Label>
                <Input 
                  value={section.title_ru || ''} 
                  onChange={(e) => updateSection(index, 'title_ru', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Текст (UA)</Label>
                <Textarea 
                  value={section.body_ua || ''} 
                  onChange={(e) => updateSection(index, 'body_ua', e.target.value)}
                />
              </div>
              <div>
                <Label>Текст (RU)</Label>
                <Textarea 
                  value={section.body_ru || ''} 
                  onChange={(e) => updateSection(index, 'body_ru', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Тип медіа</Label>
                <Select 
                  value={section.media_type || 'none'} 
                  onValueChange={(value) => updateSection(index, 'media_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Немає</SelectItem>
                    <SelectItem value="image">Зображення</SelectItem>
                    <SelectItem value="video">Відео</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {section.media_type !== 'none' && (
                <div>
                  <Label>Медіа URL</Label>
                  <MediaUploader
                    value={section.media_url}
                    onChange={(url) => updateSection(index, 'media_url', url)}
                    accept={section.media_type === 'image' ? 'image/*' : 'video/*'}
                    folder="custom-sections"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Кнопка (UA)</Label>
                <Input 
                  value={section.button_text_ua || ''} 
                  onChange={(e) => updateSection(index, 'button_text_ua', e.target.value)}
                />
              </div>
              <div>
                <Label>Кнопка (RU)</Label>
                <Input 
                  value={section.button_text_ru || ''} 
                  onChange={(e) => updateSection(index, 'button_text_ru', e.target.value)}
                />
              </div>
              <div>
                <Label>URL кнопки</Label>
                <Input 
                  value={section.button_url || ''} 
                  onChange={(e) => updateSection(index, 'button_url', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Фон</Label>
                <Input 
                  type="color" 
                  value={section.bg_color || '#ffffff'} 
                  onChange={(e) => updateSection(index, 'bg_color', e.target.value)}
                />
              </div>
              <div>
                <Label>Текст</Label>
                <Input 
                  type="color" 
                  value={section.text_color || '#111827'} 
                  onChange={(e) => updateSection(index, 'text_color', e.target.value)}
                />
              </div>
              <div>
                <Label>Акцент</Label>
                <Input 
                  type="color" 
                  value={section.accent_color || '#361c0c'} 
                  onChange={(e) => updateSection(index, 'accent_color', e.target.value)}
                />
              </div>
              <div>
                <Label>Макет</Label>
                <Select 
                  value={section.layout || 'text-left'} 
                  onValueChange={(value) => updateSection(index, 'layout', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-left">Текст зліва</SelectItem>
                    <SelectItem value="text-right">Текст справа</SelectItem>
                    <SelectItem value="center">По центру</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox 
                checked={section.full_width || false} 
                onCheckedChange={(checked) => updateSection(index, 'full_width', checked)}
              />
              <Label>Повна ширина</Label>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
