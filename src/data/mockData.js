export const mockMerchants = [
  { id: '1', name: 'Café Le Central', slug: 'cafe-le-central', owner: 'Pierre Martin', email: 'pierre@cafecentral.fr', phone: '01 23 45 67 89', type: 'cafe', status: 'active', subscription: 'pro', logo: null, bgColor: '#1e3a5f', textColor: '#ffffff', accentColor: '#f0c040', welcomeMsg: 'Bienvenue au Café Le Central !', customersCount: 234, cardsCount: 210, pointsDistributed: 14520, createdAt: '2024-06-15' },
  { id: '2', name: 'Salon Sarah', slug: 'salon-sarah', owner: 'Sarah Dubois', email: 'sarah@salonsarah.fr', phone: '01 98 76 54 32', type: 'salon', status: 'active', subscription: 'pro', logo: null, bgColor: '#d4a5a5', textColor: '#2d2d2d', accentColor: '#e8c4c4', welcomeMsg: 'Bienvenue chez Salon Sarah !', customersCount: 156, cardsCount: 140, pointsDistributed: 8930, createdAt: '2024-07-20' },
  { id: '3', name: 'Boutique Lumière', slug: 'boutique-lumiere', owner: 'Claire Leroy', email: 'claire@boutiquelumiere.fr', phone: '01 11 22 33 44', type: 'boutique', status: 'suspended', subscription: 'free', logo: null, bgColor: '#fdf6e3', textColor: '#333333', accentColor: '#c49b63', welcomeMsg: 'Découvrez Boutique Lumière !', customersCount: 45, cardsCount: 38, pointsDistributed: 2100, createdAt: '2024-09-01' },
  { id: '4', name: 'Restaurant Belle Vie', slug: 'restaurant-belle-vie', owner: 'Marc Fournier', email: 'marc@bellevie.fr', phone: '01 55 66 77 88', type: 'restaurant', status: 'active', subscription: 'pro', logo: null, bgColor: '#2c3e50', textColor: '#ecf0f1', accentColor: '#e74c3c', welcomeMsg: 'Bienvenue au Restaurant Belle Vie !', customersCount: 312, cardsCount: 290, pointsDistributed: 21300, createdAt: '2024-05-10' },
  { id: '5', name: 'Boulangerie du Coin', slug: 'boulangerie-du-coin', owner: 'Anne Petit', email: 'anne@boulangerie.fr', phone: '01 44 55 66 77', type: 'autre', status: 'active', subscription: 'free', logo: null, bgColor: '#f5e6cc', textColor: '#4a3728', accentColor: '#d4a574', welcomeMsg: 'Bienvenue à la Boulangerie !', customersCount: 89, cardsCount: 78, pointsDistributed: 4200, createdAt: '2024-08-12' }
];

export const mockCustomers = [
  { id: 'c1', name: 'Jean Dupont', phone: '06 12 34 56 78', email: 'jean.dupont@email.com', points: 450, visits: 23, lastVisit: '2025-01-10', status: 'active', merchantId: '1', appleSerial: 'APL-001-JD', googleId: 'GW-001-JD', qrToken: 'QR-ABC123' },
  { id: 'c2', name: 'Marie Laurent', phone: '06 98 76 54 32', email: 'marie.laurent@email.com', points: 280, visits: 15, lastVisit: '2025-01-08', status: 'active', merchantId: '1', appleSerial: 'APL-002-ML', googleId: 'GW-002-ML', qrToken: 'QR-DEF456' },
  { id: 'c3', name: 'Sophie Martin', phone: '07 11 22 33 44', email: 'sophie.m@email.com', points: 120, visits: 8, lastVisit: '2024-12-20', status: 'active', merchantId: '1', appleSerial: 'APL-003-SM', googleId: 'GW-003-SM', qrToken: 'QR-GHI789' },
  { id: 'c4', name: 'Lucas Bernard', phone: '06 55 44 33 22', email: 'lucas.b@email.com', points: 60, visits: 3, lastVisit: '2024-11-15', status: 'inactive', merchantId: '1', appleSerial: 'APL-004-LB', googleId: 'GW-004-LB', qrToken: 'QR-JKL012' },
  { id: 'c5', name: 'Emma Petit', phone: '07 22 33 44 55', email: 'emma.p@email.com', points: 890, visits: 45, lastVisit: '2025-01-12', status: 'active', merchantId: '2', appleSerial: 'APL-005-EP', googleId: 'GW-005-EP', qrToken: 'QR-MNO345' },
  { id: 'c6', name: 'Thomas Leroy', phone: '06 33 44 55 66', email: '', points: 340, visits: 18, lastVisit: '2025-01-05', status: 'active', merchantId: '4', appleSerial: 'APL-006-TL', googleId: 'GW-006-TL', qrToken: 'QR-PQR678' },
];

