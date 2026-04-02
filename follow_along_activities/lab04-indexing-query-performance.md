# Lab 4: Indexing and Query Performance

**Course:** CS3550 - Advanced Database Systems
**Module:** 6 - MongoDB Indexing and Data Modeling
**Part:** 1 (Week 1)
**Estimated Time:** 90 minutes
**Points:** 100
**Prerequisites:** Module 5 Labs 1 and 2 (NestMart database populated)

---

## Lab Overview

In this lab you will analyze query performance, create appropriate indexes, and measure the improvement. You'll use `explain()` to understand how MongoDB executes queries and learn when indexes help — and when they don't.

This lab uses the **NestMart** database you built in Module 5 Labs 1 and 2. If your database is empty, run your Lab 1 and Lab 2 seed data first.

---

## Learning Objectives

By completing this lab, you will:
- Run `explain("executionStats")` and interpret the output
- Identify `COLLSCAN` vs `IXSCAN` execution plans
- Create single-field, compound, multikey, and text indexes
- Measure the effect of indexes on query performance
- Use `getIndexes()` and `dropIndex()` to manage indexes
- Apply the ESR (Equality, Sort, Range) rule to compound index design

---

## Setup Instructions

### Step 1: Connect to MongoDB

```javascript
use('nestmart')
```

### Step 2: Verify Database Contents

```javascript
show collections
db.sellers.countDocuments()   // Should be 3
db.products.countDocuments()  // Should be 5+
db.orders.countDocuments()    // Should be 8+
db.buyers.countDocuments()    // Should be 3+
```

If any count is 0, run your Module 5 Lab 1 and Lab 2 solutions first.

### Step 3: Add Index Test Data

To get meaningful `explain()` timing differences, add more products and orders:

```javascript
// Extra products for index testing volume
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
])

// Extra orders for index testing volume
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
])
```

---

## Part 1: Baseline — Queries Without Indexes (20 points)

First, drop any non-default indexes to start from a clean baseline:

```javascript
// View current indexes (default is just _id)
db.products.getIndexes()
db.orders.getIndexes()

// Drop any extra indexes (keeps the _id_ index)
db.products.dropIndexes()
db.orders.dropIndexes()
db.sellers.dropIndexes()
```

### Task 1.1: Analyze Without Index (10 points)

Run the following query with `explain("executionStats")` and record the results:

```javascript
db.products.find({ category: "Textbooks" }).explain("executionStats")
```

**Record and report:**
1. What is the `stage` in `winningPlan`? (COLLSCAN or IXSCAN?)
2. What is `totalDocsExamined`?
3. What is `nReturned`?
4. What is `executionTimeMillis`?

**Deliverable:** Paste the relevant portion of the `executionStats` output and answer the four questions above.

---

### Task 1.2: Three More Baseline Queries (10 points)

Run `explain("executionStats")` on each of the following and record the same four metrics:

**Query A:** Find all available products
```javascript
db.products.find({ status: "available" }).explain("executionStats")
```

**Query B:** Find orders with total over $80
```javascript
db.orders.find({ total: { $gt: 80 } }).explain("executionStats")
```

**Query C:** Find products tagged "CS101" (array field — will become multikey)
```javascript
db.products.find({ tags: "CS101" }).explain("executionStats")
```

**Deliverable:** Table showing stage, totalDocsExamined, nReturned, and executionTimeMillis for each query.

---

## Part 2: Creating Single-Field Indexes (20 points)

### Task 2.1: Index on category (10 points)

```javascript
// Create the index
db.products.createIndex({ category: 1 }, { name: "idx_products_category" })

// Verify it was created
db.products.getIndexes()
```

Re-run the Task 1.1 query and record the metrics again:

```javascript
db.products.find({ category: "Textbooks" }).explain("executionStats")
```

**Deliverable:**
1. What changed in the execution plan? (stage, docsExamined, time)
2. Is `nReturned` the same as `totalKeysExamined`? What does that tell you?

---

### Task 2.2: Indexes on products and orders (10 points)

Create appropriate indexes for the baseline queries from Task 1.2:

```javascript
// Index for Query A
db.products.createIndex({ status: 1 })

// Index for Query B
db.orders.createIndex({ total: 1 })

// Index for Query C (multikey — indexes each element of the tags array)
db.products.createIndex({ tags: 1 })
```

Re-run all three baseline queries with `explain("executionStats")`.

**Deliverable:**
1. Comparison table: before vs after for each query (stage, docsExamined, time)
2. For Query C (tags): what type of index was created, and why?

---

## Part 3: Compound Indexes and the ESR Rule (30 points)

### Task 3.1: Design a Compound Index (15 points)

The NestMart team frequently runs this query to show a seller their pending orders in reverse chronological order:

```javascript
db.orders.find({
  seller_id: "S001",
  status: "Pending"
}).sort({ order_date: -1 })
```

**Your tasks:**
1. Run the query with `explain("executionStats")` — record metrics (no compound index yet)
2. Apply the ESR rule to design the optimal compound index:
   - Which fields are the **equality** filters? → First in index
   - Which field is the **sort**? → After equality fields
   - Which field is the **range** (if any)?
3. Create your compound index:
   ```javascript
   db.orders.createIndex({ /* your design */ })
   ```
