import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OfficeSettings } from "@/hooks/use-supabase";
import { Checkbox } from "@/components/ui/checkbox";

export function OfficeSettingsForm() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<OfficeSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('office_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      if (error) {
        setError(error.message);
      }
      setForm(
        (data as any) || {
          id: 1,
          hero_title_ua: 'Кава для вашого офісу',
          hero_title_ru: 'Кофе для вашего офиса',
          hero_subtitle_ua: 'Ми постачаємо каву, кавомашини, воду та багаторазові чашки. Гнучкі знижки для компаній будь-якого розміру.',
          hero_subtitle_ru: 'Мы поставляем кофе, кофемашины, воду и многоразовые кружки. Гибкие скидки для компаний любого размера.',

          supply_title_ua: 'Що ми постачаємо',
          supply_title_ru: 'Что мы поставляем',
          supply_subtitle_ua: 'Комплексне забезпечення офісів усім необхідним для кавових перерв',
          supply_subtitle_ru: 'Комплексное обеспечение офисов всем для кофепауз',

          supply_coffee_title_ua: 'Кава',
          supply_coffee_title_ru: 'Кофе',
          supply_coffee_desc_ua: 'Свіжообсмажені зерна з підбором профілю під ваш смак',
          supply_coffee_desc_ru: 'Свежообжаренные зерна с подбором профиля под ваш вкус',
          supply_coffee_point1_ua: 'Single-origin та бленди на вибір',
          supply_coffee_point1_ru: 'Single-origin и бленды на выбор',
          supply_coffee_point2_ua: 'Рекомендовані профілі під еспресо/фільтр',
          supply_coffee_point2_ru: 'Рекомендованные профили под эспрессо/фильтр',
          supply_coffee_point3_ua: 'Опції підписки з автоматичною доставкою',
          supply_coffee_point3_ru: 'Подписка с автоматической доставкой',

          supply_machines_title_ua: 'Кавомашини',
          supply_machines_title_ru: 'Кофемашины',
          supply_machines_desc_ua: 'Оренда або продаж професійних кавомашин з сервісом',
          supply_machines_desc_ru: 'Аренда или продажа профессиональных кофемашин с сервисом',
          supply_machines_point1_ua: 'Встановлення та навчання персоналу',
          supply_machines_point1_ru: 'Установка и обучение персонала',
          supply_machines_point2_ua: 'Планове обслуговування та швидкий виїзд',
          supply_machines_point2_ru: 'Плановое обслуживание и быстрый выезд',
          supply_machines_point3_ua: 'Моделі для 10–200+ співробітників',
          supply_machines_point3_ru: 'Модели для 10–200+ сотрудников',

          supply_water_title_ua: 'Вода',
          supply_water_title_ru: 'Вода',
          supply_water_desc_ua: 'Питна вода для офісу з регулярною доставкою',
          supply_water_desc_ru: 'Питьевая вода для офиса с регулярной доставкой',
          supply_water_point1_ua: '5л та 20л формати',
          supply_water_point1_ru: '5л и 20л форматы',
          supply_water_point2_ua: 'Кулери та підставки за потреби',
          supply_water_point2_ru: 'Кулеры и подставки по запросу',

          supply_cups_title_ua: 'Багаторазові чашки',
          supply_cups_title_ru: 'Многоразовые кружки',
          supply_cups_desc_ua: 'Екологічні рішення для вашої команди',
          supply_cups_desc_ru: 'Экологичные решения для вашей команды',
          supply_cups_point1_ua: 'Паличкі для розмішування, цукор, молоко',
          supply_cups_point1_ru: 'Палочки для размешивания, сахар, молоко',
          supply_cups_point2_ua: 'Всі дрібні речі для ідеальної кави',
          supply_cups_point2_ru: 'Все мелочи для идеального кофе',

          discounts_badge_ua: 'Знижки для бізнесу',
          discounts_badge_ru: 'Скидки для бизнеса',
          discounts_title_ua: 'Гнучкі знижки для офісів',
          discounts_title_ru: 'Гибкие скидки для офисов',
          discounts_desc_ua: 'Чим вищий обсяг або частіше доставка — тим вища знижка. Нижче — орієнтири.',
          discounts_desc_ru: 'Чем выше объем или чаще доставка — тем выше скидка. Ниже — ориентиры.',
          tier1_title_ua: '—5%',
          tier1_title_ru: '—5%',
          tier1_desc_ua: 'до 10 кг кави/міс або 1–2 доставки',
          tier1_desc_ru: 'до 10 кг кофе/мес или 1–2 доставки',
          tier2_title_ua: '—10%',
          tier2_title_ru: '—10%',
          tier2_desc_ua: '10–25 кг кави/міс або 3–4 доставки',
          tier2_desc_ru: '10–25 кг кофе/мес или 3–4 доставки',
          tier3_title_ua: '—15%',
          tier3_title_ru: '—15%',
          tier3_desc_ua: '25+ кг кави/міс або щотижнева доставка',
          tier3_desc_ru: '25+ кг кофе/мес или еженедельная доставка',
          combos_title_ua: 'Комбо-пропозиції',
          combos_title_ru: 'Комбо-предложения',
          combos_point1_ua: 'Кава + машина: додаткова знижка на сервіс',
          combos_point1_ru: 'Кофе + машина: дополнительная скидка на сервис',
          combos_point2_ua: 'Кава + вода + чашки: безкоштовна перша доставка',
          combos_point2_ru: 'Кофе + вода + кружки: бесплатная первая доставка',

          benefits_delivery_title_ua: 'Доставка',
          benefits_delivery_title_ru: 'Доставка',
          benefits_delivery_desc_ua: 'Доставляємо у вікна 8:00–20:00, трекаємо статуси',
          benefits_delivery_desc_ru: 'Доставляем в окна 8:00–20:00, трекаем статусы',
          benefits_schedule_title_ua: 'Графік',
          benefits_schedule_title_ru: 'График',
          benefits_schedule_desc_ua: 'Щотижня/двічі на місяць/щомісяця — обираєте ви',
          benefits_schedule_desc_ru: 'Еженедельно/два раза в месяц/ежемесячно — выбираете вы',
          benefits_support_title_ua: 'Підтримка',
          benefits_support_title_ru: 'Поддержка',
          benefits_support_desc_ua: 'Реакція сервісу до 24 годин у робочі дні',
          benefits_support_desc_ru: 'Реакция сервиса до 24 часов в рабочие дни',

          cta_title_ua: 'Почнемо співпрацю',
          cta_title_ru: 'Начнем сотрудничество',
          cta_subtitle_ua: '5 хвилин на бриф — і надішлемо персональну пропозицію',
          cta_subtitle_ru: '5 минут на бриф — и пришлем персональное предложение',
          cta_call_text_ua: 'Зателефонувати',
          cta_call_text_ru: 'Позвонить',
          cta_email_text_ua: 'Написати на email',
          cta_email_text_ru: 'Написать на email',
          cta_phone: '+380501234567',
          cta_email: 'info@coffeemanifest.com',
        }
      );
      setLoading(false);
    };
    load();
  }, []);

  const updateField = (key: keyof OfficeSettings, value: string) => {
    if (!form) return;
    setForm({ ...form, [key]: value } as OfficeSettings);
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from('office_settings')
      .upsert({ ...form, id: 1 }, { onConflict: 'id' });
    if (error) setError(error.message);
    setSaving(false);
    if (!error) {
      alert('Збережено!');
      try { await queryClient.invalidateQueries({ queryKey: ['office-settings'] }); } catch {}
    }
  };

  if (loading || !form) return <div>Завантаження…</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Для офісу</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* HERO */}
        <div className="space-y-4">
          <div className="font-semibold">Шапка</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Заголовок (UA)</Label>
              <Input value={form.hero_title_ua || ''} onChange={(e) => updateField('hero_title_ua', e.target.value)} />
            </div>
            <div>
              <Label>Заголовок (RU)</Label>
              <Input value={form.hero_title_ru || ''} onChange={(e) => updateField('hero_title_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Підзаголовок (UA)</Label>
              <Input value={form.hero_subtitle_ua || ''} onChange={(e) => updateField('hero_subtitle_ua', e.target.value)} />
            </div>
            <div>
              <Label>Підзаголовок (RU)</Label>
              <Input value={form.hero_subtitle_ru || ''} onChange={(e) => updateField('hero_subtitle_ru', e.target.value)} />
            </div>
          </div>
        </div>

        {/* SUPPLY */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Постачання</div>
            <div className="flex items-center gap-2">
              <Checkbox id="hide_supply" checked={(form as any).hide_supply || false} onCheckedChange={(checked) => updateField('hide_supply' as any, Boolean(checked))} />
              <Label htmlFor="hide_supply">Сховати</Label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Заголовок (UA)</Label>
              <Input value={form.supply_title_ua || ''} onChange={(e) => updateField('supply_title_ua', e.target.value)} />
            </div>
            <div>
              <Label>Заголовок (RU)</Label>
              <Input value={form.supply_title_ru || ''} onChange={(e) => updateField('supply_title_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Підзаголовок (UA)</Label>
              <Input value={form.supply_subtitle_ua || ''} onChange={(e) => updateField('supply_subtitle_ua', e.target.value)} />
            </div>
            <div>
              <Label>Підзаголовок (RU)</Label>
              <Input value={form.supply_subtitle_ru || ''} onChange={(e) => updateField('supply_subtitle_ru', e.target.value)} />
            </div>
          </div>
        </div>

        {/* SUPPLY: Кава */}
        <div className="space-y-4">
          <div className="font-semibold">Кава</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Заголовок (UA)</Label>
              <Input value={form.supply_coffee_title_ua || ''} onChange={(e) => updateField('supply_coffee_title_ua', e.target.value)} />
            </div>
            <div>
              <Label>Заголовок (RU)</Label>
              <Input value={form.supply_coffee_title_ru || ''} onChange={(e) => updateField('supply_coffee_title_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Опис (UA)</Label>
              <Input value={form.supply_coffee_desc_ua || ''} onChange={(e) => updateField('supply_coffee_desc_ua', e.target.value)} />
            </div>
            <div>
              <Label>Опис (RU)</Label>
              <Input value={form.supply_coffee_desc_ru || ''} onChange={(e) => updateField('supply_coffee_desc_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Пункт 1 (UA)</Label>
              <Input value={form.supply_coffee_point1_ua || ''} onChange={(e) => updateField('supply_coffee_point1_ua', e.target.value)} />
            </div>
            <div>
              <Label>Пункт 1 (RU)</Label>
              <Input value={form.supply_coffee_point1_ru || ''} onChange={(e) => updateField('supply_coffee_point1_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Пункт 2 (UA)</Label>
              <Input value={form.supply_coffee_point2_ua || ''} onChange={(e) => updateField('supply_coffee_point2_ua', e.target.value)} />
            </div>
            <div>
              <Label>Пункт 2 (RU)</Label>
              <Input value={form.supply_coffee_point2_ru || ''} onChange={(e) => updateField('supply_coffee_point2_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Пункт 3 (UA)</Label>
              <Input value={form.supply_coffee_point3_ua || ''} onChange={(e) => updateField('supply_coffee_point3_ua', e.target.value)} />
            </div>
            <div>
              <Label>Пункт 3 (RU)</Label>
              <Input value={form.supply_coffee_point3_ru || ''} onChange={(e) => updateField('supply_coffee_point3_ru', e.target.value)} />
            </div>
          </div>
        </div>

        {/* SUPPLY: Кавомашини */}
        <div className="space-y-4">
          <div className="font-semibold">Кавомашини</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Заголовок (UA)</Label>
              <Input value={form.supply_machines_title_ua || ''} onChange={(e) => updateField('supply_machines_title_ua', e.target.value)} />
            </div>
            <div>
              <Label>Заголовок (RU)</Label>
              <Input value={form.supply_machines_title_ru || ''} onChange={(e) => updateField('supply_machines_title_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Опис (UA)</Label>
              <Input value={form.supply_machines_desc_ua || ''} onChange={(e) => updateField('supply_machines_desc_ua', e.target.value)} />
            </div>
            <div>
              <Label>Опис (RU)</Label>
              <Input value={form.supply_machines_desc_ru || ''} onChange={(e) => updateField('supply_machines_desc_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Пункт 1 (UA)</Label>
              <Input value={form.supply_machines_point1_ua || ''} onChange={(e) => updateField('supply_machines_point1_ua', e.target.value)} />
            </div>
            <div>
              <Label>Пункт 1 (RU)</Label>
              <Input value={form.supply_machines_point1_ru || ''} onChange={(e) => updateField('supply_machines_point1_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Пункт 2 (UA)</Label>
              <Input value={form.supply_machines_point2_ua || ''} onChange={(e) => updateField('supply_machines_point2_ua', e.target.value)} />
            </div>
            <div>
              <Label>Пункт 2 (RU)</Label>
              <Input value={form.supply_machines_point2_ru || ''} onChange={(e) => updateField('supply_machines_point2_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Пункт 3 (UA)</Label>
              <Input value={form.supply_machines_point3_ua || ''} onChange={(e) => updateField('supply_machines_point3_ua', e.target.value)} />
            </div>
            <div>
              <Label>Пункт 3 (RU)</Label>
              <Input value={form.supply_machines_point3_ru || ''} onChange={(e) => updateField('supply_machines_point3_ru', e.target.value)} />
            </div>
          </div>
        </div>

        {/* SUPPLY: Вода */}
        <div className="space-y-4">
          <div className="font-semibold">Вода</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Заголовок (UA)</Label>
              <Input value={form.supply_water_title_ua || ''} onChange={(e) => updateField('supply_water_title_ua', e.target.value)} />
            </div>
            <div>
              <Label>Заголовок (RU)</Label>
              <Input value={form.supply_water_title_ru || ''} onChange={(e) => updateField('supply_water_title_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Опис (UA)</Label>
              <Input value={form.supply_water_desc_ua || ''} onChange={(e) => updateField('supply_water_desc_ua', e.target.value)} />
            </div>
            <div>
              <Label>Опис (RU)</Label>
              <Input value={form.supply_water_desc_ru || ''} onChange={(e) => updateField('supply_water_desc_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Пункт 1 (UA)</Label>
              <Input value={form.supply_water_point1_ua || ''} onChange={(e) => updateField('supply_water_point1_ua', e.target.value)} />
            </div>
            <div>
              <Label>Пункт 1 (RU)</Label>
              <Input value={form.supply_water_point1_ru || ''} onChange={(e) => updateField('supply_water_point1_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Пункт 2 (UA)</Label>
              <Input value={form.supply_water_point2_ua || ''} onChange={(e) => updateField('supply_water_point2_ua', e.target.value)} />
            </div>
            <div>
              <Label>Пункт 2 (RU)</Label>
              <Input value={form.supply_water_point2_ru || ''} onChange={(e) => updateField('supply_water_point2_ru', e.target.value)} />
            </div>
          </div>
        </div>

        {/* SUPPLY: Багаторазові чашки */}
        <div className="space-y-4">
          <div className="font-semibold">Багаторазові чашки</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Заголовок (UA)</Label>
              <Input value={form.supply_cups_title_ua || ''} onChange={(e) => updateField('supply_cups_title_ua', e.target.value)} />
            </div>
            <div>
              <Label>Заголовок (RU)</Label>
              <Input value={form.supply_cups_title_ru || ''} onChange={(e) => updateField('supply_cups_title_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Опис (UA)</Label>
              <Input value={form.supply_cups_desc_ua || ''} onChange={(e) => updateField('supply_cups_desc_ua', e.target.value)} />
            </div>
            <div>
              <Label>Опис (RU)</Label>
              <Input value={form.supply_cups_desc_ru || ''} onChange={(e) => updateField('supply_cups_desc_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Пункт 1 (UA)</Label>
              <Input value={form.supply_cups_point1_ua || ''} onChange={(e) => updateField('supply_cups_point1_ua', e.target.value)} />
            </div>
            <div>
              <Label>Пункт 1 (RU)</Label>
              <Input value={form.supply_cups_point1_ru || ''} onChange={(e) => updateField('supply_cups_point1_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Пункт 2 (UA)</Label>
              <Input value={form.supply_cups_point2_ua || ''} onChange={(e) => updateField('supply_cups_point2_ua', e.target.value)} />
            </div>
            <div>
              <Label>Пункт 2 (RU)</Label>
              <Input value={form.supply_cups_point2_ru || ''} onChange={(e) => updateField('supply_cups_point2_ru', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Знижки та переваги */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Знижки та переваги</div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox id="hide_discounts" checked={(form as any).hide_discounts || false} onCheckedChange={(checked) => updateField('hide_discounts' as any, Boolean(checked))} />
                <Label htmlFor="hide_discounts">Сховати знижки</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="hide_benefits" checked={(form as any).hide_benefits || false} onCheckedChange={(checked) => updateField('hide_benefits' as any, Boolean(checked))} />
                <Label htmlFor="hide_benefits">Сховати переваги</Label>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Бейдж (UA)</Label>
              <Input value={form.discounts_badge_ua || ''} onChange={(e) => updateField('discounts_badge_ua', e.target.value)} />
            </div>
            <div>
              <Label>Бейдж (RU)</Label>
              <Input value={form.discounts_badge_ru || ''} onChange={(e) => updateField('discounts_badge_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Заголовок (UA)</Label>
              <Input value={form.discounts_title_ua || ''} onChange={(e) => updateField('discounts_title_ua', e.target.value)} />
            </div>
            <div>
              <Label>Заголовок (RU)</Label>
              <Input value={form.discounts_title_ru || ''} onChange={(e) => updateField('discounts_title_ru', e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Опис (UA)</Label>
            <Input value={form.discounts_desc_ua || ''} onChange={(e) => updateField('discounts_desc_ua', e.target.value)} />
          </div>
          <div>
            <Label>Опис (RU)</Label>
            <Input value={form.discounts_desc_ru || ''} onChange={(e) => updateField('discounts_desc_ru', e.target.value)} />
          </div>

          {/* Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tier 1 Назва (UA)</Label>
              <Input value={form.tier1_title_ua || ''} onChange={(e) => updateField('tier1_title_ua', e.target.value)} />
              <Label>Tier 1 Опис (UA)</Label>
              <Input value={form.tier1_desc_ua || ''} onChange={(e) => updateField('tier1_desc_ua', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tier 2 Назва (UA)</Label>
              <Input value={form.tier2_title_ua || ''} onChange={(e) => updateField('tier2_title_ua', e.target.value)} />
              <Label>Tier 2 Опис (UA)</Label>
              <Input value={form.tier2_desc_ua || ''} onChange={(e) => updateField('tier2_desc_ua', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tier 3 Назва (UA)</Label>
              <Input value={form.tier3_title_ua || ''} onChange={(e) => updateField('tier3_title_ua', e.target.value)} />
              <Label>Tier 3 Опис (UA)</Label>
              <Input value={form.tier3_desc_ua || ''} onChange={(e) => updateField('tier3_desc_ua', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tier 1 Назва (RU)</Label>
              <Input value={form.tier1_title_ru || ''} onChange={(e) => updateField('tier1_title_ru', e.target.value)} />
              <Label>Tier 1 Опис (RU)</Label>
              <Input value={form.tier1_desc_ru || ''} onChange={(e) => updateField('tier1_desc_ru', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tier 2 Назва (RU)</Label>
              <Input value={form.tier2_title_ru || ''} onChange={(e) => updateField('tier2_title_ru', e.target.value)} />
              <Label>Tier 2 Опис (RU)</Label>
              <Input value={form.tier2_desc_ru || ''} onChange={(e) => updateField('tier2_desc_ru', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tier 3 Назва (RU)</Label>
              <Input value={form.tier3_title_ru || ''} onChange={(e) => updateField('tier3_title_ru', e.target.value)} />
              <Label>Tier 3 Опис (RU)</Label>
              <Input value={form.tier3_desc_ru || ''} onChange={(e) => updateField('tier3_desc_ru', e.target.value)} />
            </div>
          </div>

          {/* Combos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Комбо Заголовок (UA)</Label>
              <Input value={form.combos_title_ua || ''} onChange={(e) => updateField('combos_title_ua', e.target.value)} />
            </div>
            <div>
              <Label>Комбо Заголовок (RU)</Label>
              <Input value={form.combos_title_ru || ''} onChange={(e) => updateField('combos_title_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Комбо Пункт 1 (UA)</Label>
              <Input value={form.combos_point1_ua || ''} onChange={(e) => updateField('combos_point1_ua', e.target.value)} />
            </div>
            <div>
              <Label>Комбо Пункт 1 (RU)</Label>
              <Input value={form.combos_point1_ru || ''} onChange={(e) => updateField('combos_point1_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Комбо Пункт 2 (UA)</Label>
              <Input value={form.combos_point2_ua || ''} onChange={(e) => updateField('combos_point2_ua', e.target.value)} />
            </div>
            <div>
              <Label>Комбо Пункт 2 (RU)</Label>
              <Input value={form.combos_point2_ru || ''} onChange={(e) => updateField('combos_point2_ru', e.target.value)} />
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Доставка (UA)</Label>
              <Input value={form.benefits_delivery_title_ua || ''} onChange={(e) => updateField('benefits_delivery_title_ua', e.target.value)} />
              <Label className="mt-2">Опис (UA)</Label>
              <Input value={form.benefits_delivery_desc_ua || ''} onChange={(e) => updateField('benefits_delivery_desc_ua', e.target.value)} />
            </div>
            <div>
              <Label>Доставка (RU)</Label>
              <Input value={form.benefits_delivery_title_ru || ''} onChange={(e) => updateField('benefits_delivery_title_ru', e.target.value)} />
              <Label className="mt-2">Опис (RU)</Label>
              <Input value={form.benefits_delivery_desc_ru || ''} onChange={(e) => updateField('benefits_delivery_desc_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Графік (UA)</Label>
              <Input value={form.benefits_schedule_title_ua || ''} onChange={(e) => updateField('benefits_schedule_title_ua', e.target.value)} />
              <Label className="mt-2">Опис (UA)</Label>
              <Input value={form.benefits_schedule_desc_ua || ''} onChange={(e) => updateField('benefits_schedule_desc_ua', e.target.value)} />
            </div>
            <div>
              <Label>Графік (RU)</Label>
              <Input value={form.benefits_schedule_title_ru || ''} onChange={(e) => updateField('benefits_schedule_title_ru', e.target.value)} />
              <Label className="mt-2">Опис (RU)</Label>
              <Input value={form.benefits_schedule_desc_ru || ''} onChange={(e) => updateField('benefits_schedule_desc_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Підтримка (UA)</Label>
              <Input value={form.benefits_support_title_ua || ''} onChange={(e) => updateField('benefits_support_title_ua', e.target.value)} />
              <Label className="mt-2">Опис (UA)</Label>
              <Input value={form.benefits_support_desc_ua || ''} onChange={(e) => updateField('benefits_support_desc_ua', e.target.value)} />
            </div>
            <div>
              <Label>Підтримка (RU)</Label>
              <Input value={form.benefits_support_title_ru || ''} onChange={(e) => updateField('benefits_support_title_ru', e.target.value)} />
              <Label className="mt-2">Опис (RU)</Label>
              <Input value={form.benefits_support_desc_ru || ''} onChange={(e) => updateField('benefits_support_desc_ru', e.target.value)} />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">CTA</div>
            <div className="flex items-center gap-2">
              <Checkbox id="hide_cta" checked={(form as any).hide_cta || false} onCheckedChange={(checked) => updateField('hide_cta' as any, Boolean(checked))} />
              <Label htmlFor="hide_cta">Сховати</Label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Заголовок (UA)</Label>
              <Input value={form.cta_title_ua || ''} onChange={(e) => updateField('cta_title_ua', e.target.value)} />
            </div>
            <div>
              <Label>Заголовок (RU)</Label>
              <Input value={form.cta_title_ru || ''} onChange={(e) => updateField('cta_title_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Підзаголовок (UA)</Label>
              <Input value={form.cta_subtitle_ua || ''} onChange={(e) => updateField('cta_subtitle_ua', e.target.value)} />
            </div>
            <div>
              <Label>Підзаголовок (RU)</Label>
              <Input value={form.cta_subtitle_ru || ''} onChange={(e) => updateField('cta_subtitle_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Кнопка (UA)</Label>
              <Input value={form.cta_call_text_ua || ''} onChange={(e) => updateField('cta_call_text_ua', e.target.value)} />
            </div>
            <div>
              <Label>Кнопка (RU)</Label>
              <Input value={form.cta_call_text_ru || ''} onChange={(e) => updateField('cta_call_text_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Email (UA/RU текст)</Label>
              <Input value={form.cta_email_text_ua || ''} onChange={(e) => updateField('cta_email_text_ua', e.target.value)} />
            </div>
            <div>
              <Label>Email (RU текст)</Label>
              <Input value={form.cta_email_text_ru || ''} onChange={(e) => updateField('cta_email_text_ru', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Телефон</Label>
              <Input value={form.cta_phone || ''} onChange={(e) => updateField('cta_phone', e.target.value)} />
            </div>
            <div>
              <Label>Email адреса</Label>
              <Input value={form.cta_email || ''} onChange={(e) => updateField('cta_email', e.target.value)} />
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


