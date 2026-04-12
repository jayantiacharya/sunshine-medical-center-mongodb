/**
 * Task 8 — Complex Multi-Stage Pipelines
 * Phase 3 — Advanced Aggregation Pipelines
 *
 * INSTRUCTIONS:
 * Complete the three functions below to earn 25 points.
 *
 * Task 8.1 — $group with multiple accumulators (10 pts)
 *   Group the treatments collection by patient_ref.
 *   For each group compute:
 *     treatmentCount   — $sum: 1
 *     totalCost        — $sum: '$cost'
 *     avgCost          — $avg: '$cost'
 *     minCost          — $min: '$cost'
 *     maxCost          — $max: '$cost'
 *     followUpCount    — $sum: { $cond: ['$follow_up_required', 1, 0] }
 *   Sort by totalCost descending.
 *   Return array of grouped documents.
 *
 * Task 8.2 — $addFields: compute patient age (8 pts)
 *   Add the following computed fields to each patient document:
 *     age          — floor( (now - date_of_birth) / ms_per_year )
 *     hasAllergies — true if allergies array is non-empty, else false
 *     fullName     — concat(first_name, ' ', last_name)
 *   $project to: patient_id, fullName, age, hasAllergies, status
 *   Sort by age ascending.
 *   Return array of patient documents with computed fields.
 *
 * Task 8.3 — $replaceRoot reshape (7 pts)
 *   Start from patients, $lookup treatments (patient_id → patient_ref),
 *   filter to patients that have at least one treatment, $unwind,
 *   then $replaceRoot to promote each treatment as the root document
 *   while merging in patient_name and patient_status.
 *   $project: treatment_id, patient_name, patient_status, diagnosis,
 *             treatment_type, cost
 *   Sort by treatment_id.
 *   Return array of reshaped documents.
 *
 * Required exports: connect, close,
 *   task8_1_groupAccumulators, task8_2_addFields, task8_3_replaceRoot
 *
 * Run with: node src/phase3-aggregation/task8-complex-pipelines.js
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
 * Task 8.1 — $group with multiple accumulators — 10 points
 * @returns {object[]}
 */
export async function task8_1_groupAccumulators() {
    // TODO: $group by patient_ref with multiple accumulators, $sort
    
    const pipeline = [
        {
            $group: {
                _id: '$patient_ref',
                treatmentCount: { $sum: 1 },
                totalCost: { $sum: '$cost' },
                avgCost: { $avg: '$cost' },
                minCost: { $min: '$cost' },
                maxCost: { $max: '$cost' },
                followUpCount: {
                    $sum: {
                        $cond: ['$follow_up_required', 1, 0]
                    }
                }
            }
        },
        {
            $project: {
                patient_ref: '$_id',
                treatmentCount: 1,
                totalCost: { $round: ['$totalCost', 2] },
                avgCost: { $round: ['$avgCost', 2] },
                minCost: 1,
                maxCost: 1,
                followUpCount: 1,
                _id: 0
            }
        },
        {
            $sort: { totalCost: -1 }
        }
    ];
    
    const results = await db.collection('treatments').aggregate(pipeline).toArray();
    
    console.log('\nTreatment summary by patient:', results.length);
    if (results.length > 0) {
        console.log('Sample:', JSON.stringify(results[0], null, 2));
    }
    
    return results;
}

/**
 * Task 8.2 — $addFields computed fields — 8 points
 * @returns {object[]}
 */
export async function task8_2_addFields() {
    // TODO: $addFields age, hasAllergies, fullName, then $project, $sort
    
    const pipeline = [
        {
            $addFields: {
                age: {
                    $floor: {
                        $divide: [
                            { $subtract: [new Date(), '$date_of_birth'] },
                            1000 * 60 * 60 * 24 * 365
                        ]
                    }
                },
                hasAllergies: {
                    $cond: {
                        if: { $and: [
                            { $isArray: '$allergies' },
                            { $gt: [{ $size: '$allergies' }, 0] }
                        ]},
                        then: true,
                        else: false
                    }
                },
                fullName: {
                    $concat: ['$first_name', ' ', '$last_name']
                }
            }
        },
        {
            $project: {
                patient_id: 1,
                fullName: 1,
                age: 1,
                hasAllergies: 1,
                status: 1,
                _id: 0
            }
        },
        {
            $sort: { age: 1 }
        }
    ];
    
    const results = await db.collection('patients').aggregate(pipeline).toArray();
    
    console.log('\nPatients with computed fields:', results.length);
    if (results.length > 0) {
        console.log('Sample:', JSON.stringify(results[0], null, 2));
    }
    
    return results;
}

/**
 * Task 8.3 — $replaceRoot reshape — 7 points
 * @returns {object[]}
 */
export async function task8_3_replaceRoot() {
    // TODO: $lookup, $match, $unwind, $replaceRoot, $project, $sort
    
    const pipeline = [
        {
            $lookup: {
                from: 'treatments',
                localField: 'patient_id',
                foreignField: 'patient_ref',
                as: 'treatments'
            }
        },
        {
            $match: {
                treatments: { $ne: [] }
            }
        },
        {
            $unwind: '$treatments'
        },
        {
            $replaceRoot: {
                newRoot: {
                    $mergeObjects: [
                        '$treatments',
                        {
                            patient_name: {
                                $concat: ['$first_name', ' ', '$last_name']
                            },
                            patient_status: '$status'
                        }
                    ]
                }
            }
        },
        {
            $project: {
                treatment_id: 1,
                patient_name: 1,
                patient_status: 1,
                diagnosis: 1,
                treatment_type: 1,
                cost: 1,
                _id: 0
            }
        },
        {
            $sort: { treatment_id: 1 }
        }
    ];
    
    const results = await db.collection('patients').aggregate(pipeline).toArray();
    
    console.log('\nReshaped treatment documents:', results.length);
    if (results.length > 0) {
        console.log('Sample:', JSON.stringify(results[0], null, 2));
    }
    
    return results;
}

// ── main ───────────────────────────────────────────────────────────────────

async function main() {
    try {
        await connect();
        await task8_1_groupAccumulators();
        await task8_2_addFields();
        await task8_3_replaceRoot();
        console.log('✅ Task 8 complete');
    } finally {
        await close();
    }
}

if (import.meta.url === `file://${process.argv[1]}`) { main(); }
