
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class MedItemSchema(BaseModel):
    medicationId: str
    name: str
    dosage: str
    quantity: int

class PatientSchema(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    phone: str
    registerTime: str
    status: str
    symptoms: Optional[str] = None
    diagnosis: Optional[str] = None
    class Config:
        from_attributes = True

class MedicationSchema(BaseModel):
    id: str
    name: str
    spec: str
    stock: int
    unit: str
    price: float
    category: str
    class Config:
        from_attributes = True

class PrescriptionCreate(BaseModel):
    id: str
    patientId: str
    doctorId: str
    medications: List[MedItemSchema]
    createdAt: str
    status: str

class PrescriptionRead(BaseModel):
    id: str
    patientId: str
    doctorId: str
    createdAt: str
    status: str
    medications: List[MedItemSchema]
    class Config:
        from_attributes = True
