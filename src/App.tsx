import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import SEOHead from "@/components/SEOHead";
import LovableChatWidget from "@/components/LovableChatWidget";
import { useLocation } from "react-router-dom";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RechargePage from "./pages/RechargePage";
import RechargeUsdtPage from "./pages/RechargeUsdtPage";
import AnonymousPaymentPage from "./pages/AnonymousPaymentPage";
import OrdersPage from "./pages/OrdersPage";
import ReceiveCodePage from "./pages/ReceiveCodePage";
import FAQPage from "./pages/FAQPage";
import TutorialPage from "./pages/TutorialPage";
import APIDocsPage from "./pages/APIDocsPage";
import SupportPage from "./pages/SupportPage";
import UserCenterPage from "./pages/UserCenterPage";
import HistoryPage from "./pages/HistoryPage";
import AccountSecurityPage from "./pages/AccountSecurityPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCountries from "./pages/admin/AdminCountries";
import AdminServices from "./pages/admin/AdminServices";
import AdminCountryServices from "./pages/admin/AdminCountryServices";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminImport from "./pages/admin/AdminImport";
import AdminPhoneNumbers from "./pages/admin/AdminPhoneNumbers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminWalletBlacklist from "./pages/admin/AdminWalletBlacklist";
import AdminPersistentNumbers from "./pages/admin/AdminPersistentNumbers";
import PersistentNumbersPage from "./pages/PersistentNumbersPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const GlobalChatWidget = () => {
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) return null;
  return <LovableChatWidget />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SEOHead />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/recharge" element={<RechargePage />} />
              <Route path="/recharge_usdt_page" element={<RechargeUsdtPage />} />
              <Route path="/anonymous-payment" element={<AnonymousPaymentPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/receive-code" element={<ReceiveCodePage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/tutorial" element={<TutorialPage />} />
              <Route path="/api-docs" element={<APIDocsPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/user-center" element={<UserCenterPage />} />
              <Route path="/persistent-numbers" element={<PersistentNumbersPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/account-security" element={<AccountSecurityPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/countries" element={<AdminCountries />} />
              <Route path="/admin/services" element={<AdminServices />} />
              <Route path="/admin/country-services" element={<AdminCountryServices />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/transactions" element={<AdminTransactions />} />
              <Route path="/admin/import" element={<AdminImport />} />
              <Route path="/admin/phone-numbers" element={<AdminPhoneNumbers />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/wallet-blacklist" element={<AdminWalletBlacklist />} />
              <Route path="/admin/persistent-numbers" element={<AdminPersistentNumbers />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <GlobalChatWidget />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
