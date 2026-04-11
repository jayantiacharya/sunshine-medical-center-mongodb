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
 * Task 3.1 — Text index + $text queries — 8 points
*/

export async function task3_1_textIndex() {
    // TODO: Create text index { notes: 'text', diagnosis: 'text' }
    //       Query with $text / $search and sort by textScore
    // Return { indexName, diabetesResults, medicationResults }
    
    const indexName = 'notes_diagnosis_text';
    
    // Drop index if it exists
    try {
        await db.collection('treatments').dropIndex(indexName);
    } catch (e) {
        // Index doesn't exist yet
    }
    
    // Create text index on notes and diagnosis fields
    await db.collection('treatments').createIndex(
        { notes: 'text', diagnosis: 'text' },
        { name: indexName }
    );
    
    console.log('\nCreated text index:', indexName);
    
    // Query for 'diabetes' with text score sorting
    const diabetesResults = await db.collection('treatments')
        .find(
            { $text: { $search: 'diabetes' } },
            { score: { $meta: 'textScore' } }
        )
        .sort({ score: { $meta: 'textScore' } })
        .toArray();
    
    console.log('Diabetes search results:', diabetesResults.length);
    
    // Query for 'medication' with text score sorting
    const medicationResults = await db.collection('treatments')
        .find(
            { $text: { $search: 'medication' } },
            { score: { $meta: 'textScore' } }
        )
        .sort({ score: { $meta: 'textScore' } })
        .toArray();
    
    console.log('Medication search results:', medicationResults.length);
    
    return { indexName, diabetesResults, medicationResults };
}

/**
 * Task 3.2 — Create and drop a temporary index — 4 points
 * @returns {string} name of the dropped index
 */
export async function task3_2_dropIndex() {
    // TODO: createIndex then dropIndex
    // Return the dropped index name
    
    const indexName = 'registration_date_temp';
    
    // Drop if exists from previous run
    try {
        await db.collection('patients').dropIndex(indexName);
    } catch (e) {
        // Index doesn't exist yet
    }
    
    // Create temporary index
    await db.collection('patients').createIndex(
        { registration_date: 1 },
        { name: indexName }
    );
    
    console.log('\nCreated temporary index:', indexName);
    
    // Verify index exists
    const beforeIndexes = await db.collection('patients').indexes();
    console.log('Indexes before drop:', beforeIndexes.length);
    
    // Drop the index
    await db.collection('patients').dropIndex(indexName);
    
    console.log('Dropped index:', indexName);
    
    // Verify index is gone
    const afterIndexes = await db.collection('patients').indexes();
    console.log('Indexes after drop:', afterIndexes.length);
    
    return indexName;
}

/**
 * Task 3.3 — Index report — 3 points
 * @returns {{ [collection: string]: object[] }}
 */
export async function task3_3_indexReport() {
    // TODO: Call col.indexes() on each collection
    // Return { doctors, patients, appointments, treatments }
    
    const doctorsIndexes = await db.collection('doctors').indexes();
    const patientsIndexes = await db.collection('patients').indexes();
    const appointmentsIndexes = await db.collection('appointments').indexes();
    const treatmentsIndexes = await db.collection('treatments').indexes();
    
    console.log('\nIndex Report:');
    console.log('Doctors:', doctorsIndexes.length);
    console.log('Patients:', patientsIndexes.length);
    console.log('Appointments:', appointmentsIndexes.length);
    console.log('Treatments:', treatmentsIndexes.length);
    
    return {
        doctors: doctorsIndexes,
        patients: patientsIndexes,
        appointments: appointmentsIndexes,
        treatments: treatmentsIndexes
    };
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
