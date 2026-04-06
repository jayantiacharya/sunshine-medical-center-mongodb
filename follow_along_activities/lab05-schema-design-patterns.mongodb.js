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
db.buyers.insertMany([
  { buyer_id: "B001", name: "Sam Torres",   email: "storres@university.edu", student_id: "u9871234" },
  { buyer_id: "B002", name: "Casey Nguyen", email: "cnguyen@university.edu", student_id: "u8762345" },
  { buyer_id: "B003", name: "Riley Park",   email: "rpark@university.edu",   student_id: "u7653456" }
]);


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
  Decision: EMBED
  
  Key factor: The wishlist is always displayed with the buyer profile, has a bounded size of 5-20 items, and is never queried independently. Embedding allows a single query to retrieve all wishlist data.
  
  Document structure:
  {
    buyer_id: "B001",
    name: "Sam Torres",
    email: "storres@university.edu",
    wishlist: [
      { product_id: "P001", title: "Calculus Textbook", added_date: ISODate("2025-04-01") },
      { product_id: "P003", title: "Mechanical Keyboard", added_date: ISODate("2025-04-02") }
    ]
  }

RELATIONSHIP B: Seller → Orders
  - Potentially hundreds of orders (unbounded growth)
  - Queried independently ("today's pending orders")
  - New orders arrive continuously

TODO: Write your analysis and document structure for Relationship B.
  Decision: REFERENCE
  
  Key factor: Orders can grow unbounded (hundreds or thousands per seller), are queried independently by status and date, and new orders arrive continuously. Referencing prevents document size limits and allows efficient independent queries.
  
  Document structure:
  // Seller document
  {
    seller_id: "S001",
    name: "Alex Rivera",
    email: "alex.rivera@university.edu",
    status: "active"
  }
  
  // Order document (references seller by seller_id)
  {
    order_id: "ORD009",
    seller_id: "S001",
    buyer_id: "B001",
    order_date: ISODate("2025-03-18"),
    status: "Pending",
    total: 35.00
  }

RELATIONSHIP C: Product → Tags
  - 2–8 tags per product (bounded)
  - Always displayed with the product listing
  - Rarely changed after listing

TODO: Write your analysis and document structure for Relationship C.
  Decision: EMBED
  
  Key factor: Tags are bounded (2-8 per product), always displayed with the product, and rarely changed.
  
  Document structure:
  { product_id: "P006", title: "Linear Algebra", tags: ["MATH3200", "linear-algebra"] }

RELATIONSHIP D: Order → Line Items (items[])
  - 1–5 items per order (bounded)
  - Always read with the order (receipt, history)
  - Price must be preserved historically

TODO: Write your analysis and document structure for Relationship D.
  Decision: EMBED
  
  Key factor: Line items are bounded (1-5 per order), always displayed with the order, and require price history preservation.
  
  Document structure:
  { order_id: "ORD009", items: [{ product_id: "P006", quantity: 1, unit_price: 35.00 }] }
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
  {
    $set: {
      wishlist: [
        { product_id: "P001", added_date: new Date("2025-03-15"), notify_on_price_drop: true },
        { product_id: "P004", added_date: new Date("2025-03-25"), notify_on_price_drop: false }
      ]
    }
  }
);


// TODO: Add wishlist to buyer B003 (at least 2 items using real product IDs P001-P008)
db.buyers.updateOne(
  { buyer_id: "B003" },
  { 
    $set: { 
      wishlist: [
        { product_id: "P002", added_date: new Date("2025-03-18"), notify_on_price_drop: true },
        { product_id: "P006", added_date: new Date("2025-03-28"), notify_on_price_drop: true }
      ] 
    } 
  }
);
// TODO: Query and show the wishlist for one buyer
db.buyers.findOne({ buyer_id: "B001" });

/*
EXPLAIN: Why is embedding the right choice for wishlist items?
(Write 2-3 sentences.)

Embedding is the right choice for wishlist items because the wishlist is always displayed with the buyer profile and has a bounded size (5-20 items per student). This allows a single query to retrieve all wishlist data without needing a separate collection or joins, which improves read performance.

*/



// ------------------------------------------------------------
// Task 2.2 — Seller Categories (Many-to-Many via Reference Arrays) (15 points)
// ------------------------------------------------------------

// TODO: Create a multikey index on sellers.categories
db.sellers.createIndex({ categories: 1 });

// TODO: Run explain("executionStats") on this query and verify IXSCAN
db.sellers.find({ categories: "Textbooks" }).explain("executionStats");

// TODO: Run the query (without explain) and show output
db.sellers.find({ categories: "Textbooks" }, { name: 1, categories: 1, _id: 0 });

// TODO: Write a query that finds all AVAILABLE products from sellers who list in "Electronics"
// Hint: first find seller IDs that have "Electronics" in categories, then find their products
// Step 1: Find seller IDs that have "Electronics" in categories
const electronicsSellers = db.sellers.find(
  { categories: "Electronics" },
  { seller_id: 1, _id: 0 }
).toArray();

// Step 2: Extract seller IDs
const sellerIds = electronicsSellers.map(s => s.seller_id);

