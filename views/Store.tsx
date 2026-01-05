
import React from 'react';
import { useAppContext } from '../context/AppContext';

const Store: React.FC = () => {
  const { medications, updateInventory } = useAppContext();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-slate-800">药库库存管理</h3>
        <div className="flex gap-3">
          <button className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 shadow-md flex items-center gap-2">
             <i className="fas fa-arrow-down"></i> 入库登记
          </button>
          <button className="bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-700 shadow-md flex items-center gap-2">
             <i className="fas fa-file-export"></i> 导出报表
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-4 items-center">
           <div className="flex-1 min-w-[300px] relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input type="text" placeholder="搜索药品..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500" />
           </div>
           <select className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-medium text-slate-600">
              <option>全部分类</option>
              <option>抗生素</option>
              <option>感冒药</option>
           </select>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">药品名称</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">规格/单位</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">当前库存</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">单价</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">库存状态</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">快速补库</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {medications.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                   <div className="font-bold text-slate-800">{m.name}</div>
                   <div className="text-[10px] text-slate-400 font-mono">{m.id}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{m.spec} / {m.unit}</td>
                <td className="px-6 py-4">
                   <span className="text-sm font-bold text-slate-800">{m.stock}</span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-600">¥ {m.price.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                       <div 
                         className={`h-full rounded-full ${m.stock > 100 ? 'bg-emerald-500' : m.stock > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                         style={{ width: `${Math.min((m.stock / 500) * 100, 100)}%` }}
                       ></div>
                    </div>
                    <span className={`text-[10px] font-bold ${m.stock > 100 ? 'text-emerald-600' : m.stock > 50 ? 'text-amber-600' : 'text-red-600'}`}>
                       {m.stock > 100 ? '充足' : m.stock > 50 ? '预警' : '急缺'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => updateInventory(m.id, 50)}
                      className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-600 hover:text-white transition-all"
                    >
                      +50
                    </button>
                    <button 
                      onClick={() => updateInventory(m.id, 100)}
                      className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded hover:bg-emerald-600 hover:text-white transition-all"
                    >
                      +100
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Store;
