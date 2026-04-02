# Local Testing Guide

This guide explains how to use the local testing scripts to test MongoDB implementations locally before submitting or to batch test student submissions.

## Overview

This repository provides two testing scripts:

1. **`test-local.sh`** - Test individual repositories (instructor solutions, student template, or external repos)
2. **`test-students.sh`** - Batch test multiple student submissions from a directory

Both scripts replicate the autograding workflow that runs on GitHub Actions, allowing you to test code locally with the same tests that will be used for grading.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose configured
- MongoDB container running (automatically started by the script)

## Quick Start

### Single Repository Testing

```bash
# Test instructor solutions (default)
./test-local.sh

# Test student template (src/ folder)
./test-local.sh --student

# Test with verbose output
./test-local.sh --verbose

# Show help
./test-local.sh --help
```

### Batch Student Testing

```bash
# Test all student submissions in a directory
./test-students.sh ../project6-submissions

# Test all students for specific task
./test-students.sh ../project6-submissions --task 1

# Test all students for specific phase
./test-students.sh ../project6-submissions --phase 1
```

## Script 1: test-local.sh

### Purpose
Tests a single repository with flexible options for different testing scenarios.

### Basic Testing Modes

#### 1. Test Instructor Solutions (Default)
Tests the reference implementation in `src/` folder:
```bash
./test-local.sh
```

#### 2. Test Student Template
Tests the student template in `src/` folder:
```bash
./test-local.sh --student
```

#### 3. Test External Repository (Not Recommended)
For testing external repositories, use `test-students.sh` instead:
```bash
./test-students.sh /path/to/submissions/directory
```

### Selective Testing

#### Test Specific Task
Run tests for a single task only:
```bash
# Test only Task 1
./test-local.sh --task 1

# Test only Task 6
./test-local.sh --task 6 --student
```

#### Test Specific Phase
Run all tests for a specific phase:
```bash
# Test all Phase 1 tasks
./test-local.sh --phase 1

# Test all Phase 2 tasks with student code
./test-local.sh --phase 2 --student
```

### Verbose Mode
Show detailed test output:
```bash
# See all test output
./test-local.sh --verbose

# Combine with other options
./test-local.sh --student --verbose
./test-local.sh --task 3 --verbose
```

## Examples

### Common Testing Scenarios

#### 1. Quick Check Before Committing
```bash
# Test all instructor solutions
./test-local.sh
```

#### 2. Debugging a Failing Task
```bash
# Test specific task with verbose output
./test-local.sh --student --task 5 --verbose
```

#### 3. Verifying Student Template
```bash
# Test student template for Phase 1
./test-local.sh --student --phase 1
```

### Grading Student Submissions
```bash
# Test all students in a directory
./test-students.sh ../project6-submissions

# Test specific task for all students
./test-students.sh ../project6-submissions --task 5

# Test specific phase for all students
./test-students.sh ../project6-submissions --phase 1 --verbose
```

## Script 2: test-students.sh

### Purpose
Batch tests multiple student submissions from a directory, automatically testing each student's code and generating detailed reports.

### Usage

#### Basic Batch Testing
```bash
# Test all students (all tasks)
./test-students.sh /path/to/submissions

# Test specific task for all students
./test-students.sh ../project6-submissions --task 1

# Test specific phase for all students
./test-students.sh ../project6-submissions --phase 1

# Test with verbose output
./test-students.sh ../project6-submissions --task 5 --verbose
```

### Features

1. **Automatic Discovery**: Finds all student repositories in the specified directory
2. **Safe Testing**: Backs up and restores your `src/` folder automatically
3. **Detailed Logs**: Saves individual test results for each student in `./test-results/`
4. **Summary Report**: Provides pass/fail statistics and individual results
5. **Flexible Options**: Supports all `test-local.sh` options (task, phase, verbose)

### Output

The batch testing script creates:
- **Console Output**: Real-time progress and summary for each student
- **Log Files**: Detailed test results saved to `./test-results/<student-name>_results.txt`
- **Summary Report**: Final statistics showing which students passed/failed

### Example Output

```
╔═══════════════════════════════════════════════════════════════╗
║                   BATCH TESTING SUMMARY                       ║
╚═══════════════════════════════════════════════════════════════╝

Total Students Tested: 9
Passed: 3
Failed: 6

Individual Results:
  project6-student1: ✅ PASSED
  project6-student2: ❌ FAILED
  project6-student3: ✅ PASSED
  ...

Detailed logs saved to: ./test-results/
```

### Reviewing Results

