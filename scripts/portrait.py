#!/usr/bin/env python3
"""Turn a photo into the brightness grid that Portrait.svelte draws.

Usage:
    python3 scripts/portrait.py path/to/photo.jpg

Requires ffmpeg. Writes src/lib/portrait.ts and prints a text preview.

The photo is cropped to CROP, shrunk to COLUMNS x ROWS cells, stretched to full
contrast, and faded to black outside an ellipse so the background drops away.
A photo with a plain, dark background gives the cleanest result. Adjust CROP
and the ellipse for a new photo.
"""

import math
import subprocess
import sys
from pathlib import Path

# The grid. Portrait.svelte draws each cell 7px wide and 11px tall.
COLUMNS, ROWS = 54, 42

# Region of the source photo to use, in pixels: width, height, left, top.
CROP = (270, 330, 60, 15)

# Ellipse that stays fully visible, in cells: center, then radii.
CENTER_X, CENTER_Y = 22.5, 21
RADIUS_X, RADIUS_Y = 25, 27
# Fraction of the radius where the fade to black begins.
FADE_START = 0.62

OUTPUT = Path(__file__).resolve().parent.parent / "src" / "lib" / "portrait.ts"
PREVIEW_RAMP = " .:-=+*#%@"


def read_cells(photo: str) -> bytes:
    """Returns one grayscale byte per cell, row by row."""
    width, height, left, top = CROP
    result = subprocess.run(
        [
            "ffmpeg", "-loglevel", "error", "-i", photo,
            "-vf", f"crop={width}:{height}:{left}:{top},scale={COLUMNS}:{ROWS}:flags=area",
            "-f", "rawvideo", "-pix_fmt", "gray", "-",
        ],
        check=True,
        capture_output=True,
    )
    if len(result.stdout) != COLUMNS * ROWS:
        raise SystemExit(f"Expected {COLUMNS * ROWS} cells, got {len(result.stdout)}.")
    return result.stdout


def fade(column: int, row: int) -> float:
    """1 inside the ellipse, easing to 0 at its edge."""
    distance = math.hypot((column - CENTER_X) / RADIUS_X, (row - CENTER_Y) / RADIUS_Y)
    if distance < FADE_START:
        return 1.0
    t = max(0.0, 1 - (distance - FADE_START) / (1 - FADE_START))
    return t * t * (3 - 2 * t)


def to_rows(cells: bytes) -> list[str]:
    # Stretch contrast between the 2nd and 98th percentiles.
    ordered = sorted(cells)
    low = ordered[int(len(ordered) * 0.02)]
    high = ordered[int(len(ordered) * 0.98)]

    rows = []
    for row in range(ROWS):
        digits = ""
        for column in range(COLUMNS):
            level = (cells[row * COLUMNS + column] - low) / (high - low)
            level = min(1.0, max(0.0, level)) * fade(column, row)
            digits += str(min(9, int(level * 10)))
        rows.append(digits)
    return rows


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)

    rows = to_rows(read_cells(sys.argv[1]))
    body = ",\n".join(f"\t'{row}'" for row in rows)
    OUTPUT.write_text(
        "/** Brightness of the portrait, one digit (0 dark to 9 bright) per character cell. */\n"
        f"export const PORTRAIT_ROWS = [\n{body}\n];\n"
    )

    print("\n".join("".join(PREVIEW_RAMP[int(d)] for d in row) for row in rows))
    print(f"\nWrote {OUTPUT}")


if __name__ == "__main__":
    main()
