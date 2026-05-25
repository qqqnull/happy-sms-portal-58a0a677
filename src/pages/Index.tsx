import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, Globe, CheckCircle, Zap, ArrowLeft, 
  Shield, ShieldCheck, Lock, Database, Headphones,
  Smartphone, FileText, HelpCircle, BookOpen, 
  UserPlus, MapPin, Phone, MessageSquare, LogIn,
  Filter, ArrowUpDown, RefreshCw, Wifi, Star, Menu,
  ChevronLeft, ChevronRight, AlertTriangle, Info, CreditCard, Banknote,
  Clock, Sparkles, Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useSupportLink } from '@/hooks/useSupportLink';
import AppHeader from '@/components/layout/AppHeader';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import SEOContent from '@/components/SEOContent';
import { getServiceIcon } from '@/lib/serviceIcons';
import { getCountryFlag, getServiceFirstCharIcon } from '@/lib/countryData';
import { toast } from '@/hooks/use-toast';

interface Country {
  id: string;
  name: string;
  name_en: string;
  code: string;
  flag: string;
  region: string;
  price: number;
  is_popular: boolean;
  online_count?: number;
}

interface Service {
  id: string;
  name: string;
  name_en?: string;
  icon: string;
  description?: string;
  price_modifier: number;
  is_popular: boolean;
  success_rate?: number;
}

interface CountryService {
  id: string;
  service_id: string;
  price: number;
  service: Service;
}

type Region = 'all' | 'asia' | 'europe' | 'americas' | 'africa' | 'oceania';
type SortType = 'popular' | 'name' | 'code';

const COUNTRIES_PER_PAGE = 18;
const SERVICES_PER_PAGE = 12;

