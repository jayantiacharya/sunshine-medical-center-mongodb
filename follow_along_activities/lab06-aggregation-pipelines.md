# Lab 6: Aggregation Pipelines

**Course:** CS3550 - Advanced Database Systems
**Module:** 6 - MongoDB Indexing and Data Modeling
**Estimated Time:** 120 minutes
**Points:** 100
**Prerequisites:** Completion of Labs 1–5 (NestMart fully built and indexed)

---

## Lab Overview

In this final lab, you will leverage the complete NestMart database you've built across Labs 1–5 to write complex queries and powerful aggregation pipelines. You'll generate marketplace analytics reports, analyze seller and buyer behavior, and extract meaningful insights from embedded arrays and joined collections.

This lab introduces `$unwind` as a key technique for working with NestMart's embedded `items[]` arrays in orders — a critical skill for any application that uses embedded documents.

---

## Learning Objectives

By completing this lab, you will:
- Write complex queries using multiple operators and conditions
- Use the aggregation pipeline to transform and analyze data
- Perform grouping, counting, and statistical operations
- Use `$unwind` to flatten embedded arrays for aggregation
- Join data across collections using `$lookup`
- Create practical marketplace analytics reports
- Optimize queries for performance
- Compare MongoDB query patterns to SQL equivalents

---

## Setup Instructions

### Step 1: Verify Complete Database

```javascript
use('nestmart')

show collections
// Expected: sellers, products, orders, buyers, listings_activity

db.sellers.countDocuments()            // 3
db.products.countDocuments()           // 8
db.orders.countDocuments()             // 11
db.buyers.countDocuments()             // 3
db.listings_activity.countDocuments()  // 6+
```

If any collection is missing or empty, complete the earlier labs first.

---

## Part 1: Complex Find Queries (25 points)

### Task 1.1: Multi-Condition Queries (10 points)

Write queries to find:

1. **All Pending orders placed in March 2025**
   - Status must be "Pending"
   - Order date between March 1 and March 31, 2025
   - Sort by order_date ascending
   - Show only: order_id, buyer_name, seller_name, order_date, total

2. **Available products priced between $40 and $100 in Electronics or Textbooks**
   - Status must be "available"
   - Price between $40 and $100 (inclusive)
   - Category must be Electronics or Textbooks
   - Sort by price ascending

3. **Active sellers with rating above 4.0 who list Textbooks**
   - Seller status must be "active"
   - Rating must be greater than 4.0
   - Categories array must contain "Textbooks"
   - Sort by rating descending

4. **Orders that are stale Pending (placed before March 15, 2025, still Pending)**
   - Order date is before March 15, 2025
   - Status is still "Pending"
   - Sort by order_date ascending (oldest first)

**Deliverable:**
- All 4 queries with proper syntax
- Sample output from each query
- Brief explanation of operators used (50 words per query)

---

### Task 1.2: Array and Nested Document Queries (8 points)

Write queries to find:

1. **Products with more than 2 reviews**
   - Use `$expr` and `$size` (prefer `$ifNull` for missing review arrays)
   - Show product title, price, and review count

2. **Products with a 5-star verified purchase review**
   - Use `$elemMatch` to match both rating=5 AND verified_purchase=true in the same review
   - Show title, price, and avg_rating

3. **Buyers with at least one notify_on_price_drop item in their wishlist**
   - Use `$elemMatch` on the wishlist array
   - Show buyer name and email

**Deliverable:**
- All 3 queries
- Explanation of when to use `$elemMatch` vs a simple array field query (75 words)

---

### Task 1.3: Pattern Matching (7 points)

Write queries to find:

1. **Sellers with a university.edu email address**
   - Use `$regex` to match email ending in `@university.edu`
   - Show only name and email

2. **Orders with notes containing "cheaper", "wrong", or "cancel" (case-insensitive)**
   - Use `$regex` with the `i` flag
   - Show order_id, buyer_name, status, and notes

**Deliverable:**
- Both queries with regex patterns
- Explanation of the `i` option (50 words)

---

## Part 2: Aggregation Framework Basics (25 points)

### Task 2.1: Grouping and Counting (12 points)

Write aggregation pipelines to:

1. **Count orders by status** — sort by count descending
   ```javascript
   // Expected output structure:
   // { _id: "Pending", count: X }
   // { _id: "Shipped", count: Y }
   // ...
   ```

2. **Count orders per seller (busiest sellers first)**
   - Group by seller_id
   - Show seller_id, seller_name (use `$first`), and order count
   - Sort by order count descending

3. **Average order value per seller**
   - Group by seller_id
   - Calculate `$avg` of total
   - Show seller_name, avg_order_value (rounded to 2 decimal places)
   - Sort by avg_order_value descending

4. **Count products by category**
   - Group by category
   - Show category and count
   - Sort by count descending

**Deliverable:**
- All 4 pipelines
- Output from each
- Explanation of `$group` syntax (100 words)

---

### Task 2.2: Filtering and Projecting in Pipelines (8 points)

Write aggregation pipelines to:

