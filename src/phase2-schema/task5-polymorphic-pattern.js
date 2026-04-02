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
    throw new Error('connect() not implemented');
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
    throw new Error('task5_1_createMedicalEvents() not implemented');
}

/**
 * Task 5.2 — Query by discriminator field — 5 points
 * @returns {{ labResults: object[], flaggedLabs: object[], referrals: object[] }}
 */
export async function task5_2_queryByType() {
    // TODO: Three separate find() queries on medical_events
    // Return { labResults, flaggedLabs, referrals }
    throw new Error('task5_2_queryByType() not implemented');
}

/**
 * Task 5.3 — Compound index on (type, patient_ref) — 5 points
 * @returns {string} index name
 */
export async function task5_3_addTypeIndex() {
    // TODO: createIndex({ type: 1, patient_ref: 1 }, { name: 'type_patient_ref_1' })
    // Return the index name
    throw new Error('task5_3_addTypeIndex() not implemented');
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
