import json
from collections import defaultdict

# 输入输出路径
INPUT_FILE = "data/processed/bubble_packed_data.json"
OUTPUT_FILE = "data/processed/bubble_packed_data_grouped.json"

# 读取原始扁平数据
with open(INPUT_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

# 构建嵌套结构，按 category 分组
grouped_data = {
    "name": "coffee",
    "children": []
}

# 按 category 聚合
category_groups = defaultdict(list)
for item in data["children"]:
    category = item["category"]
    category_groups[category].append(item)

# 构造新的嵌套结构
for category, items in category_groups.items():
    grouped_data["children"].append({
        "name": category,
        "children": items
    })

# 保存结果
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(grouped_data, f, ensure_ascii=False, indent=2)

print(f"Successfully saved to {OUTPUT_FILE}")
