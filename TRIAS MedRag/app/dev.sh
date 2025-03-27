#!/bin/sh

# cd into the parent directory of the script, 
# so that the script generates virtual environments always in the same path.
cd "${0%/*}" || exit 1

cd ../
echo 'Creating python virtual environment ".venv"'
python3 -m venv .venv

echo ""
echo "Restoring backend python packages"
echo ""

./.venv/bin/python -m pip install -r app/backend/requirements.txt
out=$?
if [ $out -ne 0 ]; then
    echo "Failed to restore backend python packages"
    exit $out
fi

echo ""
echo "Restoring frontend npm packages"
echo ""

cd app/frontend
npm install
out=$?
if [ $out -ne 0 ]; then
    echo "Failed to restore frontend npm packages"
    exit $out
fi

echo ""
echo "Starting development environment"
echo ""

# Start frontend with Vite's dev server
echo "Starting frontend at http://localhost:5173"
npm run dev &
FRONTEND_PID=$!

# Give Vite time to start
sleep 3

# Navigate to backend directory
cd ../backend

echo ""
echo "Starting backend with hot reloading at http://localhost:50505"
echo ""

# Quart uses --reload instead of --debug
../../.venv/bin/python -m quart --app main:app run --reload --port 50505 --host localhost

# If backend stops, kill the frontend process
kill $FRONTEND_PID 2>/dev/null

echo ""
echo "Development environment stopped"
echo ""
