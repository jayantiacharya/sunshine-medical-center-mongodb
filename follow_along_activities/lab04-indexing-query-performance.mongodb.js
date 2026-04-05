// ============================================================
// CS3550 Advanced Database Systems
// Lab 04: Indexing and Query Performance — NestMart Student Marketplace
// ============================================================
// Database: nestmart
// Builds on: Module 5 Labs 1-2 (sellers, products, orders, buyers)
//
// Instructions:
//   - Replace every // TODO comment with working MongoDB code
//   - Run each section individually using the VS Code play button
//   - Keep this database intact — Lab 05 builds on this data!
//
// Rerun safety (drop all extra indexes before re-running):
//   Uncomment and run these lines ONCE before re-running Lab 04.
// db.products.dropIndexes();
// db.orders.dropIndexes();
// db.sellers.dropIndexes();
// db.products.deleteMany({ product_id: { $in: ["P006", "P007", "P008"] } });
// db.orders.deleteMany({ order_id: { $in: ["ORD009", "ORD010", "ORD011"] } });
// ============================================================

use('nestmart');

// Verify Module 05 data exists before starting
db.sellers.countDocuments();   // Should be 3
db.products.countDocuments();  // Should be 5+
db.orders.countDocuments();    // Should be 8+

// ============================================================
// SETUP: ADD EXTRA DATA FOR MEANINGFUL INDEX TESTING
// ============================================================

// Extra products (P006–P008)
db.products.insertMany([
  {
    product_id: "P006",
    title: "Linear Algebra Done Right 4th Ed",
    category: "Textbooks",
    price: 35.00,
    condition: "Good",
    seller_id: "S001",
    listed_date: new Date("2025-03-01"),
    status: "available",
    tags: ["MATH3200", "linear-algebra", "spring-2025"],
    description: "Clean copy, no markings. Bought for a class I dropped."
  },
  {
    product_id: "P007",
    title: "Dell 24-inch Monitor P2422H",
    category: "Electronics",
    price: 95.00,
    condition: "Like New",
    seller_id: "S003",
    listed_date: new Date("2025-03-05"),
    status: "available",
    tags: ["monitor", "dell", "24-inch"],
    description: "Used one semester. No dead pixels, includes original stand and cables."
  },
  {
    product_id: "P008",
    title: "Ergonomic Office Chair",
    category: "Furniture",
    price: 55.00,
    condition: "Fair",
    seller_id: "S002",
    listed_date: new Date("2025-03-08"),
    status: "available",
    tags: ["chair", "furniture", "ergonomic", "moving-sale"],
    description: "Adjustable height and lumbar support. Minor scuff on armrest."
  }
]);

// Extra orders (ORD009–ORD011)
db.orders.insertMany([
  {
    order_id: "ORD009",
    buyer_id: "B001", buyer_name: "Sam Torres", buyer_email: "storres@university.edu",
    seller_id: "S001", seller_name: "Alex Rivera",
    order_date: new Date("2025-03-18"),
    status: "Pending",
    items: [{ product_id: "P006", title: "Linear Algebra Done Right 4th Ed", quantity: 1, unit_price: 35.00, subtotal: 35.00 }],
    total: 35.00
  },
  {
    order_id: "ORD010",
    buyer_id: "B003", buyer_name: "Riley Park", buyer_email: "rpark@university.edu",
    seller_id: "S003", seller_name: "Jordan Kim",
    order_date: new Date("2025-03-20"),
    status: "Pending",
    items: [{ product_id: "P007", title: "Dell 24-inch Monitor P2422H", quantity: 1, unit_price: 95.00, subtotal: 95.00 }],
    total: 95.00
  },
  {
    order_id: "ORD011",
    buyer_id: "B002", buyer_name: "Casey Nguyen", buyer_email: "cnguyen@university.edu",
    seller_id: "S002", seller_name: "Morgan Lee",
    order_date: new Date("2025-03-22"),
    status: "Shipped",
    items: [{ product_id: "P008", title: "Ergonomic Office Chair", quantity: 1, unit_price: 55.00, subtotal: 55.00 }],
    total: 55.00
  }
]);

