import os
import json
import math

# 输入输出路径
INPUT_PATH = "data/processed/comments_with_sentiment_with_date.json"
OUTPUT_PATH = "data/processed/sentiment_blocks.json"

# 保证目录存在
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

# 加载原始数据
with open(INPUT_PATH, "r", encoding="utf-8") as f:
    raw = json.load(f)

# 将情绪分数按照区间分 bin，比如 0.0 ~ 0.1，0.1 ~ 0.2 ...
def get_sentiment_bin(score, bin_size=0.1):
    return round(math.floor(score / bin_size) * bin_size, 1)

# 构建 block 数据结构
blocks = []
for item in raw:
    sentiment = item.get("sentiment", None)
    if sentiment is None:
        continue

    bin_sentiment = get_sentiment_bin(sentiment)
    block = {
        "sentiment_bin": bin_sentiment,
        "keyword": item["keyword"],
        "text": item["text"],
        "title": item.get("title", ""),
        "url": item.get("url", ""),
        "score": item.get("score", 0),
        "created_utc": item.get("created_utc", None),
        "date": item.get("date", "unknown")
    }
    blocks.append(block)

# 输出新文件
with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(blocks, f, ensure_ascii=False, indent=2)

print(f"Saved {len(blocks)} sentiment blocks to {OUTPUT_PATH}")