After batch testing, review individual student logs:
```bash
# View specific student's results
cat ./test-results/project6-student1_results.txt

# Find all failing students
grep -l "FAILED" ./test-results/*.txt

# Count passing vs failing students
grep -c "PASSED" ./test-results/*.txt
```

## Understanding Test Results

### Output Format

The script provides colored output:
- 🟢 **Green** - Test passed
- 🔴 **Red** - Test failed
- 🟡 **Yellow** - Warning or informational message
- 🔵 **Blue** - Progress indicator
- 🟣 **Magenta** - Test section header

### Test Phases

**Phase 1: CRUD Operations (Tasks 1-5)**
- Task 1: Create Operations (Doctors & Patients)
- Task 2: Read Operations (Queries)
- Task 3: Update Operations
- Task 4: Delete Operations
- Task 5: Verification & Analysis

**Phase 2: Schema Design (Tasks 6-10)**
- Task 6: Appointments Collection
- Task 7: Treatments Collection
- Task 8: Medical History Enhancement
- Task 9: Complex Query Operations
- Task 10: Schema Reflection (Manual Grading)

**Phase 3: Advanced Queries (Tasks 11-15)**
- Task 11: Complex Find Queries
- Task 12: Aggregation Framework Basics
- Task 13: Advanced Aggregation
- Task 14: Practical Reports
- Task 15: Optimization & Comparison

### Final Summary

At the end of the test run, you'll see:
```
╔═══════════════════════════════════════════════════════════════╗
║                      FINAL RESULTS                             ║
╚═══════════════════════════════════════════════════════════════╝

Total Tests: 15
Passed: 15
Failed: 0

🎉 All tests passed! Great job!
```

## Troubleshooting

### Docker Not Running
**Error:** `Docker is not running. Please start Docker and try again.`

**Solution:** Start Docker Desktop and wait for it to fully initialize.

### MongoDB Connection Failed
**Error:** `MongoDB failed to start within timeout`

**Solutions:**
1. Check if MongoDB container is running: `docker compose ps`
2. Restart services: `docker compose down && docker compose up -d`
3. Check Docker logs: `docker compose logs mongodb`

### Services Not Starting
**Error:** `Services are not running`

**Solution:** The script will automatically start services, but you can manually start them:
```bash
docker compose up -d
```

### Permission Denied
**Error:** `Permission denied: ./test-local.sh`

**Solution:** Make the script executable:
```bash
chmod +x test-local.sh
```

### Tests Failing Unexpectedly
1. **Clean database:**
   ```bash
   docker compose exec -T app sh -c "cd /workspace/tests && npm run cleanup"
   ```

2. **Reinstall dependencies:**
   ```bash
   docker compose exec -T app sh -c "cd /workspace && npm ci"
   ```

3. **Restart services:**
   ```bash
   docker compose restart
   ```

4. **Run with verbose mode to see details:**
   ```bash
   ./test-local.sh --task <failing-task> --verbose
   ```

## Task Dependencies

Some tasks require data from previous tasks:

- **Task 2** depends on Task 1 (reads data inserted by Task 1)
- **Tasks 6-10** (Phase 2) depend on Task 1 (doctors & patients)
- **Task 9** depends on Tasks 1, 6, 7, 8
- **Tasks 11-15** (Phase 3) depend on Phase 1 and Phase 2 data

The script automatically handles these dependencies by seeding prerequisite data before running each task.

## Differences from GitHub Actions

The local testing script closely replicates the GitHub Actions workflow but has these differences:

1. **Environment:** Runs on your local machine vs. GitHub's cloud infrastructure
2. **Caching:** GitHub Actions caches npm dependencies between runs
3. **Timing:** Local tests may run faster/slower depending on your machine
4. **Output:** Local script provides colored terminal output for better readability

## Script Workflow

When you run `./test-local.sh`, it:

1. ✅ Checks if Docker is running
2. 🚀 Starts Docker Compose services (if not running)
3. ⏳ Waits for MongoDB to be ready
4. 📦 Installs npm dependencies
5. 💨 Runs smoke tests (environment validation)
6. 🧪 Runs selected task tests based on options
7. 📊 Displays final summary with pass/fail counts

## Integration with Development Workflow

### Recommended Workflow for Students

1. **During Development:**
   ```bash
   # Test specific task as you work on it
   ./test-local.sh --student --task 1 --verbose
   ```

2. **Before Committing:**
   ```bash
   # Test all completed phases
   ./test-local.sh --student --phase 1
   ```

