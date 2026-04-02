#!/usr/bin/env python3
"""
Student helper script to run MongoDB task implementations locally.

This script executes your JavaScript files in the Docker container
to help you test your work before submitting.

Usage:
    python run-task.py <task>
    python run-task.py <phase>
    python run-task.py all
    
Examples:
    python run-task.py task1     # Run Task 1 (Single-Field Indexes)
    python run-task.py 1         # Also works with just the number
    python run-task.py task7     # Run Task 7 ($lookup & $unwind)
    python run-task.py phase1    # Run all Phase 1 tasks (1-3)
    python run-task.py phase2    # Run all Phase 2 tasks (4-6)
    python run-task.py phase3    # Run all Phase 3 tasks (7-9)
    python run-task.py all       # Run all tasks sequentially
"""

import sys
import subprocess
import os
import time

# Task mapping: task_number -> (phase_folder, script_file, description)
TASK_MAP = {
    1: ("phase1-indexing", "task1-single-field-indexes.js", "Single-Field Indexes"),
    2: ("phase1-indexing", "task2-compound-multikey-indexes.js", "Compound & Multikey Indexes"),
    3: ("phase1-indexing", "task3-text-index-management.js", "Text Index Management"),
    4: ("phase2-schema", "task4-json-schema-validation.js", "JSON Schema Validation"),
    5: ("phase2-schema", "task5-polymorphic-pattern.js", "Polymorphic Pattern"),
    6: ("phase2-schema", "task6-billing-collection.js", "Billing Collection"),
    7: ("phase3-aggregation", "task7-lookup-unwind.js", "$lookup & $unwind"),
    8: ("phase3-aggregation", "task8-complex-pipelines.js", "Complex Aggregation Pipelines"),
    9: ("phase3-aggregation", "task9-analytics-reports.js", "Analytics Reports"),
}

# Phase groupings
PHASE_MAP = {
    "phase1": [1, 2, 3],
    "phase2": [4, 5, 6],
    "phase3": [7, 8, 9],
}


def print_usage():
    """Print usage information and available tasks."""
    print(__doc__)
    print("\nAvailable individual tasks:")
    print("-" * 70)
    for task_num, (phase, script, desc) in sorted(TASK_MAP.items()):
        print(f"  task{task_num} (or {task_num}): {desc}")
    print("-" * 70)
    print("\nPhase groups:")
    print("-" * 70)
    print("  phase1: Run all Phase 1 tasks (1-5)")
    print("  phase1: Run all Phase 1 tasks (1-3)")
    print("  phase2: Run all Phase 2 tasks (4-6)")
    print("  phase3: Run all Phase 3 tasks (7-9)")
    print("  all:    Run all tasks sequentially")
    print("-" * 70)


def check_docker_running():
    """Check if Docker Compose services are running."""
    try:
        result = subprocess.run(
            ["docker", "compose", "ps", "--services", "--filter", "status=running"],
            capture_output=True,
            text=True,
            check=True
        )
        services = result.stdout.strip().split('\n')
        if 'app' not in services:
            print("⚠️  Warning: Docker Compose 'app' service is not running.")
            print("   Please start services with: docker compose up -d")
            return False
        return True
    except subprocess.CalledProcessError:
        print("❌ Error: Unable to check Docker Compose status.")
        print("   Make sure Docker is installed and running.")
        return False
    except FileNotFoundError:
        print("❌ Error: Docker Compose is not installed or not in PATH.")
        return False


def check_and_install_dependencies():
    """Check if Node.js dependencies are installed and install if needed."""
    try:
        # Check if node_modules exists in the container
        result = subprocess.run(
            ["docker", "compose", "exec", "-T", "app", "sh", "-c",
             "test -d /workspace/node_modules && echo 'exists' || echo 'missing'"],
            capture_output=True,
            text=True,
            check=True
        )

        if 'missing' in result.stdout:
            print("📦 Installing Node.js dependencies (first time setup)...")
            install_result = subprocess.run(
                ["docker", "compose", "exec", "-T", "app", "sh", "-c",
                 "cd /workspace && npm install"],
                capture_output=True,
                text=True,
                check=False
            )

            if install_result.returncode == 0:
                print("✅ Dependencies installed successfully!")
                return True
            else:
                print("⚠️  Warning: Failed to install dependencies automatically.")
                print(
                    "   You may need to run: docker compose exec app sh -c 'cd /workspace && npm install'")
                return False

        return True
    except Exception as e:
        print(f"⚠️  Warning: Could not check dependencies: {e}")
        return True  # Continue anyway


