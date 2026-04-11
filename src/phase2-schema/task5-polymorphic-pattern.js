/**
 * Task 5 — Polymorphic Data Pattern
 * Phase 2 — Schema Design Patterns
 *
 * INSTRUCTIONS:
 * Complete the three functions below to earn 20 points.
 *
 * Task 5.1 — Create medical_events collection (10 pts)
 *   Create a collection called `medical_events`.
 *   Insert at least 8 documents covering all four types:
 *     "appointment", "lab_result", "note", "referral"
 *
 *   All documents must have: event_id, type, patient_ref, event_date, created_by
 *   Each type adds unique fields:
 *     appointment  → appointment_ref (string), status (string), duration_minutes (number)
 *     lab_result   → test_name (string), result_value (number), unit (string),
 *                    reference_range (string), flagged (bool)
 *     note         → note_text (string), note_category (string)
 *     referral     → referred_to_specialty (string), referred_to_doctor (string),
 *                    urgency (string)
 *
 *   Requirements:
 *     - At least 2 documents of EACH type
 *     - Use patient_refs from the seeded data: P10001–P10005
 *   Return the count of inserted documents.
 *
 * Task 5.2 — Query by type (5 pts)
 *   Run three queries:
 *     1. All documents of type "lab_result"
 *     2. All documents of type "lab_result" where flagged is true
 *     3. All documents of type "referral" for patient P10001
 *   Return { labResults, flaggedLabs, referrals }
 *
 * Task 5.3 — Compound index on (type, patient_ref) (5 pts)
 *   Create a compound index { type: 1, patient_ref: 1 }
 *   with name 'type_patient_ref_1'.
 *   Return the index name.
 *
 * Required exports: connect, close,
 *   task5_1_createMedicalEvents, task5_2_queryByType, task5_3_addTypeIndex
 *
 * Run with: node src/phase2-schema/task5-polymorphic-pattern.js
 */

import { MongoClient } from 'mongodb';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:cs3550password@mongodb:27017/?authSource=admin';
const DB_NAME = 'sunshine_medical_center';

let client;
let db;

export async function connect() {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB');
    return db;
}

export async function close() {
    if (client) await client.close();
}

/**
 * Task 5.1 — Create polymorphic medical_events — 10 points
 * @returns {number} insertedCount
 */
export async function task5_1_createMedicalEvents() {
    // TODO: deleteMany then insertMany with all 4 types, at least 2 each
    // Return result.insertedCount
    
    // Clear existing medical_events
    await db.collection('medical_events').deleteMany({});
    
    const events = [
        // Appointment type (2)
        {
            event_id: 'EVT001',
            type: 'appointment',
            patient_ref: 'P10001',
            event_date: new Date('2024-01-15T09:00:00Z'),
            created_by: 'D001',
            appointment_ref: 'APT001',
            status: 'Scheduled',
            duration_minutes: 30
        },
        {
            event_id: 'EVT002',
            type: 'appointment',
            patient_ref: 'P10002',
            event_date: new Date('2024-01-16T14:00:00Z'),
            created_by: 'D002',
            appointment_ref: 'APT002',
            status: 'Completed',
            duration_minutes: 45
        },
        
        // Lab Result type (2)
        {
            event_id: 'EVT003',
            type: 'lab_result',
            patient_ref: 'P10001',
            event_date: new Date('2024-01-10T08:00:00Z'),
            created_by: 'D001',
            test_name: 'Blood Glucose',
            result_value: 145,
            unit: 'mg/dL',
            reference_range: '70-100',
            flagged: true
        },
        {
            event_id: 'EVT004',
            type: 'lab_result',
            patient_ref: 'P10003',
            event_date: new Date('2024-01-12T08:00:00Z'),
            created_by: 'D001',
            test_name: 'Cholesterol',
            result_value: 180,
            unit: 'mg/dL',
            reference_range: '<200',
            flagged: false
        },
        
        // Note type (2)
        {
            event_id: 'EVT005',
            type: 'note',
            patient_ref: 'P10002',
            event_date: new Date('2024-01-15T10:00:00Z'),
            created_by: 'D002',
            note_text: 'Patient reports mild headache',
            note_category: 'Symptom'
        },
        {
            event_id: 'EVT006',
            type: 'note',
            patient_ref: 'P10004',
            event_date: new Date('2024-01-17T11:00:00Z'),
            created_by: 'D003',
            note_text: 'Follow-up scheduled in 2 weeks',
            note_category: 'Plan'
        },
        
        // Referral type (2)
        {
            event_id: 'EVT007',
            type: 'referral',
            patient_ref: 'P10001',
            event_date: new Date('2024-01-18T13:00:00Z'),
            created_by: 'D001',
            referred_to_specialty: 'Cardiology',
            referred_to_doctor: 'Dr. Heart',
            urgency: 'Routine'
        },
        {
            event_id: 'EVT008',
            type: 'referral',
            patient_ref: 'P10005',
            event_date: new Date('2024-01-19T15:00:00Z'),
            created_by: 'D002',
            referred_to_specialty: 'Neurology',
            referred_to_doctor: 'Dr. Brain',
            urgency: 'Urgent'
        }
    ];
    
    const result = await db.collection('medical_events').insertMany(events);
    
    console.log('\nInserted', result.insertedCount, 'medical events');
    console.log('- Appointments: 2');
    console.log('- Lab Results: 2');
    console.log('- Notes: 2');
    console.log('- Referrals: 2');
    
    return result.insertedCount;
}

/**
 * Task 5.2 — Query by discriminator field — 5 points
 * @returns {{ labResults: object[], flaggedLabs: object[], referrals: object[] }}
 */
export async function task5_2_queryByType() {
    // TODO: Three separate find() queries on medical_events
    // Return { labResults, flaggedLabs, referrals }
    
    // Query 1: All lab_result events
    const labResults = await db.collection('medical_events')
        .find({ type: 'lab_result' })
        .toArray();
    
    console.log('\nLab results found:', labResults.length);
    
    // Query 2: Lab results that are flagged
    const flaggedLabs = await db.collection('medical_events')
        .find({ type: 'lab_result', flagged: true })
        .toArray();
    
    console.log('Flagged lab results:', flaggedLabs.length);
    
    // Query 3: Referrals for patient P10001
    const referrals = await db.collection('medical_events')
        .find({ type: 'referral', patient_ref: 'P10001' })
        .toArray();
    
    console.log('Referrals for P10001:', referrals.length);
    
    return { labResults, flaggedLabs, referrals };
}

/**
 * Task 5.3 — Compound index on (type, patient_ref) — 5 points
 * @returns {string} index name
 */
export async function task5_3_addTypeIndex() {
    // TODO: createIndex({ type: 1, patient_ref: 1 }, { name: 'type_patient_ref_1' })
    // Return the index name
    
    const indexName = 'type_patient_ref_1';
    
    // Drop index if it exists
    try {
        await db.collection('medical_events').dropIndex(indexName);
    } catch (e) {
        // Index doesn't exist yet
    }
    
    // Create compound index
    await db.collection('medical_events').createIndex(
        { type: 1, patient_ref: 1 },
        { name: indexName }
    );
    
    console.log('\nCreated compound index:', indexName);
    
    return indexName;
}

// ── main ───────────────────────────────────────────────────────────────────

async function main() {
    try {
        await connect();
        await task5_1_createMedicalEvents();
        await task5_2_queryByType();
        await task5_3_addTypeIndex();
        console.log('✅ Task 5 complete');
    } finally {
        await close();
    }
}

if (import.meta.url === `file://${process.argv[1]}`) { main(); }
