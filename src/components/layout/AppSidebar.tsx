import { useState, useEffect } from 'react';
import { Shield, ShieldCheck, Lock, Database, Headphones, History, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useSupportLink } from '@/hooks/useSupportLink';

const AppSidebar = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { supportLink } = useSupportLink();
  const navigate = useNavigate();

  const securityBadges = [
    { icon: Lock, label: t('sslEncryption') },
    { icon: ShieldCheck, label: t('realName') },
    { icon: Database, label: t('fundCustody') },
    { icon: Shield, label: t('dataEncryption') },
  ];

  return (
    <aside className="w-60 bg-sidebar text-sidebar-foreground flex flex-col min-h-screen">
      {/* Navigation Links */}
      {user && (
        <div className="p-4 space-y-1 border-b border-sidebar-border">
          <div
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer"
          >
            <History className="h-4 w-4" />
            <span>{t('orderHistory')}</span>
          </div>
          {isAdmin && (
            <div
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer text-accent"
            >
              <Settings className="h-4 w-4" />
              <span>管理后台</span>
            </div>
          )}
        </div>
      )}

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
        <a href={supportLink} target="_blank" rel="noopener noreferrer">
          <div className="flex items-center gap-2 px-3 py-3 rounded-md bg-sidebar-accent hover:bg-sidebar-accent/80 transition-colors cursor-pointer">
            <Headphones className="h-5 w-5 text-secondary" />
            <div>
              <div className="text-sm font-medium">{t('customerSupport')}</div>
            </div>
          </div>
        </a>
      </div>
    </aside>
  );
};

export default AppSidebar;