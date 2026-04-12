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
 * Task 7.1 — $lookup appointments → doctors — 8 points
 * @returns {object[]}
 */
export async function task7_1_lookupDoctors() {
    // TODO: aggregate with $lookup, $unwind, $project, $sort
    
    const pipeline = [
        {
            $lookup: {
                from: 'doctors',
                localField: 'doctor_ref',
                foreignField: 'doctor_id',
                as: 'doctor'
            }
        },
        {
            $unwind: '$doctor'
        },
        {
            $project: {
                appointment_id: 1,
                appointment_date: 1,
                status: 1,
                patient_ref: 1,
                doctor_name: {
                    $concat: ['Dr. ', '$doctor.first_name', ' ', '$doctor.last_name']
                },
                specialty: '$doctor.specialty'
            }
        },
        {
            $sort: { appointment_date: 1 }
        }
    ];
    
    const results = await db.collection('appointments').aggregate(pipeline).toArray();
    
    console.log('\nAppointments with doctor info:', results.length);
    if (results.length > 0) {
        console.log('Sample:', JSON.stringify(results[0], null, 2));
    }
    
    return results;
}

/**
 * Task 7.2 — $lookup appointments → patients — 8 points
 * @returns {object[]}
 */
export async function task7_2_lookupPatients() {
    // TODO: aggregate with $lookup, $unwind, $project, $sort
    
    const pipeline = [
        {
            $lookup: {
                from: 'patients',
                localField: 'patient_ref',
                foreignField: 'patient_id',
                as: 'patient'
            }
        },
        {
            $unwind: '$patient'
        },
        {
            $project: {
                appointment_id: 1,
                appointment_date: 1,
                status: 1,
                doctor_ref: 1,
                patient_name: {
                    $concat: ['$patient.first_name', ' ', '$patient.last_name']
                },
                reason: 1
            }
        },
        {
            $sort: { appointment_date: 1 }
        }
    ];
    
    const results = await db.collection('appointments').aggregate(pipeline).toArray();
    
    console.log('\nAppointments with patient info:', results.length);
    if (results.length > 0) {
        console.log('Sample:', JSON.stringify(results[0], null, 2));
    }
    
    return results;
}

/**
 * Task 7.3 — $unwind treatments.medications[] — 9 points
 * @returns {object[]} one document per medication
 */
export async function task7_3_unwindMedications() {
    // TODO: $match → $unwind → $project → $sort
    
    const pipeline = [
        {
            $match: {
                medications: { $ne: [], $exists: true }
            }
        },
        {
            $unwind: '$medications'
        },
        {
            $project: {
                treatment_id: 1,
                patient_ref: 1,
                diagnosis: 1,
                medication_name: '$medications.name',
                dosage: '$medications.dosage',
                frequency: '$medications.frequency'
            }
        },
        {
            $sort: { treatment_id: 1 }
        }
    ];
    
    const results = await db.collection('treatments').aggregate(pipeline).toArray();
    
    console.log('\nFlattened medications:', results.length);
    if (results.length > 0) {
        console.log('Sample:', JSON.stringify(results[0], null, 2));
    }
    
    return results;
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