export const mockTransactions = [
  { id: 't1', customerId: 'c1', customerName: 'Jean Dupont', amount: 25.50, points: 26, type: 'purchase', date: '2025-01-10', status: 'completed', merchantId: '1' },
  { id: 't2', customerId: 'c2', customerName: 'Marie Laurent', amount: 15.00, points: 15, type: 'purchase', date: '2025-01-08', status: 'completed', merchantId: '1' },
  { id: 't3', customerId: 'c3', customerName: 'Sophie Martin', amount: 0, points: 10, type: 'visit', date: '2024-12-20', status: 'completed', merchantId: '1' },
  { id: 't4', customerId: 'c1', customerName: 'Jean Dupont', amount: 42.00, points: 42, type: 'purchase', date: '2025-01-05', status: 'completed', merchantId: '1' },
  { id: 't5', customerId: 'c5', customerName: 'Emma Petit', amount: 80.00, points: 80, type: 'purchase', date: '2025-01-12', status: 'completed', merchantId: '2' },
  { id: 't6', customerId: 'c6', customerName: 'Thomas Leroy', amount: 35.00, points: 35, type: 'purchase', date: '2025-01-05', status: 'completed', merchantId: '4' },
  { id: 't7', customerId: 'c2', customerName: 'Marie Laurent', amount: 0, points: -100, type: 'reward', date: '2025-01-02', status: 'completed', merchantId: '1' },
  { id: 't8', customerId: 'c4', customerName: 'Lucas Bernard', amount: 0, points: 50, type: 'bonus', date: '2024-11-15', status: 'completed', merchantId: '1' },
];

export const mockOffers = [
  { id: 'o1', name: 'Café offert', pointsRequired: 100, description: 'Un café offert pour 100 points cumulés.', status: 'active', timesRedeemed: 45, eligible: 12, merchantId: '1' },
  { id: 'o2', name: '10% de réduction', pointsRequired: 200, description: '10% de réduction sur votre prochaine commande.', status: 'active', timesRedeemed: 23, eligible: 8, merchantId: '1' },
  { id: 'o3', name: 'Dessert gratuit', pointsRequired: 300, description: 'Un dessert au choix offert.', status: 'inactive', timesRedeemed: 12, eligible: 5, merchantId: '1' },
  { id: 'o4', name: 'Coupe gratuite', pointsRequired: 500, description: 'Une coupe offerte après 500 points.', status: 'active', timesRedeemed: 8, eligible: 3, merchantId: '2' },
];

export const mockNotifications = [
  { id: 'n1', title: 'Offre spéciale !', body: 'Profitez de -20% ce weekend sur toutes les boissons.', target: 'all', recipients: 234, date: '2025-01-10', status: 'sent', merchantId: '1' },
  { id: 'n2', title: 'Points bonus', body: 'Gagnez le double de points cette semaine !', target: 'all', recipients: 234, date: '2025-01-05', status: 'sent', merchantId: '1' },
  { id: 'n3', title: 'Vous nous manquez !', body: 'Revenez nous voir, un café vous attend.', target: 'inactive', recipients: 18, date: '2024-12-28', status: 'sent', merchantId: '1' },
  { id: 'n4', title: 'Nouvelle offre', body: 'Nouvelle offre disponible dans votre programme.', target: 'all', recipients: 0, date: '2025-01-12', status: 'draft', merchantId: '1' },
];

export const mockSubscriptions = [
  { id: 's1', merchantId: '1', merchantName: 'Café Le Central', plan: 'Pro', status: 'active', price: 29, startDate: '2024-06-15', renewalDate: '2025-02-15' },
  { id: 's2', merchantId: '2', merchantName: 'Salon Sarah', plan: 'Pro', status: 'active', price: 29, startDate: '2024-07-20', renewalDate: '2025-02-20' },
  { id: 's3', merchantId: '3', merchantName: 'Boutique Lumière', plan: 'Free', status: 'expired', price: 0, startDate: '2024-09-01', renewalDate: '2025-01-01' },
  { id: 's4', merchantId: '4', merchantName: 'Restaurant Belle Vie', plan: 'Pro', status: 'active', price: 29, startDate: '2024-05-10', renewalDate: '2025-02-10' },
  { id: 's5', merchantId: '5', merchantName: 'Boulangerie du Coin', plan: 'Free', status: 'active', price: 0, startDate: '2024-08-12', renewalDate: '2025-08-12' },
];

