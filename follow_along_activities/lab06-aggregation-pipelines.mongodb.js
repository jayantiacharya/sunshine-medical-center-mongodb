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
db.orders.find({}, {}).sort({});

// Query 2: Available products priced $40–$100 in Electronics or Textbooks, sort by price asc
// TODO:
db.products.find({});

// Query 3: Active sellers with rating > 4.0 who list Textbooks, sort by rating desc
// TODO:
db.sellers.find({});

// Query 4: Stale Pending orders (placed before 2025-03-15, still Pending), oldest first
// TODO:
db.orders.find({}).sort({});

/*
RECORD SAMPLE OUTPUT FOR EACH QUERY AND EXPLAIN OPERATORS USED (50 words per query):
*/

// ------------------------------------------------------------
// Task 1.2 — Array and Nested Document Queries (8 points)
// ------------------------------------------------------------

// Query 1: Products with more than 2 reviews (use $expr + $size)
// TODO:
db.products.find({});

// Query 2: Products with a 5-star VERIFIED purchase review (use $elemMatch)
// TODO:
db.products.find({ reviews: { $elemMatch: {} } });

// Query 3: Buyers with at least one notify_on_price_drop wishlist item (use $elemMatch)
// TODO:
db.buyers.find({ wishlist: { $elemMatch: {} } });

/*
EXPLAIN: When should you use $elemMatch vs a simple field query on an array?
*/

// ------------------------------------------------------------
// Task 1.3 — Pattern Matching (7 points)
// ------------------------------------------------------------

// Query 1: Sellers with @university.edu email (regex)
// TODO:
db.sellers.find({ email: {} }, {});

// Query 2: Orders with notes containing "cheaper", "wrong", or "cancel" (case-insensitive)
// TODO:
db.orders.find({ notes: {} });

/*
EXPLAIN: What does the 'i' flag do in a MongoDB regex?
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
  // $group stage
  // $sort stage
]);

// Pipeline 2: Order count per seller (busiest first), show seller_name
// TODO:
db.orders.aggregate([
  // $group stage — use $first to capture seller_name
  // $sort stage
]);

// Pipeline 3: Average order value per seller, sorted highest first
// TODO:
db.orders.aggregate([
  // $group stage — use $avg on total
  // $sort stage
]);

// Pipeline 4: Count products by category
// TODO:
db.products.aggregate([
  // $group stage
  // $sort stage
]);

/*
EXPLAIN $group SYNTAX (100 words): What is _id in $group? What are accumulators?
*/

// ------------------------------------------------------------
// Task 2.2 — Filtering and Projecting in Pipelines (8 points)
// ------------------------------------------------------------

// Pipeline 1: Delivered orders in March 2025 — reshaped output (no _id)
// TODO:
db.orders.aggregate([
  { $match: {} },
  { $project: {} }
]);

// Pipeline 2: Products priced over $60 with review_count field
// TODO:
db.products.aggregate([
  { $match: {} },
  { $project: { title: 1, price: 1, review_count: {} } },  // TODO: use $size
  { $sort: {} }
]);

// Pipeline 3: Active sellers in Textbooks OR Electronics, sorted by name
// TODO:
db.sellers.aggregate([
  { $match: {} },
  { $project: {} },
  { $sort: {} }
]);

/*
EXPLAIN: How is $match in an aggregation pipeline different from find()? (75 words)
*/

// ------------------------------------------------------------
// Task 2.3 — Sorting and Limiting (5 points)
// ------------------------------------------------------------

// Pipeline 1: Top 5 most expensive AVAILABLE products
// TODO:
db.products.aggregate([
  { $match: {} },
  { $sort: {} },
  { $limit: 5 },
  { $project: { title: 1, price: 1, category: 1, condition: 1, _id: 0 } }
]);

// Pipeline 2: 5 most recently listed AVAILABLE products
// TODO:
db.products.aggregate([
  // $match, $sort, $limit
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
// TODO:
db.orders.aggregate([
  {
    $group: {
      _id: "$seller_id",
      seller_name: { $first: "$seller_name" },
      total_orders: { $sum: 1 },
      delivered: { $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] } },
      cancelled: { $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] } },
      pending:   { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
      avg_order_value: { $avg: "$total" }
    }
  },
  // TODO: add $addFields stage to compute completion_rate = delivered / total_orders
  // TODO: add $match stage to filter sellers with 2+ orders
  // TODO: add $sort stage by completion_rate descending
  // TODO: add $project to rename _id to seller_id and round avg_order_value
]);

