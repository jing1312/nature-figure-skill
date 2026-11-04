#!/usr/bin/env python3
"""CI check: parse every SVG as real XML and report malformed ones.

Usage: python3 scripts/check-svg.py <path> [<path> ...]
Accepts files or directories (directories are walked for *.svg).
"""
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

fail = 0
checked = 0


def check_file(p: Path) -> None:
    global fail, checked
    checked += 1
    try:
        root = ET.parse(p).getroot()
    except ET.ParseError as e:
        print(f"  FAIL xml parse {p}: {e}")
        fail += 1
        return
    except OSError as e:
        print(f"  FAIL read {p}: {e}")
        fail += 1
        return
    tag = root.tag.split("}")[-1]
    if tag != "svg":
        print(f"  FAIL root element is <{tag}>, expected <svg> — {p}")
        fail += 1
        return
    if "viewBox" not in root.attrib:
        print(f"  FAIL missing viewBox — {p}")
        fail += 1
        return
    print(f"  ok  {p}")


def main(argv):
    global fail
    if len(argv) < 2:
        print("usage: check-svg.py <path> [<path> ...]")
        return 2
    for raw in argv[1:]:
        p = Path(raw)
        if p.is_dir():
            for f in sorted(p.rglob("*.svg")):
                check_file(f)
        elif p.exists():
            check_file(p)
        else:
            print(f"  FAIL missing path: {p}")
            fail += 1
    if fail:
        print(f"\n{fail} svg check(s) failed")
        return 1
    print(f"\nall {checked} svg files parsed cleanly")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
