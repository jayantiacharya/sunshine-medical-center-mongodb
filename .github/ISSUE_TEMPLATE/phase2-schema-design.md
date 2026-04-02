---
name: "Phase 2: Schema Design Patterns"
about: "Implement JSON Schema validation, polymorphic pattern, and billing collection (60 points)"
title: "feat: Phase 2 - Schema Design Patterns (60 points)"
labels: ["enhancement", "phase-2", "schema-design", "60-points"]
assignees: []
---

> **Before writing any code:** Create this issue in your GitHub repository first. Go to the **Issues** tab → **New issue** → select **Phase 2: Schema Design** template. This tracks your progress and is part of the professional workflow grade.

## 🎯 **Phase 2: Schema Design Patterns**

**Points:** 60 points  
**Branch:** `feature/phase2-schema`  
**Files:** `src/phase2-schema/`

### 📋 **Requirements Checklist**

#### **Task 4: JSON Schema Validation (20 points)**
- [ ] **Task 4.1: Apply JSON Schema to a collection (7 points)** — Use `$jsonSchema` validator with required fields and types
- [ ] **Task 4.2: Verify validation enforcement (7 points)** — Show that invalid documents are rejected
- [ ] **Task 4.3: Update and inspect the schema (6 points)** — Modify the validator and confirm changes with `listCollections`

#### **Task 5: Polymorphic Pattern (20 points)**
- [ ] **Task 5.1: Insert polymorphic documents (7 points)** — Multiple document types in one collection with a `type` discriminator
- [ ] **Task 5.2: Type-specific queries (7 points)** — Query by type field and type-specific fields
- [ ] **Task 5.3: Aggregation by type (6 points)** — Use `$group` to count/aggregate per document type

#### **Task 6: Billing Collection (20 points)**
- [ ] **Task 6.1: Design billing schema (manually graded)** — Document your billing schema with field names, types, and constraints in code comments
- [ ] **Task 6.2: Insert billing documents (10 points)** — At least 6 billing documents referencing at least 3 different patients; use `payment_status` field
- [ ] **Task 6.3: Billing queries (10 points)** — Query by `payment_status` and summarize totals with aggregation

---

### 🚀 **Getting Started**

1. **Create your feature branch:**
   ```bash
   git checkout -b feature/phase2-schema
   ```

2. **Implement tasks** in `src/phase2-schema/`:
   ```bash
   docker compose exec app node src/phase2-schema/task4-json-schema-validation.js
   docker compose exec app node src/phase2-schema/task5-polymorphic-pattern.js
   docker compose exec app node src/phase2-schema/task6-billing-collection.js
   ```

3. **Push and open PR:**
   - Push your branch: `git push -u origin feature/phase2-schema`
   - Open a Pull Request to `main`

### 📚 **Resources**
- Implementation: `src/phase2-schema/task*.js`
- Reference: `docs/SCHEMA-DESIGN.md`
- Schema: `docs/SCHEMA.md`
