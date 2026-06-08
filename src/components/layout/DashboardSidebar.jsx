import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { Star, X } from 'lucide-react';

export default function DashboardSidebar({ items, basePath, open, onClose }) {
  const location = useLocation();
  const { t } = useLanguage();

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 px-5 flex items-center justify-between border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Star className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">FidélityPro</span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {items.map((item) => {
              const isActive = location.pathname === `${basePath}/${item.path}` || (item.path === 'dashboard' && location.pathname === basePath);
              return (
                <Link
                  key={item.path}
                  to={`${basePath}/${item.path}`}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}