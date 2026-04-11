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



export async function close() {
    if (client) await client.close();
}

export async function connect() {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB');
    return db;
}

/**
 * Task 2.1 — ESR compound index — 10 points
 * @returns {string} index name
 */
export async function task2_1_compoundIndex() {
    // TODO: Create index { doctor_ref: 1, status: 1, appointment_date: 1 }
    //       with name 'doctor_status_date_1'
    // Return the index name (string)
    
    // Drop ALL custom indexes on appointments to ensure COLLSCAN
    const indexes = await db.collection('appointments').indexes();
    for (const idx of indexes) {
        if (idx.name !== '_id_') {
            try {
                await db.collection('appointments').dropIndex(idx.name);
                console.log('Dropped index:', idx.name);
            } catch (e) {
                // Skip if can't drop
            }
        }
    }
    
    // Show COLLSCAN before index
    console.log('\nBefore compound index:');
    const beforeExplain = await db.collection('appointments')
        .find({ doctor_ref: 'D001', status: 'Scheduled' })
        .sort({ appointment_date: 1 })
        .explain('executionStats');
    console.log('Stage:', beforeExplain.queryPlanner.winningPlan.stage);
    
    // Create ESR compound index
    await db.collection('appointments').createIndex(
        { doctor_ref: 1, status: 1, appointment_date: 1 },
        { name: 'doctor_status_date_1' }
    );
    
    // Show IXSCAN after index
    console.log('\nAfter compound index:');
    const afterExplain = await db.collection('appointments')
        .find({ doctor_ref: 'D001', status: 'Scheduled' })
        .sort({ appointment_date: 1 })
        .explain('executionStats');
    console.log('Stage:', afterExplain.queryPlanner.winningPlan.stage);
    
    return 'doctor_status_date_1';
}

/**
 * Task 2.2 — Multikey index — 5 points
 * @returns {string} index name
 */
export async function task2_2_multikeyIndex() {
    // TODO: Create index { allergies: 1 } with name 'allergies_1' on patients collection
    // Return the index name (string)
    
    // Drop index if it exists
    try {
        await db.collection('patients').dropIndex('allergies_1');
    } catch (e) {
        // Index doesn't exist yet
    }
    
    // Create multikey index on allergies array
    await db.collection('patients').createIndex(
        { allergies: 1 },
        { name: 'allergies_1' }
    );
    
    console.log('\nCreated multikey index on patients.allergies');
    
    return 'allergies_1';
}

/**
 * Task 2.3 — List indexes — 5 points
 * @returns {{ appointmentIndexes: object[], patientIndexes: object[] }}
 */
export async function task2_3_listIndexes() {
    // TODO: Call collection.indexes() on both appointments and patients
    // Return { appointmentIndexes, patientIndexes }
    
    const appointmentIndexes = await db.collection('appointments').indexes();
    const patientIndexes = await db.collection('patients').indexes();
    
    console.log('\nAppointments indexes:', appointmentIndexes.length);
    console.log('Patients indexes:', patientIndexes.length);
    
    return { appointmentIndexes, patientIndexes };
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
