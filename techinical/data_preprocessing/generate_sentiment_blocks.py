import os
import json
import math

INPUT_PATH = "data/processed/comments_with_sentiment_with_date.json"
OUTPUT_PATH = "data/processed/sentiment_blocks.json"

os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

# Load raw data
with open(INPUT_PATH, "r", encoding="utf-8") as f:
    raw = json.load(f)

# Divide the sentiment scores into bins according to intervals, such as 0.0 ~ 0.1, 0.1 ~ 0.2 etc
def get_sentiment_bin(score, bin_size=0.1):
    return round(math.floor(score / bin_size) * bin_size, 1)

# Building block data structure
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

with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(blocks, f, ensure_ascii=False, indent=2)

print(f"Saved {len(blocks)} sentiment blocks to {OUTPUT_PATH}")