3. **Before Submitting:**
   ```bash
   # Test everything
   ./test-local.sh --student
   ```

### Recommended Workflow for Instructors

1. **Verify Reference Implementation:**
   ```bash
   # Test instructor solutions
   ./test-local.sh
   
   # Test specific phase
   ./test-local.sh --phase 1 --verbose
   ```

2. **Grade Student Submissions:**
   ```bash
   # Test all students at once
   ./test-students.sh ../project6-submissions
   
   # Test specific task for all students
   ./test-students.sh ../project6-submissions --task 1
   
   # Review individual results
   ls ./test-results/
   ```

3. **Investigate Failing Students:**
   ```bash
   # View detailed log for specific student
   cat ./test-results/project6-student1_results.txt
   
   # Test single student with verbose output
   # (manually copy their src/ folder and use --student)
   ```

## Advanced Usage

### Combining Options

#### Single Repository Testing
```bash
# Test Phase 2 student code with verbose output
./test-local.sh --student --phase 2 --verbose

# Test multiple specific tasks
./test-local.sh --student --task 3 --verbose
./test-local.sh --student --task 5 --verbose
```

#### Batch Testing
```bash
# Test specific phase for all students with verbose output
./test-students.sh ../project6-submissions --phase 1 --verbose

# Test specific task for all students
./test-students.sh ../project6-submissions --task 5
```

### Running in CI/CD Pipelines

Both scripts can be integrated into custom CI/CD pipelines:

```bash
# Test single repository
./test-local.sh --student
if [ $? -eq 0 ]; then
    echo "All tests passed!"
else
    echo "Tests failed!"
    exit 1
fi

# Batch test students (always exits 0 for summary)
./test-students.sh ../project6-submissions --task 1
cat ./test-results/*.txt  # Review results
```

### Analyzing Batch Results

```bash
# Count passing students
grep -c "✅ PASSED" ./test-results/*.txt

# Find failing students
grep "❌ FAILED" ./test-results/*.txt | cut -d: -f1

# Generate CSV report
echo "Student,Status" > results.csv
for file in ./test-results/*.txt; do
    student=$(basename "$file" _results.txt)
    status=$(grep -o "PASSED\|FAILED" "$file" | head -1)
    echo "$student,$status" >> results.csv
done
```

## Script Comparison

| Feature | test-local.sh | test-students.sh |
|---------|---------------|------------------|
| **Purpose** | Test single repository | Batch test multiple students |
| **Use Case** | Development & verification | Grading submissions |
| **Output** | Console only | Console + log files |
| **Logs** | `/tmp/test_task*_output.txt` | `./test-results/<student>_results.txt` |
| **Backup Safety** | Not needed | Auto-backs up `src/` folder |
| **Best For** | Testing your own code | Testing 5+ students at once |

## Best Practices

### For Students
1. **Test frequently** during development with `--task` option
2. **Use verbose mode** when debugging: `--verbose`
3. **Test entire phase** before moving to next phase
4. **Run all tests** before final submission

### For Instructors
1. **Verify instructor solutions** work before releasing assignment
2. **Use batch testing** for efficient grading of multiple students
3. **Review logs** in `./test-results/` for failing students
4. **Test specific tasks** to identify common problem areas
5. **Keep logs organized** by assignment/phase for record-keeping

## Getting Help

### Command Help
- Run `./test-local.sh --help` for single repository testing options
- Run `./test-students.sh` without arguments for batch testing usage

### Troubleshooting Resources
- Check the GitHub Actions workflow for comparison: `.github/workflows/autograding.yml`
- Review test output files: `/tmp/test_task*_output.txt` (single) or `./test-results/*.txt` (batch)
- Examine test implementations: `tests/phase*/` directories
- View script source code: `test-local.sh` and `test-students.sh`

### Common Issues
- **Port conflicts**: Stop other MongoDB containers before testing
- **Disk space**: Batch testing creates logs; clean up `./test-results/` periodically
- **Permissions**: Ensure scripts are executable (`chmod +x test-*.sh`)

## Contributing

If you find issues with the testing scripts or want to suggest improvements:

1. Test with the verbose flag to gather details
2. Check test output files in `/tmp/` or `./test-results/`
3. Review the script source: `test-local.sh` or `test-students.sh`
4. Submit an issue or pull request with detailed information

---

**Last Updated:** December 5, 2025  
**Compatible with:** MongoDB 8.0, Node.js 20+, Docker Compose v2  
**Scripts:** `test-local.sh` (single repo), `test-students.sh` (batch testing)
