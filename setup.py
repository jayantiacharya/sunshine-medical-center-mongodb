#!/usr/bin/env python3
"""
Sunshine Medical Center MongoDB Project - Automated Setup Script
Cross-platform setup for students (Windows, macOS, Linux)

Prerequisites: Docker Desktop must be installed and running
"""

import subprocess
import sys
import time
import platform
import os
from pathlib import Path


class Colors:
    """ANSI color codes for terminal output"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

    @staticmethod
    def disable_on_windows():
        """Disable colors on Windows if not supported"""
        if platform.system() == 'Windows' and not os.environ.get('ANSICON'):
            for attr in dir(Colors):
                if not attr.startswith('__') and attr != 'disable_on_windows':
                    setattr(Colors, attr, '')


# Disable colors on Windows if terminal doesn't support ANSI
Colors.disable_on_windows()


def print_header(message):
    """Print a formatted header message"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'=' * 70}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{message.center(70)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'=' * 70}{Colors.ENDC}\n")


def print_step(step_num, message):
    """Print a formatted step message"""
    print(
        f"{Colors.OKCYAN}{Colors.BOLD}[Step {step_num}]{Colors.ENDC} {message}")


def print_success(message):
    """Print a success message"""
    print(f"{Colors.OKGREEN}✓ {message}{Colors.ENDC}")


def print_error(message):
    """Print an error message"""
    print(f"{Colors.FAIL}✗ {message}{Colors.ENDC}", file=sys.stderr)


def print_warning(message):
    """Print a warning message"""
    print(f"{Colors.WARNING}⚠ {message}{Colors.ENDC}")


def print_info(message):
    """Print an info message"""
    print(f"{Colors.OKBLUE}ℹ {message}{Colors.ENDC}")


def run_command(cmd, check=True, capture_output=False, timeout=120):
    """
    Run a shell command and handle errors

    Args:
        cmd: Command as list or string
        check: Raise exception on non-zero exit code
        capture_output: Capture stdout/stderr
        timeout: Command timeout in seconds

    Returns:
        subprocess.CompletedProcess object
    """
    try:
        if isinstance(cmd, str):
            # Use shell=True for string commands
            result = subprocess.run(
                cmd,
                shell=True,
                check=check,
                capture_output=capture_output,
                text=True,
                timeout=timeout
            )
        else:
            # Use shell=False for list commands
            result = subprocess.run(
                cmd,
                check=check,
                capture_output=capture_output,
                text=True,
                timeout=timeout
            )
        return result
    except subprocess.CalledProcessError as e:
        if capture_output:
            print_error(f"Command failed with exit code {e.returncode}")
            if e.stdout:
                print(f"Output: {e.stdout}")
            if e.stderr:
                print(f"Error: {e.stderr}")
        raise
    except subprocess.TimeoutExpired:
        print_error(f"Command timed out after {timeout} seconds")
        raise


def check_docker():
    """Check if Docker is installed and running"""
    print_step(1, "Checking Docker installation...")

    try:
        # Check if docker command exists
        result = run_command(['docker', '--version'], capture_output=True)
        print_success(f"Docker found: {result.stdout.strip()}")

        # Check if Docker daemon is running
        result = run_command(['docker', 'ps'], capture_output=True)
        print_success("Docker daemon is running")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print_error("Docker is not installed or not running")
        print_info(
            "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop")
        print_info(
            "Make sure Docker Desktop is running before running this script")
        return False


def check_docker_compose():
    """Check if Docker Compose is available"""
    try:
        # Try docker compose (v2, built into Docker Desktop)
        result = run_command(
            ['docker', 'compose', 'version'], capture_output=True)
        print_success(f"Docker Compose found: {result.stdout.strip()}")
        return 'docker compose'
    except subprocess.CalledProcessError:
        # Try docker-compose (v1, standalone)
        try:
            result = run_command(
                ['docker-compose', '--version'], capture_output=True)
            print_success(f"Docker Compose found: {result.stdout.strip()}")
            return 'docker-compose'
        except (subprocess.CalledProcessError, FileNotFoundError):
            print_error("Docker Compose not found")
            print_info("Docker Compose should be included with Docker Desktop")
            return None


def stop_existing_containers(compose_cmd):
    """Stop any existing containers"""
    print_step(2, "Stopping any existing containers...")

    try:
        run_command(f'{compose_cmd} down', capture_output=True)
        print_success("Stopped existing containers (if any)")
    except subprocess.CalledProcessError:
        print_warning("No existing containers to stop")


