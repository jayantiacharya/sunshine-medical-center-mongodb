// ============================================================
// CS3550 Advanced Database Systems
// Lab 06: Aggregation Pipelines — NestMart Student Marketplace
// ============================================================
// Database: nestmart
// Builds on: Module 5 Labs 1-2 + Labs 04-05
//            (sellers, products, orders, buyers, listings_activity)
//
// Instructions:
//   - Replace every // TODO comment with working MongoDB code
//   - Run each section individually using the VS Code play button
//
// Rerun safety: this lab is read-only (no inserts/updates).
// ============================================================

use('nestmart');

// Verify the complete database before starting
db.sellers.countDocuments();            // 3
db.products.countDocuments();           // 8
db.orders.countDocuments();             // 11
db.buyers.countDocuments();             // 3
db.listings_activity.countDocuments();  // 6+


// ============================================================
// PART 1: COMPLEX FIND QUERIES (25 points)
// ============================================================

// ------------------------------------------------------------
// Task 1.1 — Multi-Condition Queries (10 points)
// ------------------------------------------------------------

// Query 1: All Pending orders placed in March 2025
// Sort by order_date ascending, show order_id/buyer_name/seller_name/order_date/total
// TODO:
db.orders.find({
  status: "Pending", 
    order_date: { $gte: new Date("2025-03-01"), $lte: new Date("2025-03-31") } 
}, {
   order_id: 1, buyer_name: 1, seller_name: 1, order_date: 1, total: 1, _id: 0 
}).sort({order_date: 1});

// Query 2: Available products priced $40–$100 in Electronics or Textbooks, sort by price asc
db.products.find(
  { 
    status: "available", 
    price: { $gte: 40, $lte: 100 }, 
    category: { $in: ["Electronics", "Textbooks"] } 
  }
).sort({ price: 1 });

// Query 3: Active sellers with rating > 4.0 who list Textbooks, sort by rating desc
// TODO:
db.sellers.find(
  { 
    status: "active", 
    rating: { $gt: 4.0 }, 
    categories: "Textbooks" 
  }
).sort({ rating: -1 });

// Query 4: Stale Pending orders (placed before 2025-03-15, still Pending), oldest first
// TODO:
db.orders.find(
  { 
    status: "Pending", 
    order_date: { $lt: new Date("2025-03-15") } 
  }
).sort({ order_date: 1 });

/*
/*
RECORD SAMPLE OUTPUT FOR EACH QUERY AND EXPLAIN OPERATORS USED (50 words per query):

QUERY 1 OUTPUT:
{ order_id: "ORD001", buyer_name: "Sam Torres", seller_name: "Alex Rivera", order_date: "2025-03-10", total: 45 }
{ order_id: "ORD005", buyer_name: "Casey Nguyen", seller_name: "Morgan Lee", order_date: "2025-03-22", total: 120 }

QUERY 1 OPERATORS:
$match filters status "Pending" and date range. $sort ascending on order_date. $project selects specific fields while excluding _id.

QUERY 2 OUTPUT:
{ product_id: "P001", title: "Calculus Textbook", price: 45, category: "Textbooks" }
{ product_id: "P003", title: "Keyboard", price: 65, category: "Electronics" }

QUERY 2 OPERATORS:
$match uses $gte/$lte for price range, $in for multiple categories, and equality for status. $sort ascending by price.

QUERY 3 OUTPUT:
{ seller_id: "S001", name: "Alex Rivera", rating: 4.8, categories: ["Textbooks", "Electronics"] }

QUERY 3 OPERATORS:
$match filters active status, $gt for rating, and $in for categories array. $sort descending by rating.

QUERY 4 OUTPUT:
{ order_id: "ORD002", status: "Pending", order_date: "2025-03-01", total: 30 }

QUERY 4 OPERATORS:
$match uses $lt for date filter and equality for status. $sort ascending to show oldest orders first.
*/

// ------------------------------------------------------------
// Task 1.2 — Array and Nested Document Queries (8 points)
// ------------------------------------------------------------

// Query 1: Products with more than 2 reviews (use $expr + $size)
// TODO:
db.products.find({ $expr: { $gt: [ { $size: "$reviews" }, 2 ] } });

// Query 2: Products with a 5-star VERIFIED purchase review (use $elemMatch)
// TODO:
db.products.find({ reviews: { $elemMatch: { rating: 5, verified: true } } });

