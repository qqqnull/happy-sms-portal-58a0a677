import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RechargePage from "./pages/RechargePage";
import RechargeUsdtPage from "./pages/RechargeUsdtPage";
import OrdersPage from "./pages/OrdersPage";
import ReceiveCodePage from "./pages/ReceiveCodePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCountries from "./pages/admin/AdminCountries";
import AdminServices from "./pages/admin/AdminServices";
import AdminCountryServices from "./pages/admin/AdminCountryServices";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminImport from "./pages/admin/AdminImport";
import AdminPhoneNumbers from "./pages/admin/AdminPhoneNumbers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/recharge" element={<RechargePage />} />
              <Route path="/recharge_usdt_page" element={<RechargeUsdtPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/receive-code" element={<ReceiveCodePage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/countries" element={<AdminCountries />} />
              <Route path="/admin/services" element={<AdminServices />} />
              <Route path="/admin/country-services" element={<AdminCountryServices />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/transactions" element={<AdminTransactions />} />
              <Route path="/admin/import" element={<AdminImport />} />
              <Route path="/admin/phone-numbers" element={<AdminPhoneNumbers />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
