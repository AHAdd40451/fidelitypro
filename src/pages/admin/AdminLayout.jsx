import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { LayoutDashboard, Store, Users, CreditCard, Ticket, Bell, BarChart3, Settings } from 'lucide-react';

export default function AdminLayout() {
  const { t } = useLanguage();
  const items = [
    { path: 'dashboard', label: t('sidebar.dashboard'), icon: LayoutDashboard },
    { path: 'merchants', label: t('sidebar.merchants'), icon: Store },
    // { path: 'subscriptions', label: t('sidebar.subscriptions'), icon: CreditCard },
    { path: 'passkit', label: t('sidebar.passkit'), icon: Ticket },
    // { path: 'notifications', label: t('sidebar.notifications'), icon: Bell },
    { path: 'settings', label: t('sidebar.settings'), icon: Settings },
  ];
  return <DashboardLayout sidebarItems={items} basePath="/admin" title={t('admin.dashboard_title')} />;
}