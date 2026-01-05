
import { Patient, Medication, Prescription } from '../types';
import { MOCK_PATIENTS, MOCK_MEDICATIONS } from '../constants';

const KEYS = {
  PATIENTS: 'his_patients',
  MEDICATIONS: 'his_medications',
  PRESCRIPTIONS: 'his_prescriptions'
};

export const storage = {
  getPatients: (): Patient[] => {
    const data = localStorage.getItem(KEYS.PATIENTS);
    return data ? JSON.parse(data) : MOCK_PATIENTS;
  },
  setPatients: (data: Patient[]) => {
    localStorage.setItem(KEYS.PATIENTS, JSON.stringify(data));
  },

  getMedications: (): Medication[] => {
    const data = localStorage.getItem(KEYS.MEDICATIONS);
    return data ? JSON.parse(data) : MOCK_MEDICATIONS;
  },
  setMedications: (data: Medication[]) => {
    localStorage.setItem(KEYS.MEDICATIONS, JSON.stringify(data));
  },

  getPrescriptions: (): Prescription[] => {
    const data = localStorage.getItem(KEYS.PRESCRIPTIONS);
    return data ? JSON.parse(data) : [];
  },
  setPrescriptions: (data: Prescription[]) => {
    localStorage.setItem(KEYS.PRESCRIPTIONS, JSON.stringify(data));
  },

  clearAll: () => {
    localStorage.clear();
    window.location.reload();
  }
};
