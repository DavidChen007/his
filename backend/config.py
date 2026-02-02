
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # API 元数据配置
    API_TITLE: str = "Smart-HIS Pro 接口文档"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "### Smart-HIS Pro 智慧医院系统后端 API 🚀"

    # 数据库配置 (优先从环境变量读取)
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "123456")
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "3306")
    DB_NAME: str = os.getenv("DB_NAME", "his_db")

    @property
    def database_url(self) -> str:
        """动态构建 SQLAlchemy 连接字符串"""
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # 其他系统配置
    DEBUG_MODE: bool = os.getenv("DEBUG_MODE", "True").lower() == "true"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # 忽略额外的环境变量

settings = Settings()
