import os
import json
from datetime import datetime

# 设置路径
INPUT_PATH = "data/processed/comments_with_sentiment.json"
OUTPUT_PATH = "data/processed/comments_with_sentiment_with_date.json"

# 确保输出目录存在
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

# 读取数据
with open(INPUT_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

# 添加 year、month、date 字段
for d in data:
    if "created_utc" in d:
        try:
            dt = datetime.utcfromtimestamp(d["created_utc"])
            d["year"] = dt.strftime("%Y")
            d["month"] = dt.strftime("%Y-%m")
            d["date"] = dt.strftime("%Y-%m-%d")   # 👉 精细到日
        except Exception as e:
            print(f"Invalid timestamp: {d.get('created_utc')}, error: {e}")
            d["year"] = "unknown"
            d["month"] = "unknown"
            d["date"] = "unknown"
    else:
        d["year"] = "unknown"
        d["month"] = "unknown"
        d["date"] = "unknown"

# 保存新文件
with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Processed {len(data)} items and saved to {OUTPUT_PATH}")