export const mockPasskitLogs = [
  { id: 'pl1', operation: 'create_card', merchant: 'Café Le Central', customer: 'Jean Dupont', status: 'success', message: 'Card created successfully', date: '2025-01-10' },
  { id: 'pl2', operation: 'update_card', merchant: 'Café Le Central', customer: 'Marie Laurent', status: 'success', message: 'Points updated on card', date: '2025-01-08' },
  { id: 'pl3', operation: 'push_design', merchant: 'Salon Sarah', customer: '-', status: 'success', message: 'Design pushed to all cards', date: '2025-01-07' },
  { id: 'pl4', operation: 'send_notification', merchant: 'Café Le Central', customer: '-', status: 'success', message: 'Notification sent to 234 cards', date: '2025-01-05' },
  { id: 'pl5', operation: 'update_card', merchant: 'Boutique Lumière', customer: 'Sophie Martin', status: 'failed', message: 'PassKit API timeout', date: '2025-01-04' },
];

export const mockPasskitTemplates = [
  { id: 'pt1', name: 'Café Le Central - Apple', type: 'apple_wallet', merchant: 'Café Le Central', status: 'active', lastSynced: '2025-01-10' },
  { id: 'pt2', name: 'Café Le Central - Google', type: 'google_wallet', merchant: 'Café Le Central', status: 'active', lastSynced: '2025-01-10' },
  { id: 'pt3', name: 'Salon Sarah - Apple', type: 'apple_wallet', merchant: 'Salon Sarah', status: 'active', lastSynced: '2025-01-07' },
  { id: 'pt4', name: 'Salon Sarah - Google', type: 'google_wallet', merchant: 'Salon Sarah', status: 'active', lastSynced: '2025-01-07' },
  { id: 'pt5', name: 'Boutique Lumière - Apple', type: 'apple_wallet', merchant: 'Boutique Lumière', status: 'error', lastSynced: '2024-12-15' },
];

export const mockAdmins = [
  { id: 'a1', name: 'Admin Principal', email: 'admin@fidelitypro.fr', role: 'admin', status: 'active', lastLogin: '2025-01-12' },
  { id: 'a2', name: 'Support Technique', email: 'support@fidelitypro.fr', role: 'support', status: 'active', lastLogin: '2025-01-11' },
  { id: 'a3', name: 'Super Admin', email: 'super@fidelitypro.fr', role: 'superadmin', status: 'active', lastLogin: '2025-01-12' },
];

export const mockAuditLogs = [
  { id: 'al1', user: 'Admin Principal', role: 'admin', action: 'create_merchant', target: 'Café Le Central', ip: '192.168.1.1', date: '2025-01-10', status: 'success' },
  { id: 'al2', user: 'Admin Principal', role: 'admin', action: 'suspend_merchant', target: 'Boutique Lumière', ip: '192.168.1.1', date: '2025-01-09', status: 'success' },
  { id: 'al3', user: 'Super Admin', role: 'superadmin', action: 'update_settings', target: 'System', ip: '10.0.0.1', date: '2025-01-08', status: 'success' },
  { id: 'al4', user: 'Support Technique', role: 'support', action: 'view_merchant', target: 'Salon Sarah', ip: '192.168.1.5', date: '2025-01-07', status: 'success' },
  { id: 'al5', user: 'Admin Principal', role: 'admin', action: 'push_passkit', target: 'Café Le Central', ip: '192.168.1.1', date: '2025-01-06', status: 'failed' },
];

export const chartData = {
  clientsOverTime: [
    { month: 'Juil', count: 45 }, { month: 'Août', count: 78 }, { month: 'Sep', count: 120 },
    { month: 'Oct', count: 156 }, { month: 'Nov', count: 189 }, { month: 'Déc', count: 210 }, { month: 'Jan', count: 234 }
  ],
  pointsOverTime: [
    { month: 'Juil', points: 2100 }, { month: 'Août', points: 4500 }, { month: 'Sep', points: 6800 },
    { month: 'Oct', points: 8900 }, { month: 'Nov', points: 11200 }, { month: 'Déc', points: 13000 }, { month: 'Jan', points: 14520 }
  ],
  merchantGrowth: [
    { month: 'Juil', count: 1 }, { month: 'Août', count: 2 }, { month: 'Sep', count: 3 },
    { month: 'Oct', count: 3 }, { month: 'Nov', count: 4 }, { month: 'Déc', count: 4 }, { month: 'Jan', count: 5 }
  ]
};