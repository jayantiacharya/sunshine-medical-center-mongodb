# Database Schema Design

## Schema Design Principles

Your schema must demonstrate understanding of:

### When to Embed
- **One-to-Few** relationships with small, bounded subdocuments
- Data that is **always accessed together** (patient allergies, contact info)
- Data that **doesn't change independently** (prescription details within a treatment)
- Small, predictable arrays (medical conditions, emergency contacts)

### When to Reference
- **One-to-Many** with unbounded growth (doctor → appointments)
- Data accessed **independently** (doctors, patients)
- Data **shared across documents** (patient referenced by multiple appointments)
- Large subdocuments that would cause **document bloat** (full treatment history)

## Core Schema Decisions You Must Make

For each collection, document your reasoning:

### Doctors Collection
- **What to include**: Basic profile info, specialty, contact, availability
- **Design question**: Should patient lists be embedded or referenced?
- **Recommended approach**: Reference patients via appointments (unbounded relationship)

### Patients Collection
- **What to embed**: Demographics, insurance, allergies, contact info, medical history summary
- **What to reference**: Current doctor (by ID), related appointments/treatments
- **Design question**: How deep should medical_history array go?
- **Trade-off**: Embedding history summaries vs. separate medical_records collection

### Appointments Collection
- **What to reference**: Patient ID, Doctor ID (both change independently)
- **What to embed**: Appointment-specific details (date, time, reason, status, notes)
- **Design question**: Should you denormalize patient/doctor names for query performance?
- **Trade-off**: Pure references vs. selective denormalization

### Treatments Collection
- **What to embed**: Prescriptions array (bounded, accessed together)
- **What to reference**: Patient ID, Doctor ID
- **Design question**: Should diagnoses be a separate collection or embedded strings?
- **Trade-off**: Flexibility vs. data consistency

---

[← Back to README](../README.md)
