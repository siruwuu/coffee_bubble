import json
import os
import numpy as np
from collections import defaultdict
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk

# 🔧 如果第一次运行，请确保 VADER 词典存在
nltk.download("vader_lexicon")

# ======== 📁 路径设置 ========
INPUT_FILE = "data/raw_data/reddit_coffee_bubbles_full.json"
OUTPUT_DIR = "data/processed"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ======== 📊 情绪分析器初始化 ========
sid = SentimentIntensityAnalyzer()

# ======== 📚 简要介绍词典（用于 bubble 描述） ========
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

# ======== 📥 加载原始数据 ========
with open(INPUT_FILE, "r", encoding="utf-8") as f:
    raw_data = json.load(f)

# ======== 🔁 处理每条评论 ========
comments_with_sentiment = []
aggregated = defaultdict(lambda: {"category": None, "examples": [], "sentiments": []})
category_split = defaultdict(list)

for entry in raw_data:
    keyword = entry["keyword"]
    category = entry["category"]

    for ex in entry["examples"]:
        text = ex["text"]
        sentiment = sid.polarity_scores(text)["compound"]
        post_title = ex.get("post_title", "")
        post_url = ex.get("post_url", "")

        # ✅ 收集完整数据用于单条评论散点图等
        comments_with_sentiment.append({
            "keyword": keyword,
            "category": category,
            "text": text,
            "sentiment": sentiment,
            "title": post_title,
            "url": post_url
        })

        # ✅ 汇总给 bubble 用
        agg = aggregated[keyword]
        agg["category"] = category
        agg["examples"].append({
            "text": text,
            "title": post_title,
            "url": post_url
        })
        agg["sentiments"].append(sentiment)

        # ✅ 按类别分组保存
        category_split[category].append({
            "keyword": keyword,
            "text": text,
            "sentiment": sentiment,
            "title": post_title,
            "url": post_url
        })

# ======== 📦 输出 bubble 结构文件 ========
bubble_data = {
    "name": "coffee",
    "children": []
}

for keyword, info in aggregated.items():
    value = len(info["examples"])
    avg_sentiment = float(np.mean(info["sentiments"])) if value > 0 else 0
    bubble_data["children"].append({
        "name": keyword,
        "category": info["category"],
        "value": value,
        "avg_sentiment": round(avg_sentiment, 3),
        "examples": info["examples"][:5],  # 带 title 和 url
        "description": descriptions.get(keyword, "")
    })

with open(os.path.join(OUTPUT_DIR, "bubble_with_descriptions.json"), "w", encoding="utf-8") as f:
    json.dump(bubble_data, f, ensure_ascii=False, indent=2)

# ======== 💾 保存所有评论情绪分数 ========
with open(os.path.join(OUTPUT_DIR, "comments_with_sentiment.json"), "w", encoding="utf-8") as f:
    json.dump(comments_with_sentiment, f, ensure_ascii=False, indent=2)

# ======== 💾 保存分类评论文件 ========
for category, items in category_split.items():
    filename = f"{category}_comments.json"
    with open(os.path.join(OUTPUT_DIR, filename), "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

print(" All data files saved in:", OUTPUT_DIR)
