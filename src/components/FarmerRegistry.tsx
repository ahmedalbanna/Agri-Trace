import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { Plus, Search, UserPlus, MapPin, Sprout, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FarmerRegistry() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [farmers, setFarmers] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [crops, setCrops] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'farmers'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFarmers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const handleAddFarmer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, 'farmers'), {
        name,
        location,
        crops: crops.split(',').map(c => c.trim()),
        status: 'active',
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setName('');
      setLocation('');
      setCrops('');
    } catch (error) {
      console.error("Error adding farmer:", error);
    }
  };

  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">{t('nav.farmers')}</h1>
          <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider">Farmer Network Management</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-emerald-700 text-white px-5 py-2.5 rounded-lg border border-emerald-800 font-bold flex items-center gap-2 hover:bg-emerald-800 transition-all shadow-sm active:scale-98 text-sm"
        >
          <UserPlus className="w-4 h-4" />
          {t('farmer.add')}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
        <input 
          type="text" 
          placeholder="بحث بالاسم أو الموقع..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-stone-200 rounded-xl py-3.5 pl-11 pr-5 text-sm focus:ring-2 focus:ring-emerald-700/10 outline-none transition-all shadow-sm text-stone-800"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {filteredFarmers.map((farmer) => (
            <motion.div
              key={farmer.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-stone-50 rounded-lg flex items-center justify-center text-stone-400 group-hover:bg-emerald-700 group-hover:text-white transition-all border border-stone-100">
                  <Users className="w-5 h-5" />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  farmer.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                }`}>
                  {farmer.status === 'active' ? t('status.active') : t('status.inactive')}
                </span>
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-1 tracking-tight">{farmer.name}</h3>
              <div className="space-y-1.5 text-stone-500 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 opacity-60" />
                  <span>{farmer.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sprout className="w-3 h-3 opacity-60" />
                  <span className="text-emerald-700 italic">{farmer.crops.join('، ')}</span>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/20 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none group-hover:bg-emerald-50/40 transition-all"></div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 grid place-items-center p-6 backdrop-blur-sm bg-stone-900/10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0"
            />
            <motion.form 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleAddFarmer}
              className="bg-white rounded-xl p-8 border border-stone-200 shadow-2xl max-w-lg w-full relative z-10 space-y-5"
            >
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4 mb-4">
                 <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center text-white">
                    <UserPlus className="w-4 h-4" />
                 </div>
                 <h2 className="text-xl font-bold text-stone-800 tracking-tight">{t('farmer.add')}</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">{t('farmer.name')}</label>
                  <input 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-700/10 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">{t('farmer.location')}</label>
                  <input 
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-700/10 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">{t('farmer.crops')}</label>
                  <input 
                    required
                    value={crops}
                    onChange={(e) => setCrops(e.target.value)}
                    placeholder="بن، عسل، لوز..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-700/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 border border-stone-200 text-stone-600 py-2.5 rounded-lg font-bold text-sm hover:bg-stone-50 transition-all font-sans"
                >
                  {t('common.cancel')}
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-emerald-700 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-800 transition-all shadow-md active:scale-98 font-sans"
                >
                  {t('common.save')}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
