# scripts/generate_block_data.py
import json
from datetime import datetime
from collections import defaultdict
import os

input_path = "data/processed/comments_with_sentiment_with_date.json"
output_path = "data/processed/timeline_blocks.json"
os.makedirs(os.path.dirname(output_path), exist_ok=True)

with open(input_path, "r", encoding="utf-8") as f:
    data = json.load(f)

blocks = []
for item in data:
    if not item.get("date") or not item.get("keyword"):
        continue
    try:
        date = datetime.strptime(item["date"], "%Y-%m-%d").strftime("%Y-%m-%d")
        blocks.append({
            "date": date,
            "keyword": item["keyword"],
            "text": item["text"],
            "title": item.get("title", ""),
            "url": item.get("url", "")
        })
    except Exception as e:
        continue

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(blocks, f, ensure_ascii=False, indent=2)

print(f"Saved {len(blocks)} items to {output_path}")
