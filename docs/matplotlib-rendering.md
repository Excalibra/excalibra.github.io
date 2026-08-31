# Matplotlib Rendering System

Complete solution for automatically rendering matplotlib code blocks in Markdown as images.

## Workflow

```
Markdown file (with tagged code blocks)
  ↓
Preprocessing script scans and executes Python code
  ↓
Generates images to static/generated-plots/
  ↓
Replaces code blocks with Hugo shortcode
  ↓
Hugo builds and deploys
```

## Usage

### 1. Tag code blocks in Markdown

Use the `matplotlib` tag to identify Python code blocks that need rendering:

````markdown
```python matplotlib
import matplotlib.pyplot as plt
import numpy as np

fig, ax = plt.subplots(figsize=(10, 6))
x = np.linspace(0, 10, 100)
ax.plot(x, np.sin(x), label='sin(x)')
ax.plot(x, np.cos(x), label='cos(x)')
ax.legend()
ax.set_title('Trigonometric Functions')

# The OUT variable is automatically set; can also be manually specified
# If not set, the script will add it automatically
fig.savefig(OUT, bbox_inches='tight', dpi=150)
plt.close(fig)
```
````

Or in abbreviated form:

````markdown
```matplotlib
from pathlib import Path
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.plot([1, 2, 3], [1, 4, 9])
fig.savefig(OUT)
plt.close(fig)
```
````

### 2. Local preview

Run in the project root:

```bash
# Check which files will be processed (without actually executing)
python scripts/render_matplotlib.py --dry-run

# Actually render
python scripts/render_matplotlib.py
```

Generated images are saved in `static/generated-plots/`, with filenames based on a hash of the code content.

### 3. Hot reload in development mode

Run directly:

```bash
# Recommended: use the project‑level dev entry
pnpm dev

# If you want to run hugo dev, make sure the project wrapper takes precedence over system Hugo
PATH="$PWD/bin:$PATH" hugo dev
```

This command starts both:

- `hugo serve`: handles hot updates for pages, templates, CSS
- `fswatch` watcher: automatically re‑runs `scripts/render_matplotlib.py` when content or render scripts change
- `scripts/dev-giscus.sh`: local giscus preview

During development, you only need to modify the matplotlib code in Markdown; on save, it will automatically re‑render to PNG, and Hugo will trigger a page refresh.

If `fswatch` is not installed on your machine, `dev.sh` can still start Hugo, but the matplotlib layer will not auto‑rerun; you will need to manually execute `python scripts/render_matplotlib.py`.

### 4. Automated deployment

1. **Output path**: use the `OUT` variable or let the script handle it automatically
2. **Close figures**: remember to call `plt.close(fig)` to avoid memory leaks
3. **Chinese fonts**: the script automatically detects system fonts, supporting macOS and Linux
4. **Timeout limit**: single code block execution time does not exceed 30 seconds

## Advanced Usage

### Custom image display

The shortcode supports additional parameters:

```markdown
{{< matplotlib src="/generated-plots/matplotlib_abc123.png" 
    alt="Custom image description" 
    caption="Figure 1: This is the chart caption" >}}
```

### Manually reference already generated images

If you do not want to re‑execute code every time, you can:

1. Run the generation once to create images
2. Note the image path
3. Manually reference it using the shortcode

## Architecture Features

### Separation of concerns
- **Preprocessing script**: code execution, image generation
- **Hugo shortcode**: image display, style control
- **GitHub Actions**: automated integration

### Caching mechanism
- Filenames are generated based on a hash of code content
- Identical code is not rendered repeatedly
- Images can be version‑controlled

### Cross‑platform compatibility
- Automatically detects macOS / Linux fonts
- Adapts to different system paths
- Uniform output format

## Troubleshooting

### Images not generated
- Check for syntax errors in the code
- Ensure `fig.savefig(OUT)` is called
- Look at the script’s error messages

### Chinese characters display as boxes
- macOS: ensure PingFang or Songti is installed
- Linux: install the `fonts-noto-cjk` package

### Local testing fails
```bash
# Install dependencies
pip install matplotlib

# Check Python version (requires 3.8+)
python --version
```

## File Structure

```
.
├── scripts/
│   └── render_matplotlib.py      # Core rendering script
├── layouts/
│   └── shortcodes/
│       └── matplotlib.html        # Hugo shortcode
├── assets/css/custom/
│   └── matplotlib.css             # Stylesheet
├── static/
│   └── generated-plots/           # Generated images (auto‑created)
└── .github/workflows/
    └── hugo.yml                   # CI/CD configuration
```

## Future Extensions

It can be easily extended to support other plotting libraries:
- Plotly (interactive charts)
- Seaborn (statistical visualizations)
- Graphviz (graph theory visualizations)
- D3.js (data‑driven documents)
