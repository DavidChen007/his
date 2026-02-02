
from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from .database import Base

class DoctorDB(Base):
    """医生基础信息表"""
    __tablename__ = "doctors"
    id = Column(String(50), primary_key=True)
    name = Column(String(50), nullable=False)
    department = Column(String(50))
    title = Column(String(20))

class PatientDB(Base):
    """患者档案及诊断状态表"""
    __tablename__ = "patients"
    id = Column(String(50), primary_key=True)
    name = Column(String(100), index=True)
    age = Column(Integer)
    gender = Column(String(10))
    phone = Column(String(20))
    register_time = Column(DateTime, default=func.now())
    status = Column(String(20))  # 待诊, 已完成
    symptoms = Column(Text, nullable=True)
    diagnosis = Column(Text, nullable=True)

class MedicationDB(Base):
    """药品字典与库存主表"""
    __tablename__ = "medications"
    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    spec = Column(String(100))
    stock = Column(Integer, default=0)
    unit = Column(String(20))
    price = Column(Float)
    category = Column(String(50))

class PrescriptionDB(Base):
    """处方主单表"""
    __tablename__ = "prescriptions"
    id = Column(String(50), primary_key=True)
    patient_id = Column(String(50), ForeignKey("patients.id"))
    doctor_id = Column(String(50), ForeignKey("doctors.id"))
    created_at = Column(DateTime, default=func.now())
    status = Column(String(20))  # 已开立, 已发药
    
    # 级联删除：删除处方时同步删除明细
    items = relationship("PrescriptionItemDB", back_populates="prescription", cascade="all, delete-orphan")

class PrescriptionItemDB(Base):
    """处方详情表（实现药品清单与主单的关联）"""
    __tablename__ = "prescription_items"
    id = Column(Integer, primary_key=True, autoincrement=True)
    prescription_id = Column(String(50), ForeignKey("prescriptions.id"))
    medication_id = Column(String(50), ForeignKey("medications.id"))
    med_name = Column(String(100))
    dosage = Column(String(50))
    quantity = Column(Integer)
    
    prescription = relationship("PrescriptionDB", back_populates="items")
