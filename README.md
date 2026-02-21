<<<<<<< HEAD
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

**Node Spacing Options:**

| Option | Type | Default | Description |
|---|---|---|---|
| Horizontal Spacing | number | `80` | Horizontal spacing between nodes in pixels |
| Vertical Spacing | number | `5` | Vertical spacing between nodes in pixels |
| Node Min Height | number | `16` | Minimum height of each node in pixels |
| Padding X | number | `8` | Horizontal padding inside nodes in pixels |

**Table Spacing Options:**

| Option | Type | Default | Description |
|---|---|---|---|
| Table Cell Padding | string | `4px 8px` | Padding inside table cells (CSS format, e.g., "8px 12px") |
| Table Margin | string | `8px 0` | Margin around tables (CSS format, e.g., "10px 0") |

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

## Supported Markdown Features

### Frontmatter Configuration

You can configure markmap options using YAML frontmatter at the beginning of your Markdown:

```markdown
---
title: My Mindmap
markmap:
  colorFreezeLevel: 2
  maxWidth: 300
---

# Your content here
```

### Text Formatting

- **Bold text**: `**strong**`
- ~~Strikethrough~~: `~~del~~`
- *Italic*: `*italic*`
- ==Highlight==: `==highlight==`
- `Inline code`: `` `inline code` ``

### Lists

- Unordered lists with `-` or `*`
- Ordered lists with `1. 2. 3.`
- Nested lists by indentation
- [x] Checkbox support: `[x]` for checked, `[ ]` for unchecked

```markdown
- Parent item
  - Child item 1
  - Child item 2
- [x] Completed task
- [ ] Pending task
```

### Code Blocks

Syntax highlighted code blocks:

```markdown
```javascript
console.log('Hello, World!');
```
```

### Tables

Markdown tables are fully supported:

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |
```

### Math (Katex)

Mathematical expressions using Katex:

```markdown
- $x = {-b \pm \sqrt{b^2-4ac} \over 2a}$ <!-- markmap: fold -->
```

### Links

- External links: `https://markmap.js.org/`
- GitHub links: `https://github.com/gera2ld/markmap`

### Images

```markdown
![](https://markmap.js.org/favicon.png)
```

### Important Notes

- If blocks (like code blocks, tables) and lists appear at the same level, the lists will be ignored
- Use the `maxWidth` option to wrap very long text
- Add `<!-- markmap: fold -->` comment to fold specific nodes by default

## Example Workflows

### Basic HTML Generation
```
[Manual Trigger] -> [Set node with Markdown] -> [Markmap] -> [Write Binary File]
```

### With Screenshot
```
[Manual Trigger] -> [Set node with Markdown] -> [Markmap with Screenshot enabled] -> [Write Binary File for HTML] -> [Write Binary File for Screenshot]
```

### With Custom Spacing
```
[Manual Trigger] -> [Set node with Markdown] -> [Markmap with Node Spacing (Horizontal: 120, Vertical: 15)] -> [Write Binary File]
```

## Changelog

### v0.1.5 (2026-02-20)

#### New Features
- **Node Spacing Options**: Added configurable spacing parameters for better control over mindmap layout
  - `Horizontal Spacing`: Control horizontal distance between nodes (default: 80px)
  - `Vertical Spacing`: Control vertical distance between nodes (default: 5px)
  - `Node Min Height`: Set minimum height for nodes (default: 16px)
  - `Padding X`: Set horizontal padding inside nodes (default: 8px)
- **Table Spacing Options**: Added styling options for tables in mindmaps
  - `Table Cell Padding`: Customize padding inside table cells (default: 4px 8px)
  - `Table Margin`: Customize margin around tables (default: 8px 0)

### v0.1.4 (2025-02-12)

#### Features
- Initial release
- Markdown to HTML conversion
- CDN and Local rendering modes
- Screenshot generation with Puppeteer
- Color freeze level configuration
- Initial expand level control
- Zoom and pan controls

## Related Projects

- [markmap-cli](https://github.com/gera2ld/markmap) - CLI version
- [coc-markmap](https://github.com/gera2ld/coc-markmap) - For Neovim
- [markmap-vscode](https://marketplace.visualstudio.com/items?itemName=gera2ld.markmap-vscode) - For VSCode
- [eaf-markmap](https://github.com/emacs-eaf/eaf-markmap) - For Emacs

## Compatibility

- n8n >= 1.0.0
- Node.js >= 18

## License

MIT
=======
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
>>>>>>> 09a7801e3fb630b43d48993d9315812feff108dd
