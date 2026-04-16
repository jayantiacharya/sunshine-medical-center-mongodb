# Module 6 Project: SunshineMedicalCenter — Indexing, Schema Design & Aggregation

**Course:** CS3550 - Advanced Database Systems  
**Module:** 6 - MongoDB Performance, Schema Patterns & Advanced Aggregation  
**Project Type:** Individual Project  
**Duration:** 2 weeks  
**Points:** 185 points
**Demo video link** https://youtu.be/R_r8iQgz0RM

> **Prerequisite:** This project continues directly from Module 5 (Project 5). The seed script provided in `src/seed/` will bootstrap the SunshineMedicalCenter database so you can start without completing Project 5 first.

---

## Quick Navigation

| Section | Description |
|---------|-------------|
| [Project Overview](#project-overview) | What you'll build and why |
| [Learning Objectives](#learning-objectives) | Skills assessed |
| [Setup Instructions](#setup-instructions) | Getting started |
| [Phase 1 — Indexing](#phase-1--indexing--query-performance-50-points) | Tasks 1–3 |
| [Phase 2 — Schema Design](#phase-2--schema-design-patterns-60-points) | Tasks 4–6 |
| [Phase 3 — Aggregation](#phase-3--advanced-aggregation-75-points) | Tasks 7–9 |
| [Grading Rubric](#grading-rubric) | Point breakdown |
| [Submission Guidelines](#submission-guidelines) | How to submit |

---

## Project Overview

In this project you extend the SunshineMedicalCenter MongoDB system from Project 5. You will:

1. **Optimize queries** with single-field, compound, multikey, and text indexes
2. **Enforce data quality** with `$jsonSchema` validators and schema design patterns (polymorphic, referencing)
3. **Analyze data** with advanced aggregation pipelines using `$lookup`, `$unwind`, `$group`, `$addFields`, and `$replaceRoot`

All work lives inside the `src/` directory. The autograder runs your code against the test suite in `tests/`.

---

## Learning Objectives

By completing this project you will demonstrate the ability to:

1. **Create and evaluate indexes** using `createIndex()`, `getIndexes()`, and `explain()` to observe COLLSCAN → IXSCAN improvement (LO1)
2. **Apply schema validation** with `$jsonSchema` and design polymorphic/referencing collections (LO2)
3. **Build multi-stage aggregation pipelines** with `$lookup`, `$unwind`, `$group`, `$addFields`, `$replaceRoot`, and `$facet` (LO3)
4. **Generate business analytics** reports from real healthcare data (LO4)

---

## Setup Instructions

### Prerequisites

- Docker Desktop installed and running
- Git, Node.js 20+

### 1. Clone your repository

```bash
git clone <your-repo-url>
cd project6
```

### 2. Start the environment

```bash
docker compose up -d
docker compose ps   # confirm mongodb + app are running
```

### 3. Install dependencies

```bash
docker compose exec app sh -c "cd /workspace && npm install"
```

### 4. Seed the database

The seed script creates all five collections (`doctors`, `patients`, `appointments`, `treatments`, `medical_history`) so you start with realistic data:

```bash
docker compose exec app node /workspace/src/seed/seed-database.js
```

### 5. Verify seed data

```bash
docker compose exec -T mongodb mongosh \
  --eval "db = db.getSiblingDB('sunshine_medical_center'); \
    print('Doctors:', db.doctors.countDocuments()); \
    print('Patients:', db.patients.countDocuments()); \
    print('Appointments:', db.appointments.countDocuments()); \
    print('Treatments:', db.treatments.countDocuments());" \
  mongodb://admin:cs3550password@localhost:27017/?authSource=admin
```

Expected output: Doctors: 3, Patients: 5, Appointments: 8, Treatments: 6

---

## Phase 1 — Indexing & Query Performance (50 points)

### Task 1 — Single-Field Indexes (15 points)

**File:** `src/phase1-indexing/task1-single-field-indexes.js`

1. **`task1_1_baselineExplain()`** — Run `explain('executionStats')` on a query **before** creating indexes. Capture the winning plan stage (should be `COLLSCAN`). Return the explain result. (5 pts)

2. **`task1_2_createSingleFieldIndexes()`** — Create three single-field indexes:
   - `{ specialty: 1 }` on `doctors` (name: `specialty_1`)
   - `{ status: 1 }` on `patients` (name: `status_1`)
   - `{ appointment_date: 1 }` on `appointments` (name: `appointment_date_1`)
   
   Return an array of the three index names. (5 pts)

3. **`task1_3_verifyIxscan()`** — Re-run the same queries from Task 1.1 **after** creating indexes. Verify the winning plan stage is now `IXSCAN` or `FETCH`. Return the explain result. (5 pts)

---

### Task 2 — Compound & Multikey Indexes (20 points)

**File:** `src/phase1-indexing/task2-compound-multikey-indexes.js`

1. **`task2_1_compoundIndex()`** — Create a compound ESR (Equality-Sort-Range) index on `appointments`:
   ```js
   { doctor_ref: 1, status: 1, appointment_date: 1 }
   ```
   Name it `doctor_status_date_1`. Return the index name. (10 pts)

2. **`task2_2_multikeyIndex()`** — Create a multikey index on `patients.allergies[]`:
   ```js
   { allergies: 1 }
   ```
   Name it `allergies_1`. Return the index name. (5 pts)

3. **`task2_3_listIndexes()`** — Use `collection.indexes()` to retrieve all indexes on `appointments` and `patients`. Return `{ appointmentIndexes, patientIndexes }`. (5 pts)

---

### Task 3 — Text Indexes & Index Management (15 points)

**File:** `src/phase1-indexing/task3-text-index-management.js`

1. **`task3_1_textIndex()`** — Create a text index on `treatments` covering `notes` and `diagnosis`:
   ```js
   { notes: 'text', diagnosis: 'text' }
   ```
   Name it `notes_diagnosis_text`. Run `$text` searches for `'diabetes'` and `'medication'`. Return `{ indexName, diabetesResults, medicationResults }`. (8 pts)

2. **`task3_2_dropIndex()`** — Create a temporary index on any collection, then drop it using `collection.dropIndex()`. Return the name of the dropped index. (4 pts)

3. **`task3_3_indexReport()`** — Use `collection.indexes()` to generate a report of all indexes across all collections. Return an object keyed by collection name, each value an array of index descriptors. (3 pts)

---

## Phase 2 — Schema Design Patterns (60 points)

### Task 4 — JSON Schema Validation (20 points)

**File:** `src/phase2-schema/task4-json-schema-validation.js`

1. **`task4_1_doctorSchema()`** — Apply a `$jsonSchema` validator to the `doctors` collection using `db.command({ collMod: 'doctors', validator: {...} })`. The schema must enforce at least:  `doctor_id`, `first_name`, `last_name`, `specialty` as required strings. Return the validator object. (7 pts)

2. **`task4_2_patientSchema()`** — Apply a `$jsonSchema` validator to the `patients` collection. Must require at least: `patient_id`, `first_name`, `last_name`, `date_of_birth`. Return the validator object. (7 pts)

3. **`task4_3_verifyRejection()`** — Attempt to insert one invalid doctor (missing `specialty`) and one invalid patient (wrong type for `date_of_birth`). Catch the errors. Return `{ doctorRejected: true, patientRejected: true }`. (6 pts)

---

### Task 5 — Polymorphic Pattern (20 points)

**File:** `src/phase2-schema/task5-polymorphic-pattern.js`

Create a `medical_events` collection that stores multiple event types in a single collection using the **Polymorphic pattern**:

1. **`task5_1_createMedicalEvents()`** — Insert at least 8 documents with types: `appointment`, `lab_result`, `note`, `referral` (2+ of each). Each document must have a `type` field and `patient_ref`. Return the total inserted count. (8 pts)

2. **`task5_2_queryByType()`** — Query the collection:
   - All `lab_result` events
   - Lab results flagged as abnormal (add a boolean `flagged` field to your data)
   - All `referral` events
   
   Return `{ labResults, flaggedLabs, referrals }`. (6 pts)

3. **`task5_3_addTypeIndex()`** — Create a compound index `{ type: 1, patient_ref: 1 }` named `type_patient_ref_1`. Return the index name. (6 pts)

---

### Task 6 — Billing Collection (Referencing Pattern) (20 points)

**File:** `src/phase2-schema/task6-billing-collection.js`

Create a `billing` collection that demonstrates the **Referencing pattern** (store `patient_ref` and `appointment_ref` as string IDs rather than embedding full documents).

1. **`task6_2_createBilling()`** — Insert at least 6 billing documents. Each must have:
   - `billing_id`, `patient_ref`, `appointment_ref`, `amount`, `payment_status` (`'Paid'` or `'Outstanding'`), `date`
   
   Return the inserted count. (10 pts)

2. **`task6_3_billingQueries()`** — Run two queries:
   - All `Outstanding` bills
   - All bills for a specific `patient_ref`
   
   Return `{ outstanding, patient }`. (10 pts)

---

## Phase 3 — Advanced Aggregation (75 points)

### Task 7 — $lookup & $unwind (25 points)

**File:** `src/phase3-aggregation/task7-lookup-unwind.js`

1. **`task7_1_lookupDoctors()`** — Build a pipeline on `appointments` that uses `$lookup` to join with `doctors` (matching `doctor_ref` → `doctor_id`). Add a `doctor_name` field (derived from the joined doctor's `first_name` + `last_name`). Return the array. (9 pts)

2. **`task7_2_lookupPatients()`** — Build a pipeline on `appointments` that uses `$lookup` to join with `patients` (matching `patient_ref` → `patient_id`). Add a `patient_name` field. Return the array. (8 pts)

3. **`task7_3_unwindMedications()`** — Build a pipeline on `treatments` that uses `$unwind` on the `medications` array (each treatment has `medications: [{name, dosage, frequency}, ...]`). Return documents with `medication_name`, `dosage`, `frequency` at the top level. (8 pts)

---

### Task 8 — Complex Aggregation Pipelines (25 points)

**File:** `src/phase3-aggregation/task8-complex-pipelines.js`

1. **`task8_1_groupAccumulators()`** — Group treatments by `patient_ref`. For each patient compute:
   - `treatmentCount` (`$sum: 1`)
   - `totalCost` (`$sum: '$cost'`)
   - `avgCost` (`$avg: '$cost'`)
   - `followUpCount` (`$sum` of treatments with `follow_up_required: true`)
   
   Return the array. (9 pts)

2. **`task8_2_addFields()`** — Use `$addFields` on `patients` to compute:
   - `age` — integer years from `date_of_birth`
   - `hasAllergies` — boolean (`true` if `allergies` array is non-empty)
   - `fullName` — concatenation of `first_name` + `' '` + `last_name`
   
   Return the array. (8 pts)

3. **`task8_3_replaceRoot()`** — Build a pipeline on `treatments` that does a `$lookup` to join patient data, then uses `$replaceRoot` (`$mergeObjects`) to produce a flat document. The result must include `treatment_id` and `patient_name`. Return the array. (8 pts)

---

### Task 9 — Analytics Reports (25 points)

**File:** `src/phase3-aggregation/task9-analytics-reports.js`

Build three business analytics reports for SunshineMedicalCenter management:

1. **`task9_1_doctorWorkload()`** — For each doctor, report:
   - `doctor_name`
   - `totalAppointments`
   - `completed`, `scheduled`, `cancelled` (counts per status)
   
   Return the array sorted by `totalAppointments` descending. (9 pts)

2. **`task9_2_patientCareSummary()`** — For each patient, report:
   - `patient_name`
   - `totalTreatments`
   - `totalCost` (sum of treatment costs)
   
   Return the array. (8 pts)

3. **`task9_3_monthlyTrends()`** — Group appointments by year+month+status. For each group report:
   - `year`, `month`, `status`, `count`
   - `period` — formatted string `'YYYY-MM'`
   
   Return sorted by `year`, `month`. (8 pts)

---

## Grading Rubric

| Phase | Task | Description | Points |
|-------|------|-------------|--------|
| Phase 1 | Task 1 | Single-Field Indexes | 15 |
| Phase 1 | Task 2 | Compound & Multikey Indexes | 20 |
| Phase 1 | Task 3 | Text Index Management | 15 |
| **Phase 1 Total** | | **Indexing & Query Performance** | **50** |
| Phase 2 | Task 4 | JSON Schema Validation | 20 |
| Phase 2 | Task 5 | Polymorphic Pattern | 20 |
| Phase 2 | Task 6 | Billing Collection (Referencing) | 20 |
| **Phase 2 Total** | | **Schema Design Patterns** | **60** |
| Phase 3 | Task 7 | $lookup & $unwind | 25 |
| Phase 3 | Task 8 | Complex Aggregation Pipelines | 25 |
| Phase 3 | Task 9 | Analytics Reports | 25 |
| **Phase 3 Total** | | **Advanced Aggregation** | **75** |
| **Grand Total** | | | **185** |

---

## Professional Git Workflow

For each phase, follow this workflow:

```bash
# Create a branch for each phase
git checkout -b phase1-indexing

# Commit as you complete tasks
git add src/phase1-indexing/task1-single-field-indexes.js
git commit -m "feat: implement Task 1 single-field indexes"

# Push and open a PR
git push -u origin phase1-indexing
# Open PR on GitHub → request review
```

---

## Submission Guidelines

1. Complete all tasks in `src/`
2. Push to GitHub (the autograder runs on every push to `main` and `develop`)
3. Open a pull request for each phase
4. Record a code walkthrough video (see `docs/CODE-WALKTHROUGH.md`)

---

## Resources

- [MongoDB Indexing Docs](https://www.mongodb.com/docs/manual/indexes/)
- [MongoDB Schema Validation](https://www.mongodb.com/docs/manual/core/schema-validation/)
- [Aggregation Pipeline Reference](https://www.mongodb.com/docs/manual/reference/operator/aggregation-pipeline/)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)
