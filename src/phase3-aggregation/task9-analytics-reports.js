/**
 * Task 9 — Analytics Reports
 * Phase 3 — Advanced Aggregation Pipelines
 *
 * INSTRUCTIONS:
 * Complete the three functions below to earn 25 points.
 *
 * Task 9.1 — Doctor workload report (9 pts)
 *   Using appointments, group by doctor_ref and count:
 *     totalAppointments  — $sum: 1
 *     completed          — count where status == "Completed"
 *     scheduled          — count where status == "Scheduled"
 *     cancelled          — count where status == "Cancelled"
 *   Join with doctors collection to get doctor_name and specialty.
 *   Sort by totalAppointments descending.
 *   Return array with fields: doctor_id, doctor_name, specialty,
 *     totalAppointments, completed, scheduled, cancelled
 *
 * Task 9.2 — Patient care summary report (8 pts)
 *   Using treatments, group by patient_ref and compute:
 *     totalTreatments  — $sum: 1
 *     totalCost        — $sum: '$cost'
 *     followUpCount    — count where follow_up_required is true
 *     lastTreatment    — $max: '$treatment_date'
 *   Join with patients collection to get patient_name.
 *   Sort by totalCost descending.
 *   Return array with fields: patient_id, patient_name,
 *     totalTreatments, totalCost, followUpCount, lastTreatment
 *
 * Task 9.3 — Monthly appointment trends by status (8 pts)
 *   Group appointments by { year, month, status }.
 *   Compute count: $sum: 1.
 *   Add a 'period' field like "2026-04" (zero-padded month).
 *   Sort by year, month, status.
 *   Return array with fields: year, month, period, status, count
 *
 * Required exports: connect, close,
 *   task9_1_doctorWorkload, task9_2_patientCareSummary, task9_3_monthlyTrends
 *
 * Run with: node src/phase3-aggregation/task9-analytics-reports.js
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
 * Task 9.1 — Doctor workload report — 9 points
 * @returns {object[]}
 */
export async function task9_1_doctorWorkload() {
    // TODO: $group by doctor_ref with status counts, $lookup doctors, $project, $sort
    
    const pipeline = [
        {
            $group: {
                _id: '$doctor_ref',
                totalAppointments: { $sum: 1 },
                completed: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0]
                    }
                },
                scheduled: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'Scheduled'] }, 1, 0]
                    }
                },
                cancelled: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0]
                    }
                }
            }
        },
        {
            $lookup: {
                from: 'doctors',
                localField: '_id',
                foreignField: 'doctor_id',
                as: 'doctor'
            }
        },
        {
            $unwind: '$doctor'
        },
        {
            $project: {
                doctor_id: '$_id',
                doctor_name: {
                    $concat: ['Dr. ', '$doctor.first_name', ' ', '$doctor.last_name']
                },
                specialty: '$doctor.specialty',
                totalAppointments: 1,
                completed: 1,
                scheduled: 1,
                cancelled: 1,
                _id: 0
            }
        },
        {
            $sort: { totalAppointments: -1 }
        }
    ];
    
    const results = await db.collection('appointments').aggregate(pipeline).toArray();
    
    console.log('\nDoctor workload report:', results.length, 'doctors');
    if (results.length > 0) {
        console.log('Sample:', JSON.stringify(results[0], null, 2));
    }
    
    return results;
}

/**
 * Task 9.2 — Patient care summary report — 8 points
 * @returns {object[]}
 */
export async function task9_2_patientCareSummary() {
    // TODO: $group by patient_ref, $lookup patients, $project, $sort
    
    const pipeline = [
        {
            $group: {
                _id: '$patient_ref',
                totalTreatments: { $sum: 1 },
                totalCost: { $sum: '$cost' },
                followUpCount: {
                    $sum: {
                        $cond: ['$follow_up_required', 1, 0]
                    }
                },
                lastTreatment: { $max: '$treatment_date' }
            }
        },
        {
            $lookup: {
                from: 'patients',
                localField: '_id',
                foreignField: 'patient_id',
                as: 'patient'
            }
        },
        {
            $unwind: '$patient'
        },
        {
            $project: {
                patient_id: '$_id',
                patient_name: {
                    $concat: ['$patient.first_name', ' ', '$patient.last_name']
                },
                totalTreatments: 1,
                totalCost: { $round: ['$totalCost', 2] },
                followUpCount: 1,
                lastTreatment: 1,
                _id: 0
            }
        },
        {
            $sort: { totalCost: -1 }
        }
    ];
    
    const results = await db.collection('treatments').aggregate(pipeline).toArray();
    
    console.log('\nPatient care summary:', results.length, 'patients');
    if (results.length > 0) {
        console.log('Sample:', JSON.stringify(results[0], null, 2));
    }
    
    return results;
}

/**
 * Task 9.3 — Monthly appointment trends — 8 points
 * @returns {object[]}
 */
export async function task9_3_monthlyTrends() {
    // TODO: $group by year, month, status, $project period, $sort
    
    const pipeline = [
        {
            $group: {
                _id: {
                    year: { $year: '$appointment_date' },
                    month: { $month: '$appointment_date' },
                    status: '$status'
                },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                year: '$_id.year',
                month: '$_id.month',
                status: '$_id.status',
                count: 1,
                period: {
                    $concat: [
                        { $toString: '$_id.year' },
                        '-',
                        {
                            $cond: {
                                if: { $lt: ['$_id.month', 10] },
                                then: { $concat: ['0', { $toString: '$_id.month' }] },
                                else: { $toString: '$_id.month' }
                            }
                        }
                    ]
                },
                _id: 0
            }
        },
        {
            $sort: { year: 1, month: 1, status: 1 }
        }
    ];
    
    const results = await db.collection('appointments').aggregate(pipeline).toArray();
    
    console.log('\nMonthly appointment trends:', results.length, 'groups');
    if (results.length > 0) {
        console.log('Sample:', JSON.stringify(results.slice(0, 3), null, 2));
    }
    
    return results;
}

// ── main ───────────────────────────────────────────────────────────────────

async function main() {
    try {
        await connect();
        await task9_1_doctorWorkload();
        await task9_2_patientCareSummary();
        await task9_3_monthlyTrends();
        console.log('✅ Task 9 complete');
    } finally {
        await close();
    }
}

if (import.meta.url === `file://${process.argv[1]}`) { main(); }
