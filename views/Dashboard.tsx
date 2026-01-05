
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

const data = [
  { name: '08:00', patients: 12, revenue: 1200 },
  { name: '10:00', patients: 35, revenue: 4500 },
  { name: '12:00', patients: 25, revenue: 3200 },
  { name: '14:00', patients: 48, revenue: 6800 },
  { name: '16:00', patients: 38, revenue: 5400 },
  { name: '18:00', patients: 15, revenue: 2100 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: '今日就诊人数', value: '185', diff: '+12%', color: 'from-blue-600 to-blue-400', icon: 'fa-user-check' },
            { label: '门诊流水收入', value: '¥ 24,580', diff: '+8%', color: 'from-emerald-600 to-emerald-400', icon: 'fa-hand-holding-dollar' },
            { label: '药房待领药品', value: '12', diff: '-2', color: 'from-amber-600 to-amber-400', icon: 'fa-pills' },
            { label: '平均接诊时长', value: '14.5 min', diff: '-5%', color: 'from-indigo-600 to-indigo-400', icon: 'fa-hourglass-half' },
          ].map((stat, i) => (
            <div key={i} className={`relative overflow-hidden bg-gradient-to-br ${stat.color} p-6 rounded-3xl shadow-lg shadow-blue-100/50`}>
               <div className="relative z-10 text-white">
                  <p className="text-sm font-medium opacity-80 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold mb-4">{stat.value}</p>
                  <div className="flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-2 py-1 rounded-full">
                     <i className="fas fa-arrow-up"></i> {stat.diff} <span className="opacity-70 font-normal">对比昨日</span>
                  </div>
               </div>
               <i className={`fas ${stat.icon} absolute -right-4 -bottom-4 text-8xl text-white opacity-10 rotate-12`}></i>
            </div>
          ))}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-slate-800">就诊流量与营收分析</h4>
                <div className="flex gap-2">
                   <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span> 人数
                   </span>
                   <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> 营收
                   </span>
                </div>
             </div>
             <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={data}>
                      <defs>
                        <linearGradient id="colorPat" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                      <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      <Area type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPat)" />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={0} />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
             <h4 className="font-bold text-slate-800 mb-6">实时科室负载</h4>
             <div className="flex-1 space-y-6">
                {[
                  { name: '内科', val: 85, color: 'bg-blue-500' },
                  { name: '儿科', val: 92, color: 'bg-rose-500' },
                  { name: '外科', val: 45, color: 'bg-emerald-500' },
                  { name: '中医科', val: 30, color: 'bg-indigo-500' },
                  { name: '急诊', val: 100, color: 'bg-red-500' },
                ].map((dept, i) => (
                  <div key={i} className="space-y-2">
                     <div className="flex justify-between text-sm">
                        <span className="font-bold text-slate-700">{dept.name}</span>
                        <span className="text-slate-500">{dept.val}%</span>
                     </div>
                     <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${dept.color} transition-all duration-1000`} style={{width: `${dept.val}%`}}></div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
};

export default Dashboard;
