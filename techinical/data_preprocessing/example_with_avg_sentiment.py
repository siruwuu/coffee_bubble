import json
from collections import defaultdict
import numpy as np

input_path = "data/processed/comments_with_sentiment.json"
output_path = "data/processed/bubble_with_descriptions.json"
category_output_dir = "data/processed/"

# Introduction Dictionary
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

with open(input_path, "r", encoding="utf-8") as f:
    comments = json.load(f)

# Combine bubble data and per-category split
aggregated = defaultdict(lambda: {"category": None, "examples": [], "sentiments": []})
category_split = defaultdict(list)

for item in comments:
    keyword = item["keyword"]
    category = item["category"]
    sentiment = item.get("sentiment", 0)
    text = item["text"]
    title = item.get("title", "")
    url = item.get("url", "")

    aggregated[keyword]["category"] = category
    aggregated[keyword]["examples"].append(text)
    aggregated[keyword]["sentiments"].append(sentiment)

    category_split[category].append({
        "keyword": keyword,
        "text": text,
        "sentiment": sentiment,
        "title": title,
        "url": url
    })

# Bubble plot structure
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
        "examples": info["examples"][:5],
        "description": descriptions.get(keyword, "")
    })

# Save bubble file
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(bubble_data, f, ensure_ascii=False, indent=2)

print("Bubble data saved to:", output_path)

# Save category-specific sentiment data
for cat, items in category_split.items():
    out_path = f"{category_output_dir}{cat}_comments.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    print(f" Category data saved to: {out_path}")
