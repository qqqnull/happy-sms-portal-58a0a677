import { Shield, ShieldCheck, Lock, Database, Headphones } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AppSidebar = () => {
  const { t } = useLanguage();

  const securityBadges = [
    { icon: Lock, label: t('sslEncryption') },
    { icon: ShieldCheck, label: t('realName') },
    { icon: Database, label: t('fundCustody') },
    { icon: Shield, label: t('dataEncryption') },
  ];

  return (
    <aside className="w-60 bg-sidebar text-sidebar-foreground flex flex-col min-h-screen">
      {/* Security Badges */}
      <div className="p-4 space-y-2">
        {securityBadges.map((badge, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-sidebar-accent/50 text-sm"
          >
            <badge.icon className="h-4 w-4 text-success" />
            <span>{badge.label}</span>
          </div>
        ))}
      </div>

      {/* Customer Support */}
      <div className="mt-auto p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-3 py-3 rounded-md bg-sidebar-accent hover:bg-sidebar-accent/80 transition-colors cursor-pointer">
          <Headphones className="h-5 w-5 text-secondary" />
          <div>
            <div className="text-sm font-medium">{t('customerSupport')}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
