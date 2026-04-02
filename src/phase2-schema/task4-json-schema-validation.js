/**
 * Task 4 — $jsonSchema Validation
 * Phase 2 — Schema Design Patterns
 *
 * INSTRUCTIONS:
 * Complete the three functions below to earn 20 points.
 *
 * Task 4.1 — $jsonSchema for doctors (7 pts)
 *   Apply a validator to the doctors collection enforcing:
 *     Required: doctor_id, first_name, last_name, specialty, email,
 *               hire_date, is_accepting_patients
 *     Types:    doctor_id → string, hire_date → date,
 *               is_accepting_patients → bool
 *   Use collMod if the collection already exists.
 *   Return the validator object.
 *
 * Task 4.2 — $jsonSchema for patients (7 pts)
 *   Apply a validator to the patients collection enforcing:
 *     Required: patient_id, first_name, last_name, date_of_birth,
 *               gender, status, registration_date
 *     Types:    date_of_birth → date, registration_date → date
 *     Enum:     gender in ['M','F','Other'], status in ['Active','Inactive','Pending']
 *   Use collMod if the collection already exists.
 *   Return the validator object.
 *
 * Task 4.3 — Verify rejection (6 pts)
 *   Attempt two invalid inserts (catch the errors):
 *     1. Doctor missing the 'specialty' field
 *     2. Patient with date_of_birth as a string instead of a Date
 *   Return { doctorRejected: boolean, patientRejected: boolean }
 *   Both should be true if your validators are correct.
 *
 * Required exports: connect, close,
 *   task4_1_doctorSchema, task4_2_patientSchema, task4_3_verifyRejection
 *
 * Run with: node src/phase2-schema/task4-json-schema-validation.js
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
 * Task 4.1 — $jsonSchema for doctors — 7 points
 * @returns {object} validator
 */
export async function task4_1_doctorSchema() {
    // TODO: Build a $jsonSchema validator and apply with collMod
    // Return the validator object
    throw new Error('task4_1_doctorSchema() not implemented');
}

/**
 * Task 4.2 — $jsonSchema for patients — 7 points
 * @returns {object} validator
 */
export async function task4_2_patientSchema() {
    // TODO: Build a $jsonSchema validator and apply with collMod
    // Return the validator object
    throw new Error('task4_2_patientSchema() not implemented');
}

/**
 * Task 4.3 — Verify rejection — 6 points
 * @returns {{ doctorRejected: boolean, patientRejected: boolean }}
 */
export async function task4_3_verifyRejection() {
    // TODO: Try to insert invalid docs and catch the errors
    // Return { doctorRejected, patientRejected }
    throw new Error('task4_3_verifyRejection() not implemented');
}

// ── main ───────────────────────────────────────────────────────────────────

async function main() {
    try {
        await connect();
        await task4_1_doctorSchema();
        await task4_2_patientSchema();
        await task4_3_verifyRejection();
        console.log('✅ Task 4 complete');
    } finally {
        await close();
    }
}

if (import.meta.url === `file://${process.argv[1]}`) { main(); }
