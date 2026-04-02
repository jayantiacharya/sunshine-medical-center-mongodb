# Lab 5: Schema Design Patterns

**Course:** CS3550 - Advanced Database Systems
**Module:** 6 - MongoDB Indexing and Data Modeling
**Part:** 1 (Week 1)
**Estimated Time:** 120 minutes
**Points:** 100
**Prerequisites:** Lab 4 completed (indexes created), Module 5 Labs 1–2

---

## Lab Overview

In this lab you will apply formal schema design patterns to the NestMart database: the embedding vs referencing decision framework, one-to-many relationship modeling, the polymorphic data pattern, and `$jsonSchema` validation.

This lab builds on the database from Labs 1–4. You will NOT drop the existing collections — instead you'll add a new collection (`listings_activity`) and update existing documents.

---

## Learning Objectives

By completing this lab, you will:
- Apply the embedding vs referencing decision framework to real data models
- Implement one-to-many and many-to-many relationships in MongoDB
- Create a polymorphic data model using a discriminator field
- Enforce schema rules using `$jsonSchema` validation
- Evaluate trade-offs between different schema designs

---

## Setup Instructions

### Step 1: Verify Database

```javascript
use('nestmart')
show collections
// Expected: sellers, products, orders, buyers

db.sellers.countDocuments()   // 3
db.products.countDocuments()  // 8 (5 from Lab01 + 3 from Lab04 setup)
db.orders.countDocuments()    // 11 (8 from Lab02 + 3 from Lab04 setup)
db.buyers.countDocuments()    // Should be 3 (if Lab02 Bonus B was completed)
```

### Step 2: Ensure Buyers Collection Exists

If you did not complete the Lab 02 Bonus B section (buyer wishlists), insert the buyer documents now:

```javascript
// Only run this if db.buyers.countDocuments() returns 0
db.buyers.insertMany([
  { buyer_id: "B001", name: "Sam Torres",   email: "storres@university.edu", student_id: "u9871234" },
  { buyer_id: "B002", name: "Casey Nguyen", email: "cnguyen@university.edu", student_id: "u8762345" },
  { buyer_id: "B003", name: "Riley Park",   email: "rpark@university.edu",   student_id: "u7653456" }
])
```

---

## Part 1: Embedding vs Referencing Analysis (20 points)

### Task 1.1: Design Decisions (20 points)

For each of the following data relationships in NestMart, decide whether to **embed** or **reference**. Justify your answer using the decision framework from the lecture.

**Relationship A: Buyer → Wishlist Items**
- Each buyer has a personal wishlist of products they want to buy
- The wishlist is always displayed on the buyer's profile page
- A typical student wishlist is 5–20 items (bounded)
- Wishlist items are never accessed without the buyer document

**Relationship B: Seller → Orders**
- A seller can fulfill hundreds of orders over the course of their account
- Orders are queried independently ("show all pending orders", "show orders from last week")
- New orders arrive continuously; old orders are never modified

**Relationship C: Product → Tags**
- Each product has 2–8 descriptive tags (e.g., ["CS101", "math", "spring-2025"])
- Tags are always displayed with the product listing
- Tags are rarely changed after the product is listed

**Relationship D: Order → Line Items (items[])**
- Each order has 1–5 items purchased together in one transaction
- Items are always read as part of the order (receipt, order history, checkout confirmation)
- The price charged at purchase must be preserved even if the product price changes later

**Deliverable:** For each relationship (A–D), provide:
1. Your decision (embed / reference)
2. The key factor that drove the decision
3. The MongoDB document structure you would use

---

## Part 2: One-to-Many Relationships (25 points)

### Task 2.1: Buyer Wishlist (Embedded, Bounded) (10 points)

Update your buyers collection to add a structured `wishlist` array. Wishlist items are:
- Always read with the buyer profile (justify embedding)
- Bounded — a student's wishlist rarely exceeds 20–30 items
- Not accessed independently

```javascript
// Update buyer B001 to add wishlist items
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
)
```

**Your task:** Add wishlists to at least 2 additional buyers (B002 and B003), with at least 2 wishlist items each. Use real product IDs from your database (P001–P008).

**Deliverable:**
1. The `updateOne()` commands you used for each buyer
2. A query showing the embedded wishlist for one buyer
3. Explanation of why embedding is the right choice here

---

### Task 2.2: Seller Categories — Many-to-Many via Reference Arrays (15 points)

Sellers list products in multiple categories; a category spans many sellers. This is a many-to-many relationship that NestMart handles using a reference array on the seller document plus a multikey index.

```javascript
// Each seller already has a categories array. Create a multikey index
// to support "find all sellers who list Textbooks"
db.sellers.createIndex({ categories: 1 })

// Query: all sellers who list in "Textbooks"
db.sellers.find({ categories: "Textbooks" }, { name: 1, categories: 1, _id: 0 })

// Query: all products from sellers who list Textbooks
// Step 1: find matching seller IDs
// Step 2: query products using those IDs
```

**Your task:**
1. Create the multikey index on `sellers.categories`
2. Run `explain("executionStats")` on `db.sellers.find({ categories: "Textbooks" })` — verify IXSCAN
3. Run both example queries above and include the output
4. Write a query that finds all available products from sellers who list in "Electronics"

**Deliverable:**
1. `createIndex()` command
2. `explain()` output showing IXSCAN
3. Query output from all three queries

---

## Part 3: Polymorphic Data Model (25 points)

### Task 3.1: Listings Activity Collection (25 points)

