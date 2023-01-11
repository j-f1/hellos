#!/bin/bash
lang=$1

echo "Running test for $1"
time bash ./run.sh
exit $?
