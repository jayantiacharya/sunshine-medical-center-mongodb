/**
 * Task 3 — Text Index & Index Management
 * Phase 1 — Indexing & Query Performance
 *
 * INSTRUCTIONS:
 * Complete the three functions below to earn 15 points.
 *
 * Task 3.1 — Text index + $text queries (8 pts)
 *   Create a text index on treatments.notes AND treatments.diagnosis:
 *     { notes: 'text', diagnosis: 'text' }  name: 'notes_diagnosis_text'
 *   Run two $text queries:
 *     { $text: { $search: 'diabetes' } }
 *     { $text: { $search: 'medication' } }
 *   Sort results by textScore: { score: { $meta: 'textScore' } }
 *   Return { indexName, diabetesResults, medicationResults }
 *
 * Task 3.2 — Drop an index (4 pts)
 *   Create a temporary single-field index:
 *     { registration_date: 1 } on patients, name: 'registration_date_temp'
 *   Then drop it using collection.dropIndex(name).
 *   Return the name of the dropped index.
 *
 * Task 3.3 — Final index report (3 pts)
 *   Call collection.indexes() on doctors, patients, appointments, treatments.
 *   Return an object { doctors: [...], patients: [...], appointments: [...], treatments: [...] }
 *
 * Required exports: connect, close,
 *   task3_1_textIndex, task3_2_dropIndex, task3_3_indexReport
 *
 * Run with: node src/phase1-indexing/task3-text-index-management.js
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
 * Task 3.1 — Text index + $text queries — 8 points
 * @returns {{ indexName: string, diabetesResults: object[], medicationResults: object[] }}
 */
export async function task3_1_textIndex() {
    // TODO: Create text index { notes: 'text', diagnosis: 'text' }
    //       Query with $text / $search and sort by textScore
    // Return { indexName, diabetesResults, medicationResults }
    throw new Error('task3_1_textIndex() not implemented');
}

/**
 * Task 3.2 — Create and drop a temporary index — 4 points
 * @returns {string} name of the dropped index
 */
export async function task3_2_dropIndex() {
    // TODO: createIndex then dropIndex
    // Return the dropped index name
    throw new Error('task3_2_dropIndex() not implemented');
}

/**
 * Task 3.3 — Index report — 3 points
 * @returns {{ [collection: string]: object[] }}
 */
export async function task3_3_indexReport() {
    // TODO: Call col.indexes() on each collection
    // Return { doctors, patients, appointments, treatments }
    throw new Error('task3_3_indexReport() not implemented');
}

// ── main ───────────────────────────────────────────────────────────────────

async function main() {
    try {
        await connect();
        await task3_1_textIndex();
        await task3_2_dropIndex();
        await task3_3_indexReport();
        console.log('✅ Task 3 complete');
    } finally {
        await close();
    }
}

if (import.meta.url === `file://${process.argv[1]}`) { main(); }