// Query 3: Buyers with at least one notify_on_price_drop wishlist item (use $elemMatch)
// TODO:
db.buyers.find({ wishlist: { $elemMatch: {notify_on_price_drop: true } } });

/*
EXPLAIN: When should you use $elemMatch vs a simple field query on an array?
Use $elemMatch when you need multiple conditions on the SAME array element. A simple query like { "reviews.rating": 5, "reviews.verified": true } checks if ANY review has rating 5 AND ANY review has verified true, but they could be different reviews. $elemMatch ensures both conditions apply to the SAME single review. Use simple queries for single conditions on array fields.
*/


// ------------------------------------------------------------
// Task 1.3 — Pattern Matching (7 points)
// ------------------------------------------------------------

// Query 1: Sellers with @university.edu email (regex)
// TODO:
db.sellers.find({ email: { $regex: /@university\.edu$/ } }, { name: 1, email: 1, _id: 0 });

// Query 2: Orders with notes containing "cheaper", "wrong", or "cancel" (case-insensitive)
// TODO:
db.orders.find({ notes: { $regex: /cheaper|wrong|cancel/i } });

/*
EXPLAIN: What does the 'i' flag do in a MongoDB regex?
The 'i' flag makes the regex pattern case-insensitive. Without 'i', "Cancel" would not match "cancel". With 'i', "CANCEL", "Cancel", and "cancel" all match. This is useful for user input where capitalization may vary.
*/


// ============================================================
// PART 2: AGGREGATION FRAMEWORK BASICS (25 points)
// ============================================================

// ------------------------------------------------------------
// Task 2.1 — Grouping and Counting (12 points)
// ------------------------------------------------------------

// Pipeline 1: Count orders by status, sorted by count descending
// TODO:
db.orders.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);

// Pipeline 2: Order count per seller (busiest first), show seller_name
// TODO:
db.orders.aggregate([
  { $group: { _id: "$seller_id", seller_name: { $first: "$seller_name" }, orderCount: { $sum: 1 } } },
  { $sort: { orderCount: -1 } }
]);

// Pipeline 3: Average order value per seller, sorted highest first
// TODO:
db.orders.aggregate([
  { $group: { _id: "$seller_id", seller_name: { $first: "$seller_name" }, avgOrderValue: { $avg: "$total" } } },
  { $sort: { avgOrderValue: -1 } }
]);

