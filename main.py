
# 此文件已弃用，请使用 `python -m backend.main` 启动后端
# 数据库初始化请使用 `python -m backend.init_db`
import sys

if __name__ == "__main__":
    print("错误: 核心逻辑已迁移至 backend 目录。")
    print("请使用以下命令启动项目：")
    print("1. 初始化数据库: python -m backend.init_db")
    print("2. 启动后端服务: python -m backend.main")
    sys.exit(1)
