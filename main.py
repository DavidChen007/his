
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import datetime

app = FastAPI(title="Smart-HIS Pro Backend")

# 解决跨域问题
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 数据模型 ---

class MedicationItem(BaseModel):
    medicationId: str
    name: str
    dosage: str
    quantity: int

class Patient(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    phone: str
    registerTime: str
    status: str
    symptoms: Optional[str] = None
    diagnosis: Optional[str] = None

class Medication(BaseModel):
    id: str
    name: str
    spec: str
    stock: int
    unit: str
    price: float
    category: str

class Prescription(BaseModel):
    id: str
    patientId: str
    doctorId: str
    medications: List[MedicationItem]
    createdAt: str
    status: str

# --- 内存数据库初始化 ---

db_patients = [
    {"id": "P001", "name": "张三", "age": 35, "gender": "男", "phone": "13800138000", "registerTime": "2024-05-20 08:30", "status": "待诊"},
    {"id": "P002", "name": "李四", "age": 28, "gender": "女", "phone": "13900139000", "registerTime": "2024-05-20 08:45", "status": "待诊"},
    {"id": "P006", "name": "周杰", "age": 42, "gender": "男", "phone": "13055556666", "registerTime": "2024-05-20 09:45", "status": "已完成", "symptoms": "反复咳嗽3天", "diagnosis": "上呼吸道感染"},
]

db_medications = [
    {"id": "M001", "name": "阿莫西林胶囊", "spec": "0.25g*24粒", "stock": 500, "unit": "盒", "price": 12.5, "category": "抗生素"},
    {"id": "M002", "name": "布洛芬缓释胶囊", "spec": "0.3g*10粒", "stock": 45, "unit": "盒", "price": 25.0, "category": "止痛药"},
    {"id": "M003", "name": "连花清瘟胶囊", "spec": "0.35g*24粒", "stock": 150, "unit": "盒", "price": 18.8, "category": "感冒药"},
]

db_prescriptions = [
    {
        "id": "RX888001",
        "patientId": "P006",
        "doctorId": "DOC001",
        "medications": [
            {"medicationId": "M001", "name": "阿莫西林胶囊", "dosage": "0.25g", "quantity": 2},
        ],
        "createdAt": "2024-05-20 10:05:22",
        "status": "已开立"
    }
]

# --- API 接口 ---

@app.get("/api/patients", response_model=List[Patient])
def get_patients():
    return db_patients

@app.post("/api/patients")
def add_patient(patient: Patient):
    db_patients.insert(0, patient.dict())
    return {"message": "Patient registered", "id": patient.id}

@app.patch("/api/patients/{patient_id}")
def update_patient(patient_id: str, updates: dict):
    for p in db_patients:
        if p["id"] == patient_id:
            p.update(updates)
            return p
    raise HTTPException(status_code=404, detail="Patient not found")

@app.get("/api/medications", response_model=List[Medication])
def get_medications():
    return db_medications

@app.patch("/api/medications/{med_id}")
def update_inventory(med_id: str, change: dict):
    # change 格式: {"change": 50}
    for m in db_medications:
        if m["id"] == med_id:
            m["stock"] = max(0, m["stock"] + change.get("change", 0))
            return m
    raise HTTPException(status_code=404, detail="Medication not found")

@app.get("/api/prescriptions", response_model=List[Prescription])
def get_prescriptions():
    return db_prescriptions

@app.post("/api/prescriptions")
def create_prescription(pres: Prescription):
    db_prescriptions.insert(0, pres.dict())
    # 级联更新患者状态
    for p in db_patients:
        if p["id"] == pres.patientId:
            p["status"] = "已完成"
    return pres

@app.post("/api/prescriptions/{rx_id}/dispense")
def dispense_prescription(rx_id: str):
    # 查找处方
    pres = next((p for p in db_prescriptions if p["id"] == rx_id), None)
    if not pres:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    if pres["status"] == "已发药":
        return {"message": "Already dispensed"}

    # 更新状态
    pres["status"] = "已发药"
    
    # 扣减库存
    for item in pres["medications"]:
        for m in db_medications:
            if m["id"] == item["medicationId"]:
                m["stock"] = max(0, m["stock"] - item["quantity"])
    
    return {"message": "Medication dispensed successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
