#!/usr/bin/env bash
# Full balancing sweep: every joker forced on the same seeds, plus a baseline, split across
# all CPU cores, then ranked by tools/analyze.py.
#   tools/sweep.sh [runs per joker, default 500] [board size, default 10]
# Writes sweep/runs.csv and sweep/report.txt.
set -euo pipefail
cd "$(dirname "$0")/.."
RUNS="${1:-500}"
BOARD="${2:-10}"
CORES="$( (command -v nproc >/dev/null && nproc) || sysctl -n hw.ncpu 2>/dev/null || echo 4)"
mkdir -p sweep
echo "Sweep: $RUNS runs per joker, board $BOARD, $CORES workers"
for ((k = 0; k < CORES; k++)); do
  node tools/bot.js --force-each --runs "$RUNS" --board "$BOARD" --part "$k/$CORES" --out "sweep/part-$k.csv" > /dev/null &
done
wait
head -n 1 sweep/part-0.csv > sweep/runs.csv
for f in sweep/part-*.csv; do tail -n +2 "$f" >> sweep/runs.csv; done
rm sweep/part-*.csv
python3 tools/analyze.py sweep/runs.csv | tee sweep/report.txt
