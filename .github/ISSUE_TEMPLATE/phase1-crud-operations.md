---
name: "Phase 1: Indexing & Query Performance"
about: "Create indexes and analyze query performance (50 points)"
title: "feat: Phase 1 - Indexing & Query Performance (50 points)"
labels: ["enhancement", "phase-1", "indexing", "50-points"]
assignees: []
---

> **Before writing any code:** Create this issue in your GitHub repository first. Go to the **Issues** tab → **New issue** → select **Phase 1: Indexing** template. This tracks your progress and is part of the professional workflow grade.

## 🎯 **Phase 1: Indexing & Query Performance**

**Points:** 50 points  
**Branch:** `feature/phase1-indexing`  
**Files:** `src/phase1-indexing/`

### 📋 **Requirements Checklist**

#### **Task 1: Single-Field Indexes (15 points)**
- [ ] **Task 1.1: Baseline COLLSCAN capture (5 points)** — Use `explain("executionStats")` to record COLLSCAN before any indexes
- [ ] **Task 1.2: Create three single-field indexes (5 points)** — Index on `last_name`, `specialty`, and `appointment_date`
- [ ] **Task 1.3: Verify IXSCAN after index creation (5 points)** — Confirm queries now use IXSCAN stage

#### **Task 2: Compound & Multikey Indexes (20 points)**
- [ ] **Task 2.1: Compound index (7 points)** — Create a compound index on two fields and verify usage
- [ ] **Task 2.2: Multikey index (7 points)** — Create an index on an array field and verify multikey flag
- [ ] **Task 2.3: Index analysis (6 points)** — Use `getIndexes()` to inspect and document all indexes

#### **Task 3: Text Index Management (15 points)**
- [ ] **Task 3.1: Create text index (5 points)** — Create a text index on string field(s)
- [ ] **Task 3.2: Text search queries (5 points)** — Use `$text` with `$search` to query documents
- [ ] **Task 3.3: Drop and rebuild (5 points)** — Drop the text index and recreate it; verify before/after

---

### 🚀 **Getting Started**

1. **Seed the database first:**
   ```bash
   docker compose exec app node src/seed/seed-database.js
   ```

2. **Create your feature branch:**
   ```bash
   git checkout -b feature/phase1-indexing
   ```

3. **Implement tasks** in `src/phase1-indexing/`:
   ```bash
   docker compose exec app node src/phase1-indexing/task1-single-field-indexes.js
   docker compose exec app node src/phase1-indexing/task2-compound-multikey-indexes.js
   docker compose exec app node src/phase1-indexing/task3-text-index-management.js
   ```

4. **Push and open PR:**
   - Push your branch: `git push -u origin feature/phase1-indexing`
   - Open a Pull Request to `main`

### 📚 **Resources**
- Implementation: `src/phase1-indexing/task*.js`
- Reference: `docs/QUICK-REFERENCE.md`
- Schema: `docs/SCHEMA.md`
