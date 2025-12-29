import { useState, useEffect } from 'react';
import { Search, Globe, CheckCircle, Zap, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/components/layout/MainLayout';

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

const Index = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<Region>('all');
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

  const stats = [
    { icon: Globe, label: t('globalCoverage'), color: 'text-secondary' },
    { icon: CheckCircle, label: t('successRate'), color: 'text-success' },
    { icon: Zap, label: t('instantRecharge'), color: 'text-accent' },
  ];

  const regions: { key: Region; label: string }[] = [
    { key: 'all', label: t('allRegions') },
    { key: 'asia', label: t('asia') },
    { key: 'europe', label: t('europe') },
    { key: 'americas', label: t('americas') },
    { key: 'africa', label: t('africa') },
    { key: 'oceania', label: t('oceania') },
  ];

  const filteredCountries = countries.filter((country) => {
    const matchesSearch = 
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || country.region === selectedRegion;
    return matchesSearch && matchesRegion;
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

  return (
    <MainLayout>
      <div className="p-6">
        {/* Service Center Header */}
        <div className="bg-card rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">{t('serviceCenter')}</h1>
              <span className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse-glow"></span>
                {t('systemNormal')}
              </span>
            </div>
          </div>

          <div className="flex gap-6 mt-4">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        {!selectedCountry ? (
          <>
            {/* Search and Filters */}
            <div className="bg-card rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                <div className="relative flex-1 max-w-md w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('searchCountry')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {regions.map((region) => (
                    <Button
                      key={region.key}
                      variant={selectedRegion === region.key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedRegion(region.key)}
                      className={selectedRegion === region.key ? 'bg-secondary hover:bg-secondary/90' : ''}
                    >
                      {region.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Countries Grid */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
                  <p className="text-muted-foreground mt-4">加载中...</p>
                </div>
              ) : filteredCountries.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {filteredCountries.map((country) => (
                    <div
                      key={country.id}
                      onClick={() => handleCountrySelect(country)}
                      className="p-4 rounded-lg border border-border hover:border-secondary hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="text-3xl mb-2">{country.flag}</div>
                      <div className="font-medium text-foreground group-hover:text-secondary transition-colors">
                        {lang === 'zh' ? country.name : country.name_en}
                      </div>
                      <div className="text-sm text-muted-foreground">+{country.code}</div>
                      <div className="text-sm font-medium text-accent mt-1">
                        ${country.price.toFixed(2)}
                      </div>
                      {country.is_popular && (
                        <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs bg-accent/10 text-accent">
                          {t('popular')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">没有找到匹配的国家</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回国家列表
            </Button>

            {/* Selected Country Info */}
            <div className="bg-card rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{selectedCountry.flag}</span>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {lang === 'zh' ? selectedCountry.name : selectedCountry.name_en}
                  </h2>
                  <p className="text-muted-foreground">+{selectedCountry.code}</p>
                </div>
              </div>
            </div>

            {/* Services Grid */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">{t('selectService')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {services.map((service) => {
                  const price = (selectedCountry.price * service.price_modifier).toFixed(2);
                  const isSelected = selectedService?.id === service.id;
                  
                  return (
                    <div
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-secondary bg-secondary/5 shadow-md' 
                          : 'border-border hover:border-secondary hover:shadow-md'
                      }`}
                    >
                      <div className="text-2xl mb-2">📱</div>
                      <div className={`font-medium ${isSelected ? 'text-secondary' : 'text-foreground'}`}>
                        {service.name}
                      </div>
                      <div className="text-sm font-medium text-accent mt-1">
                        ${price} <span className="text-muted-foreground font-normal">{t('pricePerSms')}</span>
                      </div>
                      {service.is_popular && (
                        <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs bg-accent/10 text-accent">
                          {t('popular')}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Get Number Button */}
              {selectedService && (
                <div className="mt-6 p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                  <div>
                    <span className="text-muted-foreground">总价：</span>
                    <span className="text-2xl font-bold text-accent">${calculatePrice()}</span>
                  </div>
                  <Button
                    size="lg"
                    className="bg-secondary hover:bg-secondary/90"
                    onClick={handleGetNumber}
                  >
                    {t('getNumberBtn')}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Insufficient Balance Dialog */}
      <Dialog open={showInsufficientDialog} onOpenChange={setShowInsufficientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('insufficientBalance')}</DialogTitle>
            <DialogDescription>
              {t('pleaseRecharge')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInsufficientDialog(false)}>
              {t('cancel')}
            </Button>
            <Button 
              className="bg-accent hover:bg-accent/90"
              onClick={() => {
                setShowInsufficientDialog(false);
                navigate('/recharge');
              }}
            >
              {t('goRecharge')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Index;