1. **Delivered orders in March 2025 — reshaped output**
   - `$match`: status = "Delivered", order_date in March 2025
   - `$project`: show order_id, buyer_name, seller_name, total, order_date — exclude _id

2. **Products priced over $60 — show with review count**
   - `$match`: price > 60
   - `$project`: add `review_count` field using `$size` on the reviews array
   - `$sort`: price descending

3. **Active sellers in Textbooks or Electronics**
   - `$match`: status = "active", categories contains "Textbooks" OR "Electronics"
   - `$project`: show seller_id, name, rating, categories — exclude _id
   - `$sort`: name ascending

**Deliverable:**
- All 3 pipelines
- Sample output
- Explanation of `$match` vs `find()` in an aggregation context (75 words)

---

### Task 2.3: Sorting and Limiting (5 points)

Write aggregation pipelines to:

1. **Top 5 most expensive available products**
   - Match only "available" status
   - Sort by price descending
   - Limit to 5
   - Show title, price, category, condition

2. **5 most recently listed available products**
   - Match only "available" status
   - Sort by listed_date descending
   - Limit to 5

**Deliverable:**
- Both pipelines with exactly 5 results each

---

## Part 3: Advanced Aggregation (25 points)

### Task 3.1: Multi-Stage Pipelines (15 points)

Write complex multi-stage pipelines to:

1. **Seller Performance Report**
   - For each seller, calculate:
     - total orders
     - delivered orders
     - cancelled orders
     - pending orders
     - completion rate (delivered / total, rounded to 2 decimal places)
     - average order value
   - Sort by completion rate descending
   - Only include sellers with at least 2 orders

   ```javascript
   // Expected output structure:
   {
     seller_id: "S001",
     seller_name: "Alex Rivera",
     total_orders: 5,
     delivered: 2,
     cancelled: 0,
     pending: 3,
     completion_rate: 0.40,
     avg_order_value: 62.00
   }
   ```

2. **Product Revenue Summary**
   - Unwind the `items[]` array in orders to get one document per line item
   - Group by product_id to calculate:
     - product title (from items.title)
     - total units sold (sum of quantity)
     - total revenue (sum of subtotal)
     - number of orders the product appeared in
   - Sort by total revenue descending
   - Only show products that appeared in 2+ orders

   > **Hint:** This pipeline requires `$unwind: "$items"` as an early stage.
   > This is a key MongoDB pattern: flatten embedded arrays before grouping on their contents.

3. **Monthly Order Trends**
   - Group orders by month using `$dateToString` with format `"%Y-%m"`
   - For each month, show:
     - order count
     - total revenue (sum of `total`)
     - average order value
   - Sort by month ascending

**Deliverable:**
- All 3 pipelines (3–5 stages each)
- Complete output
- Explanation of how `$unwind` works and why it's needed for the Product Revenue Summary (150 words)

---

### Task 3.2: Lookup (Joining Collections) (10 points)

Write aggregation pipelines using `$lookup` to:

1. **Orders with Full Product Details**
   - Start with orders
   - `$unwind` the items array
   - `$lookup` products on `items.product_id` = `product_id`
   - Show: order_id, buyer_name, status, item title, item unit_price, product condition, product category
   - Limit to 5 results

   ```javascript
   db.orders.aggregate([
     { $unwind: "$items" },
     {
       $lookup: {
         from: "products",
         localField: "items.product_id",
         foreignField: "product_id",
         as: "product_details"
       }
     },
     { $unwind: "$product_details" },
     // TODO: project and limit
   ])
   ```

2. **Sellers with All Their Product Listings**
   - Start with sellers
   - `$lookup` products on `seller_id` = `seller_id`
   - For each seller, show: seller_id, name, rating, listing count, and a simplified array of listings (title and price only)

**Deliverable:**
- Both lookup pipelines
- Formatted output showing joined data
- Comparison to SQL JOIN (100 words): How is `$lookup` similar? How is it different?

---

## Part 4: Practical Marketplace Analytics Reports (15 points)

### Task 4.1: Three Business Reports (15 points)

Generate the following reports using aggregation:

1. **Revenue by Category Report**
   - Unwind order items, then join to products to get each item's category
   - Group by category
   - For each category, show:
     - total_revenue (sum of item subtotals)
       - orders_count (count of DISTINCT orders that included this category)
     - avg_item_price (avg of unit_price)
   - Sort by total_revenue descending

   ```javascript
   // Expected output:
   { category: "Electronics", total_revenue: 285.00, orders_count: 3, avg_item_price: 95.00 }
   ```

2. **Seller Workload Analysis**
   - For each seller, show:
     - count of Pending orders
     - count of Shipped orders
     - total order count
     - availability label: `"Overloaded"` if pending > 5, `"Moderate"` if pending 2–5, `"Available"` if pending < 2
   - Sort by pending orders descending

3. **Buyer Activity Report**
   - For each buyer, show:
     - total orders placed
     - total amount spent (sum of order totals)
     - number of unique sellers bought from
     - buyer tier: `"VIP"` if total_spent > $200, `"Regular"` if $50–$200, `"New"` if < $50
   - Only include buyers with at least 1 Delivered order
   - Sort by total_spent descending

