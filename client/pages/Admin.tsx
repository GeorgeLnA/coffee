import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HomeSettingsForm } from "@/pages/admin/HomeSettingsForm";
import { FeaturedProductsManager } from "@/pages/admin/FeaturedProductsManager";
import { OfficeSettingsForm } from "@/pages/admin/OfficeSettingsForm";
import { ContactSettingsForm } from "@/pages/admin/ContactSettingsForm";
import { ContactTradePointsForm } from "@/pages/admin/ContactTradePointsForm";
import { FooterSettingsForm } from "@/pages/admin/FooterSettingsForm";
import { LegalPagesForm } from "@/pages/admin/LegalPagesForm";
import { DeliverySettingsForm } from "@/pages/admin/DeliverySettingsForm";
import { CoffeeProductsManager } from "@/pages/admin/CoffeeProductsManager";
import { WaterProductsManager } from "@/pages/admin/WaterProductsManager";
import { WaterSettingsForm } from "@/pages/admin/WaterSettingsForm";
import { CustomSectionsManager } from "@/pages/admin/CustomSectionsManager";
import { FilterOptionsManager } from "@/pages/admin/FilterOptionsManager";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { FileText, Boxes, ShoppingCart, BarChart3, Settings } from "lucide-react";
import { AdminAnalytics } from "@/pages/admin/AdminAnalytics";
import { OrdersManager } from "@/pages/admin/OrdersManager";
import { AdminPasswordSettings } from "@/pages/admin/AdminPasswordSettings";