def run_task(task_number, lines=40):
    """
    Run the specified task in the Docker container.

    Args:
        task_number: The task number to run (1-15, excluding 10)
        lines: Number of output lines to display (default: 40)
    """
    if task_number not in TASK_MAP:
        print(f"❌ Error: Task {task_number} not found.")
        print("\nValid task numbers: 1-9, 11-15 (Task 10 is manual reflection)")
        print_usage()
        return 1

    phase_folder, script_file, description = TASK_MAP[task_number]
    script_path = f"/workspace/src/{phase_folder}/{script_file}"

    print(f"🚀 Running Task {task_number}: {description}")
    print(f"📂 Script: src/{phase_folder}/{script_file}")
    print("-" * 70)

    # Check if the script file exists locally
    local_script_path = os.path.join("src", phase_folder, script_file)
    if not os.path.exists(local_script_path):
        print(f"❌ Error: {local_script_path} does not exist.")
        print("   Please create this file before running the task.")
        return 1

    # Build the command to run the script
    cmd = [
        "docker", "compose", "exec", "-T", "app",
        "node", script_path
    ]

    try:
        # Run the script and capture output
        result = subprocess.run(
            cmd, capture_output=True, text=True, check=False)

        # Display the output (limited by lines parameter)
        output_lines = result.stdout.split('\n')
        if len(output_lines) > lines:
            print('\n'.join(output_lines[:lines]))
            print(f"\n... (output truncated, showing first {lines} lines)")
        else:
            print(result.stdout)

        # Also show stderr if present
        if result.stderr:
            print(result.stderr, file=sys.stderr)

        print("-" * 70)

        # Check exit code
        if result.returncode == 0:
            print(f"✅ Task {task_number} completed successfully!")
            return 0
        else:
            print(
                f"❌ Task {task_number} failed with exit code: {result.returncode}")
            return 1

    except KeyboardInterrupt:
        print("\n⚠️  Interrupted by user")
        return 130
    except Exception as e:
        print(f"❌ Error running task: {e}")
        return 1


def parse_task_input(input_str):
    """
    Parse task input from various formats.

    Args:
        input_str: Can be "1", "task1", "phase1", "phase2", "phase3", or "all"

    Returns:
        list of task numbers to run, or None if invalid
    """
    input_lower = input_str.lower()

    # Check for 'all'
    if input_lower == "all":
        return sorted(TASK_MAP.keys())

    # Check for phase
    if input_lower in PHASE_MAP:
        return PHASE_MAP[input_lower]

    # Check for taskN format
    if input_lower.startswith("task"):
        try:
            task_num = int(input_lower[4:])
            if task_num in TASK_MAP:
                return [task_num]
        except ValueError:
            pass

    # Check for plain number
    try:
        task_num = int(input_str)
        if task_num in TASK_MAP:
            return [task_num]
    except ValueError:
        pass

    return None


def run_multiple_tasks(task_numbers, lines=40):
    """
    Run multiple tasks sequentially.

    Args:
        task_numbers: List of task numbers to run
        lines: Number of output lines to display per task
    """
    total = len(task_numbers)
    passed = 0
    failed = 0

    print(f"📋 Running {total} task(s)...")
    print("=" * 70)
    print()

    for i, task_num in enumerate(task_numbers, 1):
        print(f"\n{'=' * 70}")
        print(f"TASK {i}/{total}")
        print(f"{'=' * 70}\n")

        result = run_task(task_num, lines)

        if result == 0:
            passed += 1
        else:
            failed += 1

        # Add a small delay between tasks
        if i < total:
            time.sleep(1)

    # Print summary
    print(f"\n{'=' * 70}")
    print("📊 SUMMARY")
    print(f"{'=' * 70}")
    print(f"Total tasks run: {total}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"{'=' * 70}\n")

    return 0 if failed == 0 else 1


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("❌ Error: Missing argument")
        print_usage()
        return 1

    input_arg = sys.argv[1]

    # Parse the input
    task_numbers = parse_task_input(input_arg)

    if task_numbers is None:
        print(f"❌ Error: Invalid input '{input_arg}'")
        print("\nValid inputs:")
        print("  - Task numbers: 1-9, 11-15 (or task1, task2, etc.)")
        print("  - Phases: phase1, phase2, phase3")
        print("  - All tasks: all")
        print_usage()
        return 1

    # Parse optional lines argument
    lines = 40
    if len(sys.argv) >= 3:
        try:
            lines = int(sys.argv[2])
        except ValueError:
            print(
                f"⚠️  Warning: Invalid lines value '{sys.argv[2]}'. Using default: 40")

    # Check Docker before running any tasks
    if not check_docker_running():
        return 1

    # Check and install dependencies if needed
    check_and_install_dependencies()

    # Run single task or multiple tasks
    if len(task_numbers) == 1:
        return run_task(task_numbers[0], lines)
    else:
        return run_multiple_tasks(task_numbers, lines)


if __name__ == "__main__":
    sys.exit(main())
