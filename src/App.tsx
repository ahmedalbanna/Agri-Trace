import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Package, 
  TrendingUp, 
  CreditCard, 
  Settings, 
  Plus, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { LanguageProvider, useLanguage } from './hooks/useLanguage';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Components
import FarmerRegistry from './components/FarmerRegistry';
import HarvestLogBook from './components/HarvestLogBook';
import BatchTracker from './components/BatchTracker';
import PaymentDashboard from './components/PaymentDashboard';

function AppContent() {
  const { user, loading, login, logout } = useAuth();
  const { t, dir, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab ] = useState('farmers');

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-stone-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-emerald-700 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-8 border border-stone-200 shadow-sm max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-emerald-700 rounded-xl grid place-items-center mx-auto mb-6 shadow-md shadow-emerald-700/20">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-stone-800 mb-1 leading-tight">{t('app.title')}</h1>
          <p className="text-stone-500 text-sm mb-8">{t('auth.welcome')}</p>
          <button 
            onClick={login}
            className="w-full bg-emerald-700 text-white py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-3 hover:bg-emerald-800 transition-all active:scale-98"
          >
            {t('auth.login')}
          </button>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'farmers', icon: Users, label: t('nav.farmers') },
    { id: 'harvests', icon: Package, label: t('nav.harvests') },
    { id: 'batches', icon: TrendingUp, label: t('nav.batches') },
    { id: 'payments', icon: CreditCard, label: t('nav.payments') },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 overflow-hidden font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-700 rounded-lg flex items-center justify-center text-white shadow-sm">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-stone-800 tracking-tight leading-none">أجري-تروك</h1>
            <p className="text-[10px] text-stone-500 mt-1 uppercase tracking-wider font-semibold">Agri-Cooperative Management</p>
          </div>
        </div>

        <nav className="hidden md:flex gap-8 text-sm font-bold">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-1 transition-all border-b-2 ${
                activeTab === tab.id 
                ? 'text-emerald-700 border-emerald-700' 
                : 'text-stone-400 border-transparent hover:text-stone-800 hover:border-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4 border-s border-stone-200 ps-4">
          <div className="hidden lg:block text-start px-2">
            <p className="text-sm font-bold text-stone-800 leading-none">{user.displayName}</p>
            <p className="text-[10px] text-stone-500 uppercase mt-0.5 font-bold tracking-widest">{language === 'ar' ? 'مدير الجمعية' : 'Manager'}</p>
          </div>
          <button 
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="p-2 hover:bg-stone-50 rounded-lg text-stone-500 font-bold text-xs border border-stone-200"
          >
            {language === 'ar' ? 'EN' : 'العربية'}
          </button>
          <button 
            onClick={logout}
            className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-all border border-transparent hover:border-red-100"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'farmers' && <FarmerRegistry />}
              {activeTab === 'harvests' && <HarvestLogBook />}
              {activeTab === 'batches' && <BatchTracker />}
              {activeTab === 'payments' && <PaymentDashboard />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden bg-white border-t border-stone-200 flex justify-around p-2 sticky bottom-0 z-30">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
              activeTab === tab.id ? 'text-emerald-700 bg-emerald-50' : 'text-stone-400'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] font-bold">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
