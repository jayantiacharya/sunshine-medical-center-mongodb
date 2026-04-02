# Module 6 Lab Series: NestMart — Indexing, Schema Design & Aggregation

**Course:** CS3550 - Advanced Database Systems
**Module:** 6 - MongoDB Indexing, Schema Design, and Aggregation
**Total Labs:** 3 (building on Module 5 Labs 1–2)

---

## Overview

This lab series extends the **NestMart** student marketplace database from Module 5 to cover production-quality concerns: query performance, schema design patterns, and analytics via aggregation pipelines.

---

## Lab Series Structure

### Lab 4: Indexing and Query Performance (Week 1)
**File:** `lab04-indexing-query-performance.md`
**Estimated Time:** 90 minutes | **Points:** 100

**What You'll Learn:**
- `explain("executionStats")` output interpretation
- COLLSCAN vs IXSCAN
- Single-field, compound, multikey, and text indexes
- ESR (Equality, Sort, Range) compound index design
- Index management: `getIndexes()`, `dropIndex()`, `$indexStats`

---

### Lab 5: Schema Design Patterns (Week 1)
**File:** `lab05-schema-design-patterns.md`
**Estimated Time:** 120 minutes | **Points:** 100
**Prerequisites:** Lab 4

**What You'll Learn:**
- Embedding vs referencing decision framework
- One-to-one (embed), one-to-many (embed array vs reference), many-to-many (reference arrays)
- Polymorphic document pattern with discriminator field
- `$jsonSchema` schema validation

---

### Lab 6: Aggregation Pipelines (Week 2)
**File:** `lab06-aggregation-pipelines.md`
**Estimated Time:** 120 minutes | **Points:** 100
**Prerequisites:** Labs 4 and 5

**What You'll Learn:**
- Multi-stage aggregation pipelines
- `$group` with accumulator operators
- `$unwind` to deconstruct embedded arrays
- `$lookup` (join collections)
- Advanced pipeline patterns for marketplace analytics reports
- Query optimization with `explain()`

---

## Database Schema at End of Module 6

After all six labs (Module 5 + Module 6), your NestMart database includes:

| Collection | Description | Design Pattern |
|------------|-------------|----------------|
| `sellers` | Seller profiles with embedded contact info and analytics | Embedding (bounded arrays) |
| `products` | Product listings with embedded reviews and avg_rating | Embedding (bounded reviews) |
| `orders` | Orders with embedded line items, referencing buyers and sellers | Hybrid: embed items, reference parties |
| `buyers` | Buyer profiles with embedded wishlist | Embedding (bounded wishlist) |
| `listings_activity` | Polymorphic event log (price changes, status changes, promotions) | Polymorphic pattern (added in Lab 5) |

---

## Progressive Learning Path

```
Module 5 Labs 1–2
(CRUD + Schema Intro)
         │
         ▼
Lab 4: Indexing
(explain(), IXSCAN, compound indexes)
         │
         ▼
Lab 5: Schema Design Patterns
(embed/reference, polymorphic, $jsonSchema)
         │
         ▼
Lab 6: Aggregation Pipelines
($group, $unwind, $lookup, reports)
```

---

## Grading Summary

| Lab | Points |
|-----|--------|
| Lab 4: Indexing and Query Performance | 100 |
| Lab 5: Schema Design Patterns | 100 |
| Lab 6: Aggregation Pipelines | 100 (+15 bonus) |
| **Total** | **300** (+15 bonus) |

---

*Last Updated: March 2026*
*Part of CS3550 Module 6: MongoDB Indexing, Schema Design, and Aggregation*