// Confirm counts after setup
db.products.countDocuments();  // Should be 8
db.orders.countDocuments();    // Should be 11


// ============================================================
// PART 1: BASELINE — QUERIES WITHOUT INDEXES (20 points)
// ============================================================

// Drop extra indexes first (keep _id_ index)
// TODO: Drop all extra indexes on products, orders, and sellers
db.products.dropIndexes();
db.orders.dropIndexes();
db.sellers.dropIndexes();

// View current indexes (should only show _id_ after dropIndexes)
db.products.getIndexes();
db.orders.getIndexes();

// ------------------------------------------------------------
// Task 1.1 — Analyze Without Index (10 points)
// ------------------------------------------------------------

// Run explain("executionStats") and record:
// stage, totalDocsExamined, nReturned, executionTimeMillis
// TODO: Run this query and record the four metrics


db.products.find({ category: "Textbooks" }).explain("executionStats");

/*
RECORD YOUR RESULTS HERE:
  stage:                  COLLSCAN
  totalDocsExamined:      6
  nReturned:              2
  executionTimeMillis:    0
*/

// ------------------------------------------------------------
// Task 1.2 — Three More Baseline Queries (10 points)
// ------------------------------------------------------------

// Query A: Available products (no index yet)
// TODO: Run explain("executionStats") and record the four metrics
db.products.find({ status: "available" }).explain("executionStats");

// Query B: Orders with total over $80
// TODO: Run explain("executionStats") and record the four metrics
db.orders.find({ total: { $gt: 80 } }).explain("executionStats");

// Query C: Products tagged "CS101" (array field — will become multikey)
// TODO: Run explain("executionStats") and record the four metrics
db.products.find({ tags: "CS101" }).explain("executionStats");

/*
RECORD BASELINE TABLE:
Query  | stage    | docsExamined | nReturned | timeMillis
-------|----------|--------------|-----------|----------
A      | COLLSCAN |     6        | ____6____  | _____0___
B      | COLLSCAN |  ___6____     | ___2____  | _____0___
C      | COLLSCAN | ____6____     | ____0____  | ____0____
*/


// ============================================================
// PART 2: SINGLE-FIELD INDEXES (20 points)
// ============================================================

// ------------------------------------------------------------
// Task 2.1 — Index on category (10 points)
// ------------------------------------------------------------

// TODO: Create a single-field index on category, name it "idx_products_category"
db.products.createIndex({category: 1}, {name: "idx_products_category"});

// Verify the index was created
db.products.getIndexes();

// Re-run the Task 1.1 query and record the new metrics
// TODO: Run explain("executionStats") again after the index exists
db.products.find({ category: "Textbooks" }).explain("executionStats");

/*
RECORD AFTER INDEX:
  stage:                  IXSCAN  (should be IXSCAN)
  totalDocsExamined:      2
  nReturned:              2
  executionTimeMillis:    2

ANSWER: Is nReturned the same as totalKeysExamined? What does that tell you?
*/
// The index was highly selective and efficient

// Every key examined in the index matched the query criteria

// There was no wasted index scans (no keys examined that didn't lead to matching documents)

// The database only needed to fetch exactly the documents that matched (2 index keys → 2 documents fetched)



// ------------------------------------------------------------
// Task 2.2 — Indexes on status, total, and tags (10 points)
// ------------------------------------------------------------

// TODO: Create an index on products.status
db.products.createIndex({status: 1}, {name: "idx_products_status"});

// TODO: Create an index on orders.total
db.orders.createIndex({total: 1}, {name: "idx_order_total"});

// TODO: Create an index on products.tags (this will be a multikey index)
db.products.createIndex({tags: 1}, {name: "tags_1"});

// Re-run all three baseline queries and compare
// TODO: Re-run Query A with explain and record new metrics
db.products.find({ status: "available" }).explain("executionStats");

// TODO: Re-run Query B with explain and record new metrics
db.orders.find({ total: { $gt: 80 } }).explain("executionStats");

// TODO: Re-run Query C with explain and record new metrics
db.products.find({ tags: "CS101" }).explain("executionStats");

