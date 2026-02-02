
import { Patient, Medication, Prescription } from './types';

export const MOCK_PATIENTS: Patient[] = [
  { id: 'P001', name: '张三', age: 35, gender: '男', phone: '13800138000', registerTime: '2024-05-20 08:30', status: '待诊' },
  { id: 'P002', name: '李四', age: 28, gender: '女', phone: '13900139000', registerTime: '2024-05-20 08:45', status: '待诊' },
  { id: 'P003', name: '王五', age: 45, gender: '男', phone: '13700137000', registerTime: '2024-05-20 09:00', status: '就诊中' },
  { id: 'P004', name: '赵小明', age: 6, gender: '男', phone: '13611112222', registerTime: '2024-05-20 09:15', status: '待诊' },
  { id: 'P005', name: '孙美玲', age: 72, gender: '女', phone: '13533334444', registerTime: '2024-05-20 09:30', status: '待诊' },
  { id: 'P006', name: '周杰', age: 42, gender: '男', phone: '13055556666', registerTime: '2024-05-20 09:45', status: '已完成', symptoms: '反复咳嗽3天', diagnosis: '上呼吸道感染' },
];

export const MOCK_MEDICATIONS: Medication[] = [
  { id: 'M001', name: '阿莫西林胶囊', spec: '0.25g*24粒', stock: 500, unit: '盒', price: 12.5, category: '抗生素' },
  { id: 'M002', name: '布洛芬缓释胶囊', spec: '0.3g*10粒', stock: 45, unit: '盒', price: 25.0, category: '止痛药' },
  { id: 'M003', name: '连花清瘟胶囊', spec: '0.35g*24粒', stock: 150, unit: '盒', price: 18.8, category: '感冒药' },
  { id: 'M004', name: '葡萄糖酸钙口服溶液', spec: '10ml*10支', stock: 12, unit: '盒', price: 32.0, category: '营养补充' },
  { id: 'M005', name: '氯化钠注射液', spec: '100ml:0.9g', stock: 1000, unit: '袋', price: 5.5, category: '输液剂' },
  { id: 'M006', name: '红霉素软膏', spec: '10g:0.1g', stock: 30, unit: '支', price: 8.0, category: '皮肤科用药' },
  { id: 'M007', name: '二甲双胍片', spec: '0.5g*30片', stock: 200, unit: '盒', price: 15.6, category: '糖尿病药' },
];

export const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'RX888001',
    patientId: 'P006',
    doctorId: 'DOC001',
    medications: [
      { medicationId: 'M001', name: '阿莫西林胶囊', dosage: '0.25g', quantity: 2 },
      { medicationId: 'M003', name: '连花清瘟胶囊', dosage: '0.35g', quantity: 1 }
    ],
    createdAt: '2024-05-20 10:05:22',
    status: '已开立'
  },
  {
    id: 'RX888002',
    patientId: 'P003',
    doctorId: 'DOC001',
    medications: [
      { medicationId: 'M002', name: '布洛芬缓释胶囊', dosage: '0.3g', quantity: 1 }
    ],
    createdAt: '2024-05-20 10:15:45',
    status: '已开立'
  }
];
