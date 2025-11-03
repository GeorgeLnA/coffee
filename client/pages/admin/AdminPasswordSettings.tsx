import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";

const ADMIN_PASSWORD_KEY = "admin_password";

export function AdminPasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const getCurrentStoredPassword = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", ADMIN_PASSWORD_KEY)
        .single();

      if (error) {
        // If table doesn't exist or no record, return default
        if (error.code === "PGRST116" || error.message.includes("could not find")) {
          return "mcroaster"; // Default password
        }
        throw error;
      }

      return data?.value || "mcroaster";
    } catch (e) {
      console.error("Error fetching password:", e);
      return "mcroaster"; // Fallback to default
    }
  };

  const handleChangePassword = async () => {
    setError(null);
    setSuccess(false);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Заповніть всі поля");
      return;
    }

    if (newPassword.length < 6) {
      setError("Новий пароль повинен містити мінімум 6 символів");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Нові паролі не співпадають");
      return;
    }

    setLoading(true);

    try {
      // Get current stored password
      const storedPassword = await getCurrentStoredPassword();

      // Verify current password
      if (currentPassword !== storedPassword) {
        setError("Поточний пароль невірний");
        setLoading(false);
        return;
      }

      // Store new password in Supabase
      // First, try to update existing record
      const { error: updateError } = await supabase
        .from("admin_settings")
        .upsert(
          {
            key: ADMIN_PASSWORD_KEY,
            value: newPassword,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" }
        );

      if (updateError) {
        // If table doesn't exist, create it first (this would require a migration)
        // For now, we'll use a fallback: store in localStorage as backup
        console.warn("Could not save to Supabase, using localStorage:", updateError);
        localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword);
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message || "Помилка зміни пароля");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Зміна пароля адміністратора</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current-password">Поточний пароль</Label>
          <Input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Введіть поточний пароль"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-password">Новий пароль</Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Мінімум 6 символів"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Підтвердження нового пароля</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Повторіть новий пароль"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Пароль успішно змінено!</span>
          </div>
        )}

        <Button
          onClick={handleChangePassword}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Зміна..." : "Змінити пароль"}
        </Button>
      </CardContent>
    </Card>
  );
}

