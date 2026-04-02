// ============================================================
// CS3550 Advanced Database Systems
// Lab 05: Schema Design Patterns — NestMart Student Marketplace
// ============================================================
// Database: nestmart
// Builds on: Module 5 Labs 1-2 + Lab 04 (sellers, products, orders, buyers)
//
// Instructions:
//   - Replace every // TODO comment with working MongoDB code
//   - Run each section individually using the VS Code play button
//   - Do NOT drop existing collections — this lab extends them!
//   - Keep this database intact — Lab 06 builds on this data!
//
// Rerun safety:
//   Uncomment and run this block ONCE before re-running Lab 05.
// db.listings_activity.deleteMany({});
// db.buyers.updateMany({}, { $unset: { wishlist: "" } });
// db.sellers.dropIndex("categories_1");
// ============================================================

use('nestmart');

// Verify data from Lab 04
db.sellers.countDocuments();   // 3
db.products.countDocuments();  // 8
db.orders.countDocuments();    // 11
db.buyers.countDocuments();    // 3 (if 0, run the setup below)


// ============================================================
// SETUP: ENSURE BUYERS COLLECTION EXISTS
// ============================================================

// Only run this if buyers is empty
// db.buyers.insertMany([
//   { buyer_id: "B001", name: "Sam Torres",   email: "storres@university.edu", student_id: "u9871234" },
//   { buyer_id: "B002", name: "Casey Nguyen", email: "cnguyen@university.edu", student_id: "u8762345" },
//   { buyer_id: "B003", name: "Riley Park",   email: "rpark@university.edu",   student_id: "u7653456" }
// ]);


// ============================================================
// PART 1: EMBEDDING VS REFERENCING ANALYSIS (20 points)
// ============================================================

/*
TASK 1.1 — Design Decisions (20 points)

For each relationship below, provide:
  1. Your decision: embed or reference
  2. The key factor that drove the decision
  3. The MongoDB document structure

RELATIONSHIP A: Buyer → Wishlist Items
  - Displayed with buyer profile (one read)
  - Bounded: 5–20 items per student
  - Not accessed independently

TODO: Write your analysis and document structure for Relationship A.

RELATIONSHIP B: Seller → Orders
  - Potentially hundreds of orders (unbounded growth)
  - Queried independently ("today's pending orders")
  - New orders arrive continuously

TODO: Write your analysis and document structure for Relationship B.

RELATIONSHIP C: Product → Tags
  - 2–8 tags per product (bounded)
  - Always displayed with the product listing
  - Rarely changed after listing

TODO: Write your analysis and document structure for Relationship C.

RELATIONSHIP D: Order → Line Items (items[])
  - 1–5 items per order (bounded)
  - Always read with the order (receipt, history)
  - Price must be preserved historically

TODO: Write your analysis and document structure for Relationship D.
*/


// ============================================================
// PART 2: ONE-TO-MANY RELATIONSHIPS (25 points)
// ============================================================

// ------------------------------------------------------------
// Task 2.1 — Buyer Wishlist (Embedded, Bounded) (10 points)
// ------------------------------------------------------------

// Starter: Update B001's wishlist
db.buyers.updateOne(
  { buyer_id: "B001" },
  {
    $set: {
      wishlist: [
        { product_id: "P003", added_date: new Date("2025-03-10"), notify_on_price_drop: true },
        { product_id: "P007", added_date: new Date("2025-03-20"), notify_on_price_drop: false }
      ]
    }
  }
);

// TODO: Add wishlist to buyer B002 (at least 2 items using real product IDs P001-P008)
db.buyers.updateOne(
  { buyer_id: "B002" },
  { $set: { wishlist: [] } }  // TODO: fill in wishlist items
);

// TODO: Add wishlist to buyer B003 (at least 2 items using real product IDs P001-P008)
db.buyers.updateOne(
  { buyer_id: "B003" },
  { $set: { wishlist: [] } }  // TODO: fill in wishlist items
);

// TODO: Query and show the wishlist for one buyer
db.buyers.findOne({ buyer_id: "B001" });

/*
EXPLAIN: Why is embedding the right choice for wishlist items?
(Write 2-3 sentences.)
*/


// ------------------------------------------------------------
// Task 2.2 — Seller Categories (Many-to-Many via Reference Arrays) (15 points)
// ------------------------------------------------------------

// TODO: Create a multikey index on sellers.categories
db.sellers.createIndex({});

// TODO: Run explain("executionStats") on this query and verify IXSCAN
db.sellers.find({ categories: "Textbooks" }).explain("executionStats");

// TODO: Run the query (without explain) and show output
db.sellers.find({ categories: "Textbooks" }, { name: 1, categories: 1, _id: 0 });

// TODO: Write a query that finds all AVAILABLE products from sellers who list in "Electronics"
// Hint: first find seller IDs that have "Electronics" in categories, then find their products
db.sellers.find({});
db.products.find({});


// ============================================================
// PART 3: POLYMORPHIC DATA MODEL (25 points)
// ============================================================

// ------------------------------------------------------------
// Task 3.1 — listings_activity Collection (25 points)
// ------------------------------------------------------------

// Starter events (3 provided — you must add 3 more)