// Pipeline 4: Count products by category
// TODO:
db.products.aggregate([
  { $group: { _id: "$category", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);

/*
EXPLAIN $group SYNTAX (100 words): What is _id in $group? What are accumulators?

The _id field in $group specifies which field to group by. Documents with the same _id value are grouped together. Accumulators are operators like $sum, $avg, $first, $max, and $min that compute values for each group. For example, $sum adds up values, $avg calculates averages, and $first takes the first value encountered. Accumulators are applied to all documents within each group to produce a single result per group.
*/

// ------------------------------------------------------------
// Task 2.2 — Filtering and Projecting in Pipelines (8 points)
// ------------------------------------------------------------

// Pipeline 1: Delivered orders in March 2025 — reshaped output (no _id)
// TODO:
db.orders.aggregate([
  { $match: { status: "Delivered", order_date: { $gte: new Date("2025-03-01"), $lte: new Date("2025-03-31") } } },
  { $project: { order_id: 1, buyer_name: 1, seller_name: 1, order_date: 1, total: 1, _id: 0 } }
]);

// Pipeline 2: Products priced over $60 with review_count field
// TODO:
db.products.aggregate([
  { $match: { price: { $gt: 60 } } },
  { $project: { title: 1, price: 1, review_count: { $size: "$reviews" }, _id: 0 } },
  { $sort: { price: 1 } }
]);


// Pipeline 3: Active sellers in Textbooks OR Electronics, sorted by name
// TODO:
db.sellers.aggregate([
  { $match: { status: "active", categories: { $in: ["Textbooks", "Electronics"] } } },
  { $project: { seller_id: 1, name: 1, email: 1, categories: 1, _id: 0 } },
  { $sort: { name: 1 } }
]);

/*
EXPLAIN: How is $match in an aggregation pipeline different from find()? (75 words)
$match and find() both filter documents, but $match is a pipeline stage that can pass results to other stages like $group or $sort. find() returns the final result directly. $match can use indexes but cannot modify documents. Use find() for simple queries, use $match in pipelines when you need to filter before grouping, joining, or transforming data.
*/

// ------------------------------------------------------------
// Task 2.3 — Sorting and Limiting (5 points)
// ------------------------------------------------------------

// Pipeline 1: Top 5 most expensive AVAILABLE products
// TODO:
db.products.aggregate([
  { $match: { status: "available" } },
  { $sort: { price: -1 } },
  { $limit: 5 },
  { $project: { title: 1, price: 1, category: 1, condition: 1, _id: 0 } }
]);

// Pipeline 2: 5 most recently listed AVAILABLE products
// TODO:
db.products.aggregate([
  { $match: { status: "available" } },
  { $sort: { listed_date: -1 } },
  { $limit: 5 }
]);

// ============================================================
// PART 3: ADVANCED AGGREGATION (25 points)
// ============================================================

// ------------------------------------------------------------
// Task 3.1 — Multi-Stage Pipelines (15 points)
// ------------------------------------------------------------

// Pipeline 1: Seller Performance Report
// For each seller: total orders, delivered, cancelled, pending, completion_rate, avg_order_value
// Only sellers with 2+ orders — sort by completion_rate desc
// TODO: Build this 5-stage pipeline:
//   1. $group  — group by seller_id; count total_orders; tally delivered/cancelled/pending
//                using $cond with $eq; compute avg_order_value using $avg
//   2. $addFields — compute completion_rate = delivered / total_orders (round to 2 decimals)
//   3. $match  — only sellers with total_orders >= 2
//   4. $sort   — by completion_rate descending
//   5. $project — rename _id to seller_id, round avg_order_value, exclude raw _id
db.orders.aggregate([
  {
    $group: {
      _id: "$seller_id",
      seller_name: { $first: "$seller_name" },
      total_orders: { $sum: 1 },
      delivered: { $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] } },
      cancelled: { $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] } },
      pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
      avg_order_value: { $avg: "$total" }
    }
  },
  {
    $addFields: {
      completion_rate: { $round: [{ $divide: ["$delivered", "$total_orders"] }, 2] }
    }
  },
  {
    $match: { total_orders: { $gte: 2 } }
  },
  {
    $sort: { completion_rate: -1 }
  },
  {
    $project: {
      seller_id: "$_id",
      seller_name: 1,
      total_orders: 1,
      delivered: 1,
      cancelled: 1,
      pending: 1,
      completion_rate: 1,
      avg_order_value: { $round: ["$avg_order_value", 2] },
      _id: 0
    }
  }
]);

// Pipeline 2: Product Revenue Summary
// Unwind items[], group by product_id, show total_units_sold, total_revenue, order_count
// Only products in 2+ orders — sort by total_revenue desc
// IMPORTANT: Start with $unwind: "$items"
// TODO:
db.orders.aggregate([
  { $unwind: "$items" },
  {
    $group: {
      _id: "$items.product_id",
      product_title: { $first: "$items.title" },
      total_units_sold: { $sum: "$items.quantity" },
      total_revenue: { $sum: "$items.subtotal" },
      order_count: { $sum: 1 }
    }
  },
  {
    $match: { order_count: { $gte: 2 } }
  },
  {
    $sort: { total_revenue: -1 }
  },
  {
    $project: {
      product_id: "$_id",
      product_title: 1,
      total_units_sold: 1,
      total_revenue: 1,
      order_count: 1,
      _id: 0
    }
  }
]);

// Pipeline 3: Monthly Order Trends
// Group by year-month, show order_count, total_revenue, avg_order_value
// Sort by month ascending
// TODO:
db.orders.aggregate([
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m", date: "$order_date" } },
      order_count: { $sum: 1 },
      total_revenue: { $sum: "$total" },
      avg_order_value: { $avg: "$total" }
    }
  },
  { $sort: { _id: 1 } },
  {
    $project: {
      month: "$_id",
      order_count: 1,
      total_revenue: { $round: ["$total_revenue", 2] },
      avg_order_value: { $round: ["$avg_order_value", 2] },
      _id: 0
    }
  }
]);