// Step 3: Find available products from those sellers
db.products.find({ 
  seller_id: { $in: sellerIds }, 
  status: "available" 
}, {
  product_id: 1,
  title: 1,
  price: 1,
  status: 1,
  _id: 0
});


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
  product_ref: "P006",
  seller_ref: "S001",
  event_type: "price_change",
  date: new Date("2025-03-25"),
  old_price: 45.00,
  new_price: 35.00,
  reason: "Final price drop - need it gone before graduation"
});

// TODO: Add a second status_change event (ACT005)
db.listings_activity.insertOne({
  event_id: "ACT005",
  // TODO: fill in fields
  product_ref: "P007",
  seller_ref: "S003",
  event_type: "status_change",
  date: new Date("2025-03-28"),
  old_status: "available",
  new_status: "pending",
  triggered_by_order: "ORD010"
});

// TODO: Add a second promotion event (ACT006)
db.listings_activity.insertOne({
  event_id: "ACT006",
  // TODO: fill in fields
  product_ref: "P002",
  seller_ref: "S002",
  event_type: "promotion",
  date: new Date("2025-03-22"),
  promotion_type: "bundle",
  duration_days: 5,
  boost_views_estimate: 80,
  cost_to_seller: 1.99
});

// Verify total count
db.listings_activity.countDocuments(); // Should be 6+

// TODO: Create a compound index to support "all events for a product, sorted by date desc"
db.listings_activity.createIndex(
  { product_ref: 1, date: -1 }
);

// TODO: Create a single-field index to support "all events of a specific type"
db.listings_activity.createIndex({event_type: 1 });

// TODO: Query all events for product P001, newest first
db.listings_activity.find({ product_ref: "P001" }).sort({ date: -1 });

// TODO: Query all price_change events
db.listings_activity.find({ event_type: "price_change" });

// TODO: Query all events for P001 in March 2025 (use date range)
db.listings_activity.find({
  product_ref: "P001",
  date: { $gte: new Date("2025-03-01"), $lte: new Date("2025-03-31") }
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
- Simpler application logic with a single query for all event types
- Easier to maintain chronological order across different event types
- Reduced code complexity for inserts and updates

One collection cons:
- Sparse fields (many null/undefined fields per document)
- Less clear schema validation and documentation
- Harder to enforce type-specific required fields

Three collections pros:
- Cleaner schema with no sparse/unused fields
- Better validation and indexing per event type
- Easier to add type-specific fields without affecting others

Three collections cons:
- More complex queries when events need to be combined chronologically
- Application needs to know which collection to query
- More collections to manage and index
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
      required: ["product_id", "title", "category", "price", "condition", "seller_id", "status"],
      properties: {
        product_id: { bsonType: "string", description: "must be a string and unique" },
        title: { bsonType: "string", description: "must be a string" },
        category: { bsonType: "string", description: "must be a string" },
        price: { bsonType: "double", minimum: 0, description: "must be a positive number" },
        condition: { bsonType: "string", enum: ["New", "Like New", "Good", "Fair", "Poor"], description: "must be a valid condition" },
        seller_id: { bsonType: "string", description: "must be a string" },
        status: { bsonType: "string", enum: ["available", "sold", "pending"], description: "must be a valid status" },
        tags: { bsonType: "array", items: { bsonType: "string" }, description: "optional array of strings" }
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
Document failed validation

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
Document failed validation - 'Sports' is not one of the allowed enum values for field 'category'
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
Document failed validation - 'price' must be of type double but found type string
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

ValidationLevel "moderate" applies validation only to new and modified documents. Existing documents that violate the rules remain in the collection but cannot be updated unless they pass validation. "Strict" validates all documents on every read and write, including existing ones. With "moderate", invalid existing documents can still be read and deleted, but any update attempt will fail. This allows gradual schema enforcement without breaking existing data.
*/


// ============================================================
// PART 5: REFLECTION AND DESIGN REVIEW (10 points)
// ============================================================

/*
TASK 5.1 — Schema Design Summary (10 points)

Write a 300-400 word summary covering:
/*
TASK 5.1 — Schema Design Summary (10 points)

1. COLLECTIONS DIAGRAM
- products: product_id, title, category, price, condition, seller_id, status, tags, description
- orders: order_id, buyer_id, seller_id, order_date, status, total, items
- sellers: seller_id, name, email, categories
- buyers: buyer_id, name, email, student_id, wishlist
- listings_activity: event_id, product_ref, seller_ref, event_type, date

2. RELATIONSHIP MAP
- orders → sellers (reference via seller_id)
- orders → buyers (reference via buyer_id)
- products → sellers (reference via seller_id)
- buyers → wishlist (embedded array)
- orders → items (embedded array)
- listings_activity → products (reference via product_ref)

3. DESIGN DECISIONS
- Wishlist embedded because it's small (5-20 items) and always shown with buyer
- Items embedded in orders to preserve price history and keep receipt together
- Orders referenced from sellers because orders can grow too large
- Categories referenced via array for many-to-many flexibility

4. VALIDATION COVERAGE
Only products collection has validation. Reasons:
- Products are the core marketplace items with strict requirements
- Price must be positive number, status must be valid
- Missing title or product_id would break the marketplace
- Other collections rely on application logic or have looser requirements
*/