4. Re-run the query with `explain("executionStats")` — record metrics

**Deliverable:**
1. Your ESR analysis (which field maps to E, S, R)
2. The `createIndex()` command you used
3. Before/after comparison table
4. Explanation of why this index order is optimal

---

### Task 3.2: Index Prefix Queries (10 points)

A compound index on `{ a: 1, b: 1, c: 1 }` supports queries on:
- `{ a: value }`
- `{ a: value, b: value }`
- `{ a: value, b: value, c: value }`

But NOT on:
- `{ b: value }` (skips prefix)
- `{ c: value }` (skips prefix)

Test this with your compound index from Task 3.1:

```javascript
// Which of these use the index? Run explain() on each:
db.orders.find({ seller_id: "S001" }).explain()
db.orders.find({ status: "Pending" }).explain()
db.orders.find({ seller_id: "S001", status: "Pending" }).explain()
```

**Deliverable:**
1. Results for each query (IXSCAN or COLLSCAN?)
2. Explanation of the prefix rule in your own words

---

### Task 3.3: Unique Index (5 points)

Product IDs must be unique in the marketplace. Create a unique index:

```javascript
db.products.createIndex({ product_id: 1 }, { unique: true })
```

Test the constraint:
```javascript
// Try inserting a duplicate product_id
db.products.insertOne({
  product_id: "P001",   // Already exists
  title: "Duplicate Test",
  category: "Textbooks",
  price: 10.00,
  seller_id: "S001",
  status: "available"
})
```

**Deliverable:**
1. The error message you received
2. Why unique indexes are important for marketplace data integrity

---

## Part 4: Text Indexes (15 points)

### Task 4.1: Create and Use a Text Index (10 points)

```javascript
// Create text index on title and description
db.products.createIndex(
  { title: "text", description: "text" },
  { name: "idx_products_text" }
)

// Word search — finds documents containing any of these words
db.products.find({ $text: { $search: "textbook" } })

// Multi-word search — finds documents containing any of these words
db.products.find({ $text: { $search: "keyboard headphones" } })

// Phrase search — finds documents containing this exact phrase
db.products.find({ $text: { $search: "\"no dead pixels\"" } })
```

**Deliverable:**
1. Results from each text search
2. Explanation of the difference between word search and phrase search (with quotes)

---

### Task 4.2: Text Search with Score (5 points)

```javascript
db.products.find(
  { $text: { $search: "textbook" } },
  { score: { $meta: "textScore" }, title: 1, _id: 0 }
).sort({ score: { $meta: "textScore" } })
```

**Deliverable:**
1. Results with scores
2. Explanation of what the `textScore` represents

---

## Part 5: Index Management (15 points)

### Task 5.1: View All Indexes (5 points)

```javascript
// List indexes for all collections
db.products.getIndexes()
db.orders.getIndexes()
db.sellers.getIndexes()
```

**Deliverable:** Table listing all indexes you've created (name, key pattern, options).

---

### Task 5.2: Drop and Rebuild (5 points)

```javascript
// Drop the category index
db.products.dropIndex("idx_products_category")

// Verify it's gone
db.products.getIndexes()

// Recreate it
db.products.createIndex({ category: 1 }, { name: "idx_products_category" })
```

**Deliverable:** Output showing the index before drop, after drop, and after recreation.

---

### Task 5.3: Index Stats (5 points)

```javascript
// View index usage statistics
db.products.aggregate([{ $indexStats: {} }])
db.orders.aggregate([{ $indexStats: {} }])
```

**Deliverable:**
1. Which indexes have been used since startup?
2. What does `accesses.ops` represent?

---

## Submission Requirements

Create a file named `lab04-submission.md` containing:

1. **Header:** Name, date, Lab 4: Indexing and Query Performance
2. **Part 1:** Baseline metrics table, COLLSCAN observations
3. **Part 2:** Before/after comparison table for each indexed query
4. **Part 3:** ESR analysis, compound index command, prefix rule explanation
5. **Part 4:** Text search results and textScore explanation
6. **Part 5:** Index inventory table, stats output
7. **Reflection (100 words):** What surprised you most about index performance on the NestMart data? When would you avoid creating an index on a marketplace database?

---

## Grading Rubric

| Category | Points | Criteria |
|----------|--------|----------|
| Part 1: Baseline Analysis | 20 | Correct explain() output, all 4 metrics recorded |
| Part 2: Single-Field Indexes | 20 | Correct createIndex() commands, before/after comparison |
| Part 3: Compound Indexes | 30 | ESR analysis, optimal index design, prefix rule understanding |
| Part 4: Text Indexes | 15 | Working text search, textScore explanation |
| Part 5: Index Management | 15 | getIndexes/dropIndex/stats usage |
| **Total** | **100** | |

---

## Tips for Success

1. **Always explain() first** — understand the query plan before creating indexes
2. **Name your indexes** — use the `name` option for easy management
3. **Check index usage** — `$indexStats` shows which indexes are actually used
4. **Don't over-index** — every index has a write performance cost and storage cost
5. **The _id index** — automatically created on every collection; never drop it

---

*Last Updated: March 2026*
*Part of CS3550 Module 6: MongoDB Indexing, Schema Design, and Aggregation*
