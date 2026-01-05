
import { Patient, Medication } from './types';

export const MOCK_PATIENTS: Patient[] = [
  { id: 'P001', name: '张三', age: 35, gender: '男', phone: '13800138000', registerTime: '2024-05-20 08:30', status: '待诊' },
  { id: 'P002', name: '李四', age: 28, gender: '女', phone: '13900139000', registerTime: '2024-05-20 08:45', status: '待诊' },
  { id: 'P003', name: '王五', age: 45, gender: '男', phone: '13700137000', registerTime: '2024-05-20 09:00', status: '就诊中' },
];

export const MOCK_MEDICATIONS: Medication[] = [
  { id: 'M001', name: '阿莫西林胶囊', spec: '0.25g*24粒', stock: 500, unit: '盒', price: 12.5, category: '抗生素' },
  { id: 'M002', name: '布洛芬缓释胶囊', spec: '0.3g*10粒', stock: 200, unit: '盒', price: 25.0, category: '止痛药' },
  { id: 'M003', name: '连花清瘟胶囊', spec: '0.35g*24粒', stock: 150, unit: '盒', price: 18.8, category: '感冒药' },
  { id: 'M004', name: '葡萄糖酸钙口服溶液', spec: '10ml*10支', stock: 80, unit: '盒', price: 32.0, category: '营养补充' },
];
