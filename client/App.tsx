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
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";
import Delivery from "./pages/Delivery";
import Terms from "./pages/Terms";
import Returns from "./pages/Returns";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CartProvider } from "./contexts/CartContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import LoadingAnimation from "./components/LoadingAnimation";
import ScrollToTop from "./components/ScrollToTop";
import ErrorPage from "./pages/ErrorPage";

const queryClient = new QueryClient();

function App() {
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <CartProvider>
          <LoadingProvider>
            <LoadingAnimation />
            <Toaster />
            <Sonner />
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
                <Route path="/delivery" element={<Delivery />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/returns" element={<Returns />} />
                <Route path="/office" element={<Office />} />
                <Route path="/basket" element={<Basket />} />
                <Route path="/checkout" element={<Checkout />} />
                {/* Error pages */}
                <Route path="/402" element={<ErrorPage code={402} message="Payment Required" />} />
                <Route path="/403" element={<ErrorPage code={403} message="Forbidden" />} />
                <Route path="/500" element={<ErrorPage code={500} message="Server Error" />} />
                <Route path="/error/:code" element={<ErrorPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
          </LoadingProvider>
        </CartProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
