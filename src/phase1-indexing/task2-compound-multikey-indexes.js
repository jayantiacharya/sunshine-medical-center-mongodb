/**
 * Task 2 — Compound & Multikey Indexes
 * Phase 1 — Indexing & Query Performance
 *
 * INSTRUCTIONS:
 * Complete the three functions below to earn 20 points.
 *
 * Task 2.1 — ESR-based compound index on appointments (10 pts)
 *   Business query to optimize:
 *     db.collection('appointments')
 *       .find({ doctor_ref: 'D001', status: 'Scheduled' })
 *       .sort({ appointment_date: 1 })
 *   Apply the ESR rule (Equality → Sort → Range) to design the index key.
 *   Create the index with name: 'doctor_status_date_1'.
 *   Run explain() before and after to show the improvement.
 *   Return the index name.
 *
 * Task 2.2 — Multikey index on patients.allergies[] (5 pts)
 *   patients.allergies is an array field.
 *   Create an index on it (name: 'allergies_1').
 *   MongoDB will automatically mark it as multikey.
 *   Return the index name.
 *
 * Task 2.3 — List indexes (5 pts)
 *   Use collection.indexes() to list all indexes on appointments and patients.
 *   Return { appointmentIndexes, patientIndexes }.
 *
 * Required exports: connect, close,
 *   task2_1_compoundIndex, task2_2_multikeyIndex, task2_3_listIndexes
 *
 * Run with: node src/phase1-indexing/task2-compound-multikey-indexes.js
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
 * Task 2.1 — ESR compound index — 10 points
 * @returns {string} index name
 */
export async function task2_1_compoundIndex() {
    // TODO: Create index { doctor_ref: 1, status: 1, appointment_date: 1 }
    //       with name 'doctor_status_date_1'
    // Return the index name (string)
    throw new Error('task2_1_compoundIndex() not implemented');
}

/**
 * Task 2.2 — Multikey index — 5 points
 * @returns {string} index name
 */
export async function task2_2_multikeyIndex() {
    // TODO: Create index { allergies: 1 } with name 'allergies_1' on patients collection
    // Return the index name (string)
    throw new Error('task2_2_multikeyIndex() not implemented');
}

/**
 * Task 2.3 — List indexes — 5 points
 * @returns {{ appointmentIndexes: object[], patientIndexes: object[] }}
 */
export async function task2_3_listIndexes() {
    // TODO: Call collection.indexes() on both appointments and patients
    // Return { appointmentIndexes, patientIndexes }
    throw new Error('task2_3_listIndexes() not implemented');
}

// ── main ───────────────────────────────────────────────────────────────────

async function main() {
    try {
        await connect();
        await task2_1_compoundIndex();
        await task2_2_multikeyIndex();
        await task2_3_listIndexes();
        console.log('✅ Task 2 complete');
    } finally {
        await close();
    }
}

if (import.meta.url === `file://${process.argv[1]}`) { main(); }
