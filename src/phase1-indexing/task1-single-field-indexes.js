/**
 * Task 1 — Single-Field Indexes & explain()
 * Phase 1 — Indexing & Query Performance
 *
 * INSTRUCTIONS:
 * Complete the three functions below to earn 15 points.
 *
 * Task 1.1 — Baseline explain() (5 pts)
 *   Run explain("executionStats") on:
 *     db.collection('doctors').find({ specialty: 'Cardiology' })
 *     db.collection('patients').find({ status: 'Active' })
 *   Return the winningPlan for each query.
 *   Expected stage before indexes: COLLSCAN
 *
 * Task 1.2 — Create single-field indexes (5 pts)
 *   Create the following indexes:
 *     doctors.specialty       (ascending, name: 'specialty_1')
 *     patients.status         (ascending, name: 'status_1')
 *     appointments.appointment_date (ascending, name: 'appointment_date_1')
 *   Return an array of the three index names.
 *
 * Task 1.3 — Verify IXSCAN (5 pts)
 *   Re-run the same explain() queries from Task 1.1 AFTER creating indexes.
 *   Return { doctorsStage, patientsStage }.
 *   Expected stage after indexes: IXSCAN (or FETCH with IXSCAN inputStage)
 *
 * Required exports: connect, close,
 *   task1_1_baselineExplain, task1_2_createSingleFieldIndexes, task1_3_verifyIxscan
 *
 * Run with: node src/phase1-indexing/task1-single-field-indexes.js
 */

import { MongoClient } from 'mongodb';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:cs3550password@mongodb:27017/?authSource=admin';
const DB_NAME = 'sunshine_medical_center';

let client;
let db;

export async function connect() {
    // TODO: connect to MongoDB, set `client` and `db`
    throw new Error('connect() not implemented');
}

export async function close() {
    if (client) await client.close();
}

/**
 * Task 1.1 — Baseline explain() — 5 points
 * @returns {{ doctorsPlan: object, patientsPlan: object }}
 */
export async function task1_1_baselineExplain() {
    // TODO: Drop any existing custom indexes, then run explain() on both queries
    // Hint: collection.find({ ... }).explain("executionStats")
    // Return { doctorsPlan, patientsPlan }
    throw new Error('task1_1_baselineExplain() not implemented');
}

/**
 * Task 1.2 — Create single-field indexes — 5 points
 * @returns {string[]} names of created indexes
 */
export async function task1_2_createSingleFieldIndexes() {
    // TODO: db.collection('doctors').createIndex({ specialty: 1 }, { name: 'specialty_1' })
    //       db.collection('patients').createIndex({ status: 1 }, { name: 'status_1' })
    //       db.collection('appointments').createIndex({ appointment_date: 1 }, { name: 'appointment_date_1' })
    // Return [idx1, idx2, idx3]
    throw new Error('task1_2_createSingleFieldIndexes() not implemented');
}

/**
 * Task 1.3 — Verify IXSCAN — 5 points
 * @returns {{ doctorsStage: string, patientsStage: string }}
 */
export async function task1_3_verifyIxscan() {
    // TODO: Re-run the same explain() queries. Extract the winning plan stage.
    // Return { doctorsStage, patientsStage }
    throw new Error('task1_3_verifyIxscan() not implemented');
}

// ── main ───────────────────────────────────────────────────────────────────

async function main() {
    try {
        await connect();
        await task1_1_baselineExplain();
        await task1_2_createSingleFieldIndexes();
        await task1_3_verifyIxscan();
        console.log('✅ Task 1 complete');
    } finally {
        await close();
    }
}

if (import.meta.url === `file://${process.argv[1]}`) { main(); }
