# Grading Rubric — CS3550 Module 6 Project

**Total: 205 points**

---

## Phase 1: Foundation — CRUD Operations (100 points)

| Task | Description | Points | Type |
|------|-------------|--------|------|
| Task 1 | Create Operations (insertOne for doctors, insertMany for patients) | 25 | Automated |
| Task 2 | Read Operations (basic queries, projection, array queries) | 25 | Automated |
| Task 3 | Update Operations (updateOne, updateMany, array updates) | 25 | Automated |
| Task 4 | Delete Operations (deleteOne, conditional deleteMany) | 15 | Automated |
| Task 5 | Verification and Analysis (database summary queries) | 10 | Automated |
| **Phase 1 Total** | | **100** | |

---

## Phase 2: Schema Design and Complex Documents (75 points)

| Task | Description | Points | Type |
|------|-------------|--------|------|
| Task 6.1 | Appointments Schema Design (documented in `docs/SCHEMA.md`) | 8 | **Manual** |
| Task 6.2 | Appointments Collection Implementation (8+ appointments, correct structure) | 12 | Automated |
| Task 7.1 | Treatments Schema Design (documented in `docs/SCHEMA.md`) | 10 | **Manual** |
| Task 7.2 | Treatments Collection Implementation (10+ records, embedded medications) | 20 | Automated |
| Task 8.1 | Medical History Schema Design (documented in `docs/SCHEMA.md`) | 6 | **Manual** |
| Task 8.2 | Medical History Implementation (4+ patients updated, 2-4 conditions each) | 9 | Automated |
| Task 9 | Schema Reflection and Trade-offs (documented in `docs/SCHEMA.md`) | 10 | **Manual** |
| **Phase 2 Total** | | **75** | (41 auto + 34 manual) |

> **Manual tasks (6.1, 7.1, 8.1, 9)** are graded based on the depth and quality of your design decisions and justifications in `docs/SCHEMA.md`. Each design section should explain your embedding vs. referencing choices before you begin coding.

---

## Code Walkthrough & Demo (30 points)

| Component | Points |
|-----------|--------|
| Introduction and tech stack overview | 5 |
| Schema design explanation with justifications | 8 |
| Code walkthrough of key implementations | 8 |
| Live demo of CRUD operations and queries | 6 |
| Summary of learning and challenges | 3 |
| **Total** | **30** |

See [CODE-WALKTHROUGH.md](CODE-WALKTHROUGH.md) for full video requirements.

---

## Grand Total

| Category | Points |
|----------|--------|
| Phase 1: CRUD Operations | 100 |
| Phase 2: Schema Design | 75 |
| Code Walkthrough & Demo | 30 |
| **Total** | **205** |
