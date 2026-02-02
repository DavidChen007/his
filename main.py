
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, ForeignKey, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
import datetime

# --- 数据库配置 ---
# 请修改为您的 MySQL 配置: mysql+pymysql://user:password@host:port/dbname
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:123456@localhost:3306/his_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- SQLAlchemy 实体模型设计 ---

class DoctorDB(Base):
    """医生档案表"""
    __tablename__ = "doctors"
    id = Column(String(50), primary_key=True)
    name = Column(String(50), nullable=False)
    department = Column(String(50))
    title = Column(String(20)) # 职称

class PatientDB(Base):
    """患者档案及就诊摘要表"""
    __tablename__ = "patients"
    id = Column(String(50), primary_key=True)
    name = Column(String(100), index=True)
    age = Column(Integer)
    gender = Column(String(10))
    phone = Column(String(20))
    register_time = Column(DateTime, default=func.now())
    status = Column(String(20)) # 待诊, 已完成
    symptoms = Column(Text, nullable=True) # 主诉
    diagnosis = Column(Text, nullable=True) # 诊断结果

class MedicationDB(Base):
    """药品字典与库存表"""
    __tablename__ = "medications"
    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    spec = Column(String(100)) # 规格
    stock = Column(Integer, default=0)
    unit = Column(String(20))
    price = Column(Float)
    category = Column(String(50))

class PrescriptionDB(Base):
    """处方主表 (Header)"""
    __tablename__ = "prescriptions"
    id = Column(String(50), primary_key=True)
    patient_id = Column(String(50), ForeignKey("patients.id"))
    doctor_id = Column(String(50), ForeignKey("doctors.id"))
    created_at = Column(DateTime, default=func.now())
    status = Column(String(20)) # 已开立, 已缴费, 已发药
    
    # 定义关联：一个处方对应多个明细
    items = relationship("PrescriptionItemDB", back_populates="prescription", cascade="all, delete-orphan")

class PrescriptionItemDB(Base):
    """处方明细表 (Detail) - 规范化设计的核心"""
    __tablename__ = "prescription_items"
    id = Column(Integer, primary_key=True, autoincrement=True)
    prescription_id = Column(String(50), ForeignKey("prescriptions.id"))
    medication_id = Column(String(50), ForeignKey("medications.id"))
    med_name = Column(String(100)) # 冗余药品名，防止字典变更影响旧处方
    dosage = Column(String(50))    # 用法: 0.25g
    quantity = Column(Integer)     # 数量: 2
    
    prescription = relationship("PrescriptionDB", back_populates="items")

# 自动创建表结构
Base.metadata.create_all(bind=engine)

# --- Pydantic 响应/请求模型 ---

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
    class Config: from_attributes = True

class MedicationSchema(BaseModel):
    id: str
    name: str
    spec: str
    stock: int
    unit: str
    price: float
    category: str
    class Config: from_attributes = True

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
    class Config: from_attributes = True

# --- API 逻辑实现 ---

app = FastAPI(title="Smart-HIS Pro SQL Core")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/patients", response_model=List[PatientSchema])
def list_patients(db: Session = Depends(get_db)):
    # 格式化时间输出以匹配前端习惯
    pts = db.query(PatientDB).order_by(PatientDB.register_time.desc()).all()
    return [{**p.__dict__, "registerTime": p.register_time.strftime("%Y-%m-%d %H:%M")} for p in pts]

@app.post("/api/patients")
def create_patient(p: PatientSchema, db: Session = Depends(get_db)):
    db_p = PatientDB(
        id=p.id, name=p.name, age=p.age, gender=p.gender, 
        phone=p.phone, status=p.status
    )
    db.add(db_p)
    db.commit()
    return {"status": "ok"}

@app.patch("/api/patients/{pid}")
def update_patient(pid: str, updates: dict, db: Session = Depends(get_db)):
    db_p = db.query(PatientDB).filter(PatientDB.id == pid).first()
    if not db_p: raise HTTPException(404)
    for k, v in updates.items():
        if hasattr(db_p, k): setattr(db_p, k, v)
    db.commit()
    return {"status": "updated"}

@app.get("/api/medications", response_model=List[MedicationSchema])
def list_meds(db: Session = Depends(get_db)):
    return db.query(MedicationDB).all()

@app.patch("/api/medications/{mid}")
def adjust_stock(mid: str, payload: dict, db: Session = Depends(get_db)):
    med = db.query(MedicationDB).filter(MedicationDB.id == mid).first()
    if not med: raise HTTPException(404)
    med.stock = max(0, med.stock + payload.get("change", 0))
    db.commit()
    return med

@app.get("/api/prescriptions", response_model=List[PrescriptionRead])
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

@app.post("/api/prescriptions")
def save_prescription(data: PrescriptionCreate, db: Session = Depends(get_db)):
    # 事务：保存主表 + 明细表 + 更新患者状态
    try:
        new_px = PrescriptionDB(id=data.id, patient_id=data.patientId, doctor_id=data.doctorId, status=data.status)
        db.add(new_px)
        
        for m in data.medications:
            item = PrescriptionItemDB(
                prescription_id=data.id, medication_id=m.medicationId,
                med_name=m.name, dosage=m.dosage, quantity=m.quantity
            )
            db.add(item)
            
        # 更新患者状态
        pt = db.query(PatientDB).filter(PatientDB.id == data.patientId).first()
        if pt: pt.status = "已完成"
        
        db.commit()
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(500, detail=str(e))

@app.post("/api/prescriptions/{rxid}/dispense")
def dispense(rxid: str, db: Session = Depends(get_db)):
    # 事务：发药更新状态 + 扣减库存
    px = db.query(PrescriptionDB).filter(PrescriptionDB.id == rxid).first()
    if not px or px.status == "已发药": return {"msg": "already done"}
    
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

# 初始化基础数据
@app.on_event("startup")
def init_data():
    db = SessionLocal()
    if db.query(DoctorDB).count() == 0:
        db.add(DoctorDB(id="DOC001", name="王医生", department="内科", title="主任医师"))
    if db.query(MedicationDB).count() == 0:
        mocks = [
            MedicationDB(id="M001", name="阿莫西林胶囊", spec="0.25g*24粒", stock=500, unit="盒", price=12.5, category="抗生素"),
            MedicationDB(id="M002", name="布洛芬缓释胶囊", spec="0.3g*10粒", stock=45, unit="盒", price=25.0, category="止痛药"),
            MedicationDB(id="M003", name="连花清瘟胶囊", spec="0.35g*24粒", stock=150, unit="盒", price=18.8, category="感冒药")
        ]
        db.add_all(mocks)
    db.commit()
    db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
