import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HomeSettingsForm } from "@/pages/admin/HomeSettingsForm";
import { FeaturedProductsManager } from "@/pages/admin/FeaturedProductsManager";
import { OfficeSettingsForm } from "@/pages/admin/OfficeSettingsForm";
import { ContactSettingsForm } from "@/pages/admin/ContactSettingsForm";
import { ContactTradePointsForm } from "@/pages/admin/ContactTradePointsForm";
import { CoffeeProductsManager } from "@/pages/admin/CoffeeProductsManager";
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
import { FileText, Boxes, Settings as SettingsIcon, ShoppingCart, Search } from "lucide-react";

export default function Admin() {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [section, setSection] = useState<"pages" | "cards" | "settings" | "orders" | "seo">("pages");

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthed(!!data.session);
      setLoading(false);
    };
    init();
  }, []);

  const handleLogin = async () => {
    // Skip authentication for demo - just set as authenticated
    setIsAuthed(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthed(false);
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
            <Button onClick={handleLogin} variant="default">Увійти як адміністратор</Button>
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
                  isActive={section === "seo"}
                  onClick={() => setSection("seo")}
                  tooltip="SEO"
                  size="lg"
                  className="w-full justify-start h-16 text-lg font-semibold px-4"
                >
                  <Search className="h-8 w-8" />
                  <span>SEO</span>
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
                  <SettingsIcon className="h-8 w-8" />
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
            </Tabs>
          )}

          {section === "cards" && (
            <Tabs defaultValue="coffee" className="w-full">
              <TabsList>
                <TabsTrigger value="coffee">Кава</TabsTrigger>
                <TabsTrigger value="featured">Сезонні слайди</TabsTrigger>
              </TabsList>
              <TabsContent value="coffee">
                <CoffeeProductsManager />
              </TabsContent>
              <TabsContent value="featured">
                <FeaturedProductsManager />
              </TabsContent>
            </Tabs>
          )}

          {section === "orders" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Замовлення</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground">
                    Управління замовленнями — незабаром.
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {section === "seo" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">SEO</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground">
                    SEO налаштування — незабаром.
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {section === "settings" && (
            <Tabs defaultValue="pages" className="w-full">
              <TabsList>
                <TabsTrigger value="pages">Сторінки</TabsTrigger>
                <TabsTrigger value="general">Загальні</TabsTrigger>
                <TabsTrigger value="system">Система</TabsTrigger>
              </TabsList>
              <TabsContent value="pages">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Налаштування сторінок</h3>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-sm text-muted-foreground">
                        Налаштування сторінок сайту — незабаром.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="general">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Загальні налаштування</h3>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-sm text-muted-foreground">
                        Загальні налаштування сайту — незабаром.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="system">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Системні налаштування</h3>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-sm text-muted-foreground">
                        Системні налаштування — незабаром.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
          </div>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}



