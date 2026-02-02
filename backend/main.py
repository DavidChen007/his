
from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import uvicorn

from .database import engine, Base, get_db
from .models import PatientDB, MedicationDB, PrescriptionDB, PrescriptionItemDB, DoctorDB
from .schemas import PatientSchema, MedicationSchema, PrescriptionRead, PrescriptionCreate

# 初始化表结构
Base.metadata.create_all(bind=engine)

# Swagger 文档元数据
description = """
### Smart-HIS Pro 智慧医院系统后端 API 🚀

提供以下核心功能：
* **患者管理**：挂号、档案更新、就诊状态追踪。
* **药品库存**：字典查询、库存实时预警与调整。
* **处方业务**：电子处方开立、自动化发药逻辑与库存联动。

"""

app = FastAPI(
    title="Smart-HIS Pro 接口文档",
    description=description,
    version="1.0.0",
    contact={
        "name": "HIS 系统管理员",
        "url": "http://localhost:3000",
    },
    license_info={
        "name": "Apache 2.0",
        "url": "https://www.apache.org/licenses/LICENSE-2.0.html",
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 患者管理 (Tags: 患者管理) ---

@app.get("/api/patients", 
         response_model=List[PatientSchema], 
         tags=["患者管理"],
         summary="获取所有患者列表",
         description="按照挂号时间倒序返回所有患者的详细档案信息。")
def list_patients(db: Session = Depends(get_db)):
    pts = db.query(PatientDB).order_by(PatientDB.register_time.desc()).all()
    return [{**p.__dict__, "registerTime": p.register_time.strftime("%Y-%m-%d %H:%M")} for p in pts]

@app.post("/api/patients", 
          tags=["患者管理"],
          summary="新增患者挂号",
          description="接收患者基础信息，在数据库创建新档案并初始化为待诊状态。")
def create_patient(p: PatientSchema, db: Session = Depends(get_db)):
    db_p = PatientDB(
        id=p.id, name=p.name, age=p.age, gender=p.gender, 
        phone=p.phone, status=p.status
    )
    db.add(db_p)
    db.commit()
    return {"status": "ok"}

@app.patch("/api/patients/{pid}", 
           tags=["患者管理"],
           summary="更新患者信息",
           description="根据患者 ID 局部更新档案字段（如诊断结果、病症主诉或就诊状态）。")
def update_patient(pid: str, updates: dict = Body(...), db: Session = Depends(get_db)):
    db_p = db.query(PatientDB).filter(PatientDB.id == pid).first()
    if not db_p: raise HTTPException(404, "Patient not found")
    for k, v in updates.items():
        if hasattr(db_p, k): setattr(db_p, k, v)
    db.commit()
    return {"status": "updated"}

# --- 药品与库存 (Tags: 药品管理) ---

@app.get("/api/medications", 
         response_model=List[MedicationSchema], 
         tags=["药品管理"],
         summary="获取药品字典与库存",
         description="返回所有在库药品的规格、单价、当前库存量及分类信息。")
def list_meds(db: Session = Depends(get_db)):
    return db.query(MedicationDB).all()

@app.patch("/api/medications/{mid}", 
           tags=["药品管理"],
           summary="调整药品库存",
           description="手动增加或减少特定药品的库存量（常用于药库入库或盘点调整）。")
def adjust_stock(mid: str, payload: dict = Body(..., example={"change": 50}), db: Session = Depends(get_db)):
    med = db.query(MedicationDB).filter(MedicationDB.id == mid).first()
    if not med: raise HTTPException(404)
    med.stock = max(0, med.stock + payload.get("change", 0))
    db.commit()
    return med

# --- 处方业务 (Tags: 处方管理) ---

@app.get("/api/prescriptions", 
         response_model=List[PrescriptionRead], 
         tags=["处方管理"],
         summary="查询处方列表",
         description="返回系统中所有的历史处方及当前待处理处方，包含药品明细。")
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

@app.post("/api/prescriptions", 
          tags=["处方管理"],
          summary="开立新处方",
          description="医生站提交处方单，同时会自动将关联患者的就诊状态更新为'已完成'。")
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

@app.post("/api/prescriptions/{rxid}/dispense", 
          tags=["处方管理"],
          summary="确认发药",
          description="药房窗口确认发药。该操作是原子的：会同时检查库存是否充足、扣减库存并更新处方状态。")
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

# 初始化基础演示数据
@app.on_event("startup")
def init_data():
    db = SessionLocal()
    try:
        if db.query(DoctorDB).count() == 0:
            db.add(DoctorDB(id="DOC001", name="王医生", department="内科", title="主任医师"))
        if db.query(MedicationDB).count() == 0:
            db.add_all([
                MedicationDB(id="M001", name="阿莫西林胶囊", spec="0.25g*24粒", stock=500, unit="盒", price=12.5, category="抗生素"),
                MedicationDB(id="M002", name="布洛芬缓释胶囊", spec="0.3g*10粒", stock=45, unit="盒", price=25.0, category="止痛药"),
                MedicationDB(id="M003", name="连花清瘟胶囊", spec="0.35g*24粒", stock=150, unit="盒", price=18.8, category="感冒药")
            ])
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
