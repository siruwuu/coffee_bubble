import os
import json
import time
from dotenv import load_dotenv
import praw

# Loading environment
load_dotenv()
REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET")
REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT")

# Initiate Reddit Instance
reddit = praw.Reddit(
    client_id=REDDIT_CLIENT_ID,
    client_secret=REDDIT_CLIENT_SECRET,
    user_agent=REDDIT_USER_AGENT
)

# Key words
subreddits = [
    "Coffee", "espresso", "barista", "pourover",
    "coffeebeans", "coffeegeek", "homebarista", "latteart"
]

keywords = {
    "flavor": ["bitter", "sweet", "acidity", "fruity", "nutty", "creamy"],
    "type": ["espresso", "latte", "cold brew", "americano"],
    "brew": ["french press", "pour-over", "moka pot", "aeropress"],
    "origin": ["arabica", "robusta", "ethiopia", "colombia"]
}

# Main function
def collect_comments_by_keyword(keywords_dict, max_comments_per_keyword=50):
    result = []

    for category, kw_list in keywords_dict.items():
        for keyword in kw_list:
            print(f"\n🔍 Searching for: '{keyword}' ({category})")
            keyword_data = {
                "keyword": keyword,
                "category": category,
                "examples": [],
                "size": 0
            }

            matched = set()
            count = 0

            for sub in subreddits:
                print(f"  📂 Searching comments in r/{sub} ...")
                try:
                    for comment in reddit.subreddit(sub).comments(limit=1000):
                        text = comment.body.strip()
                        if keyword.lower() in text.lower() and len(text) >= 15:
                            if text not in matched:
                                keyword_data["examples"].append({
                                    "text": text,
                                    "subreddit": sub,
                                    "post_title": comment.submission.title,
                                    "post_url": f"https://www.reddit.com{comment.submission.permalink}"
                                })
                                matched.add(text)
                                count += 1
                                if count >= max_comments_per_keyword:
                                    break
                    if count >= max_comments_per_keyword:
                        break
                except Exception as e:
                    print(f"⚠️ Error in r/{sub}: {e}")
                    continue
                time.sleep(0.5)  

            keyword_data["size"] = len(keyword_data["examples"])
            result.append(keyword_data)
            print(f"✅ Collected {keyword_data['size']} comments for '{keyword}'")

    return result

# Save the data
all_data = collect_comments_by_keyword(keywords, max_comments_per_keyword=50)

# Output File Path
output_path = "../data/raw_data/reddit_coffee_bubbles_full.json"
os.makedirs(os.path.dirname(output_path), exist_ok=True)

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(all_data, f, ensure_ascii=False, indent=2)

print(f"\n🎉 Scraping complete! Data saved to {output_path}")
