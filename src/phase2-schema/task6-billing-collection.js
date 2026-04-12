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
 * Task 6.2 — Create billing collection — 10 points
 * @returns {number} insertedCount
 */
export async function task6_2_createBilling() {
    // TODO: deleteMany then insertMany with at least 6 billing documents
    // Return result.insertedCount
    
    // Clear existing billing documents
    await db.collection('billing').deleteMany({});
    
    const bills = [
        {
            bill_id: 'BILL001',
            patient_ref: 'P10001',
            appointment_ref: 'APT001',
            billed_date: new Date('2024-01-15'),
            billed_amount: 250.00,
            insurance_paid: 200.00,
            patient_owed: 50.00,
            payment_status: 'Paid',
            insurance_provider: 'Blue Cross'
        },
        {
            bill_id: 'BILL002',
            patient_ref: 'P10002',
            appointment_ref: 'APT002',
            billed_date: new Date('2024-01-16'),
            billed_amount: 175.00,
            insurance_paid: 150.00,
            patient_owed: 25.00,
            payment_status: 'Outstanding',
            insurance_provider: 'Aetna'
        },
        {
            bill_id: 'BILL003',
            patient_ref: 'P10003',
            appointment_ref: 'APT003',
            billed_date: new Date('2024-01-17'),
            billed_amount: 450.00,
            insurance_paid: 400.00,
            patient_owed: 50.00,
            payment_status: 'Paid',
            insurance_provider: 'Cigna'
        },
        {
            bill_id: 'BILL004',
            patient_ref: 'P10001',
            appointment_ref: 'APT004',
            billed_date: new Date('2024-01-20'),
            billed_amount: 320.00,
            insurance_paid: 250.00,
            patient_owed: 70.00,
            payment_status: 'Outstanding',
            insurance_provider: 'Blue Cross'
        },
        {
            bill_id: 'BILL005',
            patient_ref: 'P10004',
            appointment_ref: 'APT005',
            billed_date: new Date('2024-01-22'),
            billed_amount: 125.00,
            insurance_paid: 100.00,
            patient_owed: 25.00,
            payment_status: 'Paid',
            insurance_provider: 'UnitedHealthcare'
        },
        {
            bill_id: 'BILL006',
            patient_ref: 'P10005',
            appointment_ref: 'APT006',
            billed_date: new Date('2024-01-25'),
            billed_amount: 600.00,
            insurance_paid: 300.00,
            patient_owed: 300.00,
            payment_status: 'Outstanding',
            insurance_provider: 'Medicare'
        }
    ];
    
    const result = await db.collection('billing').insertMany(bills);
    
    console.log('\nInserted', result.insertedCount, 'billing documents');
    
    return result.insertedCount;
}

/**
 * Task 6.3 — Billing queries — 5 points
 * @returns {{ outstanding: object[], patient: object[] }}
 */
export async function task6_3_billingQueries() {
    // TODO: Find outstanding bills and bills for P10001
    // Return { outstanding, patient }
    
    // Find all outstanding bills
    const outstanding = await db.collection('billing')
        .find({ payment_status: 'Outstanding' })
        .toArray();
    
    console.log('\nOutstanding bills found:', outstanding.length);
    
    // Find all bills for patient P10001
    const patient = await db.collection('billing')
        .find({ patient_ref: 'P10001' })
        .toArray();
    
    console.log('Bills for patient P10001:', patient.length);
    
    return { outstanding, patient };
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
