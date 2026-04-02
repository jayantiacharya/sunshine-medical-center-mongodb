/**
 * seed-database.js
 * Sunshine Medical Center — Full Database Seed
 *
 * Bootstraps all five core collections so that Project 6 tasks can run
 * against a complete starting dataset for Project 6 tasks.
 *
 * Collections seeded:
 *   doctors        — 3 documents
 *   patients       — 5 documents
 *   appointments   — 8 documents
 *   treatments     — 6 documents
 *   medical_history — embedded into patients (via update)
 *
 * Run with: node src/seed/seed-database.js
 */

import { MongoClient } from 'mongodb';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:cs3550password@mongodb:27017/?authSource=admin';
const DB_NAME = 'sunshine_medical_center';

let client;
let db;

async function connect() {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`✅ Connected to ${DB_NAME}`);
}

async function close() {
    if (client) await client.close();
}

async function seedDoctors() {
    const col = db.collection('doctors');
    await col.deleteMany({});
    await col.insertMany([
        {
            doctor_id: 'D001',
            first_name: 'Emily',
            last_name: 'Chen',
            specialty: 'Endocrinology',
            phone: '555-1001',
            email: 'echen@sunshine.com',
            hire_date: new Date('2015-06-01'),
            is_accepting_patients: true,
            categories: ['Endocrinology', 'Internal Medicine']
        },
        {
            doctor_id: 'D002',
            first_name: 'Michael',
            last_name: 'Roberts',
            specialty: 'Cardiology',
            phone: '555-1002',
            email: 'mroberts@sunshine.com',
            hire_date: new Date('2018-03-15'),
            is_accepting_patients: true,
            categories: ['Cardiology']
        },
        {
            doctor_id: 'D003',
            first_name: 'Sarah',
            last_name: 'Martinez',
            specialty: 'Internal Medicine',
            phone: '555-1003',
            email: 'smartinez@sunshine.com',
            hire_date: new Date('2020-01-10'),
            is_accepting_patients: false,
            categories: ['Internal Medicine', 'General Practice']
        }
    ]);
    console.log('🩺 Seeded doctors (3)');
}

async function seedPatients() {
    const col = db.collection('patients');
    await col.deleteMany({});
    await col.insertMany([
        {
            patient_id: 'P10001',
            first_name: 'John',
            last_name: 'Doe',
            date_of_birth: new Date('1985-03-15'),
            gender: 'M',
            contact: { phone: '555-2001', email: 'john.doe@email.com' },
            address: { street: '123 Main St', city: 'Ogden', state: 'UT', zip: '84401' },
            insurance: { provider: 'Blue Cross', policy_number: 'BC123456', group_number: 'GRP789' },
            registration_date: new Date('2024-01-15'),
            status: 'Active',
            primary_physician: 'Dr. Emily Chen',
            allergies: ['penicillin', 'sulfa'],
            medical_conditions: ['Type 2 Diabetes', 'Hypertension']
        },
        {
            patient_id: 'P10002',
            first_name: 'Jane',
            last_name: 'Smith',
            date_of_birth: new Date('1990-07-22'),
            gender: 'F',
            contact: { phone: '555-2002', email: 'jane.smith@email.com' },
            address: { street: '456 Oak Ave', city: 'Ogden', state: 'UT', zip: '84402' },
            insurance: { provider: 'Aetna', policy_number: 'AET789012', group_number: 'GRP123' },
            registration_date: new Date('2024-02-10'),
            status: 'Active',
            primary_physician: 'Dr. Emily Chen',
            allergies: ['aspirin'],
            medical_conditions: ['Asthma']
        },
        {
            patient_id: 'P10003',
            first_name: 'Robert',
            last_name: 'Johnson',
            date_of_birth: new Date('1978-11-30'),
            gender: 'M',
            contact: { phone: '555-2003', email: 'robert.johnson@email.com' },
            address: { street: '789 Pine Rd', city: 'Ogden', state: 'UT', zip: '84403' },
            insurance: { provider: 'United Health', policy_number: 'UH345678', group_number: 'GRP456' },
            registration_date: new Date('2024-03-05'),
            status: 'Active',
            primary_physician: 'Dr. Michael Roberts',
            allergies: [],
            medical_conditions: ['Coronary Artery Disease']
        },
        {
            patient_id: 'P10004',
            first_name: 'Maria',
            last_name: 'Garcia',
            date_of_birth: new Date('1965-05-18'),
            gender: 'F',
            contact: { phone: '555-2004', email: 'maria.garcia@email.com' },
            address: { street: '321 Elm St', city: 'Ogden', state: 'UT', zip: '84404' },
            insurance: { provider: 'Cigna', policy_number: 'CG901234', group_number: 'GRP789' },
            registration_date: new Date('2024-03-20'),
            status: 'Active',
            primary_physician: 'Dr. Sarah Martinez',
            allergies: ['latex', 'ibuprofen'],
            medical_conditions: ['Hypothyroidism', 'Osteoarthritis']
        },
        {
            patient_id: 'P10005',
            first_name: 'David',
            last_name: 'Wilson',
            date_of_birth: new Date('2000-09-10'),
            gender: 'M',
            contact: { phone: '555-2005', email: 'david.wilson@email.com' },
            address: { street: '654 Maple Dr', city: 'Ogden', state: 'UT', zip: '84405' },
            insurance: { provider: 'Blue Cross', policy_number: 'BC567890', group_number: 'GRP012' },
            registration_date: new Date('2024-04-01'),
            status: 'Active',
            primary_physician: 'Dr. Sarah Martinez',
            allergies: [],
            medical_conditions: []
        }
    ]);
    console.log('🧑‍🤝‍🧑 Seeded patients (5)');
}

