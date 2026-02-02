
from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import uvicorn

from .database import get_db
from .models import PatientDB, MedicationDB, PrescriptionDB, PrescriptionItemDB
from .schemas import PatientSchema, MedicationSchema, PrescriptionRead, PrescriptionCreate
from .config import settings

# 使用配置模块中的元数据初始化 FastAPI
app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    version=settings.API_VERSION,
    contact={
        "name": "HIS 系统管理员",
        "url": "http://localhost:3000",
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 患者管理 ---

@app.get("/api/patients", 
         response_model=List[PatientSchema], 
         tags=["患者管理"],
         summary="获取所有患者列表")
def list_patients(db: Session = Depends(get_db)):
    pts = db.query(PatientDB).order_by(PatientDB.register_time.desc()).all()
    return [{**p.__dict__, "registerTime": p.register_time.strftime("%Y-%m-%d %H:%M")} for p in pts]

@app.post("/api/patients", tags=["患者管理"], summary="新增患者挂号")
def create_patient(p: PatientSchema, db: Session = Depends(get_db)):
    db_p = PatientDB(
        id=p.id, name=p.name, age=p.age, gender=p.gender, 
        phone=p.phone, status=p.status
    )
    db.add(db_p)
    db.commit()
    return {"status": "ok"}

@app.patch("/api/patients/{pid}", tags=["患者管理"], summary="更新患者信息")
def update_patient(pid: str, updates: dict = Body(...), db: Session = Depends(get_db)):
    db_p = db.query(PatientDB).filter(PatientDB.id == pid).first()
    if not db_p: raise HTTPException(404, "Patient not found")
    for k, v in updates.items():
        if hasattr(db_p, k): setattr(db_p, k, v)
    db.commit()
    return {"status": "updated"}

# --- 药品与库存 ---

@app.get("/api/medications", response_model=List[MedicationSchema], tags=["药品管理"], summary="获取药品字典")
def list_meds(db: Session = Depends(get_db)):
    return db.query(MedicationDB).all()

@app.patch("/api/medications/{mid}", tags=["药品管理"], summary="调整药品库存")
def adjust_stock(mid: str, payload: dict = Body(..., example={"change": 50}), db: Session = Depends(get_db)):
    med = db.query(MedicationDB).filter(MedicationDB.id == mid).first()
    if not med: raise HTTPException(404)
    med.stock = max(0, med.stock + payload.get("change", 0))
    db.commit()
    return med

# --- 处方业务 ---

@app.get("/api/prescriptions", response_model=List[PrescriptionRead], tags=["处方管理"], summary="查询处方列表")
def list_prescriptions(db: Session = Depends(get_db)):
    pxs = db.query(PrescriptionDB).all()
    res = []
    for p in pxs:
        items = [{"medicationId": i.medication_id, "name": i.med_name, "dosage": i.dosage, "quantity": i.quantity} for i in p.items]
        res.append({
            "id": p.id, "patientId": p.patient_id, "doctorId": p.doctor_id,
            "createdAt": p.created_at.strftime("%Y-%m-%d %H:%M"),
            "status": p.status, "medications": items
        })
    return res

@app.post("/api/prescriptions", tags=["处方管理"], summary="开立新处方")
def save_prescription(data: PrescriptionCreate, db: Session = Depends(get_db)):
    try:
        new_px = PrescriptionDB(id=data.id, patient_id=data.patientId, doctor_id=data.doctorId, status=data.status)
        db.add(new_px)
        
        for m in data.medications:
            item = PrescriptionItemDB(
                prescription_id=data.id, medication_id=m.medicationId,
                med_name=m.name, dosage=m.dosage, quantity=m.quantity
            )
            db.add(item)
            
        pt = db.query(PatientDB).filter(PatientDB.id == data.patientId).first()
        if pt: pt.status = "已完成"
        
        db.commit()
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(500, detail=str(e))

@app.post("/api/prescriptions/{rxid}/dispense", tags=["处方管理"], summary="确认发药")
def dispense(rxid: str, db: Session = Depends(get_db)):
    px = db.query(PrescriptionDB).filter(PrescriptionDB.id == rxid).first()
    if not px or px.status == "已发药": return {"msg": "invalid or already done"}
    
    try:
        px.status = "已发药"
        for item in px.items:
            med = db.query(MedicationDB).filter(MedicationDB.id == item.medication_id).first()
            if med:
                if med.stock < item.quantity:
                    raise HTTPException(400, f"{med.name} 库存不足")
                med.stock -= item.quantity
        db.commit()
        return {"status": "dispensed"}
    except Exception as e:
        db.rollback()
        raise HTTPException(500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG_MODE)
