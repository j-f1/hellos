lang=$1

echo "Running test for $1"
time bash ./langs/$lang.sh
exit $?
