import { useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MediaUploaderProps {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  accept: string; // e.g. 'image/*' or 'video/*'
  folder: string; // e.g. 'homepage', 'featured'
  placeholder?: string;
}

export function MediaUploader({ label, value, onChange, accept, folder, placeholder }: MediaUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const file = files[0];
    setError(null);
    setUploading(true);
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${folder}/${Date.now()}-${sanitizedName}`;
      const { error: uploadError } = await supabase.storage.from('media').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('media').getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (e: any) {
      setError(e?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    await handleFiles(e.dataTransfer.files);
  };

  const onBrowse = () => fileInputRef.current?.click();

  const isImage = (url?: string | null) => {
    if (!url) return false;
    return /(\.png|\.jpg|\.jpeg|\.webp|\.gif|\.avif)$/i.test(url);
  };
  const isVideo = (url?: string | null) => {
    if (!url) return false;
    return /(\.mp4|\.webm|\.ogg)$/i.test(url);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className={`border rounded-md p-4 bg-white ${dragOver ? 'border-blue-500' : 'border-dashed'} `}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={onBrowse} disabled={uploading}>
            {uploading ? 'Завантаження…' : 'Обрати файл'}
          </Button>
          <span className="text-sm text-muted-foreground">Перетягніть сюди або оберіть файл ({accept})</span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {error && <div className="text-destructive mt-2 text-sm">{error}</div>}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${label}-link`}>Або вставте посилання</Label>
        <Input
          id={`${label}-link`}
          placeholder={placeholder || 'https://...'}
          value={value || ''}
          onChange={(e) => onChange(e.target.value || null)}
        />
      </div>

      {value && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Попередній перегляд</div>
          <div className="rounded-md overflow-hidden border">
            {isImage(value) && (
              <img src={value} alt="preview" className="w-full h-48 object-cover" />
            )}
            {isVideo(value) && (
              <video className="w-full" controls src={value} />
            )}
            {!isImage(value) && !isVideo(value) && (
              <div className="p-3 text-sm">{value}</div>
            )}
          </div>
          <div>
            <Button type="button" variant="destructive" onClick={() => onChange(null)}>Очистити</Button>
          </div>
        </div>
      )}
    </div>
  );
}


