# Schema Design Documentation 🏗️

**Student Name:** [Your Name]  
**Date:** [Submission Date]  
**Project:** Sunshine Medical Center MongoDB Database

---

## 📌 Important: Task-Specific Requirements

This document contains placeholders for written justifications required by specific tasks:

- **Task 6.1**: Appointments collection design decisions (see Section 3 - Appointments Collection)
- **Task 7.1**: Treatments and prescriptions design decisions (see Section 4 - Treatments Collection)
- **Task 8.1**: Medical history embedding justification (see Section 2 - Patients Collection)
- **Task 10**: Comprehensive schema analysis and trade-offs (see Trade-offs and Justifications section)

**Note:** All other task explanations (queries, operators, performance analysis, etc.) should be provided in your **code walkthrough video** rather than in written form.

---

## Table of Contents

1. [Overview](#overview)
2. [Collections Design](#collections-design)
3. [Embedding vs Referencing Decisions](#embedding-vs-referencing-decisions)
4. [Sample Documents](#sample-documents)
5. [Relationships Diagram](#relationships-diagram)
6. [Trade-offs and Justifications](#trade-offs-and-justifications)

---

## Overview

Brief description of your overall schema design approach and philosophy.

### Design Principles Applied
- List the key MongoDB design principles you followed
- Explain your general approach to embedding vs referencing
- Note any specific patterns you used

---

## Collections Design

### 1. Doctors Collection 👨‍⚕️

**Purpose:** Store doctor profiles, specialties, and availability information.

**Schema Structure:**
```javascript
{
  doctor_id: String,           // Unique identifier
  first_name: String,
  last_name: String,
  specialty: String,
  phone: String,
  email: String,
  hire_date: Date,
  is_accepting_patients: Boolean
}
```

**Design Decisions:**
- **Why this structure:** [Explain your reasoning]
- **What NOT to embed:** [Explain what you chose to reference instead]
- **Access patterns supported:** [List the queries this design optimizes]

---

### 2. Patients Collection 🧑‍🤝‍🧑

**Purpose:** Store patient demographics, medical histories, and insurance information.

**Schema Structure:**
```javascript
{
  patient_id: String,
  first_name: String,
  last_name: String,
  date_of_birth: Date,
  gender: String,
  contact: {                   // Embedded
    phone: String,
    email: String
  },
  address: {                   // Embedded
    street: String,
    city: String,
    state: String,
    zip: String
  },
  insurance: {                 // Embedded
    provider: String,
    policy_number: String,
    group_number: String
  },
  registration_date: Date,
  status: String,
  primary_physician: String,   // Could be reference
  allergies: [String],         // Embedded array
  medical_conditions: [String], // Embedded array
  medical_history: [           // Embedded array of subdocuments
    {
      date: Date,
      event_type: String,
      description: String,
      provider: String,
      outcome: String,
      related_treatment_id: String
    }
  ]
}
```

**Design Decisions:**
- **Why embed contact/address/insurance:** [Your reasoning - e.g., "These are always accessed together with patient data and are bounded/small"]
- **Why reference primary_physician:** [Your reasoning]
- **Array size considerations:** [Discuss bounded vs unbounded]

---

#### 📋 Task 8.1: Medical History Design Decision

**Question: Why embed medical history in patient documents instead of creating a separate collection?**

[YOUR ANSWER HERE: Explain your reasoning - consider:
- How often is medical history accessed?
- Is it always accessed with patient data?
- Size considerations (bounded vs unbounded growth)
- Alternative: separate medical_events collection
- Trade-offs between embedding and referencing]

---

---

### 3. Appointments Collection 📅

**Purpose:** Track scheduled, completed, and cancelled appointments.

**Schema Structure:**
```javascript
{
  appointment_id: String,
  patient_ref: String,         // Reference to patient_id
  doctor_ref: String,          // Reference to doctor_id
  appointment_date: Date,
  appointment_time: String,
  duration_minutes: Number,
  reason: String,
  status: String,              // "Scheduled", "Completed", "Cancelled"
  notes: String,
  created_at: Date
}
```

---

#### 📋 Task 6.1: Design Decision - Embedding vs Referencing

**Question 1: Should appointment data be embedded in patient documents, doctor documents, or stored as a separate collection?**

[YOUR ANSWER HERE: Explain your reasoning - consider:
- Doctors may have 20-30 appointments per day
- Patients typically have 2-3 appointments per year
- Common queries need to find appointments for specific patients or doctors
- What are the implications of each approach?]

**Question 2: Should patient and doctor information be embedded in appointments or referenced by ID?**

[YOUR ANSWER HERE: Explain your reasoning - consider:
- Data duplication vs consistency
- What happens when doctor information changes?
- Query performance for appointment lookups]

**Question 3: What fields would you include in each appointment document?**

[YOUR ANSWER HERE: List all fields with their data types and justify any additional fields beyond the basic structure shown above]

---

---

### 4. Treatments Collection 💊

**Purpose:** Record treatments, diagnoses, and prescriptions.

**Schema Structure:**
```javascript
{
  treatment_id: String,
  patient_ref: String,         // Reference
  doctor_ref: String,          // Reference
  treatment_date: Date,
  diagnosis: String,
  procedures: [String],        // Embedded array
  prescriptions: [             // Embedded array of subdocuments
    {
      medication_name: String,
      dosage: String,
      frequency: String,
      duration_days: Number,
      refills_allowed: Number,
      pharmacy_instructions: String
    }
  ],
  follow_up_date: Date,
  cost: Number,
  notes: String
}
```

---

#### 📋 Task 7.1: Design Complex Nested Documents

**Question 1: What is your complete field structure for treatments?**

[YOUR ANSWER HERE: List and justify all fields in your treatment documents, including any additional fields beyond the basic structure]

**Question 2: How did you structure prescriptions (embedded or referenced)?**

[YOUR ANSWER HERE: Explain your reasoning - consider:
- Are prescriptions always accessed with treatments?
- How many prescriptions per treatment (bounded/unbounded)?
- Query requirements: finding all prescriptions for a medication]

**Question 3: Justification for embedding vs referencing approach**

[YOUR ANSWER HERE: Explain why you chose to embed prescriptions in treatments or keep them in a separate collection. Consider:
- Data access patterns
- Relationship cardinality
- Update frequency
- Query complexity]

**Query Support Analysis:**

This design must support:
- ✅ Find all treatments for a patient
- ✅ Find all prescriptions for a specific medication name
- ✅ Find treatments within a date range

[YOUR ANSWER HERE: Explain how your design efficiently supports each of these queries]

---

---

## Embedding vs Referencing Decisions

### When I Chose to Embed

| Data | Location | Reasoning |
|------|----------|-----------|
| Contact info | patients | Always accessed together, small, doesn't change independently |
| Insurance | patients | [Your reasoning] |
| Prescriptions | treatments | [Your reasoning] |
| Medical history | patients | [Your reasoning] |

### When I Chose to Reference

| Data | Location | Reasoning |
|------|----------|-----------|
| Patient ID | appointments | Unbounded relationship, accessed independently |
| Doctor ID | appointments | [Your reasoning] |
| Patient ID | treatments | [Your reasoning] |

---

## Sample Documents

### Sample Doctor Document
```javascript
{
  _id: ObjectId("..."),
  doctor_id: "D001",
  first_name: "Emily",
  last_name: "Chen",
  specialty: "Endocrinology",
  phone: "555-1234",
  email: "echen@sunshine.com",
  hire_date: ISODate("2015-06-01"),
  is_accepting_patients: true
}
```

### Sample Patient Document
```javascript
{
  _id: ObjectId("..."),
  patient_id: "P10001",
  first_name: "John",
  last_name: "Doe",
  // ... complete document with all nested fields
}
```

### Sample Appointment Document
```javascript
{
  _id: ObjectId("..."),
  appointment_id: "APT001",
  // ... complete document
}
```

### Sample Treatment Document
```javascript
{
  _id: ObjectId("..."),
  treatment_id: "TRT001",
  // ... complete document with embedded prescriptions
}
```

---

## Relationships Diagram

```
┌─────────────┐
│   Doctors   │
└──────┬──────┘
       │
       │ referenced by
       │
┌──────▼──────────┐        ┌─────────────┐
│  Appointments   │────────│  Patients   │
└─────────────────┘        └──────┬──────┘
                                  │
                                  │ referenced by
                                  │
                           ┌──────▼──────┐
                           │ Treatments  │
                           │  (embeds    │
                           │prescriptions)│
                           └─────────────┘
```

[You can create a more detailed diagram or use a tool like draw.io]

---

## Trade-offs and Justifications

### 1. Appointments as Separate Collection

**Decision:** Store appointments in their own collection rather than embedding in patients or doctors.

**Reasoning:**
- [Your detailed explanation]
- Pros: [List advantages]
- Cons: [List disadvantages]
- Why this is best: [Your conclusion]

### 2. Embedding Prescriptions in Treatments

**Decision:** Embed prescription details within treatment documents.

**Reasoning:**
- [Your detailed explanation]
- Pros: [List advantages]
- Cons: [List disadvantages]
- Why this is best: [Your conclusion]

### 3. Medical History in Patients

**Decision:** Embed medical_history array in patient documents.

**Reasoning:**
- [Your detailed explanation]
- Pros: [List advantages]
- Cons: [List disadvantages]
- Why this is best: [Your conclusion]

---

## 📋 Task 10: Schema Reflection and Trade-offs

This section addresses the comprehensive analysis required for Task 10.

### Embedding vs Referencing Analysis

**Where did you choose to embed data? Why?**

[YOUR ANSWER HERE: Discuss each embedding decision:
- Contact/address/insurance in patients
- Prescriptions in treatments
- Medical history in patients
- Explain the reasoning for each]

**Where did you choose to reference data? Why?**

[YOUR ANSWER HERE: Discuss each referencing decision:
- Patient references in appointments and treatments
- Doctor references in appointments and treatments
- Explain the reasoning for each]

**What would happen if appointments were embedded in patient documents?**

[YOUR ANSWER HERE: Analyze this alternative approach:
- How would queries change?
- What about doctors viewing their appointments?
- Scalability concerns?
- Why is a separate collection better (or not)?]

### Query Performance

**Which queries are optimized by your design?**

[YOUR ANSWER HERE: List specific queries that benefit from your schema choices and explain why they're efficient]

**Which queries require multiple lookups?**

[YOUR ANSWER HERE: List queries that need $lookup or multiple operations and explain why that's acceptable]

**How could indexes help your most common queries?**

[YOUR ANSWER HERE: Recommend specific indexes and explain their impact:
- Which fields should be indexed?
- Compound indexes needed?
- Impact on query performance?]

### Data Consistency

**What happens if a doctor's information changes?**

[YOUR ANSWER HERE: Analyze the update process:
- Which documents need to be updated?
- Is there any denormalized data?
- How do you maintain consistency?]

**How would you update all references to that doctor?**

[YOUR ANSWER HERE: Describe the update strategy:
- Single update or multiple?
- Which collections are affected?
- Transaction considerations?]

**What are the trade-offs of denormalization?**

[YOUR ANSWER HERE: Discuss:
- Performance benefits of denormalization
- Consistency challenges
- When is it worth it?
- Where did you choose NOT to denormalize?]

### Scalability

**What if a patient has 100+ appointments?**

[YOUR ANSWER HERE: Analyze the impact:
- Current design handles this how?
- Would you need to change anything?
- Performance considerations?
- Alternative approaches?]

**What if the medical center has 10,000 patients?**

[YOUR ANSWER HERE: Analyze the impact:
- Scaling concerns?
- Index strategies?
- Query performance?
- Sharding considerations?]

**What changes would you make for large-scale deployment?**

[YOUR ANSWER HERE: Recommend specific changes:
- Schema modifications?
- Additional collections?
- Partitioning strategies?
- Caching approaches?]

### Comparison to SQL

**How would this schema differ in a relational database?**

[YOUR ANSWER HERE: Describe the equivalent SQL schema:
- Tables required
- Foreign keys
- Junction tables
- Normalized structure]

**What are the advantages of the MongoDB approach?**

[YOUR ANSWER HERE: List and explain specific advantages:
1. Flexibility for nested data
2. Performance for specific queries
3. Scalability benefits
4. Schema evolution
5. etc.]

**What are the disadvantages of the MongoDB approach?**

[YOUR ANSWER HERE: List and explain specific disadvantages:
1. Data duplication concerns
2. Update complexity
3. Transaction limitations (if any)
4. Consistency challenges
5. etc.]

---

### 4. Query Performance Considerations (Summary)

**Queries Optimized:**
- [List queries that benefit from your design]

**Queries That Require Multiple Lookups:**
- [List queries that need multiple database operations]

**Potential Improvements:**
- [Discuss how indexes could help]
- [Discuss denormalization opportunities]

---

## Scalability Considerations

### What if the database grows significantly?

**Scenario 1: Patient has 100+ appointments**
- Current design impact: [Your analysis]
- Potential solution: [Your recommendation]

**Scenario 2: Medical center has 10,000 patients**
- Current design impact: [Your analysis]
- Potential solution: [Your recommendation]

**Scenario 3: Doctor has 30 appointments per day**
- Current design impact: [Your analysis]
- Potential solution: [Your recommendation]

---

## Comparison to Relational Database

### How would this differ in SQL?

**Tables Required:**
- [List tables you'd need]

**Joins Required:**
- [List typical joins]

**Advantages of MongoDB approach:**
1. [Advantage 1]
2. [Advantage 2]
3. [Advantage 3]

**Disadvantages of MongoDB approach:**
1. [Disadvantage 1]
2. [Disadvantage 2]

---

## Lessons Learned

### What worked well:
- [Your reflection]

### What I would change:
- [Your reflection]

### Key takeaways:
- [Your reflection]

---

**Total Collections:** 4 (doctors, patients, appointments, treatments)  
**Total Documents:** [Your count]  
**Schema Complexity:** [Simple/Moderate/Complex]
