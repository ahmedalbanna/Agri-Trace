import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: 'rtl' | 'ltr';
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    'app.title': 'أغري-تريس: تتبع المحاصيل',
    'nav.farmers': 'المزارعون',
    'nav.harvests': 'الحصاد',
    'nav.batches': 'دُفُعات التصدير',
    'nav.payments': 'المدفوعات',
    'nav.settings': 'الإعدادات',
    'farmer.name': 'اسم المزارع',
    'farmer.location': 'الموقع',
    'farmer.crops': 'المحاصيل',
    'farmer.add': 'إضافة مزارع جديد',
    'harvest.log': 'سجل الحصاد',
    'harvest.add': 'تسجيل شحنة جديدة',
    'batch.track': 'تتبع الدفعات',
    'batch.new': 'إنشاء دفعة تصدير',
    'payment.manage': 'إدارة المستحقات',
    'status.active': 'نشط',
    'status.inactive': 'غير نشط',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.loading': 'جاري التحميل...',
    'auth.welcome': 'مرحباً بك في نظام الجمعية',
    'auth.login': 'تسجيل الدخول عبر جوجل'
  },
  en: {
    'app.title': 'Agri-Trace: Crop Traceability',
    'nav.farmers': 'Farmers',
    'nav.harvests': 'Harvests',
    'nav.batches': 'Export Batches',
    'nav.payments': 'Payments',
    'nav.settings': 'Settings',
    'farmer.name': 'Farmer Name',
    'farmer.location': 'Location',
    'farmer.crops': 'Crops',
    'farmer.add': 'Add New Farmer',
    'harvest.log': 'Harvest Log',
    'harvest.add': 'Log New Delivery',
    'batch.track': 'Track Batches',
    'batch.new': 'New Export Batch',
    'payment.manage': 'Manage Payments',
    'status.active': 'Active',
    'status.inactive': 'Inactive',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    'auth.welcome': 'Welcome to Co-op System',
    'auth.login': 'Login with Google'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');

  const t = (key: string) => translations[language][key] || key;
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