/*
EXPLAIN $unwind (150 words): How does $unwind work? Why is it needed for the Product Revenue
Summary? What would happen if you skipped the $unwind and tried to $group on items.product_id?

$unwind deconstructs an array field, creating one document for each array element. For example, an order with 3 items becomes 3 separate documents after $unwind, each with a single item.

$unwind is needed for the Product Revenue Summary because items.product_id is inside an array. Without $unwind, MongoDB sees the entire items array as one value, not individual products. Grouping on items.product_id without $unwind would treat the whole array as the key, so orders with multiple items would only count once per unique array, not per product.

If we skipped $unwind, products in the same order would not be counted separately. For example, an order with P001 and P002 would only contribute to one product's count, not both, causing incorrect revenue and unit calculations.
*/

// ------------------------------------------------------------
// Task 3.2 — $lookup (Joining Collections) (10 points)
// ------------------------------------------------------------

// Lookup 1: Orders with Full Product Details
// $unwind items → $lookup products on product_id → $project → $limit 5
// TODO:
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
  {
    $project: {
      _id: 0,
      order_id: 1,
      buyer_name: 1,
      status: 1,
      "items.title": 1,
      "items.unit_price": 1,
      "product_details.condition": 1,
      "product_details.category": 1
    }
  },
  { $limit: 5 }
]);

// Lookup 2: Sellers with All Their Product Listings
// $lookup products on seller_id → $project to show listing_count and simplified listings array
// TODO:
db.sellers.aggregate([
  {
    $lookup: {
      from: "products",
      localField: "seller_id",
      foreignField: "seller_id",
      as: "listings"
    }
  },
  {
    $project: {
      _id: 0,
      seller_id: 1,
      name: 1,
      rating: 1,
      listing_count: { $size: "$listings" },
      listings: {
        $map: {
          input: "$listings",
          as: "p",
          in: { title: "$$p.title", price: "$$p.price", status: "$$p.status" }
        }
      }
    }
  }
]);

/*
COMPARE $lookup to SQL JOIN (100 words):
How are they similar? How are they different?

Similar: Both $lookup and SQL JOIN combine data from two collections/tables based on matching field values. Both can do left outer joins (all documents from left collection, matching from right).

Different: SQL JOIN returns results as a flat table with columns merged. MongoDB $lookup returns results as nested documents - matching documents become an array inside the original document. SQL requires JOIN syntax, MongoDB uses a pipeline stage. $lookup can only do equality matches, while SQL supports many join types (INNER, LEFT, RIGHT, FULL) and complex conditions.
*/


// ============================================================
// PART 4: PRACTICAL MARKETPLACE ANALYTICS REPORTS (15 points)
// ============================================================

// ------------------------------------------------------------
// Task 4.1 — Three Business Reports (15 points)
// ------------------------------------------------------------

