# Technical Requirements

## Database Platform

**Required**: Docker-based MongoDB setup
- Uses provided `docker-compose.yml` for local development
- MongoDB 8.0 with authentication pre-configured
- Includes Mongo Express web UI for database management
- Docker-based MongoDB required (no Atlas)

## Collections Required

Your database must include **at least 4 core collections**:

1. **doctors** - Doctor profiles with specialties and availability
2. **patients** - Patient demographics, insurance, medical histories
3. **appointments** - Scheduled visits linking patients and doctors
4. **treatments** - Treatment records with diagnoses and prescriptions

Optional collections for bonus points:
- **medical_records** - Detailed visit notes and test results
- **billing** - Payment and insurance claim tracking
- **pharmacy** - Medication inventory management

## Data Volume Requirements

Minimum sample data to demonstrate functionality:
- **3 doctors** across different specialties (exactly 3 required for Phase 1, Task 1)
- **5+ patients** with varied medical histories (minimum 5 for Phase 1, Task 1)
- **8+ appointments** (mix of past, current, and future) - Phase 2
- **6+ treatments** with embedded prescriptions - Phase 2
- Realistic nested data (addresses, insurance, allergies, conditions)

## Implementation Language

**Required**: Node.js with MongoDB Node Driver
- ES modules (import/export) syntax required
- All starter code provided in JavaScript
- Docker container pre-configured with Node.js 20+
- MongoDB Driver already installed in project

Your implementation must include:
- Connection management with error handling
- Environment variables from docker-compose.yml (pre-configured)
- Implementation of required task functions
- Proper async/await patterns

---

[← Back to README](../README.md)
