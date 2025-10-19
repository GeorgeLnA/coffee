import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Coffee from "./pages/Coffee";
import Product from "./pages/Product";
import News from "./pages/News";
import Water from "./pages/Water";
import WaterProduct from "./pages/WaterProduct";
import Contact from "./pages/Contact";
import Office from "./pages/Office";
import NotFound from "./pages/NotFound";
import Basket from "./pages/Basket";
import Admin from "./pages/Admin";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CartProvider } from "./contexts/CartContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import { VisualEditingProvider } from "./contexts/VisualEditingContext";
import LoadingAnimation from "./components/LoadingAnimation";
import ScrollToTop from "./components/ScrollToTop";
import { VisualEditingToolbar } from "./components/VisualEditingToolbar";
import { AdminButton } from "./components/AdminButton";

const queryClient = new QueryClient();

function App() {
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <VisualEditingProvider>
        <LanguageProvider>
          <CartProvider>
            <LoadingProvider>
              <LoadingAnimation />
              <Toaster />
              <Sonner />
              <VisualEditingToolbar />
              <BrowserRouter>
                <ScrollToTop />
                <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/coffee" element={<Coffee />} />
                <Route path="/product/:id" element={<Product />} />
                <Route path="/news" element={<News />} />
                <Route path="/water" element={<Water />} />
                <Route path="/water/:id" element={<WaterProduct />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/office" element={<Office />} />
                  <Route path="/basket" element={<Basket />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
                </Routes>
                <AdminButton />
              </BrowserRouter>
            </LoadingProvider>
          </CartProvider>
        </LanguageProvider>
      </VisualEditingProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