// Event type 1: price_change
db.listings_activity.insertOne({
  event_id: "ACT001",
  product_ref: "P001",
  seller_ref: "S001",
  event_type: "price_change",
  date: new Date("2025-03-15"),
  old_price: 50.00,
  new_price: 45.00,
  reason: "Semester ending, need to sell before moving out"
});

// Event type 2: status_change
db.listings_activity.insertOne({
  event_id: "ACT002",
  product_ref: "P004",
  seller_ref: "S002",
  event_type: "status_change",
  date: new Date("2025-03-01"),
  old_status: "available",
  new_status: "sold",
  triggered_by_order: "ORD003"
});

// Event type 3: promotion
db.listings_activity.insertOne({
  event_id: "ACT003",
  product_ref: "P005",
  seller_ref: "S003",
  event_type: "promotion",
  date: new Date("2025-03-20"),
  promotion_type: "featured",
  duration_days: 7,
  boost_views_estimate: 150,
  cost_to_seller: 2.99
});

// TODO: Add a second price_change event (ACT004) for a different product
db.listings_activity.insertOne({
  event_id: "ACT004",
  // TODO: fill in product_ref, seller_ref, event_type, date, old_price, new_price, reason
});

// TODO: Add a second status_change event (ACT005)
db.listings_activity.insertOne({
  event_id: "ACT005",
  // TODO: fill in fields
});

// TODO: Add a second promotion event (ACT006)
db.listings_activity.insertOne({
  event_id: "ACT006",
  // TODO: fill in fields
});

// Verify total count
db.listings_activity.countDocuments(); // Should be 6+

// TODO: Create a compound index to support "all events for a product, sorted by date desc"
db.listings_activity.createIndex({});

// TODO: Create a single-field index to support "all events of a specific type"
db.listings_activity.createIndex({});

// TODO: Query all events for product P001, newest first
db.listings_activity.find({}).sort({});

// TODO: Query all price_change events
db.listings_activity.find({});

// TODO: Query all events for P001 in March 2025 (use date range)
db.listings_activity.find({
  product_ref: "P001",
  date: { $gte: new Date(""), $lte: new Date("") }
});

// TODO: Run explain("executionStats") on the P001 + date range query to show IXSCAN
db.listings_activity.find({
  product_ref: "P001",
  date: { $gte: new Date("2025-03-01"), $lte: new Date("2025-03-31") }
}).explain("executionStats");

/*
POLYMORPHIC TRADE-OFFS (write 100 words):
What are the trade-offs of storing price_change, status_change, and promotion events
in ONE collection (listings_activity) vs THREE separate collections?

One collection pros:
One collection cons:
Three collections pros:
Three collections cons:
*/


// ============================================================
// PART 4: SCHEMA VALIDATION (20 points)
// ============================================================

// ------------------------------------------------------------
// Task 4.1 — Validation on Products (20 points)
// ------------------------------------------------------------

// TODO: Apply $jsonSchema validation to the products collection
db.runCommand({
  collMod: "products",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [],  // TODO: list required fields
      properties: {
        // TODO: add field rules for product_id, title, category, price, condition, seller_id, status, tags
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "error"
});

// Test A: Missing required title (should fail)
// TODO: Attempt to insert a product without the title field
db.products.insertOne({
  product_id: "P99999",
  category: "Textbooks",
  price: 25.00,
  seller_id: "S001",
  status: "available"
});

/*
RECORD ERROR from Test A:
_______________________________________
*/

// Test B: Invalid category value (should fail)
// TODO: Attempt to insert a product with category "Sports"
db.products.insertOne({
  product_id: "P99998",
  title: "Sports Gear",
  category: "Sports",
  price: 15.00,
  seller_id: "S001",
  status: "available"
});

/*
RECORD ERROR from Test B:
_______________________________________
*/

// Test C: Wrong type for price (should fail)
// TODO: Attempt to insert with price as a string
db.products.insertOne({
  product_id: "P99997",
  title: "Used Calculator",
  category: "Electronics",
  price: "twenty-five",
  seller_id: "S001",
  status: "available"
});

/*
RECORD ERROR from Test C:
_______________________________________
*/

// Test D: Valid insert (should succeed)
// TODO: Insert a valid product and confirm success
db.products.insertOne({
  product_id: "P99996",
  title: "Biology 101 Lab Manual",
  category: "Textbooks",
  price: 18.00,
  condition: "Good",
  seller_id: "S002",
  status: "available",
  tags: ["BIO1010", "lab-manual"]
});

// Clean up the test document
db.products.deleteOne({ product_id: "P99996" });

/*
EXPLAIN (75 words): How does validationLevel "moderate" differ from "strict"?
What happens to documents that already exist and violate the rules?
*/


// ============================================================
// PART 5: REFLECTION AND DESIGN REVIEW (10 points)
// ============================================================

/*
TASK 5.1 — Schema Design Summary (10 points)

Write a 300-400 word summary covering:

1. COLLECTIONS DIAGRAM
   (List each collection and its key fields — markdown table or bullet list)

2. RELATIONSHIP MAP
   (e.g., "orders → sellers via seller_id (reference)")

3. DESIGN DECISIONS
   (For each embed/reference choice, state the PRIMARY reason)

4. VALIDATION COVERAGE
   (Which collections have validation? Why those?)
*/