async function seedAppointments() {
    const col = db.collection('appointments');
    await col.deleteMany({});
    await col.insertMany([
        {
            appointment_id: 'APT001',
            patient_ref: 'P10001',
            doctor_ref: 'D001',
            appointment_date: new Date('2025-09-15'),
            appointment_time: '09:00',
            duration_minutes: 30,
            reason: 'Follow-up for diabetes management',
            status: 'Completed',
            notes: 'Blood sugar levels improving',
            created_at: new Date('2025-09-01')
        },
        {
            appointment_id: 'APT002',
            patient_ref: 'P10002',
            doctor_ref: 'D001',
            appointment_date: new Date('2026-04-20'),
            appointment_time: '10:00',
            duration_minutes: 45,
            reason: 'Annual physical examination',
            status: 'Scheduled',
            notes: '',
            created_at: new Date('2026-03-15')
        },
        {
            appointment_id: 'APT003',
            patient_ref: 'P10003',
            doctor_ref: 'D002',
            appointment_date: new Date('2025-10-05'),
            appointment_time: '11:00',
            duration_minutes: 60,
            reason: 'Cardiac stress test follow-up',
            status: 'Completed',
            notes: 'EKG results normal',
            created_at: new Date('2025-09-20')
        },
        {
            appointment_id: 'APT004',
            patient_ref: 'P10004',
            doctor_ref: 'D003',
            appointment_date: new Date('2026-04-15'),
            appointment_time: '14:00',
            duration_minutes: 30,
            reason: 'Thyroid function review',
            status: 'Scheduled',
            notes: '',
            created_at: new Date('2026-04-01')
        },
        {
            appointment_id: 'APT005',
            patient_ref: 'P10005',
            doctor_ref: 'D003',
            appointment_date: new Date('2026-03-01'),
            appointment_time: '09:30',
            duration_minutes: 15,
            reason: 'Sports physical clearance',
            status: 'Completed',
            notes: 'Cleared for all activities',
            created_at: new Date('2026-02-15')
        },
        {
            appointment_id: 'APT006',
            patient_ref: 'P10001',
            doctor_ref: 'D001',
            appointment_date: new Date('2026-05-10'),
            appointment_time: '08:00',
            duration_minutes: 30,
            reason: 'A1C lab review',
            status: 'Scheduled',
            notes: '',
            created_at: new Date('2026-04-02')
        },
        {
            appointment_id: 'APT007',
            patient_ref: 'P10002',
            doctor_ref: 'D002',
            appointment_date: new Date('2025-12-10'),
            appointment_time: '15:00',
            duration_minutes: 45,
            reason: 'Cardiology consult',
            status: 'Cancelled',
            notes: 'Patient rescheduled',
            created_at: new Date('2025-11-30')
        },
        {
            appointment_id: 'APT008',
            patient_ref: 'P10003',
            doctor_ref: 'D003',
            appointment_date: new Date('2026-06-01'),
            appointment_time: '10:30',
            duration_minutes: 30,
            reason: 'General wellness check',
            status: 'Scheduled',
            notes: '',
            created_at: new Date('2026-04-02')
        }
    ]);
    console.log('📅 Seeded appointments (8)');
}