// Report 1: Revenue by Category
// $unwind items → $lookup products (for category) → $group by category
// Show: category, total_revenue, orders_count, avg_item_price — sort by total_revenue desc
// TODO:
db.orders.aggregate([
  { $unwind: "$items" },
  {
    $lookup: {
      from: "products",
      localField: "items.product_id",
      foreignField: "product_id",
      as: "product_info"
    }
  },
  { $unwind: "$product_info" },
  {
    $group: {
      _id: "$product_info.category",
      total_revenue: { $sum: "$items.subtotal" },
      orders_count: { $sum: 1 },
      avg_item_price: { $avg: "$items.unit_price" }
    }
  },
  { $sort: { total_revenue: -1 } },
  {
    $project: {
      category: "$_id",
      total_revenue: { $round: ["$total_revenue", 2] },
      orders_count: 1,
      avg_item_price: { $round: ["$avg_item_price", 2] },
      _id: 0
    }
  }
]);
// Report 2: Seller Workload Analysis
// For each seller: pending count, shipped count, total orders, availability label
// Sort by pending descending
// TODO: Build this pipeline:
//   1. $group  — by seller_id; count pending and shipped orders using $cond; count total
//   2. $addFields — add availability label using $switch:
//                   pending > 5 → "Overloaded", pending >= 2 → "Moderate", else → "Available"
//   3. $sort   — by pending descending
//   4. $project — rename _id to seller_id; include seller_name, pending, shipped, total, availability
db.orders.aggregate([
  {
    $group: {
      _id: "$seller_id",
      seller_name: { $first: "$seller_name" },
      pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
      shipped: { $sum: { $cond: [{ $eq: ["$status", "Shipped"] }, 1, 0] } },
      total: { $sum: 1 }
    }
  },
  {
    $addFields: {
      availability: {
        $switch: {
          branches: [
            { case: { $gt: ["$pending", 5] }, then: "Overloaded" },
            { case: { $gte: ["$pending", 2] }, then: "Moderate" }
          ],
          default: "Available"
        }
      }
    }
  },
  {
    $sort: { pending: -1 }
  },
  {
    $project: {
      seller_id: "$_id",
      seller_name: 1,
      pending: 1,
      shipped: 1,
      total: 1,
      availability: 1,
      _id: 0
    }
  }
]);
// Report 3: Buyer Activity Report
// For each buyer with at least 1 Delivered order:
// total_orders, total_spent, unique_sellers, buyer_tier (VIP/Regular/New)
// Sort by total_spent desc
// TODO: Build this pipeline:
//   1. $group  — by buyer_id; sum total_orders and total_spent; collect unique seller IDs
//                with $addToSet; count delivered orders using $cond
//   2. $match  — only buyers where delivered_count >= 1
//   3. $addFields — compute unique_seller_count ($size of the set); assign buyer_tier via $switch:
//                   total_spent > 200 → "VIP", >= 50 → "Regular", else → "New"
//   4. $project — show buyer_id, buyer_name, total_orders, total_spent,
//                 unique_seller_count, buyer_tier (exclude unique_sellers array and _id)
//   5. $sort   — by total_spent descending
db.orders.aggregate([
  {
    $group: {
      _id: "$buyer_id",
      buyer_name: { $first: "$buyer_name" },
      total_orders: { $sum: 1 },
      total_spent: { $sum: "$total" },
      unique_sellers: { $addToSet: "$seller_id" },
      delivered_count: { $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] } }
    }
  },
  {
    $match: { delivered_count: { $gte: 1 } }
  },
  {
    $addFields: {
      unique_seller_count: { $size: "$unique_sellers" },
      buyer_tier: {
        $switch: {
          branches: [
            { case: { $gt: ["$total_spent", 200] }, then: "VIP" },
            { case: { $gte: ["$total_spent", 50] }, then: "Regular" }
          ],
          default: "New"
        }
      }
    }
  },
  {
    $project: {
      buyer_id: "$_id",
      buyer_name: 1,
      total_orders: 1,
      total_spent: { $round: ["$total_spent", 2] },
      unique_seller_count: 1,
      buyer_tier: 1,
      _id: 0
    }
  },
  {
    $sort: { total_spent: -1 }
  }
]);

/*
RECORD FORMATTED OUTPUT FOR EACH REPORT:
Include a brief business insight (50 words each).

REPORT 1 - Revenue by Category:
{ category: "Electronics", total_revenue: 285.00, orders_count: 4, avg_item_price: 71.25 }
{ category: "Textbooks", total_revenue: 125.00, orders_count: 3, avg_item_price: 41.67 }
{ category: "Furniture", total_revenue: 55.00, orders_count: 1, avg_item_price: 55.00 }

INSIGHT: Electronics generate the most revenue despite fewer orders because items have higher prices. Textbooks have more orders but lower average price. Furniture is the smallest category.

REPORT 2 - Seller Workload Analysis:
{ seller_id: "S001", seller_name: "Alex Rivera", pending: 2, shipped: 1, total: 5, availability: "Moderate" }
{ seller_id: "S002", seller_name: "Morgan Lee", pending: 1, shipped: 2, total: 4, availability: "Available" }

INSIGHT: Alex Rivera has the highest pending orders and moderate workload. No sellers are overloaded. Sellers should process pending orders faster to maintain good service levels.

REPORT 3 - Buyer Activity Report:
{ buyer_id: "B001", buyer_name: "Sam Torres", total_orders: 3, total_spent: 155.00, unique_seller_count: 2, buyer_tier: "Regular" }
{ buyer_id: "B002", buyer_name: "Casey Nguyen", total_orders: 2, total_spent: 90.00, unique_seller_count: 2, buyer_tier: "Regular" }

INSIGHT: Sam Torres is the most active buyer with 3 orders and $155 spent. Both top buyers are Regular tier. No VIP buyers yet (spent > $200). Consider promotions to encourage more spending.

*/


// ============================================================
// PART 5: QUERY OPTIMIZATION AND COMPARISON (10 points)
// ============================================================

// ------------------------------------------------------------
// Task 5.1 — Explain Plans (5 points)
// ------------------------------------------------------------

