
import React, { useState } from 'react';
import { ModuleType } from './types';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import Registration from './views/Registration';
import DoctorWorkstation from './views/DoctorWorkstation';
import Pharmacy from './views/Pharmacy';
import Store from './views/Store';
import { AppProvider } from './context/AppContext';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.DASHBOARD);

  const renderContent = () => {
    switch (activeModule) {
      case ModuleType.DASHBOARD:
        return <Dashboard />;
      case ModuleType.REGISTRATION:
        return <Registration />;
      case ModuleType.DOCTOR:
        return <DoctorWorkstation />;
      case ModuleType.PHARMACY:
        return <Pharmacy />;
      case ModuleType.STORE:
        return <Store />;
      case ModuleType.SETTINGS:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-fadeIn">
            <i className="fas fa-tools text-6xl mb-4"></i>
            <h2 className="text-xl font-bold">系统设置模块</h2>
            <p className="mb-6">管理系统配置与本地存储</p>
            <button 
              onClick={() => { if(confirm('确定要重置所有数据吗？')) localStorage.clear(); window.location.reload(); }}
              className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
            >
              重置系统数据 (清除持久化)
            </button>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <Layout activeModule={activeModule} onModuleChange={setActiveModule}>
        {renderContent()}
      </Layout>
    </AppProvider>
  );
};

export default App;
