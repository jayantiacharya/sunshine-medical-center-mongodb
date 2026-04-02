#!/usr/bin/env bash
# Sunshine Medical Center MongoDB Project - Setup Script for macOS/Linux
# Run this script with: ./setup.sh or bash setup.sh

set -e  # Exit on error

echo "========================================"
echo "Sunshine Medical Center MongoDB Project Setup"
echo "========================================"
echo

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo
    echo "Please install Python 3.7+ from:"
    echo "  macOS: brew install python3"
    echo "  Linux: sudo apt-get install python3 (Ubuntu/Debian)"
    echo "         sudo yum install python3 (RHEL/CentOS)"
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "Found Python $PYTHON_VERSION"
echo

# Run the setup script
echo "Running setup script..."
echo
python3 setup.py

# Check exit code
if [ $? -eq 0 ]; then
    echo
    echo "========================================"
    echo "Setup completed successfully!"
    echo "========================================"
else
    echo
    echo "========================================"
    echo "Setup failed. See errors above."
    echo "========================================"
    exit 1
fi
