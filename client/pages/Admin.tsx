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

export default function Admin() {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

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
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Адмін-панель</h1>
          <Button variant="outline" onClick={handleLogout}>Вийти</Button>
        </div>
        <Tabs defaultValue="coffee">
          <TabsList>
            <TabsTrigger value="coffee">Кава</TabsTrigger>
            <TabsTrigger value="products">Сезонні слайди</TabsTrigger>
            <TabsTrigger value="home">Головна</TabsTrigger>
            <TabsTrigger value="office">Для офісу</TabsTrigger>
            <TabsTrigger value="contact">Контакти</TabsTrigger>
          </TabsList>
          <TabsContent value="coffee">
            <CoffeeProductsManager />
          </TabsContent>
          <TabsContent value="products">
            <FeaturedProductsManager />
          </TabsContent>
          <TabsContent value="home">
            <HomeSettingsForm />
          </TabsContent>
          <TabsContent value="office">
            <OfficeSettingsForm />
          </TabsContent>
          <TabsContent value="contact">
            <div className="grid grid-cols-1 gap-6">
              <ContactSettingsForm />
              <ContactTradePointsForm />
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}



