// 动态获取当前访问的主机名，确保在局域网或云端部署时也能正确连接后端
const getApiBase = () => {
  // 如果是在浏览器环境
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // 默认后端在 8000 端口
    return `http://${hostname}:8000/api`;
  }
  return 'http://localhost:8000/api';
};

const API_BASE = getApiBase();

export const api = {
  // 患者相关
  getPatients: () => fetch(`${API_BASE}/patients`).then(r => {
    if (!r.ok) throw new Error('网络响应错误');
    return r.json();
  }),
  addPatient: (p: any) => fetch(`${API_BASE}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(p)
  }).then(r => r.json()),
  updatePatient: (id: string, updates: any) => fetch(`${API_BASE}/patients/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  }).then(r => r.json()),

  // 药品相关
  getMedications: () => fetch(`${API_BASE}/medications`).then(r => {
    if (!r.ok) throw new Error('网络响应错误');
    return r.json();
  }),
  updateInventory: (id: string, change: number) => fetch(`${API_BASE}/medications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ change })
  }).then(r => r.json()),

  // 处方相关
  getPrescriptions: () => fetch(`${API_BASE}/prescriptions`).then(r => {
    if (!r.ok) throw new Error('网络响应错误');
    return r.json();
  }),
  addPrescription: (pres: any) => fetch(`${API_BASE}/prescriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pres)
  }).then(r => r.json()),
  dispenseMedication: (rxId: string) => fetch(`${API_BASE}/prescriptions/${rxId}/dispense`, {
    method: 'POST'
  }).then(r => r.json())
};
