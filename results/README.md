# Test Results Directory

This directory stores test execution results and reports.

## Auto-generated Files

- `test-results-[timestamp].json` - Detailed test results in JSON format
- `grading-reports-[timestamp].html` - Human-readable grading reports
- `security-logs-[timestamp].log` - Security monitoring logs
- `batch-results-[date].csv` - Batch testing summaries

## Directory Structure

```
results/
├── individual/          # Individual student test results
├── batch/              # Batch testing results
├── security/           # Security monitoring logs
└── reports/            # Generated grading reports
```

## Data Retention

- Results are kept for the duration of the grading period
- All data is purged at the end of the semester
- Security logs are archived (anonymized) for 1 year

---

**Note**: This directory is created automatically during test execution.
