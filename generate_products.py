import json
import random

# Load existing products
with open('product_service/products.json', 'r') as f:
    products = json.load(f)

# New categories
new_categories = ['Headphones', 'Smartwatches', 'Cameras', 'Gaming Consoles']

brands = ['Sony', 'Samsung', 'Apple', 'Google', 'Microsoft', 'Amazon', 'Bose', 'JBL', 'Canon', 'Nikon', 'PlayStation', 'Xbox']

usages = ['Gaming', 'Bureautique', 'Étudiant', 'Pro', 'Photo_Video']

# Generate 50 per category
current_id = len(products) + 1

for cat in new_categories:
    for i in range(50):
        product = {
            "product_id": current_id,
            "name": f"{brands[current_id % len(brands)]} {cat} Model {i+1}",
            "category": cat,
            "price": random.randint(50, 2500),
            "brand": brands[current_id % len(brands)],
            "usage": usages[current_id % len(usages)],
            "design_rating": random.randint(1, 5),
            "battery_rating": random.randint(1, 5),
            "image_url": f"https://images.pexels.com/photos/{1649771 + current_id}/pexels-photo-{1649771 + current_id}.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
            "fallback_url": f"https://picsum.photos/id/{current_id}/800/600"
        }
        products.append(product)
        current_id += 1

# Save
with open('product_service/products.json', 'w') as f:
    json.dump(products, f, indent=2)
