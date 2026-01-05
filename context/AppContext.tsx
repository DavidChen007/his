
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Patient, Medication, Prescription } from '../types';
import { storage } from '../services/storageService';

interface AppContextType {
  patients: Patient[];
  medications: Medication[];
  prescriptions: Prescription[];
  addPatient: (p: Patient) => void;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  addPrescription: (prescription: Prescription) => void;
  dispenseMedication: (prescriptionId: string) => void;
  updateInventory: (medId: string, change: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  // Initialize data
  useEffect(() => {
    setPatients(storage.getPatients());
    setMedications(storage.getMedications());
    setPrescriptions(storage.getPrescriptions());
  }, []);

  // Persist data on change
  useEffect(() => { storage.setPatients(patients); }, [patients]);
  useEffect(() => { storage.setMedications(medications); }, [medications]);
  useEffect(() => { storage.setPrescriptions(prescriptions); }, [prescriptions]);

  const addPatient = (p: Patient) => setPatients([p, ...patients]);

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const addPrescription = (pres: Prescription) => {
    setPrescriptions([pres, ...prescriptions]);
    // 同时更新患者状态
    updatePatient(pres.patientId, { status: '已完成' });
  };

  const updateInventory = (medId: string, change: number) => {
    setMedications(prev => prev.map(m => 
      m.id === medId ? { ...m, stock: Math.max(0, m.stock + change) } : m
    ));
  };

  const dispenseMedication = (prescriptionId: string) => {
    const pres = prescriptions.find(p => p.id === prescriptionId);
    if (!pres) return;

    // 更新处方状态
    setPrescriptions(prev => prev.map(p => 
      p.id === prescriptionId ? { ...p, status: '已发药' } : p
    ));

    // 扣减库存
    pres.medications.forEach(m => {
      updateInventory(m.medicationId, -m.quantity);
    });
  };

  return (
    <AppContext.Provider value={{
      patients, medications, prescriptions,
      addPatient, updatePatient, addPrescription,
      dispenseMedication, updateInventory
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
