import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, where, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { Box, Globe, ChevronRight, Activity, MapPin, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function BatchTracker() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [batches, setBatches] = useState<any[]>([]);
  const [availableLogs, setAvailableLogs] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [batchName, setBatchName] = useState('');
  const [cropType, setCropType] = useState('');
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  const [destination, setDestination] = useState('');

  useEffect(() => {
    const qBatches = query(collection(db, 'exportBatches'), orderBy('createdAt', 'desc'));
    const unsubscribeBatches = onSnapshot(qBatches, (snapshot) => {
      setBatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qLogs = query(collection(db, 'harvestLogs'), where('status', '==', 'received'));
    const unsubscribeLogs = onSnapshot(qLogs, (snapshot) => {
      setAvailableLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeBatches();
      unsubscribeLogs();
    };
  }, []);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || selectedLogIds.length === 0) return;

    const selectedLogsData = availableLogs.filter(l => selectedLogIds.includes(l.id));
    const totalQuantity = selectedLogsData.reduce((acc, curr) => acc + curr.quantity, 0);

    try {
      // 1. Create the Batch document
      const batchRef = await addDoc(collection(db, 'exportBatches'), {
        batchName,
        cropType,
        totalQuantity,
        logsCount: selectedLogIds.length,
        destination,
        status: 'collecting',
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });

      // 2. Update all logs to 'batched' status and link to batch
      const batchOp = writeBatch(db);
      selectedLogIds.forEach(id => {
        const logRef = doc(db, 'harvestLogs', id);
        batchOp.update(logRef, { 
          status: 'batched',
          batchId: batchRef.id 
        });
      });
      await batchOp.commit();

      setIsCreating(false);
      setBatchName('');
      setSelectedLogIds([]);
    } catch (error) {
      console.error("Error creating batch:", error);
    }
  };

  const toggleLogSelection = (id: string) => {
    setSelectedLogIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">{t('nav.batches')}</h1>
          <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider">International Export Logistics</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-emerald-700 text-white px-5 py-2.5 rounded-lg border border-emerald-800 font-bold flex items-center gap-2 hover:bg-emerald-800 transition-all shadow-sm active:scale-98 text-sm"
        >
          <Box className="w-4 h-4" />
          {t('batch.new')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {batches.map(batch => (
          <motion.div 
            key={batch.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-xl shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[220px] transition-all group ${
              batch.status === 'collecting' ? 'bg-emerald-900 text-white' : 'bg-white border border-stone-200 text-stone-900'
            }`}
          >
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                 <div className={`w-12 h-12 rounded-lg grid place-items-center ${
                   batch.status === 'collecting' ? 'bg-emerald-800 border border-emerald-700' : 'bg-stone-50 border border-stone-100'
                 }`}>
                   <Globe className={`w-6 h-6 ${batch.status === 'collecting' ? 'text-emerald-400' : 'text-emerald-700'}`} />
                 </div>
                 <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                   batch.status === 'collecting' ? 'bg-amber-400 text-amber-950 border-amber-500' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                 }`}>
                    {batch.status}
                 </span>
              </div>
              <h3 className={`text-xl font-bold tracking-tight mb-1 italic ${batch.status === 'collecting' ? 'text-white' : 'text-stone-800'}`}>
                {batch.batchName}
              </h3>
              <p className={`text-xs font-medium uppercase tracking-widest opacity-60 mb-6`}>
                {batch.cropType} • {batch.totalQuantity} {batch.totalQuantity > 1000 ? 'Ton' : 'Kg'}
              </p>

              <div className="space-y-3">
                 <div className="flex justify-between text-[10px] font-bold uppercase opacity-80 letter-spacing-wider">
                    <span>Batch Readiness</span>
                    <span>{batch.status === 'collecting' ? '65%' : '100%'}</span>
                 </div>
                 <div className={`w-full h-1.5 rounded-full overflow-hidden ${batch.status === 'collecting' ? 'bg-emerald-800' : 'bg-stone-100'}`}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: batch.status === 'collecting' ? '65%' : '100%' }}
                      className={`h-full ${batch.status === 'collecting' ? 'bg-amber-400' : 'bg-emerald-600'}`}
                    />
                 </div>
              </div>
            </div>

            <div className="relative z-10 mt-6 flex justify-between items-center bg-black/5 p-3 rounded-lg -mx-2 mb-[-8px]">
               <div className="flex items-center gap-2">
                 <MapPin className={`w-3.5 h-3.5 ${batch.status === 'collecting' ? 'text-emerald-400' : 'text-stone-400'}`} />
                 <span className={`text-[11px] font-bold ${batch.status === 'collecting' ? 'text-emerald-100' : 'text-stone-600'}`}>{batch.destination || 'Not Assigned'}</span>
               </div>
               <button className={`p-1.5 rounded-md hover:bg-black/10 transition-all ${batch.status === 'collecting' ? 'text-white' : 'text-stone-400'}`}>
                 <ChevronRight className="w-4 h-4" />
               </button>
            </div>

            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          </motion.div>
        ))}
      </div>

      {/* Create Batch Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 grid place-items-center p-6 overflow-y-auto bg-stone-900/10 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              className="absolute inset-0"
            />
            <motion.form 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleCreateBatch}
              className="bg-white rounded-xl p-8 border border-stone-200 shadow-2xl max-w-3xl w-full relative z-10 space-y-6 my-10"
            >
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4 mb-4">
                 <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center text-white">
                    <Box className="w-4 h-4" />
                 </div>
                 <h2 className="text-xl font-bold text-stone-800 tracking-tight">{t('batch.new')}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-start">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">اسم الدفعة</label>
                    <input 
                      required
                      value={batchName}
                      onChange={(e) => setBatchName(e.target.value)}
                      placeholder="مثل: شحنة بن مايو 2024"
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-700/10 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">نوع المحصول</label>
                    <input 
                      required
                      value={cropType}
                      onChange={(e) => setCropType(e.target.value)}
                      placeholder="مثل: بن مران"
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-700/10 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">الوجهة النهائية</label>
                    <input 
                      required
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="مثل: برلين، ألمانيا"
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-700/10 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 flex flex-col h-full">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">اختر التوريدات (متاح: {availableLogs.length})</label>
                  <div className="flex-1 bg-stone-50 border border-stone-200 rounded-lg p-3 overflow-y-auto max-h-72 space-y-2">
                    {availableLogs.length === 0 && <div className="text-stone-400 text-[10px] text-center py-10 font-bold uppercase tracking-wider italic">لا توجد توريدات جديدة</div>}
                    {availableLogs.map(log => (
                      <div 
                        key={log.id}
                        onClick={() => toggleLogSelection(log.id)}
                        className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                          selectedLogIds.includes(log.id) 
                          ? 'bg-emerald-700 border-emerald-800 text-white shadow-md' 
                          : 'bg-white border-stone-200 hover:border-emerald-200'
                        }`}
                      >
                        <div>
                          <p className={`font-bold text-xs ${selectedLogIds.includes(log.id) ? 'text-white' : 'text-stone-800'}`}>{log.farmerName}</p>
                          <p className={`text-[10px] font-bold opacity-60 ${selectedLogIds.includes(log.id) ? 'text-emerald-100' : 'text-stone-500'}`}>{log.cropType} • {log.quantity} {log.unit}</p>
                        </div>
                        {selectedLogIds.includes(log.id) && <CheckCircle className="w-4 h-4 text-amber-400" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-stone-100">
                <button 
                  type="button" 
                  onClick={() => setIsCreating(false)}
                  className="flex-1 border border-stone-200 text-stone-600 py-3 rounded-lg font-bold text-sm hover:bg-stone-50 transition-all font-sans"
                >
                  {t('common.cancel')}
                </button>
                <button 
                  type="submit"
                  disabled={selectedLogIds.length === 0}
                  className="flex-1 bg-emerald-700 text-white py-3 rounded-lg font-bold text-sm disabled:bg-stone-200 disabled:text-stone-400 transition-all shadow-lg active:scale-98 font-sans"
                >
                  {t('common.save')} ({selectedLogIds.length})
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
