import json
import os
from collections import defaultdict
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk

nltk.download("vader_lexicon")

# ========== 📂 路径设置 ==========
INPUT_FILE = "data/raw_data/reddit_coffee_bubbles_full.json"
OUTPUT_DIR = "data/processed"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ========== 📥 加载原始数据 ==========
with open(INPUT_FILE, "r", encoding="utf-8") as f:
    raw_data = json.load(f)

# ========== 🔍 初始化情绪分析器 ==========
sid = SentimentIntensityAnalyzer()

# ========== 📊 结构准备 ==========
summary_data = []
all_comments_with_sentiment = []

# ========== 🔁 遍历关键词数据 ==========
for item in raw_data:
    keyword = item["keyword"]
    category = item["category"]
    examples = item["examples"]

    sentiment_scores = []
    for ex in examples:
        text = ex["text"]
        score = sid.polarity_scores(text)["compound"]
        ex["sentiment"] = score
        sentiment_scores.append(score)

        all_comments_with_sentiment.append({
            "keyword": keyword,
            "category": category,
            "text": text,
            "sentiment": score,
            "subreddit": ex.get("subreddit"),
            "post_title": ex.get("post_title"),
            "post_url": ex.get("post_url")
        })

    # 关键词级别统计
    summary_data.append({
        "keyword": keyword,
        "category": category,
        "size": len(examples),
        "avg_sentiment": round(sum(sentiment_scores) / len(sentiment_scores), 4) if sentiment_scores else 0.0
    })

# ========== 💾 写入结果文件 ==========

# 1. 汇总数据（供气泡图使用）
with open(os.path.join(OUTPUT_DIR, "keyword_sentiment_summary.json"), "w", encoding="utf-8") as f:
    json.dump(summary_data, f, ensure_ascii=False, indent=2)

# 2. 每条评论附带情绪信息（供散点图、嵌入用）
with open(os.path.join(OUTPUT_DIR, "comments_with_sentiment.json"), "w", encoding="utf-8") as f:
    json.dump(all_comments_with_sentiment, f, ensure_ascii=False, indent=2)

print("✅ Sentiment processing complete. Files saved to:", OUTPUT_DIR)
