import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { LayoutDashboard, Users, QrCode, ArrowLeftRight, Gift, Bell, Palette, Globe, Settings } from 'lucide-react';

export default function MerchantLayout() {
  const { t } = useLanguage();
  const items = [
    { path: 'dashboard', label: t('sidebar.dashboard'), icon: LayoutDashboard },
    { path: 'clients', label: t('sidebar.clients'), icon: Users },
    { path: 'scanner', label: t('sidebar.scanner'), icon: QrCode },
    { path: 'transactions', label: t('sidebar.transactions'), icon: ArrowLeftRight },
    { path: 'offres', label: t('sidebar.offers'), icon: Gift },
    // { path: 'notifications', label: t('sidebar.notifications'), icon: Bell },
    { path: 'card-design', label: t('sidebar.card_design'), icon: Palette },
    { path: 'public-page', label: t('sidebar.public_page'), icon: Globe },
    { path: 'settings', label: t('sidebar.settings'), icon: Settings },
  ];
  return <DashboardLayout sidebarItems={items} basePath="/merchant" title="Café Le Central" />;
}