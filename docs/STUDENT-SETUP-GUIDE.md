# Student Setup Guide

## What You Need

- **VS Code** (with Docker extension recommended)
- **Docker Desktop** installed and running
- **Git** (to clone this repository)
- **Python 3.7+** (for automated setup - usually pre-installed on macOS/Linux)

**That's it!** No Node.js, MongoDB, or npm installation required on your machine.

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-github-classroom-repo-url>
cd <repo-name>
```

### 2. Choose Setup Method

**Option A: Automated Setup (Recommended) 🚀**

Run the Python setup script:

**macOS/Linux:**

```bash
python3 setup.py
# or
./setup.sh
```

**Windows:**

```bash
python setup.py
```

Or simply double-click `setup.bat`

The script will automatically:

- ✓ Check Docker is installed and running
- ✓ Start all services (MongoDB, app, Mongo Express)
- ✓ Wait for MongoDB to be ready
- ✓ Seed the database with sample data
- ✓ Run a verification test
- ✓ Display helpful commands

**That's it! Skip to the "Common Commands" section below.**

---

**Option B: Manual Setup**

If you prefer to run commands manually:

### 2. Start Docker Services (Manual)

From the project root, run:

```bash
docker compose up -d
```

This command starts:

- **MongoDB** database (accessible at `localhost:27017`)
- **Mongo Express** web UI at <http://localhost:8081>
- **Node app container** (stays running in the background for you to execute commands)

### 3. Seed the Database

Populate the database with Phase 1 Task 1 sample data:

```bash
docker compose exec app node src/seed/seed-database.js
```

You should see output confirming doctors and patients were inserted.

### 4. Run Your Implementation

Run your Task 1 solution:

```bash
docker compose exec app node src/seed/seed-database.js
```

Run tests to verify your implementation:

```bash
docker compose exec app sh -c "cd tests && npm run test:phase1:task1"
```

## Common Commands

### Run your implementations

```bash
# Run any task implementation
docker compose exec app node src/phase1-indexing/<task-file>.js

# Examples:
docker compose exec app node src/seed/seed-database.js
docker compose exec app node src/phase1-indexing/task2-read-operations.js
```

### Run tests

```bash
# Run all Phase 1 tests
docker compose exec app sh -c "cd tests && npm run test:phase1"

# Run specific task tests
docker compose exec app sh -c "cd tests && npm run test:phase1:task1"
docker compose exec app sh -c "cd tests && npm run test:phase1:task2"
```

### Open a shell inside the app container

```bash
docker compose exec app sh
```

Once inside:

```sh
# Run any implementation
node src/seed/seed-database.js

# Or navigate to tests
cd tests
npm run test:phase1
```

Type `exit` to leave the shell.

### Access MongoDB Shell (mongosh)

```bash
docker compose exec mongodb mongosh -u admin -p cs3550password --authenticationDatabase admin sunshine_medical_center
```

Use this to run manual queries:

```javascript
show dbs
use sunshine_medical_center
db.doctors.find().pretty()
db.patients.find().limit(2).pretty()
```

Type `exit` to quit.

### View Logs

```bash
docker compose logs -f app
```

Press `Ctrl+C` to stop following logs.

### Stop All Services

```bash
docker compose down
```

To remove the database volume (start fresh):

```bash
docker compose down -v
```

## Troubleshooting

### "Cannot connect to the Docker daemon"

**Solution:** Make sure Docker Desktop is running.

### "Port 27017 already in use"

**Solution:** Stop any local MongoDB instance or change the port in `docker-compose.yml`.

### Database not seeding / connection errors

**Solution:** Wait a few seconds after `docker compose up` for MongoDB to fully start, then retry the seed command.

### Changes to code not reflected

**Solution:** Your code changes are immediately available (no restart needed). Simply re-run your script:

```bash
docker compose exec app node src/phase1-indexing/<task-file>.js
```

## Development Workflow

1. **Edit code** in `src/phase1-indexing/` using VS Code on your host machine.
2. **Run your implementation**:
   ```bash
   docker compose exec app node src/seed/seed-database.js
   ```
3. **Test your implementation**:
   ```bash
   docker compose exec app sh -c "cd tests && npm run test:phase1:task1"
   ```
4. **Review hints** from test output (if tests fail).
5. **Query the database** via Mongo Express UI (<http://localhost:8081>) or mongosh.
6. **Repeat** until all tests pass.

## VS Code Dev Containers (Optional)

For a more integrated experience:

1. Install the **Dev Containers** extension in VS Code.
2. Open the project folder.
3. Press `F1` → **Dev Containers: Reopen in Container**.
4. VS Code will attach to the running `app` container, giving you terminal, IntelliSense, and debugging inside the container.

## Need Help?

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Review [PROJECT-SPECIFICATION.md](./PROJECT-SPECIFICATION.md) for requirements
- Post in Canvas discussion or office hours

---

**Remember:** All your implementation code goes in `src/` and is executed via `docker compose exec app node ...` commands. No local Node.js or MongoDB installation needed!
