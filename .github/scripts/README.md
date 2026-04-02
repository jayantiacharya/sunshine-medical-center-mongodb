# CI/CD Scripts

This directory contains reusable bash scripts used by GitHub Actions workflows.

## 📁 Scripts

### `wait-for-mongodb.sh`
**Purpose**: Waits for MongoDB to be ready before proceeding with tests

**Usage**:
```bash
./.github/scripts/wait-for-mongodb.sh
```

**Behavior**:
- Makes up to 30 connection attempts (60 seconds total)
- Tests MongoDB connectivity using `mongosh`
- Exits with code 0 on success, 1 on timeout

**Environment Requirements**:
- Docker Compose services must be running
- MongoDB credentials: `admin:cs3550password`

---

### `verify-seed-data.sh`
**Purpose**: Verifies that the database has been seeded with minimum required data

**Usage**:
```bash
./.github/scripts/verify-seed-data.sh
```

**Validation Checks**:
- ✅ At least 3 doctors
- ✅ At least 5 patients

**Exits**:
- Code 0: Seed data valid
- Code 1: Seed data insufficient

---

### `seed-database.sh`
**Purpose**: Seeds the MongoDB database with initial test data

**Usage**:
```bash
./.github/scripts/seed-database.sh
```

**Behavior**:
- Checks if instructor solution exists (for instructor repo)
- Runs `src/seed/seed-database.js` to seed doctors, patients, appointments, and treatments

**Exits**:
- Code 0: Seeding successful
- Code 1: Seeding failed

---

### `parse-test-results.sh`
**Purpose**: Parses Node.js test output and provides clean, student-friendly summaries

**Usage**:
```bash
./.github/scripts/parse-test-results.sh <output_file> <phase_name>
```

**Parameters**:
- `output_file`: Path to test output file (e.g., `phase1_output.txt`)
- `phase_name`: Human-readable phase name (e.g., "Phase 1: Schema & Seed")

**Output**:
- Clean summary with test counts (tests, passed, failed, duration)
- List of failed test names (without full TAP output)
- Pass/fail indicators with emojis

**Example Output**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Phase 1: Schema & Seed Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Tests:    21
  Passed:   ✅ 18
  Failed:   ❌ 3
  Duration: 1.23s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Failed tests:
  not ok 1 - should have orders collection
  not ok 2 - should have inventory collection
  not ok 3 - should have reviews collection

❌ Some tests failed
```

---

### `calculate-grade.sh`
**Purpose**: Calculates student grade based on test results

**Usage**:
```bash
./.github/scripts/calculate-grade.sh <smoke_test_outcome>
```

**Parameters**:
- `smoke_test_outcome`: "success" or "failure" (from GitHub Actions)

**Input Files** (expected in current directory):
- `phase1_output.txt` - Phase 1 test output
- `phase2_output.txt` - Phase 2 test output
- `phase3_output.txt` - Phase 3 test output
- `phase4_output.txt` - Phase 4 test output
- `phase5_output.txt` - Phase 5 test output

**Output**:
```
Phase 1: 18/20 tests passed = 18.00/20 points
Phase 2: 23/25 tests passed = 18.40/20 points
...
Total Score: 87.5/100
Letter Grade: B
score=87.5
grade=B
```

**Grading Logic**:
- Each phase worth 20 points
- Score = (tests_passed / total_tests) × 20
- Letter grades: A (90+), B (80-89), C (70-79), D (60-69), F (<60)
- Smoke tests must pass (prerequisite)

---

### `validate-test-coverage.sh`
**Purpose**: Validates that the test framework has sufficient test coverage

**Usage**:
```bash
./.github/scripts/validate-test-coverage.sh
```

**Checks**:
- Counts tests in each phase
- Verifies total is at least 100 tests
- Displays summary breakdown

**Output Example**:
```
Test Count Summary:
  Smoke:   14 tests
  Phase 1: 22 tests
  Phase 2: 27 tests
  Phase 3: 32 tests
  Phase 4: 28 tests
  Phase 5: 33 tests
  ─────────────────────
  Total:   156 tests

✅ Test coverage meets requirements (156 tests)
```

---

### `check-test-performance.sh`
**Purpose**: Ensures tests execute within acceptable time limits

**Usage**:
```bash
./.github/scripts/check-test-performance.sh
```

**Performance Checks**:
- Runs smoke tests
- Measures execution time
- Validates against 60-second threshold

**Exits**:
- Code 0: Performance acceptable
- Code 1: Performance too slow

---

### `check-documentation.sh`
**Purpose**: Verifies all required documentation files exist

**Usage**:
```bash
./.github/scripts/check-documentation.sh
```

**Required Files**:
- `tests/README.md`
- `tests/package.json`
- `tests/utils/test-utils.js`
- `tests/run-tests.sh`
- `docs/TEST-FRAMEWORK-SUMMARY.md`
- `docs/CI-CD-DOCUMENTATION.md`

**Exits**:
- Code 0: All files present
- Code 1: Missing files

---

## 🔧 Local Testing

You can test these scripts locally:

```bash
# Start services
docker compose up -d

# Test individual scripts
./.github/scripts/wait-for-mongodb.sh
./.github/scripts/verify-seed-data.sh
./.github/scripts/validate-test-coverage.sh
./.github/scripts/check-test-performance.sh
./.github/scripts/check-documentation.sh

# Test grading (requires test output files)
docker compose exec -T app sh -c "cd /workspace/tests && npm run test:phase1" > phase1_output.txt 2>&1
# ... run all phases ...
./.github/scripts/calculate-grade.sh success
```

## 🛠️ Maintenance

### Adding New Scripts

1. Create script in `.github/scripts/`
2. Add shebang: `#!/bin/bash`
3. Add `set -e` for error handling
4. Make executable: `chmod +x script.sh`
5. Document in this README
6. Update workflows to use script

### Modifying Existing Scripts

1. Edit script locally
2. Test with local Docker environment
3. Verify in CI/CD workflow
4. Update documentation if behavior changes

### Best Practices

- ✅ Use `set -e` to exit on first error
- ✅ Echo progress messages for debugging
- ✅ Use clear exit codes (0 = success, 1 = failure)
- ✅ Include error messages for failures
- ✅ Make scripts idempotent (safe to run multiple times)
- ✅ Use environment variables for configuration
- ✅ Add comments for complex logic

## 🐛 Debugging

### Enable Verbose Output

```bash
# Run with bash -x for debugging
bash -x ./.github/scripts/wait-for-mongodb.sh
```

### Common Issues

**Script not executable**:
```bash
chmod +x .github/scripts/*.sh
```

**Docker Compose not found**:
```bash
# Ensure you're in project root
cd /path/to/project6-template
```

**MongoDB connection fails**:
```bash
# Check services
docker compose ps

# Check MongoDB logs
docker compose logs mongodb
```

## 📚 Resources

- [GitHub Actions - Running Scripts](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstepsrun)
- [Bash Scripting Guide](https://www.gnu.org/software/bash/manual/bash.html)
- [Shell Script Best Practices](https://google.github.io/styleguide/shellguide.html)

---

**Last Updated**: November 5, 2024  
**Script Count**: 7  
**Total Lines**: ~220
