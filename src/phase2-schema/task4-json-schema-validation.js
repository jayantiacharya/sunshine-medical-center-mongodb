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
 * Task 4.1 — $jsonSchema for doctors — 7 points
 * @returns {object} validator
 */
export async function task4_1_doctorSchema() {
    // TODO: Build a $jsonSchema validator and apply with collMod
    // Return the validator object
     const validator = {
        $jsonSchema: {
            bsonType: 'object',
            required: [
                'doctor_id',
                'first_name',
                'last_name',
                'specialty',
                'email',
                'hire_date',
                'is_accepting_patients'
            ],
            properties: {
                doctor_id: { bsonType: 'string' },
                first_name: { bsonType: 'string' },
                last_name: { bsonType: 'string' },
                specialty: { bsonType: 'string' },
                email: { bsonType: 'string' },
                hire_date: { bsonType: 'date' },
                is_accepting_patients: { bsonType: 'bool' }
            }
        }
    };
    
    await db.command({
        collMod: 'doctors',
        validator: validator,
        validationLevel: 'strict',
        validationAction: 'error'
    });
    
    console.log('\nApplied validator to doctors collection');
    
    return validator;

}

/**
 * Task 4.2 — $jsonSchema for patients — 7 points
 * @returns {object} validator
 */
export async function task4_2_patientSchema() {
    // TODO: Build a $jsonSchema validator and apply with collMod
    // Return the validator object
    
    const validator = {
        $jsonSchema: {
            bsonType: 'object',
            required: [
                'patient_id',
                'first_name',
                'last_name',
                'date_of_birth',
                'gender',
                'status',
                'registration_date'
            ],
            properties: {
                patient_id: { bsonType: 'string' },
                first_name: { bsonType: 'string' },
                last_name: { bsonType: 'string' },
                date_of_birth: { bsonType: 'date' },
                gender: { 
                    bsonType: 'string',
                    enum: ['M', 'F', 'Other']
                },
                status: { 
                    bsonType: 'string',
                    enum: ['Active', 'Inactive', 'Pending']
                },
                registration_date: { bsonType: 'date' }
            }
        }
    };
    
    await db.command({
        collMod: 'patients',
        validator: validator,
        validationLevel: 'strict',
        validationAction: 'error'
    });
    
    console.log('\nApplied validator to patients collection');
    
    return validator;
}

/**
 * Task 4.3 — Verify rejection — 6 points
 * @returns {{ doctorRejected: boolean, patientRejected: boolean }}
 */
export async function task4_3_verifyRejection() {
    // TODO: Try to insert invalid docs and catch the errors
    // Return { doctorRejected, patientRejected }
    
    let doctorRejected = false;
    let patientRejected = false;
    
    // Try to insert invalid doctor (missing specialty)
    try {
        await db.collection('doctors').insertOne({
            doctor_id: 'D999',
            first_name: 'Test',
            last_name: 'Doctor',
            email: 'test@test.com',
            hire_date: new Date(),
            is_accepting_patients: true
            // specialty missing intentionally
        });
        console.log('Doctor insert succeeded (should have failed)');
    } catch (e) {
        doctorRejected = true;
        console.log('Doctor insert rejected (missing specialty)');
    }
    
    // Try to insert invalid patient (date_of_birth as string)
    try {
        await db.collection('patients').insertOne({
            patient_id: 'P999',
            first_name: 'Test',
            last_name: 'Patient',
            date_of_birth: '1990-01-01', // string instead of Date
            gender: 'M',
            status: 'Active',
            registration_date: new Date()
        });
        console.log('Patient insert succeeded (should have failed)');
    } catch (e) {
        patientRejected = true;
        console.log('Patient insert rejected (date_of_birth as string)');
    }
    
    return { doctorRejected, patientRejected };
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
