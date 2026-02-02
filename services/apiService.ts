
const API_BASE = 'http://localhost:8000/api';

export const api = {
  // 患者相关
  getPatients: () => fetch(`${API_BASE}/patients`).then(r => r.json()),
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
  getMedications: () => fetch(`${API_BASE}/medications`).then(r => r.json()),
  updateInventory: (id: string, change: number) => fetch(`${API_BASE}/medications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ change })
  }).then(r => r.json()),

  // 处方相关
  getPrescriptions: () => fetch(`${API_BASE}/prescriptions`).then(r => r.json()),
  addPrescription: (pres: any) => fetch(`${API_BASE}/prescriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pres)
  }).then(r => r.json()),
  dispenseMedication: (rxId: string) => fetch(`${API_BASE}/prescriptions/${rxId}/dispense`, {
    method: 'POST'
  }).then(r => r.json())
};