/*
RECORD BEFORE/AFTER TABLE:
Query  | before stage | after stage | before docs | after docs
-------|--------------|-------------|-------------|----------
A      | COLLSCAN     | IXSCAN      | 6           | 6
B      | COLLSCAN     | IXSCAN      | 6           | 2
C      | COLLSCAN     | IXSCAN      | 6           | 0

ANSWER: What type of index was created for the tags field, and why?

Because the tags field is an array that can contain multiple values (e.g., ["MATH3200", "linear-algebra", "spring-2025"]). When we create an index on an array field, MongoDB automatically creates a multikey index, which creates separate index entries for each element in the array. This allows for efficient searching of individual tag values.
*/

// ============================================================
// PART 3: COMPOUND INDEXES AND THE ESR RULE (30 points)
// ============================================================

// ------------------------------------------------------------
// Task 3.1 — Design a Compound Index (15 points)
// ------------------------------------------------------------

// This is the query NestMart runs to show a seller their pending orders:
db.orders.find({ seller_id: "S001", status: "Pending" }).sort({ order_date: -1 })

// Step 1: Run without compound index and record metrics
// TODO: Run explain("executionStats") on the query above
db.orders.find({
  seller_id: "S001",
  status: "Pending"
}).sort({ order_date: -1 }).explain("executionStats");

/*
BASELINE (before compound index):
  stage:               SORT + COLLSCAN
  totalDocsExamined:   6
  nReturned:           2
  executionTimeMillis: 0
*/

// Step 2: Apply the ESR Rule
/*
WRITE YOUR ESR ANALYSIS:
  Equality fields:  seller_id, Status  (filters that use = or $in)
  Sort field:       order_date  (the field in .sort())
  Range field(s):   none (filters that use $gt, $lt, $gte, $lte, etc.)

  Optimal index order: { seller_id: 1, status : 1, order_date : -1 }
*/

// Step 3: Create the compound index
// TODO: Create the compound index based on your ESR analysis
db.orders.createIndex({seller_id: 1, status: 1, order_date: -1 });

// Step 4: Re-run with explain and record new metrics
// TODO: Run explain("executionStats") again
db.orders.find({
  seller_id: "S001",
  status: "Pending"
}).sort({ order_date: -1 }).explain("executionStats");

/*
AFTER COMPOUND INDEX:
  stage:               IXSCAN (should be IXSCAN)
  totalDocsExamined:   2
  nReturned:           2
  executionTimeMillis: 1
*/

// ------------------------------------------------------------
// Task 3.2 — Index Prefix Queries (10 points)
// ------------------------------------------------------------

// Test which queries use the compound index (IXSCAN) vs scan everything (COLLSCAN)

// TODO: Run explain() on each — record IXSCAN or COLLSCAN
db.orders.find({ seller_id: "S001" }).explain();
db.orders.find({ status: "Pending" }).explain();
db.orders.find({ seller_id: "S001", status: "Pending" }).explain();

/*
PREFIX RULE RESULTS:
  find({ seller_id })              → _______  (IXSCAN uses index prefix)
  find({ status })                 → _______  (COLLSCAN — skips prefix)
  find({ seller_id, status })      → _______  (IXSCAN uses full prefix)

IN YOUR OWN WORDS: Explain the prefix rule.

The prefix rule states that MongoDB can use a compound index for queries that include the first field, first two fields, or all fields in order. If a query omits the first field (the leftmost prefix), MongoDB cannot use that compound index efficiently and falls back to a COLLSCAN. This is why find({status}) did a COLLSCAN while find({seller_id}) and find({seller_id, status}) both used IXSCAN.
*/
// ------------------------------------------------------------
// Task 3.3 — Unique Index (5 points)
// ------------------------------------------------------------

// TODO: Create a unique index on product_id
db.products.createIndex({product_id: 1}, {unique: true, name:"idx_products_product_id_unique"});

