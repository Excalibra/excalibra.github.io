#!/usr/bin/env python3
"""
Matplotlib code block pre-render script

Scans Markdown files in content/ for code blocks tagged as matplotlib,
executes the code to generate images, and replaces the block with an image reference.

Usage:
    python scripts/render_matplotlib.py [--dry-run]
"""

import hashlib
import re
import subprocess
import sys
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Tuple

# Project root directory
ROOT = Path(__file__).parent.parent
CONTENT_DIR = ROOT / "content"
STATIC_DIR = ROOT / "static"
OUTPUT_DIR = STATIC_DIR / "generated-plots"
RENDERER_VERSION = "2026-08-27-v2"

# Matplotlib code block pattern: ```python matplotlib or ```matplotlib
PATTERN = re.compile(
    r'```(?:[^\n`]*\s+)?matplotlib\s*\n(.*?)```',
    re.DOTALL | re.MULTILINE
)

RENDER_BLOCK_PATTERN = re.compile(
    r'^\n*(?:<!-- matplotlib-render:start -->.*?<!-- matplotlib-render:end -->\n*)',
    re.DOTALL,
)


def ensure_output_dir():
    """Ensure the output directory exists."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def code_hash(code: str) -> str:
    """Generate a hash of the code to use as the filename."""
    payload = f"{RENDERER_VERSION}\n{code}"
    return hashlib.sha256(payload.encode()).hexdigest()[:12]


CJK_FONT_BOOTSTRAP = r'''
from pathlib import Path as _MatplotlibRenderPath

import matplotlib.pyplot as _matplotlib_render_plt
from matplotlib import font_manager as _matplotlib_render_fm
from matplotlib import rcParams as _matplotlib_render_rcParams

# Common CJK fonts for Windows, macOS, and Linux
_matplotlib_render_font_candidates = [
    # Windows: Chinese + Japanese common fonts
    r'C:/Windows/Fonts/msyh.ttc',
    r'C:/Windows/Fonts/msyhbd.ttc',
    r'C:/Windows/Fonts/simhei.ttf',
    r'C:/Windows/Fonts/simsun.ttc',
    r'C:/Windows/Fonts/meiryo.ttc',
    r'C:/Windows/Fonts/YuGothM.ttc',
    r'C:/Windows/Fonts/msgothic.ttc',
    # macOS: Chinese + Japanese common fonts
    '/System/Library/Fonts/PingFang.ttc',
    '/System/Library/Fonts/Supplemental/Songti.ttc',
    '/System/Library/Fonts/Supplemental/Hiragino Sans GB.ttc',
    '/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc',
    '/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc',
    '/Library/Fonts/Arial Unicode.ttf',
    # Linux / GitHub Actions: recommended to install fonts-noto-cjk
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
    '/usr/share/fonts/opentype/noto/NotoSansCJKsc-Regular.otf',
    '/usr/share/fonts/opentype/noto/NotoSansCJKjp-Regular.otf',
    '/usr/share/fonts/truetype/wqy/wqy-microhei.ttc',
]

_matplotlib_render_font_path = next(
    (font for font in _matplotlib_render_font_candidates if _MatplotlibRenderPath(font).exists()),
    None,
)

if _matplotlib_render_font_path:
    _matplotlib_render_fm.fontManager.addfont(_matplotlib_render_font_path)
    CJK_FONT_PROP = _matplotlib_render_fm.FontProperties(fname=_matplotlib_render_font_path)
    CJK_FONT_NAME = CJK_FONT_PROP.get_name()
    _matplotlib_render_rcParams['font.family'] = CJK_FONT_NAME
    _matplotlib_render_rcParams['font.sans-serif'] = [CJK_FONT_NAME]
else:
    CJK_FONT_PROP = None
    CJK_FONT_NAME = 'sans-serif'

_matplotlib_render_rcParams['axes.unicode_minus'] = False
'''


def content_date_for_file(md_path: Path) -> str:
    """Extract the article date, preferring YYYY-MM-DD from the filename."""
    match = re.search(r'(\d{4}-\d{2}-\d{2})', md_path.name)
    if match:
        return match.group(1)
    return datetime.fromtimestamp(md_path.stat().st_mtime).strftime('%Y-%m-%d')


def inject_after_imports(code: str, injection: str) -> str:
    """Insert the injection content after import statements, preserving structure."""
    lines = code.splitlines()
    insert_at = 0

    for index, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith(('import ', 'from ')) or not stripped:
            insert_at = index + 1
            continue
        break

    return '\n'.join(lines[:insert_at] + [injection.strip()] + lines[insert_at:])


def build_render_block(img_url: str) -> str:
    return (
        "\n\n<!-- matplotlib-render:start -->\n"
        f"{{{{< matplotlib src=\"{img_url}\" >}}}}\n"
        "<!-- matplotlib-render:end -->\n"
    )


def adapt_code_for_rendering(code: str, output_path: Path) -> str:
    code = re.sub(
        r'OUT\s*=\s*Path\([\'"].*?[\'"]\)',
        f'OUT = Path("{output_path}")',
        code,
    )

    code = re.sub(
        r"rcParams\s*\[\s*['\"]font\.family['\"]\s*\]\s*=\s*[^\n]+",
        "rcParams['font.family'] = CJK_FONT_NAME",
        code,
    )
    code = re.sub(
        r"plt\.rcParams\s*\[\s*['\"]font\.family['\"]\s*\]\s*=\s*[^\n]+",
        "plt.rcParams['font.family'] = CJK_FONT_NAME",
        code,
    )

    if 'OUT = Path' not in code:
        code = inject_after_imports(code, f'OUT = Path("{output_path}")')

    return inject_after_imports(code, CJK_FONT_BOOTSTRAP)


def execute_matplotlib_code(code: str, output_path: Path) -> bool:
    """
    Execute matplotlib code in a temporary environment.
    Returns True on success.
    """
    adapted_code = adapt_code_for_rendering(code, output_path)

    # Create a temporary Python file
    with tempfile.NamedTemporaryFile(
        mode='w', suffix='.py', delete=False, encoding='utf-8'
    ) as f:
        f.write(adapted_code)
        temp_file = Path(f.name)

    try:
        # Execute the Python script
        result = subprocess.run(
            [sys.executable, str(temp_file)],
            capture_output=True,
            text=True,
            timeout=30
        )

        if result.returncode != 0:
            print(f"❌ Execution failed: {result.stderr}", file=sys.stderr)
            return False

        if not output_path.exists():
            print(f"❌ Image not generated: {output_path}", file=sys.stderr)
            return False

        return True

    except subprocess.TimeoutExpired:
        print(f"❌ Execution timed out", file=sys.stderr)
        return False

    finally:
        temp_file.unlink(missing_ok=True)


def process_markdown_file(
    md_path: Path, dry_run: bool = False
) -> Tuple[int, int]:
    """
    Process a single Markdown file.
    Returns (number of blocks found, number successfully rendered).
    """
    content = md_path.read_text(encoding='utf-8')
    matches = list(PATTERN.finditer(content))

    if not matches:
        return 0, 0

    print(f"\n📄 {md_path.relative_to(ROOT)}")

    replacements = []
    success_count = 0

    article_date = content_date_for_file(md_path)

    for match in matches:
        code = match.group(1).strip()
        code_id = code_hash(code)

        # Generate image filename
        img_filename = f"{article_date}-{code_id}.png"
        img_path = OUTPUT_DIR / img_filename
        img_url = f"/generated-plots/{img_filename}"

        print(f"  🔍 Found code block {code_id}...", end=" ")

        if img_path.exists():
            print("✓ Already exists")
            success_count += 1
        elif dry_run:
            print("⏭️  Skipped (dry-run)")
        else:
            # Execute code to generate image
            if execute_matplotlib_code(code, img_path):
                print("✅ Generated successfully")
                success_count += 1
            else:
                print("❌ Generation failed")
                continue

        existing_render = RENDER_BLOCK_PATTERN.match(content[match.end():])
        span_end = match.end() + (existing_render.end() if existing_render else 0)
        replacement = content[match.start():match.end()] + build_render_block(img_url)
        replacements.append((match.start(), span_end, replacement))

    # Apply replacements from back to front to avoid offset issues
    if replacements and not dry_run:
        new_content = content
        for start, end, replacement in reversed(replacements):
            new_content = new_content[:start] + replacement + new_content[end:]

        # Only write if the content actually changed, to avoid unnecessary Hugo rebuilds
        if new_content != content:
            md_path.write_text(new_content, encoding='utf-8')
            print(f"  💾 Updated Markdown file")
        else:
            print(f"  ✓ No content changes, skipping write")

    return len(matches), success_count


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Render matplotlib code blocks in Markdown')
    parser.add_argument('--dry-run', action='store_true', help='Check only, do not execute')
    args = parser.parse_args()

    ensure_output_dir()

    print("🚀 Starting scan of Markdown files...")

    # Recursively find all .md files
    md_files = list(CONTENT_DIR.rglob("*.md"))
    total_blocks = 0
    total_success = 0

    for md_file in md_files:
        blocks, success = process_markdown_file(md_file, args.dry_run)
        total_blocks += blocks
        total_success += success

    print(f"\n{'='*60}")
    print(f"📊 Summary: Found {total_blocks} code blocks, successfully rendered {total_success}")

    if args.dry_run:
        print("⚠️  This was a dry-run, no files were modified")

    return 0 if total_success == total_blocks else 1


if __name__ == "__main__":
    sys.exit(main())
