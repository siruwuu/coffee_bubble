import json
import os
from collections import defaultdict
import numpy as np

# 路径设置
INPUT = "data/processed/comments_with_sentiment_with_date.json"
OUTPUT = "data/processed/bubble_from_comments.json"

# 读取原始评论数据
with open(INPUT, "r", encoding="utf-8") as f:
    data = json.load(f)

# 分组和统计
grouped = defaultdict(lambda: {
    "category": "",
    "examples": [],
    "sentiments": []
})

for d in data:
    keyword = d["keyword"]
    grouped[keyword]["category"] = d["category"]
    grouped[keyword]["examples"].append({
        "text": d["text"],
        "title": d["title"],
        "url": d["url"]
    })
    grouped[keyword]["sentiments"].append(d["sentiment"])

# 构造 bubble 数据结构
bubble = {
    "name": "coffee",
    "children": []
}

for keyword, info in grouped.items():
    examples = info["examples"][:5]  # 最多5条
    avg_sent = float(np.mean(info["sentiments"])) if info["sentiments"] else 0
    bubble["children"].append({
        "name": keyword,
        "category": info["category"],
        "value": len(info["examples"]),
        "avg_sentiment": round(avg_sent, 4),
        "examples": examples
    })

# 保存为 JSON
os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
with open(OUTPUT, "w", encoding="utf-8") as f:
    json.dump(bubble, f, ensure_ascii=False, indent=2)

print(f"Bubble data saved to: {OUTPUT}")
