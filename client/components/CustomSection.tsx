import { useLanguage } from "@/contexts/LanguageContext";

type Props = {
  title_ua?: string | null;
  title_ru?: string | null;
  body_ua?: string | null;
  body_ru?: string | null;
  media_url?: string | null;
  media_type?: 'none' | 'image' | 'video' | null;
  button_text_ua?: string | null;
  button_text_ru?: string | null;
  button_url?: string | null;
  bg_color?: string | null;
  text_color?: string | null;
  accent_color?: string | null;
  layout?: 'text-left' | 'text-right' | 'center' | null;
  full_width?: boolean | null;
};

export function CustomSection(props: Props) {
  const { language } = useLanguage();
  const pick = (ua?: string | null, ru?: string | null, fallback: string = "") => (language === 'ru' ? (ru ?? ua ?? fallback) : (ua ?? ru ?? fallback));

  const bg = props.bg_color || '#ffffff';
  const text = props.text_color || '#111827';
  const accent = props.accent_color || '#361c0c';
  const layout = props.layout || 'text-left';

  const hasContent = Boolean(
    (props.title_ua && props.title_ua.trim()) ||
    (props.title_ru && props.title_ru.trim()) ||
    (props.body_ua && props.body_ua.trim()) ||
    (props.body_ru && props.body_ru.trim()) ||
    (props.media_url && props.media_url.trim()) ||
    (props.button_text_ua && props.button_text_ua.trim()) ||
    (props.button_text_ru && props.button_text_ru.trim())
  );
  if (!hasContent) return null;

  const content = (
    <div className="space-y-6">
      {(props.title_ua || props.title_ru) && (
        <h3 className="text-3xl md:text-5xl font-black font-coolvetica tracking-wider" style={{ color: text }}>
          {pick(props.title_ua, props.title_ru)}
        </h3>
      )}
      {(props.body_ua || props.body_ru) && (
        <p className="text-lg font-medium" style={{ color: text }}>
          {pick(props.body_ua, props.body_ru)}
        </p>
      )}
      {(props.button_text_ua || props.button_text_ru) && props.button_url && (
        <a href={props.button_url} className="inline-block px-8 py-4 border-2 font-black text-lg transition-all duration-300 hover:opacity-90" style={{ borderColor: accent, color: accent }}>
          {pick(props.button_text_ua, props.button_text_ru)}
        </a>
      )}
    </div>
  );

  const media = props.media_url ? (
    props.media_type === 'video' ? (
      <video src={props.media_url} controls className="w-full h-[400px] object-cover" />
    ) : (
      <img src={props.media_url} className="w-full h-[400px] object-cover" />
    )
  ) : null;

  const inner = (
    <div className="max-w-8xl mx-auto px-6 lg:px-8">
      {layout === 'center' ? (
        <div className="text-center">
          {media}
          <div className="mt-6">{content}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {layout === 'text-left' ? (
            <>
              <div>{content}</div>
              <div>{media}</div>
            </>
          ) : (
            <>
              <div>{media}</div>
              <div>{content}</div>
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <section className="py-20 relative z-10" style={{ backgroundColor: bg }}>
      {inner}
    </section>
  );
}