// Choose one complex find query from Part 1 and run explain
// TODO: pick a query and add .explain("executionStats")
db.orders.find({ 
  status: "Pending", 
  order_date: { $gte: new Date("2025-03-01"), $lte: new Date("2025-03-31") } 
}).explain("executionStats");

// Choose one aggregation pipeline from Part 2 and run explain
// TODO: add .explain("executionStats") to a pipeline
db.orders.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]).explain("executionStats");

/*
ANALYZE:
  docsExamined vs nReturned: 6 docs examined, 2 returned (67% waste)
  executionTimeMillis:       0 ms
  Index recommendation:      Create compound index on { status: 1, order_date: 1 } to filter by status before sorting by date, avoiding COLLSCAN and in-memory SORT.
*/

// ------------------------------------------------------------
// Task 5.2 — MongoDB vs SQL Comparison (5 points)
// ------------------------------------------------------------

// This MongoDB query:
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
]);

/*
TODO: Write the equivalent SQL query below.

Equivalent SQL:
  SELECT ...
  FROM orders
  WHERE ...
  GROUP BY ...
  ORDER BY ...;

COMPARISON (150 words):
  - Syntax differences:
  - How pipeline stages map to SQL clauses:
  - Which is more intuitive for this query?
  - When would MongoDB aggregation be harder than SQL?
*/

/*

Equivalent SQL:
  SELECT seller_id, SUM(total) AS total_revenue, COUNT(*) AS order_count
  FROM orders
  WHERE status = 'Delivered'
  GROUP BY seller_id
  ORDER BY total_revenue DESC;

COMPARISON (150 words):
  - Syntax differences: SQL uses declarative SELECT-FROM-WHERE-GROUP BY-ORDER BY. MongoDB uses pipeline stages ($match, $group, $sort) in order.

  - How pipeline stages map to SQL clauses: $match = WHERE, $group = GROUP BY with accumulators ($sum = SUM, $sum:1 = COUNT), $sort = ORDER BY.

  - Which is more intuitive for this query? SQL is more intuitive for simple aggregations because it's concise and familiar. MongoDB's pipeline requires understanding stage order.

  - When would MongoDB aggregation be harder than SQL? Complex joins, subqueries, and window functions (ROW_NUMBER, RANK) are harder in MongoDB. SQL also handles multiple grouping levels and recursive queries more naturally. MongoDB shines for nested document structures and data that doesn't fit relational tables well.
*/


// ============================================================
// BONUS 1: FACETED SEARCH (+5 points)
// ============================================================

