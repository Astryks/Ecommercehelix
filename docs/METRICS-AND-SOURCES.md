# Helix metrics: formulas, thresholds and sources

Rules: every Numbers tool is designed from scratch, with Helix's own layout, wording and explanations. Nothing copies a source sheet's structure or text. Standard metric names stay as they are (sales, ROAS, CAC, LTV:CAC). Users type only the basics (sales, spend, orders), and Helix works out the rest. Ratings are Good, Okay or Needs work. All money is in USD.

| Metric | Formula | Good / Okay | Source |
|---|---|---|---|
| Contribution margin (plus "You kept $X of every $100") | (sales − COGS − shipping − fees − marketing) ÷ sales | unchanged | Shopify Help, analytics fields (gross margin, net sales) |
| New customer CAC | ad spend ÷ new-customer orders | ≤0.75× first-order margin / ≤1× | shopify.com/blog/customer-acquisition-cost |
| Returning customer revenue | 100 − new-customer share of sales | ≥20% / ≥10% | Shopify Help, analytics fields (most stores 20–40%) |
| Refund rate | refunds ÷ gross sales | ≤5% / ≤10% | common ecommerce benchmark |
| Cart abandonment rate | 1 − orders ÷ add-to-carts | <70% / <80% | baymard.com/lists/cart-abandonment-rate (70.22% avg, Sep 2025) |
| CAC payback (Customers) | 0 if CAC ≤ first-order margin, else (CAC − first-order margin) ÷ monthly repeat profit | ≤3 mo / ≤6 mo | shopify.com/blog/cac-payback-period; thedtcplaybook.com |
| LTV:CAC (Customers) | 12-month profit per customer before ads ÷ CAC | ≥3:1 / ≥2:1 | shopify.com/blog/what-is-a-good-ltv-to-cac-ratio |
| Days of cover (Stock plan) | floor(on hand ÷ daily sales) | existing reorder logic | inventory standard |

Monthly repeat profit = (orders per customer − 1) × AOV × margin ÷ 12.
