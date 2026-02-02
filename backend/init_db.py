
from .database import engine, Base, SessionLocal
from .models import DoctorDB, MedicationDB

def init_db():
    # 1. 创建所有表结构
    print("正在创建数据库表结构...")
    Base.metadata.create_all(bind=engine)
    
    # 2. 开启会话进行数据填充
    db = SessionLocal()
    try:
        # 检查并初始化医生数据
        if db.query(DoctorDB).count() == 0:
            print("正在初始化医生基础数据...")
            db.add(DoctorDB(id="DOC001", name="王医生", department="内科", title="主任医师"))
        
        # 检查并初始化药品字典
        if db.query(MedicationDB).count() == 0:
            print("正在初始化药品字典数据...")
            db.add_all([
                MedicationDB(id="M001", name="阿莫西林胶囊", spec="0.25g*24粒", stock=500, unit="盒", price=12.5, category="抗生素"),
                MedicationDB(id="M002", name="布洛芬缓释胶囊", spec="0.3g*10粒", stock=45, unit="盒", price=25.0, category="止痛药"),
                MedicationDB(id="M003", name="连花清瘟胶囊", spec="0.35g*24粒", stock=150, unit="盒", price=18.8, category="感冒药"),
                MedicationDB(id="M004", name="葡萄糖酸钙口服溶液", spec="10ml*10支", stock=12, unit="盒", price=32.0, category="营养补充"),
                MedicationDB(id="M005", name="氯化钠注射液", spec="100ml:0.9g", stock=1000, unit="袋", price=5.5, category="输液剂"),
                MedicationDB(id="M006", name="红霉素软膏", spec="10g:0.1g", stock=30, unit="支", price=8.0, category="皮肤科用药"),
                MedicationDB(id="M007", name="二甲双胍片", spec="0.5g*30片", stock=200, unit="盒", price=15.6, category="糖尿病药")
            ])
        
        db.commit()
        print("数据库初始化完成！")
    except Exception as e:
        db.rollback()
        print(f"初始化过程中发生错误: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
