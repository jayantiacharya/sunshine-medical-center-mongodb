# Quick Reference: Container-First Workflow

**For students with only VS Code + Docker (no local Node/npm/MongoDB)**

## Automated Setup (Recommended)

**First time setup - run once:**

```bash
# macOS/Linux:
python3 setup.py

# Windows:
python setup.py
# or double-click setup.bat
```

The script handles everything automatically! ✅

---

## Essential Commands

### Start Everything
```bash
docker compose up -d
```
Starts MongoDB, app container, and Mongo Express UI.

### Seed Database (Phase 1)
```bash
# Task 1 (Create Operations)
docker compose exec app node src/seed/seed-database.js

# Task 2 (Read Operations)
docker compose exec app node src/phase1-indexing/task2-compound-multikey-indexes.js

# Task 3 (Update Operations)
docker compose exec app node src/phase1-indexing/task3-text-index-management.js
```
Populates database with sample data. Safe to run multiple times.

### Run Your Student Implementation
```bash
# Example: Run Phase 1 Task 1 student solution
docker compose exec app node src/seed/seed-database.js

# Run tests for specific phase
npm test tests/phase1/
```

### Stop Everything
```bash
docker compose down
```

### Fresh Start (Reset Database)
```bash
docker compose down -v
docker compose up -d
# Wait 10 seconds for MongoDB to initialize, then seed:
docker compose exec app node src/seed/seed-database.js
```

## Access Tools

### App Container Shell
```bash
docker compose exec app sh
```
Inside: `node src/seed/seed-database.js`

### MongoDB Shell
```bash
docker compose run --rm mongosh 'mongodb://admin:cs3550password@mongodb:27017/sunshine_medical_center?authSource=admin'
```

Common queries:
```javascript
db.doctors.find().limit(5)
db.patients.countDocuments()
db.appointments.find({ status: "scheduled" })
```

### Web UI
Open browser: <http://localhost:8081>

## Testing

### Run All Tests
```bash
npm test
```

### Run Specific Phase Tests
```bash
npm test tests/phase1/
npm test tests/phase2/
npm test tests/phase3/
```

### Run Single Test File
```bash
npm test tests/phase1/01-schema-seed.test.js
```

## View Logs
```bash
docker compose logs -f app
docker compose logs -f mongodb
```

## Troubleshooting

**Problem:** "Cannot connect to Docker daemon"
**Fix:** Start Docker Desktop

**Problem:** Seed fails or timeout
**Fix:** Wait 10 seconds after `docker compose up -d`, then retry

**Problem:** Code changes not reflected
**Fix:** Restart app container: `docker compose restart app`

**Problem:** Port already in use
**Fix:** Stop local MongoDB/services or edit ports in `docker-compose.yml`

## What You DON'T Need
- ❌ Local Node.js installation
- ❌ Local MongoDB installation  
- ❌ Local npm or package managers
- ❌ Environment configuration files

Everything runs inside Docker! 🚀