// Pipeline 2: Product Revenue Summary
// Unwind items[], group by product_id, show total_units_sold, total_revenue, order_count
// Only products in 2+ orders — sort by total_revenue desc
// IMPORTANT: Start with $unwind: "$items"
// TODO:
db.orders.aggregate([
  { $unwind: "$items" },
  // TODO: $group stage on items.product_id
  // TODO: $match to filter products in 2+ orders
  // TODO: $sort by total_revenue desc
]);

// Pipeline 3: Monthly Order Trends
// Group by year-month, show order_count, total_revenue, avg_order_value
// Sort by month ascending
// TODO:
db.orders.aggregate([
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m", date: "$order_date" } },
      // TODO: order_count, total_revenue, avg_order_value
    }
  },
  { $sort: { _id: 1 } }
]);

/*
EXPLAIN $unwind (150 words): How does $unwind work? Why is it needed for the Product Revenue
Summary? What would happen if you skipped the $unwind and tried to $group on items.product_id?
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
      localField: "",       // TODO: field in orders (after unwind)
      foreignField: "",     // TODO: field in products
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
      // TODO: project items.title, items.unit_price, product_details.condition, product_details.category
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
      localField: "",      // TODO
      foreignField: "",    // TODO
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
      // TODO: total_revenue, orders_count, avg_item_price
    }
  },
  { $sort: { total_revenue: -1 } }
]);

// Report 2: Seller Workload Analysis
// For each seller: pending count, shipped count, total orders, availability label
// Sort by pending descending
// TODO:
db.orders.aggregate([
  {
    $group: {
      _id: "$seller_id",
      seller_name: { $first: "$seller_name" },
      pending:  { $sum: { $cond: [{ $eq: ["$status", "Pending"] },  1, 0] } },
      shipped:  { $sum: { $cond: [{ $eq: ["$status", "Shipped"] },  1, 0] } },
      total:    { $sum: 1 }
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
  { $sort: { pending: -1 } }
]);

// Report 3: Buyer Activity Report
// For each buyer with at least 1 Delivered order:
// total_orders, total_spent, unique_sellers, buyer_tier (VIP/Regular/New)
// Sort by total_spent desc
// TODO:
db.orders.aggregate([
  // Hint: first filter to buyers who have at least one Delivered order.
  // One approach: $group all orders, then $match where delivered > 0.
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
  { $match: { delivered_count: { $gte: 1 } } },
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
  // TODO: $project to clean up output (remove unique_sellers array, keep count)
  { $sort: { total_spent: -1 } }
]);

/*
RECORD FORMATTED OUTPUT FOR EACH REPORT:
Include a brief business insight (50 words each).
*/


// ============================================================
// PART 5: QUERY OPTIMIZATION AND COMPARISON (10 points)
// ============================================================

// ------------------------------------------------------------
// Task 5.1 — Explain Plans (5 points)
// ------------------------------------------------------------

// Choose one complex find query from Part 1 and run explain
// TODO: pick a query and add .explain("executionStats")
db.orders.find({}).explain("executionStats");

// Choose one aggregation pipeline from Part 2 and run explain
// TODO: add .explain("executionStats") to a pipeline
db.orders.aggregate([]).explain("executionStats");

/*
ANALYZE:
  docsExamined vs nReturned: _______
  executionTimeMillis:       _______
  Index recommendation:      _______  (which fields would benefit from an index?)
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
      by_category: [],    // TODO: $group on category
      by_condition: [],   // TODO: $group on condition
      price_buckets: []   // TODO: $bucket with boundaries [0, 51, 101, 9999]
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


// ============================================================
// BONUS 3: SELLER ANALYTICS DASHBOARD (+5 points)
// ============================================================

// Build a full seller performance dashboard (5+ stages, $lookup, $unwind on embedded array)
// Output: scorecard per seller — revenue, avg product rating, fulfillment rate, top category
// TODO: Design and implement this pipeline.

/*
DASHBOARD DESCRIPTION (100 words):
What business problem does this dashboard solve?
*/