Create a new `listings_activity` collection that stores different types of marketplace events using the **polymorphic pattern**. All events share common fields (`event_id`, `product_ref`, `seller_ref`, `event_type`, `date`) but have type-specific fields based on the `event_type` discriminator.

**Three event types:**

```javascript
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
})

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
})

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
})
```

**Your task:**
1. Insert at least 2 events of each type (minimum 6 events total). Use ACT004–ACT006 at minimum; ACT007–ACT008 are optional extras.
2. Use at least 2 different products and 2 different sellers across your events
3. Create indexes to support these query patterns:
   - All events for a product, sorted by date descending
   - All events of a specific type
4. Run and show output for:
   - "Show all events for product P001, newest first"
   - "Show all price_change events"
   - "Show all events for product P001 in March 2025"
5. Run `explain("executionStats")` on the compound query (product + date range) to verify IXSCAN

**Deliverable:**
1. All `insertOne()` commands for your events (6 minimum)
2. Index creation commands
3. Query results with `explain()` showing IXSCAN for the compound query
4. Discussion (100 words): What are the trade-offs of storing all three event types in one collection vs using three separate collections (`price_changes`, `status_changes`, `promotions`)?

---

## Part 4: Schema Validation (20 points)

### Task 4.1: Add Validation to the Products Collection (20 points)

Add `$jsonSchema` validation to enforce data quality rules on the `products` collection:

```javascript
db.runCommand({
  collMod: "products",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["product_id", "title", "category", "price", "seller_id", "status"],
      properties: {
        product_id: {
          bsonType: "string",
          description: "Required. Must be a string."
        },
        title: {
          bsonType: "string",
          minLength: 1,
          description: "Required. Non-empty string."
        },
        category: {
          bsonType: "string",
          enum: ["Textbooks", "Electronics", "Furniture", "Clothing", "Other"],
          description: "Required. Must be one of the allowed categories."
        },
        price: {
          bsonType: "number",
          minimum: 0,
          description: "Required. Must be a non-negative number."
        },
        condition: {
          bsonType: "string",
          enum: ["New", "Like New", "Good", "Fair"],
          description: "If provided, must be a recognized condition."
        },
        seller_id: {
          bsonType: "string",
          description: "Required. References the sellers collection."
        },
        status: {
          bsonType: "string",
          enum: ["available", "sold", "reserved"],
          description: "Required. Must be available, sold, or reserved."
        },
        tags: {
          bsonType: "array",
          items: { bsonType: "string" },
          description: "If provided, must be an array of strings."
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "error"
})
```

**Your task:**
1. Apply the validation above
2. Test validation by attempting each of the following (and document the error messages):

```javascript
// Test A: Missing required title
db.products.insertOne({
  product_id: "P99999",
  category: "Textbooks",
  price: 25.00,
  seller_id: "S001",
  status: "available"
})

// Test B: Invalid category value
db.products.insertOne({
  product_id: "P99998",
  title: "Sports Gear",
  category: "Sports",          // Not in enum
  price: 15.00,
  seller_id: "S001",
  status: "available"
})

// Test C: Wrong type for price
db.products.insertOne({
  product_id: "P99997",
  title: "Used Calculator",
  category: "Electronics",
  price: "twenty-five",        // String instead of number
  seller_id: "S001",
  status: "available"
})

// Test D: Valid insert (should succeed)
db.products.insertOne({
  product_id: "P99996",
  title: "Biology 101 Lab Manual",
  category: "Textbooks",
  price: 18.00,
  condition: "Good",
  seller_id: "S002",
  status: "available",
  tags: ["BIO1010", "lab-manual"]
})
```

**Deliverable:**
1. Error messages from Tests A, B, and C
2. Success result from Test D
3. Explanation (75 words): How does `validationLevel: "moderate"` differ from `"strict"`? What happens to existing documents that violate the rules when moderate is set?

---

## Part 5: Reflection and Design Review (10 points)

### Task 5.1: Schema Design Summary (10 points)

Produce a written summary of your NestMart schema after this lab:

1. **Collections diagram:** List each collection and its key fields (use bullet points or markdown table)
2. **Relationship map:** Describe each relationship (e.g., `orders → sellers` via `seller_id` reference, `products → reviews[]` embedded)
3. **Design decisions:** For each embedding or referencing choice, state the primary reason
4. **Validation coverage:** Which collections have validation, and why did you choose those?

**Deliverable:** 300–400 word written summary with a collections and relationships diagram.

---

## Submission Requirements

Create `lab05-submission.md` containing:
1. Header: name, date, Lab 5
2. Part 1: Design decisions for all 4 relationships
3. Part 2: Commands and query output for wishlist and many-to-many
4. Part 3: All insert commands, query results, polymorphic trade-offs discussion
5. Part 4: Validation commands, error messages, validationLevel explanation
6. Part 5: Schema summary and design diagram

---

## Grading Rubric

| Category | Points | Criteria |
|----------|--------|----------|
| Part 1: Design Analysis | 20 | All 4 relationships analyzed with correct justification |
| Part 2: One-to-Many | 25 | Correct implementation of embedded and referenced patterns |
| Part 3: Polymorphic Pattern | 25 | Working polymorphic collection with indexes and queries |
| Part 4: Schema Validation | 20 | Validation applied, all 4 tests run and documented |
| Part 5: Design Summary | 10 | Clear, accurate schema diagram and written summary |
| **Total** | **100** | |

---

*Last Updated: March 2026*
*Part of CS3550 Module 6: MongoDB Indexing, Schema Design, and Aggregation*
