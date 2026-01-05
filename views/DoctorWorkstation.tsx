
import React, { useState } from 'react';
import { Patient, Prescription } from '../types';
import { getMedicalAdvice } from '../services/geminiService';
import { useAppContext } from '../context/AppContext';

const DoctorWorkstation: React.FC = () => {
  const { patients, medications, addPrescription, updatePatient } = useAppContext();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patients[0] || null);
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  const handleAiAssist = async () => {
    if (!symptoms) return;
    setAiLoading(true);
    const advice = await getMedicalAdvice(symptoms);
    setAiAdvice(advice);
    if (advice) {
        setDiagnosis(advice.diagnosis);
    }
    setAiLoading(false);
  };

  const addToPrescription = (medName: string) => {
    const med = medications.find(m => m.name === medName);
    if (!med) return;
    setPrescriptions([...prescriptions, { 
      medicationId: med.id,
      name: med.name, 
      dosage: '1粒/次', 
      quantity: 1,
      freq: '3次/日' 
    }]);
  };

  const handleCommit = () => {
    if (!selectedPatient || prescriptions.length === 0) return;

    const newPres: Prescription = {
      id: `RX${Date.now().toString().slice(-6)}`,
      patientId: selectedPatient.id,
      doctorId: 'DOC001',
      medications: prescriptions,
      createdAt: new Date().toLocaleString(),
      status: '已开立'
    };

    addPrescription(newPres);
    updatePatient(selectedPatient.id, { symptoms, diagnosis, status: '已完成' });
    
    // Reset state
    setPrescriptions([]);
    setSymptoms('');
    setDiagnosis('');
    setAiAdvice(null);
    alert('处方已成功开立！');
  };

  return (
    <div className="h-full flex gap-6 overflow-hidden animate-fadeIn">
      {/* Patient List */}
      <div className="w-80 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input type="text" placeholder="搜索患者" className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {patients.filter(p => p.status !== '已完成').map(p => (
            <div 
              key={p.id}
              onClick={() => setSelectedPatient(p)}
              className={`p-4 border-b border-slate-50 cursor-pointer transition-all ${selectedPatient?.id === p.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-slate-50'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-slate-800">{p.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${p.status === '待诊' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                  {p.status}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>{p.gender} / {p.age}岁</span>
                <span>{p.id}</span>
              </div>
            </div>
          ))}
          {patients.filter(p => p.status !== '已完成').length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">暂无待诊患者</div>
          )}
        </div>
      </div>

      {/* Diagnosis Area */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
          {/* Medical Record */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i className="fas fa-file-medical text-blue-600"></i> 门诊记录 - {selectedPatient?.name || '请选择患者'}
            </h4>
            <div className="space-y-4 flex-1 overflow-auto">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">主诉/病史</label>
                <textarea 
                  value={symptoms}
                  onChange={e => setSymptoms(e.target.value)}
                  disabled={!selectedPatient}
                  placeholder="请输入主诉..."
                  className="w-full h-32 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-slate-50"
                />
              </div>
              <div className="flex justify-between items-center">
                 <label className="block text-sm font-semibold text-slate-600">临床诊断</label>
                 <button 
                  onClick={handleAiAssist}
                  disabled={aiLoading || !symptoms}
                  className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-200 transition-colors disabled:opacity-50"
                 >
                   <i className={`fas ${aiLoading ? 'fa-spinner fa-spin' : 'fa-magic'} mr-1`}></i>
                   AI 辅助
                 </button>
              </div>
              <textarea 
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                disabled={!selectedPatient}
                placeholder="诊断结果..."
                className="w-full h-24 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-slate-50"
              />
              
              {aiAdvice && (
                <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 animate-slideIn">
                   <div className="flex items-center gap-2 mb-2 text-indigo-800 font-bold text-sm">
                     <i className="fas fa-robot"></i> AI 建议
                   </div>
                   <p className="text-xs text-indigo-700 leading-relaxed mb-3">{aiAdvice.analysis}</p>
                   <div className="flex flex-wrap gap-2">
                     {aiAdvice.medications.map((m: string, i: number) => (
                       <button 
                         key={i} 
                         onClick={() => addToPrescription(m)}
                         className="text-[10px] bg-white border border-indigo-200 px-2 py-1 rounded text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
                       >
                         + {m}
                       </button>
                     ))}
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Prescription Area */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i className="fas fa-prescription text-emerald-600"></i> 电子处方
            </h4>
            <div className="flex-1 overflow-auto">
              <div className="bg-slate-50 p-4 rounded-xl mb-4">
                 <p className="text-xs text-slate-500 uppercase font-bold mb-3 tracking-wider">快捷选药</p>
                 <div className="grid grid-cols-2 gap-2">
                    {medications.slice(0, 4).map(m => (
                      <button 
                        key={m.id}
                        onClick={() => addToPrescription(m.name)}
                        disabled={!selectedPatient}
                        className="p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-emerald-500 transition-all text-left disabled:opacity-50"
                      >
                        <div className="font-bold">{m.name}</div>
                        <div className="text-[10px] text-slate-400">{m.spec}</div>
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-3">
                {prescriptions.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <div>
                      <div className="text-sm font-bold text-slate-800">{p.name}</div>
                      <div className="text-xs text-slate-500">{p.dosage} | {p.freq}</div>
                    </div>
                    <button 
                      onClick={() => setPrescriptions(prescriptions.filter((_, idx) => idx !== i))}
                      className="text-red-400 hover:text-red-600"
                    >
                      <i className="fas fa-times-circle"></i>
                    </button>
                  </div>
                ))}
                {prescriptions.length === 0 && (
                  <div className="text-center py-12 text-slate-400 text-sm italic">暂未添加药品</div>
                )}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex gap-4">
              <button 
                onClick={handleCommit}
                disabled={!selectedPatient || prescriptions.length === 0}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold shadow-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                完成开立
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorWorkstation;
