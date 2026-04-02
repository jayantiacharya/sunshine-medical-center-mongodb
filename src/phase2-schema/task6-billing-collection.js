/**
 * Task 6 — Billing Collection (Referencing Pattern)
 * Phase 2 — Schema Design Patterns
 *
 * INSTRUCTIONS:
 * Complete the two functions below to earn 20 points.
 *
 * Task 6.1 — Design justification (manually graded, see docs/SCHEMA.md)
 *   Answer: Should billing embed into appointments or reference them?
 *   Justify your answer using: access patterns, cardinality, update frequency.
 *
 * Task 6.2 — Create billing collection (10 pts)
 *   Create a `billing` collection with at least 6 documents.
 *   Each document must include:
 *     bill_id (string)           — unique identifier e.g. "BILL001"
 *     patient_ref (string)       — reference to patient_id e.g. "P10001"
 *     appointment_ref (string)   — reference to appointment_id e.g. "APT001"
 *     billed_date (Date)
 *     billed_amount (number)     — total charge
 *     insurance_paid (number)    — amount paid by insurance
 *     patient_owed (number)      — amount patient still owes
 *     payment_status (string)    — "Paid" or "Outstanding"  ← use this exact field name
 *     insurance_provider (string)
 *
 *   Requirements:
 *     - At least 6 documents referencing at least 3 different patients
 *     - Mix of "Paid" and "Outstanding" payment_status values
 *     - Use patient_ref values from seeded data: P10001–P10005
 *   Return insertedCount.
 *
 * Task 6.3 — Billing queries (10 pts)
 *   Run:
 *     1. Find all bills with payment_status "Outstanding"
 *     2. Find all bills for patient P10001
 *   Return { outstanding, patient }
 *
 * Required exports: connect, close,
 *   task6_2_createBilling, task6_3_billingQueries
 *
 * Run with: node src/phase2-schema/task6-billing-collection.js
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
 * Task 6.2 — Create billing collection — 10 points
 * @returns {number} insertedCount
 */
export async function task6_2_createBilling() {
    // TODO: deleteMany then insertMany with at least 6 billing documents
    // Return result.insertedCount
    throw new Error('task6_2_createBilling() not implemented');
}

/**
 * Task 6.3 — Billing queries — 5 points
 * @returns {{ outstanding: object[], patient: object[] }}
 */
export async function task6_3_billingQueries() {
    // TODO: Find outstanding bills and bills for P10001
    // Return { outstanding, patient }
    throw new Error('task6_3_billingQueries() not implemented');
}

// ── main ───────────────────────────────────────────────────────────────────

async function main() {
    try {
        await connect();
        await task6_2_createBilling();
        await task6_3_billingQueries();
        console.log('✅ Task 6 complete');
    } finally {
        await close();
    }
}

if (import.meta.url === `file://${process.argv[1]}`) { main(); }
