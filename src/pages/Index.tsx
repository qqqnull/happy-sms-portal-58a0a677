import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, Globe, CheckCircle, Zap, ArrowLeft, 
  Shield, ShieldCheck, Lock, Database, Headphones,
  Smartphone, FileText, HelpCircle, BookOpen, 
  UserPlus, MapPin, Phone, MessageSquare, LogIn,
  Filter, ArrowUpDown, RefreshCw, Wifi, Star, Menu
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
import AppHeader from '@/components/layout/AppHeader';
import { getServiceIcon } from '@/lib/serviceIcons';

interface Country {
  id: string;
  name: string;
  name_en: string;
  code: string;
  flag: string;
  region: string;
  price: number;
  is_popular: boolean;
}

interface Service {
  id: string;
  name: string;
  icon: string;
  price_modifier: number;
  is_popular: boolean;
}

type Region = 'all' | 'asia' | 'europe' | 'americas' | 'africa' | 'oceania';
type SortType = 'popular' | 'name' | 'code';

const Index = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<Region>('all');
  const [sortType, setSortType] = useState<SortType>('popular');
  const [showInsufficientDialog, setShowInsufficientDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { user, profile } = useAuth();
  const { t, lang } = useLanguage();
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
        price: Number(c.price)
      })));
    }
    if (servicesRes.data) {
      setServices(servicesRes.data.map(s => ({
        ...s,
        price_modifier: Number(s.price_modifier)
      })));
    }
    setLoading(false);
  };

  const regions: { key: Region; label: string }[] = [
    { key: 'all', label: '所有地区' },
    { key: 'asia', label: '亚洲' },
    { key: 'europe', label: '欧洲' },
    { key: 'americas', label: '美洲' },
    { key: 'africa', label: '非洲' },
    { key: 'oceania', label: '大洋洲' },
  ];

  const filteredCountries = countries
    .filter((country) => {
      const matchesSearch = 
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = selectedRegion === 'all' || country.region === selectedRegion;
      return matchesSearch && matchesRegion;
    })
    .sort((a, b) => {
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

  const handleCountrySelect = (country: Country) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedCountry(country);
    setSelectedService(null);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
  };

  const calculatePrice = () => {
    if (!selectedCountry || !selectedService) return 0;
    return Number((selectedCountry.price * selectedService.price_modifier).toFixed(2));
  };

  const handleGetNumber = () => {
    if (!profile) return;
    
    const price = calculatePrice();
    if (profile.balance < price) {
      setShowInsufficientDialog(true);
      return;
    }
    
    // TODO: Implement number acquisition
    console.log('Get number for', selectedCountry, selectedService);
  };

  const handleBack = () => {
    setSelectedCountry(null);
    setSelectedService(null);
  };

  const navItems = [
    { icon: Smartphone, label: '获取接码号码', path: '/', active: true },
    { icon: FileText, label: 'API接口服务', path: '/api-docs' },
    { icon: Headphones, label: '客户支持中心', path: '/support' },
    { icon: HelpCircle, label: '常见问题解答', path: '/faq' },
    { icon: BookOpen, label: '使用教程', path: '/tutorial' },
  ];

  const securityBadges = [
    { icon: Lock, label: 'SSL加密' },
    { icon: ShieldCheck, label: '实名认证' },
    { icon: Database, label: '资金存管' },
    { icon: Shield, label: '数据加密' },
  ];

  const features = [
    { icon: Shield, title: '安全可靠', desc: '一次性号码，保障隐私安全' },
    { icon: Zap, title: '快速响应', desc: '验证码实时接收，无需等待' },
    { icon: Globe, title: '全球覆盖', desc: '支持全球150+国家地区' },
  ];

  const steps = [
    { icon: UserPlus, title: '注册登录', desc: '创建账户或登录系统' },
    { icon: MapPin, title: '选择国家', desc: '选择国家和服务' },
    { icon: Phone, title: '获取号码', desc: '系统分配接码号码' },
    { icon: MessageSquare, title: '接收验证码', desc: '实时查看验证码' },
  ];

  // Sidebar content component for reuse
  const SidebarContent = () => (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="bg-primary text-primary-foreground px-4 py-3 font-semibold">
          服务导航
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
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Security Badges */}
      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="bg-primary text-primary-foreground px-4 py-3 font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" />
          安全保障
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          {securityBadges.map((badge, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
              <badge.icon className="h-4 w-4 text-success" />
              <span>{badge.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Support */}
      <div className="bg-card rounded-xl shadow-sm p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
          <Headphones className="h-8 w-8 text-secondary" />
        </div>
        <h3 className="font-semibold mb-1">专业技术支持</h3>
        <p className="text-sm text-muted-foreground mb-4">7x24小时全天候服务响应</p>
        <Button className="w-full bg-primary hover:bg-primary/90">
          <MessageSquare className="h-4 w-4 mr-2" />
          咨询客服
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
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
              <SheetTitle>服务导航</SheetTitle>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Left Sidebar - Desktop only */}
        <aside className="w-[280px] min-h-[calc(100vh-56px)] p-4 hidden lg:block">
          <SidebarContent />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-4 pb-24 lg:pb-4">
          {!selectedCountry ? (
            <>
              {/* Service Center Header */}
              <div className="bg-primary text-primary-foreground rounded-xl p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Wifi className="h-5 w-5 sm:h-6 sm:w-6" />
                    <h1 className="text-lg sm:text-xl font-bold">接码服务中心</h1>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-success/20 text-success text-xs sm:text-sm">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-success animate-pulse"></span>
                      系统正常
                    </span>
                    <span className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-white/10 text-xs sm:text-sm">
                      <RefreshCw className="h-3 w-3" />
                      实时更新
                    </span>
                  </div>
                </div>

                {/* Stats - Responsive grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mt-3 sm:mt-4">
                  <div className="flex items-center gap-2 sm:gap-3 bg-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3">
                    <Globe className="h-8 w-8 sm:h-10 sm:w-10 opacity-80 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm sm:text-base">全球覆盖</div>
                      <div className="text-xs sm:text-sm opacity-80 truncate">支持150+国家和地区</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 bg-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3">
                    <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 opacity-80 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm sm:text-base">高接收率</div>
                      <div className="text-xs sm:text-sm opacity-80 truncate">成功率达99.9%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 bg-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3">
                    <Zap className="h-8 w-8 sm:h-10 sm:w-10 opacity-80 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm sm:text-base">即时到账</div>
                      <div className="text-xs sm:text-sm opacity-80 truncate">充值秒到，即刻使用</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="bg-card rounded-xl shadow-sm p-3 sm:p-4">
                {/* Mobile: Stacked layout */}
                <div className="flex flex-col gap-3 sm:hidden">
                  {/* Search Input - Full width on mobile */}
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索国家/地区..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Region Tabs - Scrollable on mobile */}
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
                          {region.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort Select */}
                  <Select value={sortType} onValueChange={(v) => setSortType(v as SortType)}>
                    <SelectTrigger className="w-full">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">按热门排序</SelectItem>
                      <SelectItem value="name">按名称排序</SelectItem>
                      <SelectItem value="code">按国家代码排序</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Desktop: Horizontal layout */}
                <div className="hidden sm:flex flex-wrap items-center gap-4">
                  {/* Region Tabs */}
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
                        {region.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1" />

                  {/* Search Input */}
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索国家/地区..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Region Select */}
                  <Select value={selectedRegion} onValueChange={(v) => setSelectedRegion(v as Region)}>
                    <SelectTrigger className="w-32">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.key} value={region.key}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Sort Select */}
                  <Select value={sortType} onValueChange={(v) => setSortType(v as SortType)}>
                    <SelectTrigger className="w-36">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">按热门排序</SelectItem>
                      <SelectItem value="name">按名称排序</SelectItem>
                      <SelectItem value="code">按国家代码排序</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Countries Section */}
              <div className="bg-card rounded-xl shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-secondary" />
                    <h2 className="font-semibold">选择国家/地区</h2>
                  </div>
                  <span className="text-sm text-muted-foreground">支持 {countries.length}+ 国家和地区</span>
                </div>

                <div className="p-4">
                  {loading ? (
                    <div className="text-center py-16">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
                      <p className="text-muted-foreground mt-4">正在加载国家数据...</p>
                    </div>
                  ) : !user ? (
                    <div className="text-center py-16">
                      <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">请登录后查看所有可用国家和地区</p>
                      <Button 
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => navigate('/login')}
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        立即登录
                      </Button>
                    </div>
                  ) : filteredCountries.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {filteredCountries.map((country) => (
                        <div
                          key={country.id}
                          onClick={() => handleCountrySelect(country)}
                          className="p-4 rounded-xl border border-border hover:border-secondary hover:shadow-lg transition-all cursor-pointer group bg-card"
                        >
                          <div className="text-3xl mb-2">{country.flag}</div>
                          <div className="font-medium text-foreground group-hover:text-secondary transition-colors truncate">
                            {lang === 'zh' ? country.name : country.name_en}
                          </div>
                          <div className="text-sm text-muted-foreground">+{country.code}</div>
                          <div className="text-sm font-semibold text-accent mt-1">
                            ${country.price.toFixed(2)}
                          </div>
                          {country.is_popular && (
                            <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs bg-accent/10 text-accent">
                              热门
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">没有找到匹配的国家</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Services Preview - Scrolling Animation */}
              <div className="bg-card rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-secondary" />
                    <h2 className="font-semibold">选择服务</h2>
                  </div>
                  <span className="text-sm text-muted-foreground">支持 {services.length}+ 主流应用服务</span>
                </div>

                <div className="p-4">
                  {/* Scrolling Services Showcase */}
                  <div className="relative overflow-hidden">
                    {/* First row - scrolling left */}
                    <div className="flex gap-3 animate-scroll-left mb-3">
                      {[...services, ...services].map((service, index) => (
                        <div
                          key={`row1-${index}`}
                          onClick={() => !user && navigate('/login')}
                          className="flex-shrink-0 w-32 p-3 rounded-xl border border-border bg-card hover:border-secondary hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="text-2xl mb-1">{getServiceIcon(service.icon)}</div>
                          <div className="font-medium text-sm truncate text-foreground">{service.name}</div>
                          {service.is_popular && (
                            <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-xs bg-accent/10 text-accent">
                              <Star className="h-3 w-3" />
                              热门
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Second row - scrolling right */}
                    <div className="flex gap-3 animate-scroll-right">
                      {[...services.slice().reverse(), ...services.slice().reverse()].map((service, index) => (
                        <div
                          key={`row2-${index}`}
                          onClick={() => !user && navigate('/login')}
                          className="flex-shrink-0 w-32 p-3 rounded-xl border border-border bg-card hover:border-secondary hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="text-2xl mb-1">{getServiceIcon(service.icon)}</div>
                          <div className="font-medium text-sm truncate text-foreground">{service.name}</div>
                          {service.is_popular && (
                            <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-xs bg-accent/10 text-accent">
                              <Star className="h-3 w-3" />
                              热门
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Gradient overlays */}
                    <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-card to-transparent pointer-events-none z-10"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-card to-transparent pointer-events-none z-10"></div>
                  </div>

                  {/* Info banner */}
                  <div className="mt-4 p-4 rounded-xl bg-secondary/10 text-center">
                    <p className="text-muted-foreground">
                      登录后可查看每个国家支持的全部服务项目，部分国家支持高达 <span className="text-secondary font-bold">180+</span> 种服务
                    </p>
                    {!user && (
                      <Button 
                        className="mt-3 bg-secondary hover:bg-secondary/90"
                        onClick={() => navigate('/login')}
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        立即登录查看
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
                      <h3 className="font-bold text-base sm:text-lg text-secondary">{feature.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Usage Steps */}
              <div className="bg-primary text-primary-foreground rounded-xl overflow-hidden">
                <div className="px-3 sm:px-4 py-3 border-b border-white/10 flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  <h2 className="font-semibold text-sm sm:text-base">使用流程</h2>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                    {steps.map((step, index) => (
                      <div key={index} className="text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 rounded-full bg-white/10 flex items-center justify-center">
                          <step.icon className="h-6 w-6 sm:h-8 sm:w-8" />
                        </div>
                        <h4 className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1">{step.title}</h4>
                        <p className="text-xs sm:text-sm opacity-80">{step.desc}</p>
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
                返回国家列表
              </Button>

              {/* Selected Country Info */}
              <div className="bg-card rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{selectedCountry.flag}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {lang === 'zh' ? selectedCountry.name : selectedCountry.name_en}
                    </h2>
                    <p className="text-muted-foreground">+{selectedCountry.code}</p>
                  </div>
                </div>
              </div>

              {/* Services Grid */}
              <div className="bg-card rounded-xl shadow-sm">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-secondary" />
                    <h3 className="font-semibold">选择服务</h3>
                  </div>
                  <span className="text-sm text-muted-foreground">可用服务 {services.length} 项</span>
                </div>
                <div className="p-4">
                  {/* Search for services */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="搜索服务..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {services.map((service) => {
                      const price = (selectedCountry.price * service.price_modifier).toFixed(2);
                      const isSelected = selectedService?.id === service.id;
                      
                      return (
                        <div
                          key={service.id}
                          onClick={() => handleServiceSelect(service)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-secondary bg-secondary/5 shadow-lg ring-2 ring-secondary/20' 
                              : 'border-border hover:border-secondary hover:shadow-md'
                          }`}
                        >
                          <div className="text-2xl mb-2">{getServiceIcon(service.icon)}</div>
                          <div className={`font-medium truncate ${isSelected ? 'text-secondary' : 'text-foreground'}`}>
                            {service.name}
                          </div>
                          <div className="text-sm font-semibold text-accent mt-1">
                            ${price}
                          </div>
                          {service.is_popular && (
                            <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded text-xs bg-accent/10 text-accent">
                              <Star className="h-3 w-3" />
                              热门
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Get Number Button */}
                  {selectedService && (
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-secondary/10 to-accent/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                      <div>
                        <div className="text-xs sm:text-sm text-muted-foreground mb-1">
                          {selectedCountry.flag} {lang === 'zh' ? selectedCountry.name : selectedCountry.name_en} · {selectedService.name}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-muted-foreground text-sm">总价：</span>
                          <span className="text-2xl sm:text-3xl font-bold text-accent">${calculatePrice()}</span>
                        </div>
                      </div>
                      <Button
                        size="lg"
                        className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 text-base sm:text-lg px-6 sm:px-8 shadow-lg"
                        onClick={handleGetNumber}
                      >
                        <Phone className="h-5 w-5 mr-2" />
                        获取号码
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Insufficient Balance Dialog */}
      <Dialog open={showInsufficientDialog} onOpenChange={setShowInsufficientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>余额不足</DialogTitle>
            <DialogDescription>
              请先充值后再获取号码
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInsufficientDialog(false)}>
              取消
            </Button>
            <Button 
              className="bg-accent hover:bg-accent/90"
              onClick={() => {
                setShowInsufficientDialog(false);
                navigate('/recharge');
              }}
            >
              去充值
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
