#!/bin/bash

# verify-seed-data.sh
# Verifies that the database has been seeded correctly

set -e

echo "🔍 Verifying seed data..."

docker compose exec -T mongodb mongosh \
    --quiet \
    --eval "
        db = db.getSiblingDB('sunshine_medical_center');
        const doctorCount      = db.doctors.countDocuments();
        const patientCount     = db.patients.countDocuments();
        const appointmentCount = db.appointments.countDocuments();
        const treatmentCount   = db.treatments.countDocuments();

        print('Doctors:',      doctorCount);
        print('Patients:',     patientCount);
        print('Appointments:', appointmentCount);
        print('Treatments:',   treatmentCount);

        if (doctorCount < 3) {
            print('ERROR: Expected at least 3 doctors');
            quit(1);
        }
        if (patientCount < 5) {
            print('ERROR: Expected at least 5 patients');
            quit(1);
        }
        if (appointmentCount < 8) {
            print('ERROR: Expected at least 8 appointments');
            quit(1);
        }
        if (treatmentCount < 6) {
            print('ERROR: Expected at least 6 treatments');
            quit(1);
        }

        print('✅ Seed data verification passed');
    " \
    mongodb://admin:cs3550password@localhost:27017/?authSource=admin

if [ $? -eq 0 ]; then
    echo "✅ Seed data verified successfully"
    exit 0
else
    echo "❌ Seed data verification failed"
    exit 1
fi
