import json
import os

INPUT_FILE = "data/processed/keyword_sentiment_summary.json"
OUTPUT_FILE = "data/processed/bubble_packed_data.json"

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    raw_data = json.load(f)

packed_data = {
    "name": "coffee",
    "children": []
}

for item in raw_data:
    packed_data["children"].append({
        "name": item["keyword"],
        "category": item["category"],
        "value": item["size"],
        "avg_sentiment": item["avg_sentiment"]
    })

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(packed_data, f, ensure_ascii=False, indent=2)

print(f"Packed bubble data saved to {OUTPUT_FILE}")
