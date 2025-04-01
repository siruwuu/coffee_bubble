import json
import numpy as np

with open("data/processed/comments_with_sentiment.json", "r", encoding="utf-8") as f:
    data = json.load(f)

lengths = [len(item["text"]) for item in data]
min_len, max_len = min(lengths), max(lengths)
avg_len = np.mean(lengths)

print(f"Comment Length Stats:")
print(f"Min length: {min_len}")
print(f"Max length: {max_len}")
print(f"Avg length: {avg_len:.2f}")
