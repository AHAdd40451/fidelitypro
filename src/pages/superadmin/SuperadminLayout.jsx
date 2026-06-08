import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { LayoutDashboard, Shield, Lock, Settings, FileText, ToggleLeft, DollarSign, Ticket } from 'lucide-react';

export default function SuperadminLayout() {
  const { t } = useLanguage();
  const items = [
    { path: 'dashboard', label: t('sidebar.overview'), icon: LayoutDashboard },
    { path: 'admins', label: t('sidebar.admins'), icon: Shield },
    { path: 'roles', label: t('sidebar.roles'), icon: Lock },
    { path: 'system-settings', label: t('sidebar.system_settings'), icon: Settings },
    { path: 'audit-logs', label: t('sidebar.audit_logs'), icon: FileText },
    { path: 'feature-flags', label: t('sidebar.feature_flags'), icon: ToggleLeft },
  ];
  return <DashboardLayout sidebarItems={items} basePath="/superadmin" title={t('superadmin.dashboard_title')} />;
}