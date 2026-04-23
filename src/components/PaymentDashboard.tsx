import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { CreditCard, Check, Clock, Wallet, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function PaymentDashboard() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    // Show logs that are either batched or paid
    const q = query(
      collection(db, 'harvestLogs'), 
      where('status', 'in', ['batched', 'paid']),
      orderBy('receivedAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const handleMarkPaid = async (id: string) => {
    try {
      await updateDoc(doc(db, 'harvestLogs', id), {
        status: 'paid'
      });
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  const totalPayable = logs.reduce((acc, l) => l.status === 'batched' ? acc + (l.quantity * 10) : acc, 0); // Mock rate
  const totalPaid = logs.reduce((acc, l) => l.status === 'paid' ? acc + (l.quantity * 10) : acc, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">{t('nav.payments')}</h1>
          <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider">Financial settlements & disbursement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-800 p-6 rounded-xl text-white shadow-lg relative overflow-hidden flex flex-col justify-between h-40">
          <div className="flex justify-between items-start relative z-10">
            <Wallet className="w-6 h-6 opacity-60" />
            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded uppercase tracking-wider">Payable</span>
          </div>
          <div className="relative z-10">
            <h4 className="text-3xl font-bold tracking-tight">{totalPayable} <span className="text-lg font-normal opacity-60">$</span></h4>
            <p className="text-emerald-200 text-[10px] font-bold uppercase tracking-widest mt-1">Pending Disbursement</p>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-600/30 rounded-full blur-2xl"></div>
        </div>

        <div className="bg-white border border-stone-200 p-6 rounded-xl text-stone-900 shadow-sm flex flex-col justify-between h-40">
           <div className="flex justify-between items-start">
            <Clock className="w-6 h-6 text-amber-600" />
            <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-100 uppercase tracking-wider">Processing</span>
          </div>
          <div>
            <h4 className="text-3xl font-bold tracking-tight text-stone-800">{logs.filter(l => l.status === 'batched').length}</h4>
            <p className="text-stone-500 text-[10px] font-bold uppercase tracking-widest mt-1">Ready for payment</p>
          </div>
        </div>

        <div className="bg-white border border-stone-200 p-6 rounded-xl text-stone-900 shadow-sm flex flex-col justify-between h-40">
           <div className="flex justify-between items-start">
            <Check className="w-6 h-6 text-emerald-600" />
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wider">Completed</span>
          </div>
          <div>
            <h4 className="text-3xl font-bold tracking-tight text-stone-800">{totalPaid} <span className="text-lg font-normal text-stone-400">$</span></h4>
            <p className="text-stone-500 text-[10px] font-bold uppercase tracking-widest mt-1">Historical Paid</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center">
          <h3 className="font-bold text-stone-800 text-sm tracking-tight">Financial Transaction Ledger</h3>
        </div>
        <div className="divide-y divide-stone-50">
          {logs.map(log => (
            <div key={log.id} className="px-6 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg grid place-items-center border ${
                  log.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                   <h5 className="font-bold text-stone-900 text-sm tracking-tight">{log.farmerName}</h5>
                   <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{log.batchId ? `Batch: ${log.batchId.slice(-5)}` : 'Wait Batching'}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-end">
                  <p className="font-bold text-stone-900 text-sm italic">{log.quantity * 10} $</p>
                  <p className="text-[10px] font-bold text-stone-400">{log.quantity} {log.unit} • Grade {log.qualityGrade}</p>
                </div>
                
                {log.status === 'batched' ? (
                  <button 
                    onClick={() => handleMarkPaid(log.id)}
                    className="bg-emerald-700 text-white p-2 rounded-lg hover:bg-emerald-800 active:scale-95 transition-all shadow-sm group"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-full grid place-items-center border border-emerald-100">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="p-16 text-center text-stone-300">
              <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest italic">No pending settlements found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
