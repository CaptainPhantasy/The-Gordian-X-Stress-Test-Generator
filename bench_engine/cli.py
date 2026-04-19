#!/usr/bin/env python3
"""
Gordian-X Offline Benchmark Engine — CLI Interface
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Usage:
    python run_bench.py generate [--count N] [--domain DOMAIN] [--technique TECH] [--difficulty DIFF]
    python run_bench.py suggest "Your scenario text here" [--domain DOMAIN]
    python run_bench.py rate BENCHMARK_ID SCORE
    python run_bench.py history [--limit N] [--domain DOMAIN]
    python run_bench.py stats
    python run_bench.py export [--domain DOMAIN]
    python run_bench.py interactive
    python run_bench.py list-domains
    python run_bench.py list-techniques
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from typing import List, Optional

from bench_engine.engine import GordianEngine
from bench_engine.models import DOMAINS


def cmd_generate(args):
    engine = GordianEngine(state_dir=args.state_dir, seed=args.seed)

    techniques = None
    if args.techniques:
        techniques = [t.strip() for t in args.techniques.split(",")]

    result = engine.generate(
        count=args.count,
        domain=args.domain,
        technique=args.technique,
        difficulty=args.difficulty,
        custom_instructions=args.instructions,
        include_human_seeds=not args.no_human,
        allow_mutation=not args.no_mutation,
        techniques=techniques,
    )

    print(f"\n{'═' * 60}")
    print(f"  GORDIAN-X BENCHMARK GENERATION COMPLETE")
    print(f"{'═' * 60}")
    print(f"  {result.summary()}")
    print(f"{'═' * 60}\n")

    for i, bm in enumerate(result.benchmarks, 1):
        print(f"┌─ Benchmark #{i} [{bm.id}] ─────────────────────────")
        print(f"│ Domain:    {bm.domain}")
        print(f"│ Technique: {bm.technique}")
        print(f"│ Difficulty: {bm.difficulty}")
        print(f"│ Source:    {bm.source}")
        print(f"│")
        print(f"│ SCENARIO:")
        # Wrap scenario text
        words = bm.scenario.split()
        line = "│ "
        for word in words:
            if len(line) + len(word) + 1 > 72:
                print(line)
                line = "│ " + word
            else:
                line += (" " if line != "│ " else "") + word
        if line.strip() != "│":
            print(line)
        print(f"│")
        if bm.grading_criteria:
            print(f"│ Grading Criteria:")
            for gc in bm.grading_criteria[:3]:
                print(f"│   • {gc}")
        if bm.red_flags:
            print(f"│ Red Flags:")
            for rf in bm.red_flags[:3]:
                print(f"│   ⚠ {rf}")
        print(f"└{'─' * 50}\n")

    if args.output:
        with open(args.output, "w") as f:
            json.dump([bm.to_dict() for bm in result.benchmarks], f, indent=2)
        print(f"  → Saved to {args.output}")

    return result


def cmd_suggest(args):
    engine = GordianEngine(state_dir=args.state_dir)
    benchmarks = engine.add_suggestion(args.text, domain=args.domain, difficulty=args.difficulty)

    print(f"\n  Parsed {len(benchmarks)} benchmark(s) from suggestion:\n")
    for i, bm in enumerate(benchmarks, 1):
        print(f"  [{i}] {bm.domain} / {bm.technique} / {bm.difficulty}")
        print(f"      {bm.scenario[:100]}...")
        print()


def cmd_rate(args):
    engine = GordianEngine(state_dir=args.state_dir)
    engine.rate_benchmark(args.benchmark_id, args.score)
    print(f"  Rated {args.benchmark_id} → {args.score}/5")


def cmd_history(args):
    engine = GordianEngine(state_dir=args.state_dir)
    benchmarks = engine.history(limit=args.limit, domain=args.domain)

    if not benchmarks:
        print("  No benchmarks in history.")
        return

    print(f"\n  Last {len(benchmarks)} benchmarks:\n")
    for i, bm in enumerate(benchmarks, 1):
        print(f"  {i:3d}. [{bm.id}] {bm.domain:25s} {bm.technique:25s} {bm.difficulty:12s} ({bm.source})")
        print(f"       {bm.scenario[:80]}...")
    print()


def cmd_stats(args):
    engine = GordianEngine(state_dir=args.state_dir)
    stats = engine.stats()

    print(f"\n{'═' * 50}")
    print(f"  GORDIAN-X ENGINE STATISTICS")
    print(f"{'═' * 50}")
    print(f"  Total benchmarks generated: {stats['total_benchmarks']}")
    print(f"  Estimated remaining combos: {stats['estimated_remaining']:,}")
    print()

    if stats['domain_distribution']:
        print("  Domain Distribution:")
        for domain, count in sorted(stats['domain_distribution'].items(), key=lambda x: -x[1]):
            bar = "█" * min(count, 30)
            print(f"    {domain:30s} {count:4d} {bar}")
        print()

    if stats['technique_distribution']:
        print("  Technique Distribution:")
        for tech, count in sorted(stats['technique_distribution'].items(), key=lambda x: -x[1]):
            bar = "█" * min(count, 30)
            print(f"    {tech:30s} {count:4d} {bar}")
        print()

    dedup = stats['dedup']
    print(f"  Dedup Index: {dedup['fingerprints']} fingerprints, "
          f"{dedup['profiles']} profiles, "
          f"{dedup['unique_ngrams']} unique n-grams")
    print(f"{'═' * 50}\n")


def cmd_export(args):
    engine = GordianEngine(state_dir=args.state_dir)
    data = engine.export(domain=args.domain)

    if args.output:
        with open(args.output, "w") as f:
            f.write(data)
        print(f"  Exported to {args.output}")
    else:
        print(data)


def cmd_list_domains(args):
    engine = GordianEngine(state_dir=args.state_dir)
    print("\n  Available Domains:\n")
    for i, d in enumerate(engine.list_domains(), 1):
        combos = engine.kb.count_combinations(d)
        print(f"    {i:2d}. {d:30s} (~{combos:,} combinations)")
    print()


def cmd_list_techniques(args):
    engine = GordianEngine(state_dir=args.state_dir)
    print("\n  Available Techniques:\n")
    for i, t in enumerate(engine.list_techniques(), 1):
        print(f"    {i:2d}. {t}")
    print()


def cmd_interactive(args):
    """Interactive REPL mode."""
    engine = GordianEngine(state_dir=args.state_dir, seed=args.seed)

    print(f"\n{'═' * 60}")
    print(f"  GORDIAN-X INTERACTIVE BENCHMARK ENGINE")
    print(f"{'═' * 60}")
    print(f"  Commands:")
    print(f"    generate [N]        — Generate N benchmarks (default: 3)")
    print(f"    suggest <text>      — Add a human suggestion")
    print(f"    rate <id> <1-5>     — Rate a benchmark")
    print(f"    history [N]         — Show last N benchmarks")
    print(f"    stats               — Show engine statistics")
    print(f"    domain <name>       — Set domain filter")
    print(f"    difficulty <level>  — Set difficulty filter")
    print(f"    technique <name>    — Set technique filter")
    print(f"    export              — Export all benchmarks")
    print(f"    help                — Show this help")
    print(f"    quit                — Exit")
    print(f"{'═' * 60}\n")

    current_domain = None
    current_difficulty = None
    current_technique = None

    while True:
        try:
            prompt_parts = []
            if current_domain:
                prompt_parts.append(current_domain[:15])
            if current_technique:
                prompt_parts.append(current_technique[:12])
            if current_difficulty:
                prompt_parts.append(current_difficulty)
            prompt_suffix = "/".join(prompt_parts) if prompt_parts else "all"
            line = input(f"gordian-x [{prompt_suffix}]> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n  Exiting.")
            break

        if not line:
            continue

        parts = line.split(maxsplit=1)
        cmd = parts[0].lower()
        rest = parts[1] if len(parts) > 1 else ""

        if cmd in ("quit", "exit", "q"):
            print("  Exiting.")
            break

        elif cmd == "help":
            print("  Type 'generate', 'suggest', 'rate', 'history', 'stats', 'export', 'quit'")

        elif cmd == "generate":
            count = 3
            if rest:
                try:
                    count = int(rest)
                except ValueError:
                    pass
            result = engine.generate(
                count=count,
                domain=current_domain,
                technique=current_technique,
                difficulty=current_difficulty,
            )
            print(f"\n  {result.summary()}\n")
            for i, bm in enumerate(result.benchmarks, 1):
                print(f"  [{i}] {bm.scenario[:90]}...")
                print(f"      {bm.domain} / {bm.technique} / {bm.difficulty}")
            print()

        elif cmd == "suggest":
            if not rest:
                print("  Usage: suggest <scenario text>")
                continue
            benchmarks = engine.add_suggestion(rest, domain=current_domain, difficulty=current_difficulty)
            print(f"  Added {len(benchmarks)} suggestion(s).")

        elif cmd == "rate":
            try:
                parts2 = rest.split()
                bm_id = parts2[0]
                score = int(parts2[1])
                engine.rate_benchmark(bm_id, score)
                print(f"  Rated {bm_id} → {score}/5")
            except (IndexError, ValueError):
                print("  Usage: rate <benchmark_id> <1-5>")

        elif cmd == "history":
            limit = 10
            if rest:
                try:
                    limit = int(rest)
                except ValueError:
                    pass
            benchmarks = engine.history(limit=limit, domain=current_domain)
            for i, bm in enumerate(benchmarks, 1):
                print(f"  {i:2d}. [{bm.id}] {bm.scenario[:70]}...")
            if not benchmarks:
                print("  No history yet.")

        elif cmd == "stats":
            stats = engine.stats()
            print(f"  Total: {stats['total_benchmarks']} | Remaining: ~{stats['estimated_remaining']:,}")

        elif cmd == "domain":
            if rest:
                domain = rest.strip()
                if domain.lower() in ("none", "all", "clear", "reset"):
                    current_domain = None
                    print("  Domain filter cleared.")
                elif domain in engine.list_domains():
                    current_domain = domain
                    print(f"  Domain set to: {domain}")
                else:
                    # Fuzzy match
                    matches = [d for d in engine.list_domains() if domain.lower() in d.lower()]
                    if len(matches) == 1:
                        current_domain = matches[0]
                        print(f"  Domain set to: {matches[0]}")
                    else:
                        print(f"  Unknown domain. Available: {', '.join(engine.list_domains())}")
            else:
                print(f"  Current domain: {current_domain or 'all'}")

        elif cmd == "technique":
            if rest:
                tech = rest.strip()
                if tech.lower() in ("none", "all", "clear", "reset"):
                    current_technique = None
                    print("  Technique filter cleared.")
                elif tech in engine.list_techniques():
                    current_technique = tech
                    print(f"  Technique set to: {tech}")
                else:
                    print(f"  Unknown technique. Available: {', '.join(engine.list_techniques())}")
            else:
                print(f"  Current technique: {current_technique or 'all'}")

        elif cmd == "difficulty":
            if rest:
                diff = rest.strip().lower()
                if diff in ("easy", "medium", "hard", "expert", "adversarial"):
                    current_difficulty = diff
                    print(f"  Difficulty set to: {diff}")
                elif diff in ("none", "all", "clear", "reset"):
                    current_difficulty = None
                    print("  Difficulty filter cleared.")
                else:
                    print("  Levels: easy, medium, hard, expert, adversarial")
            else:
                print(f"  Current difficulty: {current_difficulty or 'random'}")

        elif cmd == "export":
            data = engine.export(domain=current_domain)
            filename = f"gordian_export_{int(time.time())}.json"
            with open(filename, "w") as f:
                f.write(data)
            print(f"  Exported to {filename}")

        else:
            # Treat unknown command as a suggestion
            benchmarks = engine.add_suggestion(line, domain=current_domain)
            if benchmarks:
                print(f"  Interpreted as suggestion → {len(benchmarks)} benchmark(s) added.")
            else:
                print(f"  Unknown command: {cmd}. Type 'help' for commands.")


def main():
    parser = argparse.ArgumentParser(
        prog="gordian-x",
        description="Gordian-X Offline Benchmark Engine",
    )
    parser.add_argument("--state-dir", default=None, help="State directory path")
    parser.add_argument("--seed", type=int, default=None, help="Random seed for reproducibility")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    # generate
    gen_parser = subparsers.add_parser("generate", help="Generate benchmarks")
    gen_parser.add_argument("--count", "-n", type=int, default=5, help="Number of benchmarks")
    gen_parser.add_argument("--domain", "-d", default=None, help="Domain filter")
    gen_parser.add_argument("--technique", "-t", default=None, help="Technique filter")
    gen_parser.add_argument("--techniques", default=None, help="Comma-separated technique list")
    gen_parser.add_argument("--difficulty", default=None, help="Difficulty level")
    gen_parser.add_argument("--instructions", "-i", default=None, help="Custom instructions")
    gen_parser.add_argument("--output", "-o", default=None, help="Output file (JSON)")
    gen_parser.add_argument("--no-human", action="store_true", help="Skip human seeds")
    gen_parser.add_argument("--no-mutation", action="store_true", help="Disable mutation")

    # suggest
    sug_parser = subparsers.add_parser("suggest", help="Add a human suggestion")
    sug_parser.add_argument("text", help="Suggestion text")
    sug_parser.add_argument("--domain", "-d", default=None)
    sug_parser.add_argument("--difficulty", default=None)

    # rate
    rate_parser = subparsers.add_parser("rate", help="Rate a benchmark")
    rate_parser.add_argument("benchmark_id", help="Benchmark ID")
    rate_parser.add_argument("score", type=int, help="Score 1-5")

    # history
    hist_parser = subparsers.add_parser("history", help="Show generation history")
    hist_parser.add_argument("--limit", "-n", type=int, default=20)
    hist_parser.add_argument("--domain", "-d", default=None)

    # stats
    subparsers.add_parser("stats", help="Show engine statistics")

    # export
    exp_parser = subparsers.add_parser("export", help="Export benchmarks")
    exp_parser.add_argument("--domain", "-d", default=None)
    exp_parser.add_argument("--output", "-o", default=None)

    # list-domains
    subparsers.add_parser("list-domains", help="List available domains")

    # list-techniques
    subparsers.add_parser("list-techniques", help="List available techniques")

    # interactive
    subparsers.add_parser("interactive", help="Interactive REPL mode")

    args = parser.parse_args()

    commands = {
        "generate": cmd_generate,
        "suggest": cmd_suggest,
        "rate": cmd_rate,
        "history": cmd_history,
        "stats": cmd_stats,
        "export": cmd_export,
        "list-domains": cmd_list_domains,
        "list-techniques": cmd_list_techniques,
        "interactive": cmd_interactive,
    }

    if args.command in commands:
        commands[args.command](args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
