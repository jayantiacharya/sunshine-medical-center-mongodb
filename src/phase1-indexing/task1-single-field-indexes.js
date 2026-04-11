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
 * Task 1.1 — Baseline explain() — 5 points
 * @returns {{ doctorsPlan: object, patientsPlan: object }}
 */
export async function task1_1_baselineExplain() {
    // TODO: Drop any existing custom indexes, then run explain() on both queries
    // Hint: collection.find({ ... }).explain("executionStats")
    // Return { doctorsPlan, patientsPlan }
    
    // Drop any existing custom indexes to ensure COLLSCAN
    try {
        await db.collection('doctors').dropIndex('specialty_1');
        await db.collection('patients').dropIndex('status_1');
    } catch (e) {
        // Indexes might not exist yet, that's fine
        console.log('No existing indexes to drop');
    }
    
    // Run explain() on doctors query
    const doctorsExplain = await db.collection('doctors')
        .find({ specialty: 'Cardiology' })
        .explain('executionStats');
    
    // Run explain() on patients query
    const patientsExplain = await db.collection('patients')
        .find({ status: 'Active' })
        .explain('executionStats');
    
    console.log('\nDoctors Query Winning Plan:');
    console.log('Stage:', doctorsExplain.queryPlanner.winningPlan.stage);
    
    console.log('\nPatients Query Winning Plan:');
    console.log('Stage:', patientsExplain.queryPlanner.winningPlan.stage);
    
    return {
        doctorsPlan: doctorsExplain.queryPlanner.winningPlan,
        patientsPlan: patientsExplain.queryPlanner.winningPlan
    };
}

/**
 * Task 1.2 — Create single-field indexes — 5 points
 * @returns {string[]} Array of index names created
 */
export async function task1_2_createSingleFieldIndexes() {
    // TODO: Create three single-field indexes
    // Hint: db.collection('doctors').createIndex({ field: 1 })
    // Return array of index names
    
    // Create index on doctors.specialty
    const doctorsIndex = await db.collection('doctors')
        .createIndex({ specialty: 1 }, { name: 'specialty_1' });
    
    // Create index on patients.status
    const patientsIndex = await db.collection('patients')
        .createIndex({ status: 1 }, { name: 'status_1' });
    
    // Create index on appointments.appointment_date
    const appointmentsIndex = await db.collection('appointments')
        .createIndex({ appointment_date: 1 }, { name: 'appointment_date_1' });
    
    console.log('Created indexes:', doctorsIndex, patientsIndex, appointmentsIndex);
    
    return ['specialty_1', 'status_1', 'appointment_date_1'];
}

/**
 * Task 1.3 — Verify IXSCAN — 5 points
 * @returns {{ doctorsStage: string, patientsStage: string }}
 */
export async function task1_3_verifyIxscan() {
    // TODO: Re-run the same explain() queries. Extract the winning plan stage.
    // Return { doctorsStage, patientsStage }
    
    // Run explain() on doctors query with index
    const doctorsExplain = await db.collection('doctors')
        .find({ specialty: 'Cardiology' })
        .explain('executionStats');
    
    // Run explain() on patients query with index
    const patientsExplain = await db.collection('patients')
        .find({ status: 'Active' })
        .explain('executionStats');
    
    const doctorsStage = doctorsExplain.queryPlanner.winningPlan.stage;
    const patientsStage = patientsExplain.queryPlanner.winningPlan.stage;
    
    console.log('\nDoctors Query Stage (after index):', doctorsStage);
    console.log('Patients Query Stage (after index):', patientsStage);
    
    return { doctorsStage, patientsStage };
}
// ─── main ───────────────────────────────────────────────────────────────────

// ─── main ───────────────────────────────────────────────────────────────────

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

if (import.meta.url === `file://${process.argv[1]}`) { 
    main(); 
}