export default function Admin() {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [section, setSection] = useState<"pages" | "cards" | "orders" | "analysis" | "settings">("pages");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const ADMIN_PASSWORD_KEY = "admin_password";

  const getStoredPassword = async (): Promise<string> => {
    try {
      // Try to get from Supabase
      const { data, error } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", ADMIN_PASSWORD_KEY)
        .single();

      if (error) {
        // If table doesn't exist or no record, check localStorage, then default
        if (error.code === "PGRST116" || error.message.includes("could not find")) {
          const localPassword = localStorage.getItem(ADMIN_PASSWORD_KEY);
          return localPassword || "mcroaster"; // Default password
        }
        throw error;
      }

      return data?.value || localStorage.getItem(ADMIN_PASSWORD_KEY) || "mcroaster";
    } catch (e) {
      // Fallback to localStorage or default
      return localStorage.getItem(ADMIN_PASSWORD_KEY) || "mcroaster";
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthed(!!data.session);
      setLoading(false);
    };
    init();
  }, []);

  const handleLogin = async () => {
    const storedPassword = await getStoredPassword();
    if (password === storedPassword) {
      setIsAuthed(true);
      setError("");
    } else {
      setError("Невірний пароль");
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthed(false);
    setPassword("");
    setError("");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Завантаження…</div>;
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Вхід до адмін-панелі</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Увійдіть, щоб керувати контентом сайту.</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="mt-1"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button onClick={handleLogin} variant="default" className="w-full">Увійти як адміністратор</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SidebarProvider>
        <Sidebar collapsible="icon" className="border-r top-20 h-[calc(100vh-80px)]">
          <SidebarHeader className="px-2 py-3">
          </SidebarHeader>
          <SidebarContent className="overflow-y-auto">
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={section === "pages"}
                  onClick={() => setSection("pages")}
                  tooltip="Сторінки"
                  size="lg"
                  className="w-full justify-start h-16 text-lg font-semibold px-4"
                >
                  <FileText className="h-8 w-8" />
                  <span>Сторінки</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={section === "cards"}
                  onClick={() => setSection("cards")}
                  tooltip="Картки"
                  size="lg"
                  className="w-full justify-start h-16 text-lg font-semibold px-4"
                >
                  <Boxes className="h-8 w-8" />
                  <span>Картки</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={section === "orders"}
                  onClick={() => setSection("orders")}
                  tooltip="Замовлення"
                  size="lg"
                  className="w-full justify-start h-16 text-lg font-semibold px-4"
                >
                  <ShoppingCart className="h-8 w-8" />
                  <span>Замовлення</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={section === "analysis"}
                  onClick={() => setSection("analysis")}
                  tooltip="Аналіз"
                  size="lg"
                  className="w-full justify-start h-16 text-lg font-semibold px-4"
                >
                  <BarChart3 className="h-8 w-8" />
                  <span>Аналіз</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={section === "settings"}
                  onClick={() => setSection("settings")}
                  tooltip="Налаштування"
                  size="lg"
                  className="w-full justify-start h-16 text-lg font-semibold px-4"
                >
                  <Settings className="h-8 w-8" />
                  <span>Налаштування</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="pt-20">
          <div className="max-w-6xl mx-auto px-6 py-6 w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold">Адмін-панель</h1>
            </div>
            <Button variant="outline" onClick={handleLogout}>Вийти</Button>
          </div>

          {section === "pages" && (
            <Tabs defaultValue="home" className="w-full">
              <TabsList>
                <TabsTrigger value="home">Головна</TabsTrigger>
                <TabsTrigger value="office">Для офісу</TabsTrigger>
                <TabsTrigger value="contact">Контакти</TabsTrigger>
                <TabsTrigger value="trade-points">Точки продажу</TabsTrigger>
                <TabsTrigger value="footer">Футер</TabsTrigger>
                <TabsTrigger value="water-settings">Вода</TabsTrigger>
                <TabsTrigger value="delivery-settings">Доставка</TabsTrigger>
                <TabsTrigger value="legal">Юридичні сторінки</TabsTrigger>
                <TabsTrigger value="custom-sections">Кастомні секції</TabsTrigger>
              </TabsList>
              <TabsContent value="home">
                <HomeSettingsForm />
              </TabsContent>
              <TabsContent value="office">
                <OfficeSettingsForm />
              </TabsContent>
              <TabsContent value="contact">
                <ContactSettingsForm />
              </TabsContent>
              <TabsContent value="trade-points">
                <ContactTradePointsForm />
              </TabsContent>
              <TabsContent value="footer">
                <FooterSettingsForm />
              </TabsContent>
              <TabsContent value="water-settings">
                <WaterSettingsForm />
              </TabsContent>
              <TabsContent value="delivery-settings">
                <DeliverySettingsForm />
              </TabsContent>
              <TabsContent value="legal">
                <Tabs defaultValue="delivery" className="w-full">
                  <TabsList>
                    <TabsTrigger value="delivery">Доставка та оплата</TabsTrigger>
                    <TabsTrigger value="terms">Умови використання</TabsTrigger>
                    <TabsTrigger value="returns">Політика повернення</TabsTrigger>
                  </TabsList>
                  <TabsContent value="delivery">
                    <LegalPagesForm pageType="delivery" />
                  </TabsContent>
                  <TabsContent value="terms">
                    <LegalPagesForm pageType="terms" />
                  </TabsContent>
                  <TabsContent value="returns">
                    <LegalPagesForm pageType="returns" />
                  </TabsContent>
                </Tabs>
              </TabsContent>
              <TabsContent value="custom-sections">
                <CustomSectionsManager />
              </TabsContent>
            </Tabs>
          )}

          {section === "cards" && (
            <Tabs defaultValue="coffee" className="w-full">
              <TabsList>
                <TabsTrigger value="coffee">Кава</TabsTrigger>
                <TabsTrigger value="water">Вода</TabsTrigger>
                <TabsTrigger value="featured">Сезонні слайди</TabsTrigger>
                <TabsTrigger value="filters">Фільтри</TabsTrigger>
              </TabsList>
              <TabsContent value="coffee">
                <CoffeeProductsManager />
              </TabsContent>
              <TabsContent value="water">
                <WaterProductsManager />
              </TabsContent>
              <TabsContent value="featured">
                <FeaturedProductsManager />
              </TabsContent>
              <TabsContent value="filters">
                <FilterOptionsManager />
              </TabsContent>
            </Tabs>
          )}

          {section === "orders" && (
            <OrdersManager />
          )}

          {section === "analysis" && (
            <AdminAnalytics />
          )}

          {section === "settings" && (
            <div className="space-y-6">
              <AdminPasswordSettings />
            </div>
          )}

          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}