const Index = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [countryServices, setCountryServices] = useState<CountryService[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<Region>('all');
  const [sortType, setSortType] = useState<SortType>('popular');
  const [showInsufficientDialog, setShowInsufficientDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [refreshingNumbers, setRefreshingNumbers] = useState(false);
  const [countryPage, setCountryPage] = useState(1);
  const [servicePage, setServicePage] = useState(1);
  
  const { user, profile } = useAuth();
  const { t, lang } = useLanguage();
  const { supportLink } = useSupportLink();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [countriesRes, servicesRes] = await Promise.all([
      supabase.from('countries').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('services').select('*').eq('is_active', true).order('sort_order'),
    ]);

    if (countriesRes.data) {
      setCountries(countriesRes.data.map(c => ({
        ...c,
        price: Number(c.price),
        flag: c.flag || getCountryFlag(c.code),
        online_count: c.online_count || 100
      })));
    }
    if (servicesRes.data) {
      setServices(servicesRes.data.map(s => ({
        ...s,
        price_modifier: Number(s.price_modifier),
        success_rate: s.success_rate || 95
      })));
    }
    setLoading(false);
  };

  const refreshOnlineNumbers = async () => {
    setRefreshingNumbers(true);
    const { data } = await supabase.from('countries').select('id, online_count').eq('is_active', true);
    if (data) {
      setCountries(prev => prev.map(country => {
        const updated = data.find(c => c.id === country.id);
        return updated ? { ...country, online_count: updated.online_count || 100 } : country;
      }));
    }
    setRefreshingNumbers(false);
  };

  const fetchCountryServices = async (countryId: string) => {
    setLoadingServices(true);
    const { data } = await supabase
      .from('country_services')
      .select(`
        id,
        service_id,
        price,
        service:services(*)
      `)
      .eq('country_id', countryId)
      .eq('is_active', true);

    if (data) {
      const mapped = data.map((cs: any) => ({
        id: cs.id,
        service_id: cs.service_id,
        price: Number(cs.price),
        service: {
          ...cs.service,
          price_modifier: Number(cs.service.price_modifier)
        }
      }));
      mapped.sort((a, b) => (a.service.sort_order ?? 0) - (b.service.sort_order ?? 0));
      setCountryServices(mapped);
    } else {
      // If no country-specific services, use all services with default pricing
      setCountryServices([]);
    }
    setLoadingServices(false);
  };

  const regions: { key: Region; labelZh: string; labelEn: string }[] = [
    { key: 'all', labelZh: '所有地区', labelEn: 'All' },
    { key: 'asia', labelZh: '亚洲', labelEn: 'Asia' },
    { key: 'europe', labelZh: '欧洲', labelEn: 'Europe' },
    { key: 'americas', labelZh: '美洲', labelEn: 'Americas' },
    { key: 'africa', labelZh: '非洲', labelEn: 'Africa' },
    { key: 'oceania', labelZh: '大洋洲', labelEn: 'Oceania' },
  ];

  const getRegionLabel = (region: { labelZh: string; labelEn: string }) => {
    return lang === 'zh' ? region.labelZh : region.labelEn;
  };

  const filteredCountries = useMemo(() => {
    return countries
      .filter((country) => {
        const matchesSearch = 
          country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          country.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
          country.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRegion = selectedRegion === 'all' || country.region === selectedRegion;
        return matchesSearch && matchesRegion;
      })
      .sort((a, b) => {
        // 中国始终排在第一位
        if (a.code === 'CN') return -1;
        if (b.code === 'CN') return 1;
        
        if (sortType === 'popular') {
          if (a.is_popular && !b.is_popular) return -1;
          if (!a.is_popular && b.is_popular) return 1;
          return 0;
        }
        if (sortType === 'name') {
          return lang === 'zh' ? a.name.localeCompare(b.name, 'zh') : a.name_en.localeCompare(b.name_en);
        }
        if (sortType === 'code') {
          return a.code.localeCompare(b.code);
        }
        return 0;
      });
  }, [countries, searchQuery, selectedRegion, sortType, lang]);

  // Reset country page when filters change
  useEffect(() => {
    setCountryPage(1);
  }, [searchQuery, selectedRegion, sortType]);

  // Pagination for countries
  const totalCountryPages = Math.ceil(filteredCountries.length / COUNTRIES_PER_PAGE);
  const paginatedCountries = filteredCountries.slice(
    (countryPage - 1) * COUNTRIES_PER_PAGE,
    countryPage * COUNTRIES_PER_PAGE
  );

  // Get services to display - either country-specific or all services
  const displayServices = countryServices.length > 0 
    ? countryServices.map(cs => ({
        ...cs.service,
        specificPrice: cs.price
      }))
    : services.map(s => ({
        ...s,
        specificPrice: selectedCountry ? selectedCountry.price * s.price_modifier : 0
      }));

  const filteredServices = useMemo(() => {
    return displayServices.filter(service => {
      const searchLower = serviceSearchQuery.toLowerCase();
      return service.name.toLowerCase().includes(searchLower) ||
             (service.name_en && service.name_en.toLowerCase().includes(searchLower)) ||
             (service.description && service.description.toLowerCase().includes(searchLower));
    });
  }, [displayServices, serviceSearchQuery]);

  // Reset service page when search changes
  useEffect(() => {
    setServicePage(1);
  }, [serviceSearchQuery, selectedCountry]);

  // Pagination for services
  const totalServicePages = Math.ceil(filteredServices.length / SERVICES_PER_PAGE);
  const paginatedServices = filteredServices.slice(
    (servicePage - 1) * SERVICES_PER_PAGE,
    servicePage * SERVICES_PER_PAGE
  );

  const handleCountrySelect = (country: Country) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedCountry(country);
    setSelectedService(null);
    setServiceSearchQuery('');
    fetchCountryServices(country.id);
  };

  const handleServiceSelect = (service: Service & { specificPrice?: number }) => {
    setSelectedService(service);
    setSelectedPrice(service.specificPrice || 0);
  };

  // 跳转到接收验证码页面
  const handleGetNumber = () => {
    if (!selectedCountry || !selectedService || !user) return;
    
    // 直接跳转到接收验证码页面，不管余额
    const params = new URLSearchParams({
      country: selectedCountry.code,
      countryName: lang === 'zh' ? selectedCountry.name : selectedCountry.name_en,
      service: selectedService.name,
      serviceId: selectedService.id,
      price: selectedPrice.toString(),
    });
    
    navigate(`/receive-code?${params.toString()}`);
  };

  const handleBack = () => {
    setSelectedCountry(null);
    setSelectedService(null);
    setCountryServices([]);
    setServiceSearchQuery('');
  };

  const navItems = [
    { icon: Smartphone, labelZh: '获取接码号码', labelEn: 'Get Number', path: '/', active: true },
    { icon: FileText, labelZh: 'API接口服务', labelEn: 'API Service', path: '/api-docs' },
    { icon: Headphones, labelZh: '客户支持中心', labelEn: 'Support', path: '/support' },
    { icon: HelpCircle, labelZh: '常见问题解答', labelEn: 'FAQ', path: '/faq' },
    { icon: BookOpen, labelZh: '使用教程', labelEn: 'Tutorial', path: '/tutorial' },
  ];

  const securityBadges = [
    { icon: Lock, labelZh: 'SSL加密', labelEn: 'SSL' },
    { icon: ShieldCheck, labelZh: '实名认证', labelEn: 'Verified' },
    { icon: Database, labelZh: '资金存管', labelEn: 'Custody' },
    { icon: Shield, labelZh: '数据加密', labelEn: 'Encrypted' },
  ];

  const features = [
    { icon: Shield, titleZh: '安全可靠', titleEn: 'Secure', descZh: '一次性号码，保障隐私安全', descEn: 'One-time numbers for privacy' },
    { icon: Zap, titleZh: '快速响应', titleEn: 'Fast', descZh: '验证码实时接收，无需等待', descEn: 'Real-time code reception' },
    { icon: Globe, titleZh: '全球覆盖', titleEn: 'Global', descZh: '支持全球150+国家地区', descEn: '150+ countries worldwide' },
  ];

  const steps = [
    { icon: UserPlus, titleZh: '注册登录', titleEn: 'Register', descZh: '创建账户或登录系统', descEn: 'Create or login' },
    { icon: MapPin, titleZh: '选择国家', titleEn: 'Select', descZh: '选择国家和服务', descEn: 'Choose country & service' },
    { icon: Phone, titleZh: '获取号码', titleEn: 'Get Number', descZh: '系统分配接码号码', descEn: 'System assigns number' },
    { icon: MessageSquare, titleZh: '接收验证码', titleEn: 'Receive', descZh: '实时查看验证码', descEn: 'View code real-time' },
  ];

  // Sidebar content component for reuse
  const SidebarContent = () => (
    <div className="space-y-4">
      {/* Language Switcher for sidebar */}
      <LanguageSwitcher variant="sidebar" />

      {/* Navigation */}
      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="bg-primary text-primary-foreground px-4 py-3 font-semibold">
          {t('serviceNav')}
        </div>
        <nav className="p-2">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                item.active 
                  ? 'bg-secondary/10 text-secondary font-medium' 
                  : 'hover:bg-muted text-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{lang === 'zh' ? item.labelZh : item.labelEn}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Security Badges */}
      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="bg-primary text-primary-foreground px-4 py-3 font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {t('securityTitle')}
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          {securityBadges.map((badge, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
              <badge.icon className="h-4 w-4 text-success" />
              <span>{lang === 'zh' ? badge.labelZh : badge.labelEn}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Support */}
      <div className="bg-card rounded-xl shadow-sm p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
          <Headphones className="h-8 w-8 text-secondary" />
        </div>
        <h3 className="font-semibold mb-1">{t('techSupport')}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t('techSupportDesc')}</p>
        <a href={supportLink} target="_blank" rel="noopener noreferrer" className="block">
          <Button className="w-full bg-primary hover:bg-primary/90">
            <MessageSquare className="h-4 w-4 mr-2" />
            {t('contactSupport')}
          </Button>
        </a>
      </div>
    </div>
  );

  // Service icon component - uses first character
  const ServiceIcon = ({ name, icon }: { name: string; icon?: string }) => {
    // Try to use the icon from serviceIcons first
    const existingIcon = icon ? getServiceIcon(icon) : null;
    if (existingIcon && existingIcon !== '📱') {
      return <span className="text-2xl">{existingIcon}</span>;
    }
    // Fallback to first character
    const firstChar = getServiceFirstCharIcon(name);
    return (
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center text-secondary font-bold text-lg">
        {firstChar}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      {/* Header */}
      <AppHeader />

      {/* Mobile Menu Button - Fixed at bottom */}
      <div className="fixed bottom-4 left-4 z-50 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg bg-primary hover:bg-primary/90 h-14 w-14">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-4 overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle>{t('serviceNav')}</SheetTitle>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <div className="flex w-full max-w-full overflow-hidden">
        {/* Left Sidebar - Desktop only */}
        <aside className="w-[280px] min-w-[280px] min-h-[calc(100vh-56px)] p-4 hidden lg:block flex-shrink-0">
          <SidebarContent />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-3 sm:p-4 space-y-3 sm:space-y-4 pb-24 lg:pb-4 overflow-x-hidden">
          {!selectedCountry ? (
            <>
              {/* Service Center Header */}
              <div className="bg-primary text-primary-foreground rounded-xl p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Wifi className="h-5 w-5 sm:h-6 sm:w-6" />
                    <h1 className="text-lg sm:text-xl font-bold">{t('serviceCenter')}</h1>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-success/20 text-success text-xs sm:text-sm">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-success animate-pulse"></span>
                      {t('systemNormal')}
                    </span>
                    <span className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-white/10 text-xs sm:text-sm">
                      <RefreshCw className="h-3 w-3" />
                      {t('realTimeUpdate')}
                    </span>
                  </div>
                </div>

                {/* Stats - Responsive grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mt-3 sm:mt-4">
                  <div className="flex items-center gap-2 sm:gap-3 bg-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3">
                    <Globe className="h-8 w-8 sm:h-10 sm:w-10 opacity-80 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm sm:text-base">{t('globalCoverage')}</div>
                      <div className="text-xs sm:text-sm opacity-80 truncate">{t('globalCoverageDesc')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 bg-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3">
                    <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 opacity-80 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm sm:text-base">{t('highSuccessRate')}</div>
                      <div className="text-xs sm:text-sm opacity-80 truncate">{t('highSuccessRateDesc')}</div>
                    </div>
                  </div>
                  <a href="https://www.2026hao.cc/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 sm:gap-3 bg-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3 hover:bg-white/20 transition-colors cursor-pointer">
                    <Zap className="h-8 w-8 sm:h-10 sm:w-10 opacity-80 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm sm:text-base">{t('instantRecharge')}</div>
                      <div className="text-xs sm:text-sm opacity-80 truncate">{t('instantRechargeDesc')}</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="bg-card rounded-xl shadow-sm p-3 sm:p-4">
                {/* Mobile: Stacked layout */}
                <div className="flex flex-col gap-3 sm:hidden">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('searchCountry')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="overflow-x-auto -mx-3 px-3">
                    <div className="flex gap-1 bg-muted rounded-lg p-1 w-max">
                      {regions.map((region) => (
                        <button
                          key={region.key}
                          onClick={() => setSelectedRegion(region.key)}
                          className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                            selectedRegion === region.key
                              ? 'bg-secondary text-secondary-foreground'
                              : 'hover:bg-muted-foreground/10 text-muted-foreground'
                          }`}
                        >
                          {getRegionLabel(region)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Select value={sortType} onValueChange={(v) => setSortType(v as SortType)}>
                    <SelectTrigger className="w-full">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">{t('sortByPopular')}</SelectItem>
                      <SelectItem value="name">{t('sortByName')}</SelectItem>
                      <SelectItem value="code">{t('sortByCode')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Desktop: Horizontal layout */}
                <div className="hidden sm:flex flex-wrap items-center gap-4">
                  <div className="flex gap-1 bg-muted rounded-lg p-1">
                    {regions.map((region) => (
                      <button
                        key={region.key}
                        onClick={() => setSelectedRegion(region.key)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          selectedRegion === region.key
                            ? 'bg-secondary text-secondary-foreground'
                            : 'hover:bg-muted-foreground/10 text-muted-foreground'
                        }`}
                      >
                        {getRegionLabel(region)}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1" />

                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('searchCountry')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={selectedRegion} onValueChange={(v) => setSelectedRegion(v as Region)}>
                    <SelectTrigger className="w-32">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.key} value={region.key}>
                          {getRegionLabel(region)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortType} onValueChange={(v) => setSortType(v as SortType)}>
                    <SelectTrigger className="w-36">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">{t('sortByPopular')}</SelectItem>
                      <SelectItem value="name">{t('sortByName')}</SelectItem>
                      <SelectItem value="code">{t('sortByCode')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Countries Section */}
              <div className="bg-card rounded-xl shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-secondary" />
                    <h2 className="font-semibold">{t('selectCountryTitle')}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshOnlineNumbers}
                      disabled={refreshingNumbers}
                      className="text-xs"
                    >
                      <RefreshCw className={`h-3 w-3 mr-1 ${refreshingNumbers ? 'animate-spin' : ''}`} />
                      {refreshingNumbers ? t('refreshing') : t('refreshNumbers')}
                    </Button>
                    <span className="text-sm text-muted-foreground">{t('countryCount')}</span>
                  </div>
                </div>

                <div className="p-4">
                  {loading ? (
                    <div className="text-center py-16">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
                      <p className="text-muted-foreground mt-4">{t('loading')}</p>
                    </div>
                  ) : !user ? (
                    <div className="text-center py-16">
                      <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">{t('loginToView')}</p>
                      <Button 
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => navigate('/login')}
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        {t('loginNow')}
                      </Button>
                    </div>
                  ) : paginatedCountries.length > 0 ? (
                    <>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                        {paginatedCountries.map((country) => (
                          <div
                            key={country.id}
                            onClick={() => handleCountrySelect(country)}
                            className="p-2 sm:p-3 rounded-lg border border-border hover:border-secondary hover:shadow-lg transition-all cursor-pointer group bg-card"
                          >
                            <img 
                              src={`https://flagcdn.com/w160/${country.code.toLowerCase()}.png`} 
                              alt={country.name}
                              className="w-10 h-6 sm:w-12 sm:h-8 object-cover rounded mb-1 sm:mb-2"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            <div className="font-medium text-xs sm:text-sm text-foreground group-hover:text-secondary transition-colors truncate">
                              {lang === 'zh' ? country.name : country.name_en}
                            </div>
                            <div className="text-xs text-muted-foreground">{country.code}</div>
                            
                            {/* Online count badge and popular star */}
                            <div className="mt-1 flex items-center gap-1">
                              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
                                <span className="w-1 h-1 rounded-full bg-success animate-pulse"></span>
                                {t('online')} {country.online_count || 100}
                              </div>
                              
                              {country.is_popular && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-accent/10 text-accent">
                                  <Star className="h-2.5 w-2.5" />
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Country Pagination */}
                      {totalCountryPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCountryPage(p => Math.max(1, p - 1))}
                            disabled={countryPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm text-muted-foreground px-3">
                            {countryPage} / {totalCountryPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCountryPage(p => Math.min(totalCountryPages, p + 1))}
                            disabled={countryPage === totalCountryPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">{t('noCountries')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Services Preview - Scrolling Animation */}
              <div className="bg-card rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-secondary" />
                    <h2 className="font-semibold">{t('selectServiceTitle')}</h2>
                  </div>
                  <span className="text-sm text-muted-foreground">{t('serviceCount')}</span>
                </div>

                <div className="p-4">
                  <div className="relative overflow-hidden">
                    <div className="flex gap-3 animate-scroll-left mb-3">
                      {[...services, ...services].map((service, index) => (
                        <div
                          key={`row1-${index}`}
                          onClick={() => !user && navigate('/login')}
                          className="flex-shrink-0 w-32 p-3 rounded-xl border border-border bg-card hover:border-secondary hover:shadow-md transition-all cursor-pointer"
                        >
                          <ServiceIcon name={service.name} icon={service.icon} />
                          <div className="font-medium text-sm truncate text-foreground mt-2">{service.name}</div>
                          {service.is_popular && (
                            <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-xs bg-accent/10 text-accent">
                              <Star className="h-3 w-3" />
                              {t('popular')}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-3 animate-scroll-right">
                      {[...services.slice().reverse(), ...services.slice().reverse()].map((service, index) => (
                        <div
                          key={`row2-${index}`}
                          onClick={() => !user && navigate('/login')}
                          className="flex-shrink-0 w-32 p-3 rounded-xl border border-border bg-card hover:border-secondary hover:shadow-md transition-all cursor-pointer"
                        >
                          <ServiceIcon name={service.name} icon={service.icon} />
                          <div className="font-medium text-sm truncate text-foreground mt-2">{service.name}</div>
                          {service.is_popular && (
                            <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-xs bg-accent/10 text-accent">
                              <Star className="h-3 w-3" />
                              {t('popular')}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-card to-transparent pointer-events-none z-10"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-card to-transparent pointer-events-none z-10"></div>
                  </div>

                  <div className="mt-4 p-4 rounded-xl bg-secondary/10 text-center">
                    <p className="text-muted-foreground">
                      {lang === 'zh' 
                        ? <>登录后可查看每个国家支持的全部服务项目，部分国家支持高达 <span className="text-secondary font-bold">180+</span> 种服务</>
                        : <>Login to view all services for each country, some support up to <span className="text-secondary font-bold">180+</span> services</>
                      }
                    </p>
                    {!user && (
                      <Button 
                        className="mt-3 bg-secondary hover:bg-secondary/90"
                        onClick={() => navigate('/login')}
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        {t('loginNow')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="bg-card rounded-xl shadow-sm p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base sm:text-lg text-secondary">
                        {lang === 'zh' ? feature.titleZh : feature.titleEn}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {lang === 'zh' ? feature.descZh : feature.descEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Usage Steps */}
              <div className="bg-primary text-primary-foreground rounded-xl overflow-hidden">
                <div className="px-3 sm:px-4 py-3 border-b border-white/10 flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  <h2 className="font-semibold text-sm sm:text-base">{t('usageSteps')}</h2>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                    {steps.map((step, index) => (
                      <div key={index} className="text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 rounded-full bg-white/10 flex items-center justify-center">
                          <step.icon className="h-6 w-6 sm:h-8 sm:w-8" />
                        </div>
                        <h4 className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1">
                          {lang === 'zh' ? step.titleZh : step.titleEn}
                        </h4>
                        <p className="text-xs sm:text-sm opacity-80">
                          {lang === 'zh' ? step.descZh : step.descEn}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('backToCountry')}
              </Button>

              {/* Selected Country Info */}
              <div className="bg-card rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={`https://flagcdn.com/w160/${selectedCountry.code.toLowerCase()}.png`} 
                    alt={selectedCountry.name}
                    className="w-16 h-12 object-cover rounded shadow-sm"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {lang === 'zh' ? selectedCountry.name : selectedCountry.name_en}
                    </h2>
                    <p className="text-muted-foreground">{selectedCountry.code}</p>
                  </div>
                </div>
              </div>

              {/* Services Grid */}
              <div className="bg-card rounded-xl shadow-sm">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-secondary" />
                    <h3 className="font-semibold">{t('selectServiceTitle')}</h3>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {lang === 'zh' ? `可用服务 ${filteredServices.length} 项` : `${filteredServices.length} services`}
                  </span>
                </div>
                <div className="p-4">
                  {/* Search for services */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t('searchService')}
                        value={serviceSearchQuery}
                        onChange={(e) => setServiceSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  {loadingServices ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mx-auto"></div>
                      <p className="text-muted-foreground mt-3">{t('loading')}</p>
                    </div>
                  ) : paginatedServices.length > 0 ? (
                    <>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                        {paginatedServices.map((service: any) => {
                          const isSelected = selectedService?.id === service.id;
                          
                          return (
                            <div
                              key={service.id}
                              onClick={() => handleServiceSelect(service)}
                              className={`p-2 sm:p-3 rounded-lg border transition-all cursor-pointer ${
                                isSelected 
                                  ? 'border-secondary bg-secondary/5 shadow-lg ring-2 ring-secondary/20' 
                                  : 'border-border hover:border-secondary hover:shadow-md'
                              }`}
                            >
                              <ServiceIcon name={service.name} icon={service.icon} />
                              <div className={`font-medium text-xs sm:text-sm truncate mt-1 ${isSelected ? 'text-secondary' : 'text-foreground'}`}>
                                {service.name}
                              </div>
                              <div className="text-xs sm:text-sm font-semibold text-accent mt-1">
                                ￥{service.specificPrice?.toFixed(2) || '0.00'}
                              </div>
                              
                              {/* Success rate badge */}
                              <div className="mt-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
                                {service.success_rate || 95}%
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Service Pagination */}
                      {totalServicePages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setServicePage(p => Math.max(1, p - 1))}
                            disabled={servicePage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm text-muted-foreground px-3">
                            {servicePage} / {totalServicePages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setServicePage(p => Math.min(totalServicePages, p + 1))}
                            disabled={servicePage === totalServicePages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Smartphone className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">{t('noServices')}</p>
                    </div>
                  )}

                  {/* Get Number Button */}
                  {selectedService && (
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-secondary/10 to-accent/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                      <div>
                        <div className="text-xs sm:text-sm text-muted-foreground mb-1 flex items-center gap-2">
                          <img 
                            src={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png`} 
                            alt={selectedCountry.name}
                            className="w-5 h-4 object-cover rounded"
                          />
                          {lang === 'zh' ? selectedCountry.name : selectedCountry.name_en} · {selectedService.name}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-muted-foreground text-sm">
                            {lang === 'zh' ? '总价：' : 'Total:'}
                          </span>
                          <span className="text-2xl sm:text-3xl font-bold text-accent">￥{selectedPrice.toFixed(2)}</span>
                        </div>
                      </div>
                      <Button
                        size="lg"
                        className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 text-base sm:text-lg px-6 sm:px-8 shadow-lg"
                        onClick={handleGetNumber}
                      >
                        <Phone className="h-5 w-5 mr-2" />
                        {t('getNumberBtn')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              {/* SEO Content Section - Only show on country selection page */}
              <SEOContent />
            </>
          )}
        </main>
      </div>

      {/* Insufficient Balance Dialog - Redesigned */}
      <Dialog open={showInsufficientDialog} onOpenChange={setShowInsufficientDialog}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0 border-0 [&>button]:text-primary-foreground [&>button]:hover:text-primary-foreground/80">
          {/* Header */}
          <div className="bg-primary px-6 py-4 flex items-center gap-3 pr-12">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-primary-foreground" />
            </div>
            <DialogTitle className="text-primary-foreground text-lg m-0">
              {lang === 'zh' ? '账户余额不足' : 'Insufficient Balance'}
            </DialogTitle>
          </div>
          
          <div className="p-6">
            {/* Warning Message */}
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {lang === 'zh' ? '您的账户余额不足' : 'Your account balance is insufficient'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {lang === 'zh' ? '无法获取号码，请先充值后再试' : 'Cannot get number, please recharge first'}
                </p>
              </div>
            </div>
            
            {/* Info Tip */}
            <div className="bg-info/10 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-info">
                    {lang === 'zh' ? '温馨提示：' : 'Tips:'}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {lang === 'zh' 
                      ? '我们提供多种充值选择，充值后即可使用全球验证码接收服务。新用户充值满50元即可享受9折优惠！'
                      : 'We offer multiple payment options. After recharging, you can use the global verification code service. New users get 10% off on charges over ¥50!'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Recharge Options */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border border-border rounded-xl p-4 text-center hover:border-secondary transition-colors cursor-pointer group">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <Zap className="h-6 w-6 text-secondary" />
                </div>
                <h4 className="font-semibold text-foreground">
                  {lang === 'zh' ? '快速充值' : 'Quick Recharge'}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === 'zh' ? '即时到账，立即使用' : 'Instant credit'}
                </p>
              </div>
              <div className="border border-border rounded-xl p-4 text-center hover:border-secondary transition-colors cursor-pointer group">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
                  <CreditCard className="h-6 w-6 text-success" />
                </div>
                <h4 className="font-semibold text-foreground">
                  {lang === 'zh' ? '多种支付' : 'Multiple Payments'}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === 'zh' ? '支持多种支付方式' : 'Various payment methods'}
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowInsufficientDialog(false)}
              >
                {lang === 'zh' ? '稍后充值' : 'Later'}
              </Button>
              <Button 
                className="flex-1 bg-secondary hover:bg-secondary/90"
                onClick={() => {
                  setShowInsufficientDialog(false);
                  navigate('/recharge');
                }}
              >
                <Banknote className="h-4 w-4 mr-2" />
                {lang === 'zh' ? '立即充值' : 'Recharge Now'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Index;