def start_services(compose_cmd):
    """Start Docker Compose services"""
    print_step(3, "Starting Docker services (MongoDB, app, Mongo Express)...")
    print_info("This may take a minute on first run (downloading images)...")

    try:
        # Start services in detached mode
        run_command(f'{compose_cmd} up -d', timeout=300)
        print_success("Services started successfully!")
        print_info("  • MongoDB: localhost:27017")
        print_info("  • Mongo Express UI: http://localhost:8081")
        print_info("  • App container: running in background")
    except subprocess.CalledProcessError as e:
        print_error("Failed to start services")
        print_info("Check if ports 27017 or 8081 are already in use")
        raise


def wait_for_mongodb(compose_cmd, max_wait=30):
    """Wait for MongoDB to be ready"""
    print_step(4, "Waiting for MongoDB to be ready...")

    start_time = time.time()
    while time.time() - start_time < max_wait:
        try:
            # Try to connect to MongoDB
            result = run_command(
                f'{compose_cmd} exec -T mongodb mongosh '
                f'"mongodb://admin:cs3550password@localhost:27017/admin?authSource=admin" '
                f'--eval "db.adminCommand(\'ping\')"',
                capture_output=True,
                timeout=5
            )
            if 'ok' in result.stdout.lower():
                print_success(
                    f"MongoDB is ready! (waited {int(time.time() - start_time)}s)")
                return True
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
            pass

        # Show progress
        elapsed = int(time.time() - start_time)
        print(f"\r  Waiting... ({elapsed}s)", end='', flush=True)
        time.sleep(2)

    print()  # New line after progress
    print_warning("MongoDB may not be fully ready, but continuing...")
    return False


def install_dependencies(compose_cmd):
    """Install Node.js dependencies in the app container"""
    print_step(5, "Installing Node.js dependencies...")

    try:
        result = run_command(
            f'{compose_cmd} exec -T app sh -c "cd /workspace && npm install"',
            capture_output=True,
            timeout=120
        )
        print_success("Node.js dependencies installed successfully!")
    except subprocess.CalledProcessError as e:
        print_error("Failed to install dependencies")
        print_info("You can try running this manually later:")
        print_info(
            f"  {compose_cmd} exec app sh -c 'cd /workspace && npm install'")
        raise


def seed_database(compose_cmd):
    """Seed the database with sample data (optional for students)"""
    print_step(6, "Checking for sample data...")

    # Check if this is student template (no instructor-solutions folder)
    if not Path('instructor-solutions').exists():
        print_info("This is a student template repository.")
        print_info(
            "You'll implement the seeding scripts as part of Phase 1 tasks.")
        print_info(
            "Database is ready but empty - waiting for your implementations!")
        return

    print_info("This will populate the database with initial seed data...")

    try:
        result = run_command(
            f'{compose_cmd} exec app node /workspace/src/seed/seed-database.js',
            timeout=60
        )
        print_success("Database seeded successfully!")
    except subprocess.CalledProcessError:
        print_error("Failed to seed database")
        print_info("You can try running this manually later:")
        print_info(
            f"  {compose_cmd} exec app node /workspace/src/seed/seed-database.js")
        raise


def run_sample_app(compose_cmd):
    """Verify setup by connecting to MongoDB and listing collections"""
    print_step(7, "Verifying database connection...")

    verify_script = (
        "const { MongoClient } = require('mongodb'); "
        "const client = new MongoClient(process.env.MONGODB_URI); "
        "client.connect().then(() => { "
        "  const db = client.db(process.env.DB_NAME); "
        "  return db.listCollections().toArray().then(cols => { "
        "    console.log('Connected to database:', process.env.DB_NAME); "
        "    console.log('Collections:', cols.map(c => c.name).join(', ') || '(none yet — ready for your implementations!)'); "
        "    return client.close(); "
        "  }); "
        "}).catch(err => { console.error('Connection error:', err.message); process.exit(1); });"
    )

    try:
        result = run_command(
            f'{compose_cmd} exec -T app node -e "{verify_script}"',
            capture_output=True,
            timeout=30
        )
        if result.stdout:
            for line in result.stdout.strip().splitlines():
                print_info(f"  {line}")
        print_success("Database connection verified!")
    except subprocess.CalledProcessError:
        print_warning("Could not verify database connection, but services are running")
        print_info("You can verify manually: docker compose exec app node -e \"require('mongodb').MongoClient.connect(process.env.MONGODB_URI).then(c => { console.log('OK'); c.close(); })\"")
        # Don't raise - this is just a verification step
        pass


