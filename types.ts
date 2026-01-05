
export enum ModuleType {
  DASHBOARD = 'DASHBOARD',
  REGISTRATION = 'REGISTRATION',
  DOCTOR = 'DOCTOR',
  PHARMACY = 'PHARMACY',
  STORE = 'STORE',
  SETTINGS = 'SETTINGS'
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: '男' | '女';
  phone: string;
  registerTime: string;
  status: '待诊' | '就诊中' | '已完成' | '待缴费';
  symptoms?: string;
  diagnosis?: string;
}

export interface Medication {
  id: string;
  name: string;
  spec: string; // 规格
  stock: number;
  unit: string;
  price: number;
  category: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  medications: {
    medicationId: string;
    name: string;
    dosage: string;
    quantity: number;
  }[];
  createdAt: string;
  status: '已开立' | '已缴费' | '已发药';
}

export interface InventoryItem extends Medication {
  minStock: number;
  supplier: string;
}