**Deliverable:**
- All 3 complete report pipelines
- Formatted output that looks like an actual report
- Brief business insight from each report (50 words each)

---

## Part 5: Query Optimization and Comparison (10 points)

### Task 5.1: Explain Plans (5 points)

Run `.explain("executionStats")` on:
1. One complex find query from Part 1
2. One aggregation pipeline from Part 2

**Analyze:**
- How many documents were examined vs returned?
- What is the execution time?
- Would an index help? On which fields?

**Deliverable:**
- Explain output for both queries
- Analysis and index recommendations (150 words)

---

### Task 5.2: MongoDB vs SQL Comparison (5 points)

For the following MongoDB aggregation pipeline, write the equivalent SQL query:

**MongoDB Query:**
```javascript
db.orders.aggregate([
  { $match: { status: "Delivered" } },
  {
    $group: {
      _id: "$seller_id",
      total_revenue: { $sum: "$total" },
      order_count: { $sum: 1 }
    }
  },
  { $sort: { total_revenue: -1 } }
])
```

**Your Task:**
1. Write the equivalent SQL query (assume a relational `orders` table with `status`, `seller_id`, and `total` columns)
2. Explain the differences (150 words):
   - Syntax differences
   - How the aggregation pipeline compares to SQL operations
   - Which is more intuitive for this query? Why?
   - When would MongoDB aggregation be harder than SQL?

---

## Bonus Challenges (Optional, +15 extra points)

### Bonus 1: Faceted Marketplace Search (+5 points)

Use `$facet` to return multiple summaries in a single pipeline:
- Count products by category
- Count products by condition
- Price distribution buckets: $0–50, $51–100, $101+

All in one aggregation pipeline using `$facet` and `$bucket`.

---

### Bonus 2: Wishlist Price-Drop Analysis (+5 points)

Create a pipeline that:
1. First, add a `listed_price_at_add` field to each buyer's wishlist items (set it equal to the current product price using `updateMany` + `$lookup` logic)
2. Then write an aggregation that joins buyers.wishlist to products on product_id
3. Finds wishlist items where the current `price` is lower than `listed_price_at_add`
4. Groups by buyer to show each buyer's total potential savings

---

### Bonus 3: Seller Analytics Dashboard (+5 points)

Design and implement a complete seller performance dashboard pipeline that:
- Uses at least 5 aggregation stages
- Includes at least one `$lookup`
- Uses `$unwind` on an embedded array
- Outputs a scorecard per seller: total revenue, avg rating across all their products, fulfillment rate, most popular category
- Write a 100-word description of what business problem this dashboard solves

---

## Submission Requirements

Create a file named `lab06-submission.mongodb.js` containing:

1. **Header section:** Name, date, lab title, table of contents
2. **Part 1:** All queries with sample output and operator explanations
3. **Part 2:** All aggregation pipelines with output and explanations
4. **Part 3:** Multi-stage pipelines, $unwind explanation, $lookup examples
5. **Part 4:** Complete report pipelines with formatted output and business insights
6. **Part 5:** Explain plans, SQL equivalent, comparison analysis
7. **Bonus (if completed)**

---

## Grading Rubric

| Category | Points | Criteria |
|----------|--------|----------|
| **Part 1: Complex Find Queries** | 25 | Correct operators, proper syntax, meaningful output |
| **Part 2: Basic Aggregation** | 25 | Working pipelines, proper grouping, accurate calculations |
| **Part 3: Advanced Aggregation** | 25 | Multi-stage pipelines (including $unwind), successful lookups |
| **Part 4: Practical Reports** | 15 | Professional formatting, business value, actionable insights |
| **Part 5: Optimization & Comparison** | 10 | Thoughtful analysis, accurate SQL equivalents |
| **Code Quality & Documentation** | 5 | Well-commented, organized, follows conventions |
| **Bonus Challenges** | +15 | Extra credit for advanced work |
| **Total** | **100** (+15 bonus) | |

---

## SQL to MongoDB Aggregation Mapping

| SQL | MongoDB Aggregation |
|-----|---------------------|
| WHERE | $match |
| GROUP BY | $group |
| HAVING | $match (after $group) |
| SELECT | $project |
| ORDER BY | $sort |
| LIMIT | $limit |
| SUM() | $sum |
| AVG() | $avg |
| COUNT() | $sum: 1 |
| JOIN | $lookup |
| (no direct equivalent) | $unwind |

---

## Tips for Success

1. **$unwind before $group on arrays** — if you want to group on items inside an embedded array, you must `$unwind` the array first to create one document per element
2. **Test incrementally** — add one stage at a time; don't write the entire pipeline at once
3. **Check data types** — ensure dates are `new Date(...)`, numbers are numbers, not strings
4. **Use $first for denormalized fields** — e.g., `seller_name: { $first: "$seller_name" }` inside `$group` retrieves a consistent value from all grouped documents

---

*Last Updated: March 2026*
*Part of CS3550 Module 6: MongoDB Indexing, Schema Design, and Aggregation*