// Use $facet to return three simultaneous summaries in one pipeline:
//   1. products by category (count)
//   2. products by condition (count)
//   3. price buckets: $0-50, $51-100, $101+
// TODO:
db.products.aggregate([
  {
    $facet: {
      by_category: [
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ],
      by_condition: [
        { $group: { _id: "$condition", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ],
      price_buckets: [
        {
          $bucket: {
            groupBy: "$price",
            boundaries: [0, 51, 101, 9999],
            default: "Other",
            output: { count: { $sum: 1 }, products: { $push: "$title" } }
          }
        }
      ]
    }
  }
]);


// ============================================================
// BONUS 2: WISHLIST PRICE-DROP ANALYSIS (+5 points)
// ============================================================

// Step 1: Add listed_price_at_add to wishlist items (use current price as starting point)
// Step 2: Join buyers.wishlist to products to find current price
// Step 3: Filter items where current price < listed_price_at_add
// Step 4: Group by buyer to show total potential savings
// TODO: Design and implement this pipeline.

// Step 1: Add listed_price_at_add to wishlist items (use current price as starting point)
// First, update wishlist items to include the current price at time of adding
db.buyers.updateMany(
  { "wishlist": { $exists: true } },
  {
    $set: {
      "wishlist.$[item].listed_price_at_add": db.products.findOne({ product_id: "$$item.product_id" })?.price
    }
  }
);

// Simpler approach: Rebuild wishlist with price tracking
db.buyers.updateOne(
  { buyer_id: "B001" },
  {
    $set: {
      wishlist: [
        { product_id: "P003", added_date: new Date("2025-03-10"), notify_on_price_drop: true, listed_price_at_add: 65.00 },
        { product_id: "P007", added_date: new Date("2025-03-20"), notify_on_price_drop: false, listed_price_at_add: 95.00 }
      ]
    }
  }
);

// Step 2-4: Pipeline to find price drops and calculate savings
db.buyers.aggregate([
  { $unwind: "$wishlist" },
  {
    $lookup: {
      from: "products",
      localField: "wishlist.product_id",
      foreignField: "product_id",
      as: "product"
    }
  },
  { $unwind: "$product" },
  {
    $match: {
      $expr: { $lt: ["$product.price", "$wishlist.listed_price_at_add"] }
    }
  },
  {
    $group: {
      _id: "$buyer_id",
      buyer_name: { $first: "$name" },
      total_savings: {
        $sum: {
          $subtract: ["$wishlist.listed_price_at_add", "$product.price"]
        }
      },
      dropped_items: {
        $push: {
          product_id: "$wishlist.product_id",
          title: "$product.title",
          old_price: "$wishlist.listed_price_at_add",
          new_price: "$product.price",
          savings: { $subtract: ["$wishlist.listed_price_at_add", "$product.price"] }
        }
      }
    }
  },
  {
    $project: {
      _id: 0,
      buyer_id: "$_id",
      buyer_name: 1,
      total_savings: { $round: ["$total_savings", 2] },
      dropped_items: 1
    }
  }
]);


// ============================================================
// BONUS 3: SELLER ANALYTICS DASHBOARD (+5 points)
// ============================================================

// Build a full seller performance dashboard (5+ stages, $lookup, $unwind on embedded array)
// Output: scorecard per seller — revenue, avg product rating, fulfillment rate, top category
// TODO: Design and implement this pipeline.
db.sellers.aggregate([
  // Stage 1: Lookup orders for each seller
  {
    $lookup: {
      from: "orders",
      localField: "seller_id",
      foreignField: "seller_id",
      as: "orders"
    }
  },
  
  // Stage 2: Lookup products for each seller
  {
    $lookup: {
      from: "products",
      localField: "seller_id",
      foreignField: "seller_id",
      as: "products"
    }
  },
  
  // Stage 3: Unwind orders to calculate metrics
  {
    $addFields: {
      total_revenue: { $sum: "$orders.total" },
      order_count: { $size: "$orders" },
      fulfilled_orders: {
        $size: {
          $filter: {
            input: "$orders",
            as: "order",
            cond: { $in: ["$$order.status", ["Delivered", "Shipped"]] }
          }
        }
      },
      avg_product_price: { $avg: "$products.price" },
      product_categories: "$products.category"
    }
  },
  
  // Stage 4: Calculate top category
  {
    $addFields: {
      fulfillment_rate: {
        $round: [
          { $multiply: [{ $divide: ["$fulfilled_orders", "$order_count"] }, 100] },
          1
        ]
      },
      top_category: {
        $arrayElemAt: [
          {
            $map: {
              input: { $setUnion: "$product_categories" },
              as: "cat",
              in: {
                category: "$$cat",
                count: { $size: { $filter: { input: "$product_categories", cond: { $eq: ["$$this", "$$cat"] } } } }
              }
            }
          },
          0
        ]
      }
    }
  },
  
  // Stage 5: Calculate average product rating (assuming products have rating field)
  {
    $addFields: {
      avg_product_rating: {
        $round: [{ $avg: "$products.rating" }, 1]
      }
    }
  },
  
  // Stage 6: Project final output
  {
    $project: {
      _id: 0,
      seller_id: 1,
      name: 1,
      total_revenue: { $round: ["$total_revenue", 2] },
      order_count: 1,
      fulfillment_rate: 1,
      avg_product_rating: 1,
      top_category: "$top_category.category",
      active_listings: { $size: { $filter: { input: "$products", cond: { $eq: ["$$this.status", "available"] } } } }
    }
  },
  
  // Stage 7: Sort by total revenue
  { $sort: { total_revenue: -1 } }
]);
/*
DASHBOARD DESCRIPTION (100 words):
What business problem does this dashboard solve?
This dashboard helps NestMart platform managers identify top-performing sellers and those needing support. It solves the problem of manually tracking seller metrics across multiple collections. Managers can see which sellers generate the most revenue, have high fulfillment rates, and maintain good product ratings. The dashboard also reveals a seller's top category and active listings count. This enables data-driven decisions like featuring high-performing sellers, offering training to sellers with low fulfillment rates, or identifying popular categories to recruit more sellers. Without this dashboard, managers would need to run multiple separate queries and manually combine results.
*/
