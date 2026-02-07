# n8n-nodes-markmap

This is an [n8n](https://n8n.io) community node that converts **Markdown text** into a self-contained, interactive **markmap mind-map HTML page**.

[markmap](https://markmap.js.org/) is a library that visualizes Markdown documents as interactive mind maps.

> **Note:** This node supports both CDN and Local rendering modes. By default, it uses CDN for faster loading. You can switch to Local mode for offline use.

## Installation

Follow the [n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

```
npm install n8n-nodes-markmap
```

## Operations

### Markdown to HTML

Takes Markdown text as input and produces a fully self-contained HTML page with an interactive mind-map visualization.

**Inputs:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| Markdown Text | string | (required) | The Markdown content to visualize |
| Title | string | `Markmap` | Title for the HTML page |

**Options:**

| Option | Type | Default | Description |
|---|---|---|---|
| Render Mode | string | `cdn` | Choose how to load libraries: `cdn` (requires internet) or `local` (offline, embedded) |
| Color Freeze Level | number | `0` | Freeze branch colors at a specific depth |
| Initial Expand Level | number | `-1` | Max node depth to expand on load (`-1` = all) |
| Max Width | number | `0` | Max width of node content in px (`0` = unlimited) |
| Zoom | boolean | `true` | Enable zoom on the mind-map |
| Pan | boolean | `true` | Enable panning on the mind-map |
| Output Field | string | `html` | Name of the output JSON field containing the HTML |

**Screenshot Options:**

| Option | Type | Default | Description |
|---|---|---|---|
| Enable Screenshot | boolean | `false` | Whether to generate a screenshot of the mindmap using Puppeteer |
| Chrome Executable Path | string | `C:\Program Files\Google\Chrome\Application\chrome.exe` | Path to the Chrome/Chromium executable for Puppeteer. Can also be set via `PUPPETEER_EXECUTABLE_PATH` environment variable (takes priority) |
| Screenshot Width | number | `1920` | Width of the screenshot in pixels |
| Screenshot Height | number | `1080` | Height of the screenshot in pixels |
| Wait Time (ms) | number | `2000` | Time to wait for the mindmap animation to complete before taking screenshot |
| Full Page Screenshot | boolean | `false` | Whether to capture the full scrollable page or just the viewport |
| Output Format | string | `binary` | How to output the screenshot: `binary` (as binary data) or `base64` (as base64 encoded string) |

**Output:**

The node adds a field (default: `html`) to each item containing the complete HTML page string. You can then:

- Write it to a file using the **Write Binary File** node
- Send it as an email attachment
- Return it as an HTTP response
- Store it in a database

When screenshot is enabled, the node will also output:
- **Binary mode**: A binary field named `screenshot` containing the PNG image
- **Base64 mode**: JSON fields `screenshotBase64` and `screenshotMimeType` containing the base64-encoded image

## Markdown Format Specification

The node uses standard Markdown syntax to build the mind-map hierarchy:

- `# Title` - Root node (level 1 heading), represents the main topic
- `## Branch` - Second-level node (level 2 heading), represents main branches
- `### Sub-branch` - Third-level node (level 3 heading), represents sub-branches
- `- List item` - Leaf nodes (bullet points), represents end content

**Example Structure:**
```markdown
# Project Plan (root)
## Phase 1 (branch)
### Task A (sub-branch)
- Detail 1 (leaf)
- Detail 2 (leaf)
## Phase 2 (branch)
- Summary (leaf)
```

The hierarchy is: `# Root` → `## Branch` → `### Sub-branch` → `- Leaf`

## Example Workflows

### Basic HTML Generation
```
[Manual Trigger] -> [Set node with Markdown] -> [Markmap] -> [Write Binary File]
```

### With Screenshot
```
[Manual Trigger] -> [Set node with Markdown] -> [Markmap with Screenshot enabled] -> [Write Binary File for HTML] -> [Write Binary File for Screenshot]
```

## Compatibility

- n8n >= 1.0.0
- Node.js >= 18

## License

MIT