// Test the constraint — this should fail with a duplicate key error
// TODO: Try inserting a product with product_id "P001" (already exists)
db.products.insertOne({
  product_id: "P001",   // Already exists
  title: "Duplicate Test",
  category: "Textbooks",
  price: 10.00,
  seller_id: "S001",
  status: "available"
});

/*
RECORD THE ERROR MESSAGE:
_______________________________________
Index build failed: f30438aa-931c-4e9b-bbb0-041da6a2e405: Collection test.products ( 5d566e31-577f-42bd-96a9-95334c792601 ) :: caused by :: E11000 duplicate key error collection: test.products index: idx_products_product_id_unique dup key: { product_id: "P001" }

ANSWER: Why are unique indexes important for a marketplace database?

Unique indexes prevent duplicate entries in fields that must be unique, such as product_id, order_id, and email addresses. They maintain data integrity, prevent accidental duplicate inserts, and ensure each entity can be uniquely identified, which is critical for a marketplace where every product and order must be distinct.
*/


// ============================================================
// PART 4: TEXT INDEXES (15 points)
// ============================================================

// ------------------------------------------------------------
// Task 4.1 — Create and Use a Text Index (10 points)
// ------------------------------------------------------------

// TODO: Create a text index on title and description, name it "idx_products_text"
db.products.createIndex({}, {});

// Word search — any product whose title or description contains "textbook"
// TODO: Run this search and record the results
db.products.find({ $text: { $search: "textbook" } });

// Multi-word search — any product containing "keyboard" OR "headphones"
// TODO: Run this search and record the results
db.products.find({ $text: { $search: "keyboard headphones" } });

// Phrase search — products containing the exact phrase "no dead pixels"
// TODO: Run this search and record the results
db.products.find({ $text: { $search: "\"no dead pixels\"" } });

/*
RECORD RESULTS:
  "textbook" search returned:          _______ documents
  "keyboard headphones" search:        _______ documents
  "\"no dead pixels\"" phrase search:   _______ documents

EXPLAIN: What is the difference between a word search and a phrase search?
*/

// ------------------------------------------------------------
// Task 4.2 — Text Search with Score (5 points)
// ------------------------------------------------------------

// TODO: Run this query to see textScore relevance ranking
db.products.find(
  { $text: { $search: "textbook" } },
  { score: { $meta: "textScore" }, title: 1, _id: 0 }
).sort({ score: { $meta: "textScore" } });

/*
RECORD RESULTS (include each document's score):
_______________________________________

EXPLAIN: What does the textScore represent?
*/


// ============================================================
// PART 5: INDEX MANAGEMENT (15 points)
// ============================================================

// ------------------------------------------------------------
// Task 5.1 — View All Indexes (5 points)
// ------------------------------------------------------------

// TODO: List all indexes on each collection
db.products.getIndexes();
db.orders.getIndexes();
db.sellers.getIndexes();

/*
RECORD INDEX INVENTORY TABLE:
Collection | Index Name             | Key Pattern        | Options
-----------|------------------------|--------------------|--------
products   | _id_                   | { _id: 1 }         |
products   | _______________________ | __________________ | _______
products   | _______________________ | __________________ | _______
products   | _______________________ | __________________ | _______
products   | _______________________ | __________________ | _______
orders     | _id_                   | { _id: 1 }         |
orders     | _______________________ | __________________ | _______
*/

// ------------------------------------------------------------
// Task 5.2 — Drop and Rebuild (5 points)
// ------------------------------------------------------------

// Drop the category index
// TODO: Drop "idx_products_category"
db.products.dropIndex("");

// Verify it's gone
db.products.getIndexes();

// Recreate it
// TODO: Recreate the category index with the same name
db.products.createIndex({}, {});

// Verify it's back
db.products.getIndexes();

// ------------------------------------------------------------
// Task 5.3 — Index Stats (5 points)
// ------------------------------------------------------------

// TODO: View index usage statistics for products and orders
db.products.aggregate([{ $indexStats: {} }]);
db.orders.aggregate([{ $indexStats: {} }]);

/*
RECORD STATS:
  Which indexes have accesses.ops > 0?
  _______________________________________

  What does accesses.ops represent?
  _______________________________________
*/
