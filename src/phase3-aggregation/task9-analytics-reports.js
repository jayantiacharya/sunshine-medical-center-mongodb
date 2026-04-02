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
    throw new Error('connect() not implemented');
}

export async function close() {
    if (client) await client.close();
}

/**
 * Task 9.1 — Doctor workload report — 9 points
 * @returns {object[]}
 */
export async function task9_1_doctorWorkload() {
    throw new Error('task9_1_doctorWorkload() not implemented');
}

/**
 * Task 9.2 — Patient care summary report — 8 points
 * @returns {object[]}
 */
export async function task9_2_patientCareSummary() {
    throw new Error('task9_2_patientCareSummary() not implemented');
}

/**
 * Task 9.3 — Monthly appointment trends — 8 points
 * @returns {object[]}
 */
export async function task9_3_monthlyTrends() {
    throw new Error('task9_3_monthlyTrends() not implemented');
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
