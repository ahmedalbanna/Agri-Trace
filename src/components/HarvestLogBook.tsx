import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { Package, Calendar, Weight, Star, User, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function HarvestLogBook() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [logs, setLogs] = useState<any[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [isLogging, setIsLogging] = useState(false);

  // Form State
  const [farmerId, setFarmerId] = useState('');
  const [cropType, setCropType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [qualityGrade, setQualityGrade] = useState('A');

  useEffect(() => {
    const qLogs = query(collection(db, 'harvestLogs'), orderBy('receivedAt', 'desc'));
    const unsubscribeLogs = onSnapshot(qLogs, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qFarmers = query(collection(db, 'farmers'), orderBy('name', 'asc'));
    const unsubscribeFarmers = onSnapshot(qFarmers, (snapshot) => {
      setFarmers(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
    });

    return () => {
      unsubscribeLogs();
      unsubscribeFarmers();
    };
  }, []);

  const handleLogHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !farmerId) return;

    const selectedFarmer = farmers.find(f => f.id === farmerId);

    try {
      await addDoc(collection(db, 'harvestLogs'), {
        farmerId,
        farmerName: selectedFarmer?.name || 'Unknown',
        cropType,
        quantity: Number(quantity),
        unit,
        qualityGrade,
        status: 'received',
        receivedAt: serverTimestamp(),
        createdBy: user.uid
      });
      setIsLogging(false);
      setFarmerId('');
      setCropType('');
      setQuantity('');
    } catch (error) {
      console.error("Error logging harvest:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">{t('nav.harvests')}</h1>
          <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider">Logistics & Intake Management</p>
        </div>
        <button 
          onClick={() => setIsLogging(true)}
          className="bg-emerald-700 text-white px-5 py-2.5 rounded-lg border border-emerald-800 font-bold flex items-center gap-2 hover:bg-emerald-800 transition-all shadow-sm active:scale-98 text-sm"
        >
          <Plus className="w-4 h-4" />
          {t('harvest.add')}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4 text-start">{t('farmer.name')}</th>
                <th className="px-6 py-4 text-start">{t('farmer.crops')}</th>
                <th className="px-6 py-4 text-center">الكمية</th>
                <th className="px-6 py-4 text-start">الجودة</th>
                <th className="px-6 py-4 text-start">التاريخ</th>
                <th className="px-6 py-4 text-start">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-stone-100 rounded-lg grid place-items-center border border-stone-200">
                        <User className="w-4 h-4 text-stone-400" />
                      </div>
                      <span className="font-bold text-stone-800">{log.farmerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-stone-600 font-medium italic">{log.cropType}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-stone-800">{log.quantity}</span>
                    <span className="text-stone-400 text-[10px] ms-1 font-bold">{log.unit}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      log.qualityGrade === 'A' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {log.qualityGrade === 'A' ? `ممتاز (${log.qualityGrade})` : log.qualityGrade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-stone-400 text-xs font-semibold">
                    {log.receivedAt?.toDate().toLocaleDateString(language === 'ar' ? 'ar-YE' : 'en-US')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-wider border border-emerald-100">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Modal */}
      <AnimatePresence>
        {isLogging && (
          <div className="fixed inset-0 z-50 grid place-items-center p-6 bg-stone-900/10 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogging(false)}
              className="absolute inset-0"
            />
            <motion.form 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleLogHarvest}
              className="bg-white rounded-xl p-8 border border-stone-200 shadow-2xl max-w-lg w-full relative z-10 space-y-5"
            >
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4 mb-4">
                 <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center text-white">
                    <Plus className="w-4 h-4" />
                 </div>
                 <h2 className="text-xl font-bold text-stone-800 tracking-tight">{t('harvest.add')}</h2>
              </div>
              
              <div className="space-y-4 text-start">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">{t('farmer.name')}</label>
                  <select 
                    required
                    value={farmerId}
                    onChange={(e) => setFarmerId(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-700/10 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">اختر المزارع...</option>
                    {farmers.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">{t('farmer.crops')}</label>
                    <input 
                      required
                      value={cropType}
                      onChange={(e) => setCropType(e.target.value)}
                      placeholder="مثل: بن يافعي"
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">الجودة</label>
                    <select 
                      value={qualityGrade}
                      onChange={(e) => setQualityGrade(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm outline-none cursor-pointer"
                    >
                      <option value="A">Grade A (ممتاز)</option>
                      <option value="B">Grade B (جيد)</option>
                      <option value="C">Grade C (تجاري)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">الكمية</label>
                    <input 
                      required
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">الوحدة</label>
                    <select 
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm outline-none cursor-pointer"
                    >
                      <option value="kg">كيلوجرام (kg)</option>
                      <option value="liters">لتر (liters)</option>
                      <option value="tonnes">طن (tonnes)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsLogging(false)}
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
