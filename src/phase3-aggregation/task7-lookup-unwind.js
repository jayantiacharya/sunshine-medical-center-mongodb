/**
 * Task 7 — $lookup Joins & $unwind
 * Phase 3 — Advanced Aggregation Pipelines
 *
 * INSTRUCTIONS:
 * Complete the three functions below to earn 25 points.
 *
 * Task 7.1 — $lookup: appointments → doctors (8 pts)
 *   Join the appointments collection with the doctors collection.
 *   localField: 'doctor_ref', foreignField: 'doctor_id'
 *   $unwind the resulting 'doctor' array (1:1 relationship).
 *   $project to include:
 *     appointment_id, appointment_date, status, patient_ref,
 *     doctor_name (concat "Dr. " + first_name + " " + last_name),
 *     doctor specialty
 *   Sort by appointment_date ascending.
 *   Return array of enriched documents.
 *
 * Task 7.2 — $lookup: appointments → patients (8 pts)
 *   Same pattern but join to patients instead.
 *   localField: 'patient_ref', foreignField: 'patient_id'
 *   Include: appointment_id, appointment_date, status, doctor_ref,
 *            patient_name (first + " " + last), reason
 *   Return array of enriched documents.
 *
 * Task 7.3 — $unwind: treatments.medications[] (9 pts)
 *   Start from the treatments collection.
 *   Filter to treatments where medications array is not empty.
 *   $unwind the medications array.
 *   Project each flattened item:
 *     treatment_id, patient_ref, diagnosis,
 *     medication_name (from medications.name),
 *     dosage, frequency
 *   Return array of one-row-per-medication documents.
 *
 * Required exports: connect, close,
 *   task7_1_lookupDoctors, task7_2_lookupPatients, task7_3_unwindMedications
 *
 * Run with: node src/phase3-aggregation/task7-lookup-unwind.js
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
 * Task 7.1 — $lookup appointments → doctors — 8 points
 * @returns {object[]}
 */
export async function task7_1_lookupDoctors() {
    // TODO: aggregate with $lookup, $unwind, $project, $sort
    throw new Error('task7_1_lookupDoctors() not implemented');
}

/**
 * Task 7.2 — $lookup appointments → patients — 8 points
 * @returns {object[]}
 */
export async function task7_2_lookupPatients() {
    // TODO: aggregate with $lookup, $unwind, $project, $sort
    throw new Error('task7_2_lookupPatients() not implemented');
}

/**
 * Task 7.3 — $unwind treatments.medications[] — 9 points
 * @returns {object[]} one document per medication
 */
export async function task7_3_unwindMedications() {
    // TODO: $match → $unwind → $project → $sort
    throw new Error('task7_3_unwindMedications() not implemented');
}

// ── main ───────────────────────────────────────────────────────────────────

async function main() {
    try {
        await connect();
        await task7_1_lookupDoctors();
        await task7_2_lookupPatients();
        await task7_3_unwindMedications();
        console.log('✅ Task 7 complete');
    } finally {
        await close();
    }
}

if (import.meta.url === `file://${process.argv[1]}`) { main(); }
