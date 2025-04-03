import json
import os
import numpy as np
from collections import defaultdict
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk

# ✅ 确保 VADER 字典加载
nltk.download("vader_lexicon")

# ====== 📁 路径配置 ======
INPUT_FILE = "data/raw_data/post.json"
OUTPUT_DIR = "data/processed"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ====== 📘 关键词简介（给气泡用） ======
descriptions = {
    "bitter": "Bitter is one of the basic taste sensations often associated with dark roast or over-extraction.",
    "sweet": "Sweetness in coffee is a desirable trait, indicating well-developed sugars during roasting.",
    "acidity": "Acidity refers to the bright, tangy notes in coffee, often found in light roast or African beans.",
    "fruity": "Fruity describes coffee with berry, citrus, or tropical fruit notes, common in natural processed beans.",
    "nutty": "Nutty flavors are characterized by almond, hazelnut, or peanut-like tastes, often in medium roasts.",
    "creamy": "Creamy describes a smooth mouthfeel, sometimes associated with milk-based drinks or certain beans.",
    "espresso": "Espresso is a concentrated coffee made by forcing hot water under pressure through fine grounds.",
    "latte": "Latte is a milk-based espresso drink with a high ratio of steamed milk to coffee.",
    "cold brew": "Cold brew is made by steeping coarse coffee grounds in cold water for an extended period.",
    "americano": "Americano is an espresso diluted with hot water, resembling drip coffee in strength and volume.",
    "french press": "French press is a manual brewing method using immersion and a plunger to extract coffee.",
    "pour-over": "Pour-over is a drip method where hot water is poured over grounds in a filter for precise control.",
    "moka pot": "Moka pot brews strong stovetop coffee by passing steam-pressured water through grounds.",
    "aeropress": "Aeropress is a compact brewing device using pressure and immersion for rapid coffee extraction.",
    "arabica": "Arabica is a coffee species known for smooth flavor, mild acidity, and lower caffeine levels.",
    "robusta": "Robusta is a coffee species higher in caffeine, often used in espresso blends for crema and strength.",
    "ethiopia": "Ethiopia is considered the birthplace of coffee, known for fruity, floral, and complex profiles.",
    "colombia": "Colombian coffee is known for balanced acidity, nutty tones, and smooth medium body."
}

# ====== 📊 初始化情绪分析器 ======
sid = SentimentIntensityAnalyzer()

# ====== 📥 加载原始数据 ======
with open(INPUT_FILE, "r", encoding="utf-8") as f:
    raw_data = json.load(f)

# ====== 🔁 开始处理 ======
comments_with_sentiment = []
bubble_grouped = defaultdict(lambda: {
    "category": None,
    "examples": [],
    "sentiments": []
})

for item in raw_data:
    keyword = item["keyword"]
    category = item["category"]

    for ex in item["examples"]:
        text = ex["text"]
        sentiment = sid.polarity_scores(text)["compound"]

        comment_entry = {
            "keyword": keyword,
            "category": category,
            "text": text,
            "sentiment": sentiment,
            "title": ex.get("post_title", ""),
            "url": ex.get("post_url", ""),
            "score": ex.get("score", None),
            "created_utc": ex.get("created_utc", None)
        }

        comments_with_sentiment.append(comment_entry)

        bubble_grouped[keyword]["category"] = category
        bubble_grouped[keyword]["sentiments"].append(sentiment)
        bubble_grouped[keyword]["examples"].append({
            "text": text,
            "title": comment_entry["title"],
            "url": comment_entry["url"]
        })

# ====== 💾 保存所有评论情绪数据 ======
with open(os.path.join(OUTPUT_DIR, "comments_with_sentiment.json"), "w", encoding="utf-8") as f:
    json.dump(comments_with_sentiment, f, ensure_ascii=False, indent=2)

# ====== 🎈 准备 bubble 用数据结构 ======
bubble_data = {
    "name": "coffee",
    "children": []
}

for keyword, info in bubble_grouped.items():
    sentiments = info["sentiments"]
    avg_sent = float(np.mean(sentiments)) if sentiments else 0

    bubble_data["children"].append({
        "name": keyword,
        "category": info["category"],
        "value": len(info["examples"]),
        "avg_sentiment": round(avg_sent, 3),
        "examples": info["examples"][:5],
        "description": descriptions.get(keyword, "")
    })

with open(os.path.join(OUTPUT_DIR, "bubble_with_descriptions.json"), "w", encoding="utf-8") as f:
    json.dump(bubble_data, f, ensure_ascii=False, indent=2)

print("Done! All files saved to:", OUTPUT_DIR)
