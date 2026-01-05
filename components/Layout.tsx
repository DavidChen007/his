
import React from 'react';
import { ModuleType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeModule: ModuleType;
  onModuleChange: (module: ModuleType) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeModule, onModuleChange }) => {
  const menuItems = [
    { type: ModuleType.DASHBOARD, label: '系统概览', icon: 'fa-chart-line' },
    { type: ModuleType.REGISTRATION, label: '挂号收费', icon: 'fa-user-plus' },
    { type: ModuleType.DOCTOR, label: '医生站', icon: 'fa-user-md' },
    { type: ModuleType.PHARMACY, label: '药房系统', icon: 'fa-pills' },
    { type: ModuleType.STORE, label: '药库管理', icon: 'fa-warehouse' },
    { type: ModuleType.SETTINGS, label: '系统设置', icon: 'fa-cog' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <i className="fas fa-hospital text-xl"></i>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Smart-HIS</h1>
        </div>

        <nav className="flex-1 mt-4 px-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.type}
              onClick={() => onModuleChange(item.type)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeModule === item.type 
                ? 'bg-blue-50 text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <i className={`fas ${item.icon} text-lg w-6 ${activeModule === item.type ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'}`}></i>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              管
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">系统管理员</p>
              <p className="text-xs text-slate-500">工号: ADM001</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-slate-800">
              {menuItems.find(m => m.type === activeModule)?.label}
            </h2>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <i className="fas fa-bell text-slate-400 hover:text-blue-600 cursor-pointer text-xl"></i>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-slate-500">当前时间: {new Date().toLocaleTimeString()}</span>
              <button className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
                退出登录
              </button>
            </div>
          </div>
        </header>

        {/* View Area */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
