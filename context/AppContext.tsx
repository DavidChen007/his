
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Patient, Medication, Prescription } from '../types';
import { api } from '../services/apiService';

interface AppContextType {
  patients: Patient[];
  medications: Medication[];
  prescriptions: Prescription[];
  refreshData: () => Promise<void>;
  addPatient: (p: Patient) => Promise<void>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;
  addPrescription: (prescription: Prescription) => Promise<void>;
  dispenseMedication: (prescriptionId: string) => Promise<void>;
  updateInventory: (medId: string, change: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  const refreshData = async () => {
    try {
      const [p, m, rx] = await Promise.all([
        api.getPatients(),
        api.getMedications(),
        api.getPrescriptions()
      ]);
      setPatients(p);
      setMedications(m);
      setPrescriptions(rx);
    } catch (e) {
      console.error("Failed to fetch data from Python backend:", e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addPatient = async (p: Patient) => {
    await api.addPatient(p);
    await refreshData();
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    await api.updatePatient(id, updates);
    await refreshData();
  };

  const addPrescription = async (pres: Prescription) => {
    await api.addPrescription(pres);
    await refreshData();
  };

  const updateInventory = async (medId: string, change: number) => {
    await api.updateInventory(medId, change);
    await refreshData();
  };

  const dispenseMedication = async (prescriptionId: string) => {
    await api.dispenseMedication(prescriptionId);
    await refreshData();
  };

  return (
    <AppContext.Provider value={{
      patients, medications, prescriptions,
      refreshData, addPatient, updatePatient, addPrescription,
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
