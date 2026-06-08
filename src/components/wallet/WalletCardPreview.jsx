import React from 'react';
import { QrCode, Star } from 'lucide-react';

export default function WalletCardPreview({ type = 'apple', merchantName = 'Mon Commerce', cardTitle = 'Carte de fidélité', bgColor = '#1e3a5f', textColor = '#ffffff', accentColor = '#f0c040', points = 450, customerName = 'Jean Dupont' }) {
  if (type === 'google') {
    return (
      <div className="w-full max-w-[320px] rounded-2xl overflow-hidden shadow-xl border border-border/50" style={{ backgroundColor: bgColor }}>
        <div className="px-5 pt-5 pb-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Star className="h-5 w-5" style={{ color: accentColor }} />
          </div>
          <div>
            <p className="text-xs opacity-70" style={{ color: textColor }}>{cardTitle}</p>
            <p className="font-semibold text-sm" style={{ color: textColor }}>{merchantName}</p>
          </div>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs opacity-60 mb-1" style={{ color: textColor }}>Points</p>
            <p className="text-3xl font-bold" style={{ color: accentColor }}>{points}</p>
          </div>
          <div className="w-16 h-16 rounded-lg bg-white/90 flex items-center justify-center">
            <QrCode className="h-10 w-10 text-gray-800" />
          </div>
        </div>
        <div className="px-5 pb-4 pt-2 border-t border-white/10">
          <p className="text-xs opacity-60" style={{ color: textColor }}>{customerName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[320px] rounded-2xl overflow-hidden shadow-xl border border-border/50" style={{ backgroundColor: bgColor }}>
      <div className="px-5 pt-5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <Star className="h-4 w-4" style={{ color: accentColor }} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: textColor }}>{merchantName}</p>
            <p className="text-[11px] opacity-60" style={{ color: textColor }}>{cardTitle}</p>
          </div>
        </div>
      </div>
      <div className="px-5 py-5 text-center">
        <p className="text-[11px] uppercase tracking-widest opacity-50 mb-1" style={{ color: textColor }}>Points</p>
        <p className="text-4xl font-bold" style={{ color: accentColor }}>{points}</p>
      </div>
      <div className="px-5 pb-5 flex justify-center">
        <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center">
          <QrCode className="h-14 w-14 text-gray-800" />
        </div>
      </div>
      <div className="px-5 pb-4 text-center">
        <p className="text-xs opacity-50" style={{ color: textColor }}>{customerName}</p>
      </div>
    </div>
  );
}