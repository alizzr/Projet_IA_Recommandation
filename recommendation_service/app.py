from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import json
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ----- Charger le catalogue -----
if os.path.exists('products.json'):
    with open('products.json', 'r', encoding='utf-8') as f:
        products = json.load(f)
    df = pd.DataFrame(products)
elif os.path.exists('products.csv'):
    df = pd.read_csv('products.csv')
else:
    df = pd.DataFrame()

# ----- Helpers -----
def normalize_str(s):
    if s is None: return ""
    return str(s).strip().lower()

def parse_brands(s):
    if not s: return []
    return [b.strip().lower() for b in s.split(',') if b.strip()]

def infer_product_perf(row):
    """
    Retourne 0 (basique), 1 (moyen), 2 (elevé) estimé à partir de usage/design_rating.
    """
    usage = normalize_str(row.get('usage', ''))
    design = row.get('design_rating')
    try:
        design = int(design)
    except:
        design = 3
    # heuristique simple : gaming -> élevé, photo_video/pro -> élevé, bureautique/étudiant -> moyen, basique -> basique
    if usage.startswith('gaming') or 'gaming' in usage:
        return 2
    if 'photo' in usage or 'video' in usage or 'pro' in usage:
        return 2
    if 'bureautique' in usage or 'étudiant' in usage or 'etudiant' in usage:
        return 1
    if 'basique' in usage:
        return 0
    # fallback from design_rating: high design => moyen/élevé
    if design >= 4:
        return 2
    if design == 3:
        return 1
    return 0

def score_by_questions(row, answers):
    """
    Retourne un score (plus grand = meilleur). Basé sur :
     - category strict match (fort bonus)
     - brand preference (bonus)
     - budget: penalise fortement si > budget, bonus si <= and close
     - performance distance (petite pénalité si différent)
     - small tie-breakers: battery_rating/design_rating
    """
    score = 0.0

    # Résolution des champs utilisateur
    budget = None
    for key in ('price', 'budget'):
        try:
            if answers.get(key) not in (None, ''):
                budget = float(answers.get(key))
                break
        except:
            pass
    # category
    desired_cat = normalize_str(answers.get('category') or '')
    prod_cat = normalize_str(row.get('category') or '')
    if desired_cat:
        if prod_cat == desired_cat:
            score += 5.0  # fort bonus si même catégorie
        else:
            # catégorie différente => faible score (on garde, mais en bas)
            score -= 3.0

    # brands preference
    pref_brands = parse_brands(answers.get('brand') or answers.get('brands') or '')
    prod_brand = normalize_str(row.get('brand') or '')
    if pref_brands:
        if prod_brand in pref_brands:
            score += 2.5  # bon bonus pour marque préférée

    # price handling
    try:
        prod_price = float(row.get('price') or 0)
    except:
        prod_price = 0.0

    if budget is not None:
        # penalize strongly if product > budget
        if prod_price > budget:
            # penalty proportional to how much it exceeds
            over = prod_price - budget
            score -= 4.0 * (over / (budget + 1))
        else:
            # reward closeness to budget (products close to budget get small bonus)
            proximity = 1.0 - (abs(budget - prod_price) / (budget + 1))
            score += 2.0 * proximity

    # performance matching
    perf_map = {'basique':0, 'moyen':1, 'élevé':2, 'eleve':2, 'standard':1}
    user_perf = perf_map.get(normalize_str(answers.get('performance') or answers.get('perf') or ''), None)
    if user_perf is None:
        # try to deduce from other fields (if user selected 'Basique' in wording)
        if normalize_str(answers.get('performance') or '').startswith('bas'):
            user_perf = 0
        else:
            user_perf = 1  # default moyen

    prod_perf = infer_product_perf(row)
    # smaller penalty for perf mismatch (we prefer not to over-penalize)
    perf_diff = abs(prod_perf - user_perf)
    score += max(0, 1.2 - 0.6 * perf_diff)  # 1.2 for exact, decreasing

    # battery preference (if provided)
    bat_map = {'standard':2, 'longue durée':4, 'tres longue durée':5, 'très longue durée':5, 'longue':4}
    user_bat = None
    bq = normalize_str(answers.get('battery') or answers.get('batterie') or '')
    if bq:
        # map approximate
        for k in bat_map:
            if k in bq:
                user_bat = bat_map[k]
                break
    try:
        prod_bat = int(row.get('battery_rating', 3))
    except:
        prod_bat = 3
    if user_bat is not None:
        score += max(0, 1.0 - (abs(prod_bat - user_bat) * 0.15))

    # small tie-breakers
    try:
        score += (float(row.get('design_rating', 3)) / 10.0)  # small boost for better design
        score += (float(row.get('battery_rating', 3)) / 20.0)
    except:
        pass

    return score

# ----- Endpoint amélioré (accepts top_k) -----
@app.route('/recommend_by_questions', methods=['POST'])
def recommend_by_questions():
    try:
        answers = request.json or {}
        top_k = int(answers.get('top_k', 8))

        # score each product
        scored = []
        for _, row in df.iterrows():
            s = score_by_questions(row, answers)
            scored.append((s, row.to_dict()))

        # sort by score desc
        scored.sort(key=lambda x: -x[0])

        result = [p for s, p in scored[:top_k]]
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recommend', methods=['POST'])
def recommend_alias():
    return recommend_by_questions()

# ----- Cart-based endpoint left unchanged (optional) -----
@app.route('/recommend_by_cart', methods=['POST'])
def recommend_by_cart():
    try:
        cart = request.json or []
        # basic hybrid: prefer same category/brand and price near average
        cats = {}
        brands = {}
        prices = []
        for item in cart:
            cats[item.get('category')] = cats.get(item.get('category'), 0) + 1
            brands[item.get('brand')] = brands.get(item.get('brand'), 0) + 1
            try:
                prices.append(float(item.get('price', 0)))
            except:
                pass
        avg_price = float(np.mean(prices)) if prices else 0.0

        scored = []
        for _, row in df.iterrows():
            s = 0.0
            if row.get('category') in cats:
                s += 3.0 * cats[row.get('category')]
            if row.get('brand') in brands:
                s += 2.0 * brands[row.get('brand')]
            # price proximity
            try:
                s += max(0, 1 - (abs(row.get('price') - avg_price) / (avg_price + 1))) * 2
            except:
                pass
            scored.append((s, row.to_dict()))
        scored.sort(key=lambda x: -x[0])

        # exclude exact items already in cart
        cart_keys = set((i.get('name'), float(i.get('price', 0))) for i in cart)
        res = []
        for s, p in scored:
            if (p.get('name'), float(p.get('price', 0))) in cart_keys:
                continue
            res.append(p)
            if len(res) >= 8:
                break
        return jsonify(res)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
