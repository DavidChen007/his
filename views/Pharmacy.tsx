
import React from 'react';
import { useAppContext } from '../context/AppContext';

const Pharmacy: React.FC = () => {
  const { prescriptions, patients, dispenseMedication } = useAppContext();

  const getPatientName = (pid: string) => patients.find(p => p.id === pid)?.name || '未知患者';

  return (
    <div className="space-y-6 animate-fadeIn">
       <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-slate-800">药房发药窗口</h3>
          <div className="flex gap-4">
             <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-3">
                <span className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-bold text-slate-600">待发处方: {prescriptions.filter(p => p.status === '已开立').length}</span>
             </div>
             <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-3">
                <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                <span className="text-sm font-bold text-slate-600">今日已完成: {prescriptions.filter(p => p.status === '已发药').length}</span>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {prescriptions.map((item) => (
            <div key={item.id} className={`bg-white rounded-2xl border p-6 shadow-sm transition-all duration-300 ${item.status === '已开立' ? 'border-amber-200 shadow-amber-50' : 'border-slate-100 opacity-60'}`}>
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">处方单号</span>
                    <h4 className="text-lg font-bold text-slate-800">#{item.id}</h4>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${item.status === '已开立' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                    {item.status}
                  </span>
               </div>
               
               <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {getPatientName(item.patientId)[0]}
                    </div>
                    <span className="font-bold text-slate-700">{getPatientName(item.patientId)}</span>
                    <span className="text-xs text-slate-400 ml-auto">{item.createdAt.split(' ')[1]}</span>
                  </div>
                  <div className="space-y-2">
                    {item.medications.map((med, idx) => (
                      <div key={idx} className="flex justify-between text-sm py-2 border-b border-slate-50 last:border-0">
                         <span className="text-slate-600">{med.name} x{med.quantity}</span>
                         <i className="fas fa-check text-emerald-500 text-xs"></i>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="flex gap-3">
                  <button className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">
                    打印
                  </button>
                  {item.status === '已开立' && (
                    <button 
                      onClick={() => {
                        if(confirm('确认发放药品并扣减库存？')) dispenseMedication(item.id);
                      }}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg"
                    >
                      发药
                    </button>
                  )}
               </div>
            </div>
          ))}
          {prescriptions.length === 0 && (
            <div className="lg:col-span-3 py-20 bg-white rounded-3xl border border-dashed border-slate-300 text-center text-slate-400">
               <i className="fas fa-prescription-bottle-alt text-4xl mb-3"></i>
               <p>暂无待处理处方</p>
            </div>
          )}
       </div>
    </div>
  );
};

export default Pharmacy;
