#!/usr/bin/env python3
"""
Gordian-X Offline Benchmark Engine — Entry Point
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Usage:
    python run_bench.py <command> [options]

Commands:
    generate [--count N]       Generate N benchmarks
    suggest "text"             Add a human suggestion
    rate <id> <1-5>            Rate a benchmark
    history [--limit N]        Show generation history
    stats                      Show engine statistics
    export [--output file]     Export benchmarks as JSON
    list-domains               List available domains
    list-techniques            List available techniques
    interactive                Interactive REPL mode
"""

import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from bench_engine.cli import main

if __name__ == "__main__":
    main()
