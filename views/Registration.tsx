
import React, { useState } from 'react';
import { Patient } from '../types';
import { useAppContext } from '../context/AppContext';

const Registration: React.FC = () => {
  const { patients, addPatient } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  // Fix: Changed 'as '男'' to 'as '男' | '女'' to fix the type mismatch when updating gender in the select component.
  const [newPatient, setNewPatient] = useState({ name: '', gender: '男' as '男' | '女', age: '', phone: '' });

  const handleRegister = () => {
    if (!newPatient.name || !newPatient.age) return;
    const p: Patient = {
      id: `P${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      name: newPatient.name,
      gender: newPatient.gender,
      age: parseInt(newPatient.age),
      phone: newPatient.phone,
      registerTime: new Date().toLocaleString(),
      status: '待诊'
    };
    addPatient(p);
    setShowModal(false);
    setNewPatient({ name: '', gender: '男', age: '', phone: '' });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-slate-800">挂号列表</h3>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> 新增挂号
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: '今日挂号', value: patients.length.toString(), icon: 'fa-users', color: 'bg-blue-500' },
          { label: '待就诊', value: patients.filter(p => p.status === '待诊').length.toString(), icon: 'fa-clock', color: 'bg-amber-500' },
          { label: '已完成', value: patients.filter(p => p.status === '已完成').length.toString(), icon: 'fa-check-circle', color: 'bg-emerald-500' },
          { label: '待就诊率', value: `${Math.round((patients.filter(p => p.status === '待诊').length / (patients.length || 1)) * 100)}%`, icon: 'fa-chart-pie', color: 'bg-indigo-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg`}>
              <i className={`fas ${stat.icon} text-xl`}></i>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">患者ID</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">姓名</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">性别/年龄</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">联系电话</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">挂号时间</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {patients.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-blue-600">#{p.id}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-800">{p.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{p.gender} / {p.age}岁</td>
                <td className="px-6 py-4 text-sm text-slate-600">{p.phone}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{p.registerTime}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    p.status === '待诊' ? 'bg-amber-100 text-amber-700' : 
                    p.status === '就诊中' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">打印凭证</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-6">新增挂号</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">姓名</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newPatient.name}
                  onChange={e => setNewPatient({...newPatient, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">年龄</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={newPatient.age}
                    onChange={e => setNewPatient({...newPatient, age: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">性别</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={newPatient.gender}
                    onChange={e => setNewPatient({...newPatient, gender: e.target.value as '男' | '女'})}
                  >
                    <option>男</option>
                    <option>女</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">联系电话</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newPatient.phone}
                  onChange={e => setNewPatient({...newPatient, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
              >
                取消
              </button>
              <button 
                onClick={handleRegister}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-sm"
              >
                确认挂号
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registration;
