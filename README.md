# n8n-nodes-markmap

This is an [n8n](https://n8n.io) community node that converts **Markdown text** into a self-contained, interactive **markmap mind-map HTML page**.

[markmap](https://markmap.js.org/) is a library that visualizes Markdown documents as interactive mind maps.

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
| Color Freeze Level | number | `0` | Freeze branch colors at a specific depth |
| Initial Expand Level | number | `-1` | Max node depth to expand on load (`-1` = all) |
| Max Width | number | `0` | Max width of node content in px (`0` = unlimited) |
| Zoom | boolean | `true` | Enable zoom on the mind-map |
| Pan | boolean | `true` | Enable panning on the mind-map |
| Output Field | string | `html` | Name of the output JSON field containing the HTML |

**Output:**

The node adds a field (default: `html`) to each item containing the complete HTML page string. You can then:

- Write it to a file using the **Write Binary File** node
- Send it as an email attachment
- Return it as an HTTP response
- Store it in a database

## Example Workflow

```
[Manual Trigger] -> [Set node with Markdown] -> [Markmap] -> [Write Binary File]
```

## Compatibility

- n8n >= 1.0.0
- Node.js >= 18

## License

MIT