def show_next_steps(compose_cmd):
    """Display next steps for the user"""
    print_header("Setup Complete! 🎉")

    print(f"{Colors.BOLD}Your environment is ready to use!{Colors.ENDC}\n")

    print(f"{Colors.BOLD}Access your tools:{Colors.ENDC}")
    print(
        f"  • Mongo Express UI: {Colors.OKGREEN}http://localhost:8081{Colors.ENDC}")
    print(f"  • MongoDB: {Colors.OKGREEN}localhost:27017{Colors.ENDC}")
    print()

    print(f"{Colors.BOLD}Common commands:{Colors.ENDC}")
    print(f"  Run your task implementations:")
    print(
        f"    {Colors.OKCYAN}python run-task.py task1{Colors.ENDC}  (or task2, task3, etc.)")
    print(
        f"    {Colors.OKCYAN}python run-task.py phase1{Colors.ENDC} (run all Phase 1 tasks)")
    print()
    print(f"  Run tests:")
    print(
        f"    {Colors.OKCYAN}{compose_cmd} exec app node --test /workspace/tests/phase1/{Colors.ENDC}")
    print()
    print(f"  Access MongoDB shell:")
    print(f"    {Colors.OKCYAN}{compose_cmd} run --rm mongosh 'mongodb://admin:cs3550password@mongodb:27017/sunshine_medical_center?authSource=admin'{Colors.ENDC}")
    print()
    print(f"  Open app container shell:")
    print(f"    {Colors.OKCYAN}{compose_cmd} exec app sh{Colors.ENDC}")
    print()
    print(f"  Stop all services:")
    print(f"    {Colors.OKCYAN}{compose_cmd} down{Colors.ENDC}")
    print()
    print(f"  Fresh start (reset database):")
    print(f"    {Colors.OKCYAN}{compose_cmd} down -v{Colors.ENDC}")
    print(f"    {Colors.OKCYAN}{compose_cmd} up -d{Colors.ENDC}")
    # Show different instructions based on whether this is instructor or student repo
    if Path('src/seed').exists():
        print(
            f"    {Colors.OKCYAN}{compose_cmd} exec app node /workspace/src/seed/seed-database.js{Colors.ENDC}")
    else:
        print(
            f"    {Colors.OKCYAN}docker compose exec app node /workspace/src/seed/seed-database.js{Colors.ENDC}")
    print()

    print(f"{Colors.BOLD}Documentation:{Colors.ENDC}")
    print(
        f"  • Quick Reference: {Colors.OKCYAN}docs/QUICK-REFERENCE.md{Colors.ENDC}")
    print(
        f"  • Student Guide: {Colors.OKCYAN}docs/STUDENT-SETUP-GUIDE.md{Colors.ENDC}")
    print(f"  • Main README: {Colors.OKCYAN}README.md{Colors.ENDC}")
    print()

    print(f"{Colors.WARNING}Tip: Keep this terminal output handy for the commands!{Colors.ENDC}")


def cleanup_on_error(compose_cmd):
    """Clean up containers if setup fails"""
    print_warning("\nCleaning up due to error...")
    try:
        run_command(f'{compose_cmd} down', capture_output=True)
        print_info("Containers stopped")
    except:
        pass


def main():
    """Main setup workflow"""
    print_header("Sunshine Medical Center MongoDB Project - Setup")
    print(f"{Colors.BOLD}Platform:{Colors.ENDC} {platform.system()} {platform.release()}")
    print(f"{Colors.BOLD}Python:{Colors.ENDC} {sys.version.split()[0]}\n")

    compose_cmd = None

    try:
        # Step 1: Check Docker
        if not check_docker():
            sys.exit(1)

        # Check Docker Compose
        compose_cmd = check_docker_compose()
        if not compose_cmd:
            sys.exit(1)

        # Step 2: Stop existing containers
        stop_existing_containers(compose_cmd)

        # Step 3: Start services
        start_services(compose_cmd)

        # Step 4: Wait for MongoDB
        wait_for_mongodb(compose_cmd)

        # Step 5: Install Node.js dependencies
        install_dependencies(compose_cmd)

        # Step 6: Seed database
        seed_database(compose_cmd)

        # Step 7: Run verification
        run_sample_app(compose_cmd)

        # Show next steps
        show_next_steps(compose_cmd)

        return 0

    except KeyboardInterrupt:
        print_warning("\n\nSetup interrupted by user")
        if compose_cmd:
            cleanup_on_error(compose_cmd)
        return 130

    except Exception as e:
        print_error(f"\n\nSetup failed: {str(e)}")
        if compose_cmd:
            cleanup_on_error(compose_cmd)
        print_info("\nFor manual setup, see: docs/STUDENT-SETUP-GUIDE.md")
        return 1


if __name__ == '__main__':
    sys.exit(main())