async function seedTreatments() {
    const col = db.collection('treatments');
    await col.deleteMany({});
    await col.insertMany([
        {
            treatment_id: 'TRT001',
            patient_ref: 'P10001',
            doctor_ref: 'D001',
            appointment_ref: 'APT001',
            diagnosis: 'Type 2 Diabetes — controlled',
            treatment_date: new Date('2025-09-15'),
            treatment_type: 'Medication Adjustment',
            medications: [
                { name: 'Metformin', dosage: '1000mg', frequency: 'twice daily' },
                { name: 'Lisinopril', dosage: '10mg', frequency: 'once daily' }
            ],
            notes: 'Reduced Metformin dose; monitor A1C in 3 months',
            follow_up_required: true,
            cost: 150.00
        },
        {
            treatment_id: 'TRT002',
            patient_ref: 'P10003',
            doctor_ref: 'D002',
            appointment_ref: 'APT003',
            diagnosis: 'Stable angina',
            treatment_date: new Date('2025-10-05'),
            treatment_type: 'Cardiac Evaluation',
            medications: [
                { name: 'Aspirin', dosage: '81mg', frequency: 'once daily' },
                { name: 'Atorvastatin', dosage: '40mg', frequency: 'once daily' }
            ],
            notes: 'Continue current regimen; stress test in 6 months',
            follow_up_required: true,
            cost: 275.00
        },
        {
            treatment_id: 'TRT003',
            patient_ref: 'P10005',
            doctor_ref: 'D003',
            appointment_ref: 'APT005',
            diagnosis: 'Healthy — no findings',
            treatment_date: new Date('2026-03-01'),
            treatment_type: 'Preventive Care',
            medications: [],
            notes: 'Cleared for competitive sports',
            follow_up_required: false,
            cost: 75.00
        },
        {
            treatment_id: 'TRT004',
            patient_ref: 'P10004',
            doctor_ref: 'D003',
            appointment_ref: 'APT004',
            diagnosis: 'Hypothyroidism — under-treated',
            treatment_date: new Date('2025-11-20'),
            treatment_type: 'Medication Adjustment',
            medications: [
                { name: 'Levothyroxine', dosage: '75mcg', frequency: 'once daily' }
            ],
            notes: 'Increase dose; retest TSH in 6 weeks',
            follow_up_required: true,
            cost: 120.00
        },
        {
            treatment_id: 'TRT005',
            patient_ref: 'P10002',
            doctor_ref: 'D001',
            appointment_ref: 'APT002',
            diagnosis: 'Mild asthma — intermittent',
            treatment_date: new Date('2025-08-10'),
            treatment_type: 'Preventive Care',
            medications: [
                { name: 'Albuterol', dosage: '90mcg', frequency: 'as needed' }
            ],
            notes: 'Continue rescue inhaler; avoid known triggers',
            follow_up_required: false,
            cost: 90.00
        },
        {
            treatment_id: 'TRT006',
            patient_ref: 'P10001',
            doctor_ref: 'D001',
            appointment_ref: 'APT006',
            diagnosis: 'Type 2 Diabetes — A1C elevated',
            treatment_date: new Date('2025-12-01'),
            treatment_type: 'Lab Review',
            medications: [
                { name: 'Metformin', dosage: '1000mg', frequency: 'twice daily' }
            ],
            notes: 'A1C at 7.8%; dietary counselling recommended',
            follow_up_required: true,
            cost: 200.00
        }
    ]);
    console.log('💊 Seeded treatments (6)');
}

async function addMedicalHistory() {
    const col = db.collection('patients');
    const histories = {
        P10001: [
            { event_date: new Date('2023-05-10'), event_type: 'Diagnosis', description: 'Diagnosed with Type 2 Diabetes', provider: 'Dr. Emily Chen' },
            { event_date: new Date('2023-11-20'), event_type: 'Lab Result', description: 'A1C: 8.2%', provider: 'Lab Services' },
            { event_date: new Date('2024-04-15'), event_type: 'Medication Change', description: 'Started Lisinopril for blood pressure', provider: 'Dr. Emily Chen' }
        ],
        P10002: [
            { event_date: new Date('2020-03-12'), event_type: 'Diagnosis', description: 'Diagnosed with mild intermittent asthma', provider: 'Dr. Emily Chen' },
            { event_date: new Date('2022-09-05'), event_type: 'ER Visit', description: 'Asthma exacerbation, treated and released', provider: 'Ogden Regional ER' }
        ],
        P10003: [
            { event_date: new Date('2019-08-20'), event_type: 'Diagnosis', description: 'Diagnosed with Coronary Artery Disease', provider: 'Dr. Michael Roberts' },
            { event_date: new Date('2020-01-14'), event_type: 'Procedure', description: 'Coronary angiogram — no intervention needed', provider: 'Dr. Michael Roberts' },
            { event_date: new Date('2023-06-30'), event_type: 'Lab Result', description: 'LDL: 115 mg/dL; started statin therapy', provider: 'Dr. Michael Roberts' }
        ],
        P10004: [
            { event_date: new Date('2015-11-03'), event_type: 'Diagnosis', description: 'Hypothyroidism diagnosed', provider: 'Dr. Sarah Martinez' },
            { event_date: new Date('2021-04-22'), event_type: 'Diagnosis', description: 'Osteoarthritis — bilateral knees', provider: 'Dr. Sarah Martinez' }
        ],
        P10005: [
            { event_date: new Date('2024-01-10'), event_type: 'Physical', description: 'Annual sports physical — cleared', provider: 'Dr. Sarah Martinez' }
        ]
    };

    for (const [pid, history] of Object.entries(histories)) {
        await col.updateOne({ patient_id: pid }, { $set: { medical_history: history } });
    }
    console.log('🏥 Added medical_history to patients');
}

async function main() {
    try {
        await connect();
        await seedDoctors();
        await seedPatients();
        await seedAppointments();
        await seedTreatments();
        await addMedicalHistory();
        console.log('\n🎉 Database seeded successfully');
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    } finally {
        await close();
    }
}

if (import.meta.url === `file://${process.argv[1]}`) { main(); }

export { connect, close, seedDoctors, seedPatients, seedAppointments, seedTreatments, addMedicalHistory };
