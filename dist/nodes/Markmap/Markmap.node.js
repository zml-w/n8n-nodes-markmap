"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Markmap = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Cache for library files
let d3JsCache = null;
let markmapViewJsCache = null;
/**
 * Load library files from current directory
 * These files are copied to dist/ during build
 */
function loadLocalLibraries() {
    // Return cached values if available
    if (d3JsCache && markmapViewJsCache) {
        return { d3Js: d3JsCache, markmapViewJs: markmapViewJsCache };
    }
    try {
        // Load d3 from current directory (works in both source and dist)
        const d3Path = path.join(__dirname, 'd3.min.js');
        const d3Js = fs.readFileSync(d3Path, 'utf-8');
        // Load markmap-view from current directory
        const markmapViewPath = path.join(__dirname, 'markmap-view.js');
        const markmapViewJs = fs.readFileSync(markmapViewPath, 'utf-8');
        // Cache the results
        d3JsCache = d3Js;
        markmapViewJsCache = markmapViewJs;
        return { d3Js, markmapViewJs };
    }
    catch (error) {
        throw new Error(`Failed to load local libraries: ${error.message}`);
    }
}
/**
 * Build HTML with CDN resources
 */
function buildHtmlWithCDN(rootJson, title, jsonOptionsJson, colorFreezeLevel) {
    return `<!doctype html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<style>
* { margin: 0; padding: 0; }
html {
  font-family: ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
}
#mindmap {
  display: block;
  width: 100vw;
  height: 100vh;
}
.markmap-dark {
  background: #27272a;
  color: white;
}
</style>
</head>
<body>
<svg id="mindmap"></svg>
<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
<script src="https://cdn.jsdelivr.net/npm/markmap-view@0.18"></script>
<script>
(function() {
  var root = ${rootJson};
  var jsonOptions = ${jsonOptionsJson};
  var colorFreezeLevel = ${colorFreezeLevel};

  var options = markmap.deriveOptions(jsonOptions);
  if (colorFreezeLevel > 0) {
    options.colorFreezeLevel = colorFreezeLevel;
  }

  window.mm = markmap.Markmap.create('svg#mindmap', options, root);

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('markmap-dark');
  }
})();
</script>
</body>
</html>`;
}
/**
 * Build HTML with local embedded resources
 */
function buildHtmlWithLocal(rootJson, title, jsonOptionsJson, colorFreezeLevel) {
    const { d3Js, markmapViewJs } = loadLocalLibraries();
    return `<!doctype html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<style>
* { margin: 0; padding: 0; }
html {
  font-family: ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
}
#mindmap {
  display: block;
  width: 100vw;
  height: 100vh;
}
.markmap-dark {
  background: #27272a;
  color: white;
}
</style>
</head>
<body>
<svg id="mindmap"></svg>
<script>
${d3Js}
</script>
<script>
${markmapViewJs}
</script>
<script>
(function() {
  var root = ${rootJson};
  var jsonOptions = ${jsonOptionsJson};
  var colorFreezeLevel = ${colorFreezeLevel};

  var options = markmap.deriveOptions(jsonOptions);
  if (colorFreezeLevel > 0) {
    options.colorFreezeLevel = colorFreezeLevel;
  }

  window.mm = markmap.Markmap.create('svg#mindmap', options, root);

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('markmap-dark');
  }
})();
</script>
</body>
</html>`;
}
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
/**
 * Take a screenshot of HTML content using Puppeteer
 */
async function takeScreenshot(html, chromePath, width, height, waitTime, fullPage = false) {
    const browser = await puppeteer_core_1.default.launch({
        executablePath: chromePath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
        const page = await browser.newPage();
        await page.setViewport({ width, height });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        // Wait for markmap to render
        await page.waitForFunction('typeof window.mm !== "undefined"', { timeout: 10000 });
        // Additional wait time for animation to complete
        await new Promise(resolve => setTimeout(resolve, waitTime));
        // Take screenshot
        const screenshot = await page.screenshot({
            fullPage: fullPage,
            type: 'png',
        });
        return screenshot;
    }
    finally {
        await browser.close();
    }
}
class Markmap {
    constructor() {
        this.description = {
            displayName: 'Markmap',
            name: 'markmap',
            icon: 'file:markmap.svg',
            group: ['transform'],
            version: 1,
            subtitle: '={{$parameter["operation"]}}',
            description: 'Convert Markdown text into an interactive markmap mind-map HTML page. Can be used as a tool by AI Agents to visualize structured information.',
            defaults: {
                name: 'Markmap',
            },
            usableAsTool: true,
            inputs: ['main'],
            outputs: ['main'],
            properties: [
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Markdown to HTML',
                            value: 'markdownToHtml',
                            description: 'Transform Markdown text into a self-contained markmap HTML page',
                            action: 'Transform markdown to markmap HTML',
                        },
                    ],
                    default: 'markdownToHtml',
                },
                {
                    displayName: 'Markdown Text',
                    name: 'markdown',
                    type: 'string',
                    typeOptions: {
                        rows: 12,
                    },
                    default: '',
                    required: true,
                    placeholder: '# My Topic\n\n## Branch 1\n\n- item a\n- item b\n\n## Branch 2\n\n- item c',
                    description: `The Markdown content to convert into a markmap mind-map.

Markdown Format Specification:
- # Title - Root node (level 1 heading), represents the main topic
- ## Branch - Second-level node (level 2 heading), represents main branches
- ### Sub-branch - Third-level node (level 3 heading), represents sub-branches
- - List item - Leaf nodes (bullet points), represents end content

Example Structure:
  # Project Plan (root)
  ## Phase 1 (branch)
  ### Task A (sub-branch)
  - Detail 1 (leaf)
  - Detail 2 (leaf)
  ## Phase 2 (branch)
  - Summary (leaf)

The hierarchy is: # Root → ## Branch → ### Sub-branch → - Leaf`,
                    displayOptions: {
                        show: {
                            operation: ['markdownToHtml'],
                        },
                    },
                },
                {
                    displayName: 'Title',
                    name: 'title',
                    type: 'string',
                    default: 'Markmap',
                    description: 'Title for the generated HTML page',
                    displayOptions: {
                        show: {
                            operation: ['markdownToHtml'],
                        },
                    },
                },
                {
                    displayName: 'Enable Screenshot',
                    name: 'enableScreenshot',
                    type: 'boolean',
                    default: false,
                    description: 'Whether to generate a screenshot of the mindmap using Puppeteer',
                    displayOptions: {
                        show: {
                            operation: ['markdownToHtml'],
                        },
                    },
                },
                {
                    displayName: 'Chrome Executable Path',
                    name: 'chromePath',
                    type: 'string',
                    default: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                    required: true,
                    description: 'Path to the Chrome/Chromium executable for Puppeteer. This parameter is automatically added when screenshot is enabled. If a corresponding environment variable is set, it will take precedence over this value.',
                    displayOptions: {
                        show: {
                            operation: ['markdownToHtml'],
                            enableScreenshot: [true],
                        },
                    },
                },
                {
                    displayName: 'Screenshot Options',
                    name: 'screenshotOptions',
                    type: 'collection',
                    placeholder: 'Add Option',
                    default: {},
                    displayOptions: {
                        show: {
                            operation: ['markdownToHtml'],
                            enableScreenshot: [true],
                        },
                    },
                    options: [
                        {
                            displayName: 'Screenshot Width',
                            name: 'width',
                            type: 'number',
                            default: 1920,
                            description: 'Width of the screenshot in pixels',
                        },
                        {
                            displayName: 'Screenshot Height',
                            name: 'height',
                            type: 'number',
                            default: 1080,
                            description: 'Height of the screenshot in pixels',
                        },
                        {
                            displayName: 'Wait Time (ms)',
                            name: 'waitTime',
                            type: 'number',
                            default: 2000,
                            description: 'Time to wait for the mindmap animation to complete before taking screenshot (in milliseconds)',
                        },
                        {
                            displayName: 'Full Page Screenshot',
                            name: 'fullPage',
                            type: 'boolean',
                            default: false,
                            description: 'Whether to capture the full scrollable page (true) or just the viewport (false). Full page captures the entire mindmap even if it extends beyond the screen',
                        },
                        {
                            displayName: 'Output Format',
                            name: 'outputFormat',
                            type: 'options',
                            default: 'binary',
                            description: 'How to output the screenshot: binary data or base64 encoded string',
                            options: [
                                {
                                    name: 'Binary Data',
                                    value: 'binary',
                                    description: 'Return screenshot as binary data',
                                },
                                {
                                    name: 'Base64 String',
                                    value: 'base64',
                                    description: 'Return screenshot as base64 encoded string in JSON',
                                },
                            ],
                        },
                    ],
                },
                {
                    displayName: 'Options',
                    name: 'options',
                    type: 'collection',
                    placeholder: 'Add Option',
                    default: {},
                    displayOptions: {
                        show: {
                            operation: ['markdownToHtml'],
                        },
                    },
                    options: [
                        {
                            displayName: 'Render Mode',
                            name: 'renderMode',
                            type: 'options',
                            default: 'cdn',
                            description: 'Choose how to load markmap libraries: CDN (requires internet) or Local (offline, embedded)',
                            options: [
                                {
                                    name: 'CDN (Online)',
                                    value: 'cdn',
                                    description: 'Load libraries from CDN (requires internet connection)',
                                },
                                {
                                    name: 'Local (Offline)',
                                    value: 'local',
                                    description: 'Use embedded local libraries (works offline)',
                                },
                            ],
                        },
                        {
                            displayName: 'Color Freeze Level',
                            name: 'colorFreezeLevel',
                            type: 'number',
                            default: 0,
                            description: 'Freeze colors at a specific branch depth (0 = no freeze)',
                        },
                        {
                            displayName: 'Initial Expand Level',
                            name: 'initialExpandLevel',
                            type: 'number',
                            default: -1,
                            description: 'The maximum level of nodes to expand on initial render (-1 = expand all)',
                        },
                        {
                            displayName: 'Max Width',
                            name: 'maxWidth',
                            type: 'number',
                            default: 0,
                            description: 'Maximum width of each node content in pixels (0 = no limit)',
                        },
                        {
                            displayName: 'Zoom',
                            name: 'zoom',
                            type: 'boolean',
                            default: true,
                            description: 'Whether to enable zoom and pan on the mind-map',
                        },
                        {
                            displayName: 'Pan',
                            name: 'pan',
                            type: 'boolean',
                            default: true,
                            description: 'Whether to enable panning on the mind-map',
                        },
                        {
                            displayName: 'Output Field',
                            name: 'outputField',
                            type: 'string',
                            default: 'html',
                            description: 'Name of the output field that will contain the HTML string',
                        },
                    ],
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        // Dynamic import so we can use the ESM markmap-lib package
        let Transformer;
        try {
            const markmapLib = await Promise.resolve().then(() => __importStar(require('markmap-lib')));
            Transformer = markmapLib.Transformer;
        }
        catch (err) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Failed to load markmap-lib. Make sure markmap-lib is installed.');
        }
        for (let i = 0; i < items.length; i++) {
            try {
                const operation = this.getNodeParameter('operation', i);
                if (operation === 'markdownToHtml') {
                    const markdown = this.getNodeParameter('markdown', i);
                    const title = this.getNodeParameter('title', i);
                    const options = this.getNodeParameter('options', i, {});
                    const enableScreenshot = this.getNodeParameter('enableScreenshot', i);
                    const outputField = options.outputField || 'html';
                    const colorFreezeLevel = options.colorFreezeLevel ?? 0;
                    const renderMode = options.renderMode || 'cdn';
                    // 1. Transform Markdown -> tree
                    const transformer = new Transformer();
                    const { root, frontmatter } = transformer.transform(markdown);
                    // 2. Build jsonOptions from frontmatter + user options
                    const jsonOptions = {
                        ...(frontmatter?.markmap || {}),
                    };
                    if (options.initialExpandLevel !== undefined && options.initialExpandLevel !== -1) {
                        jsonOptions.initialExpandLevel = options.initialExpandLevel;
                    }
                    if (options.maxWidth && options.maxWidth > 0) {
                        jsonOptions.maxWidth = options.maxWidth;
                    }
                    if (options.zoom === false) {
                        jsonOptions.zoom = false;
                    }
                    if (options.pan === false) {
                        jsonOptions.pan = false;
                    }
                    // 3. Build self-contained HTML based on render mode
                    const rootJson = JSON.stringify(root);
                    const jsonOptionsJson = JSON.stringify(jsonOptions);
                    const html = renderMode === 'local'
                        ? buildHtmlWithLocal(rootJson, title, jsonOptionsJson, colorFreezeLevel)
                        : buildHtmlWithCDN(rootJson, title, jsonOptionsJson, colorFreezeLevel);
                    const result = {
                        json: {
                            ...items[i].json,
                            [outputField]: html,
                        },
                    };
                    // 4. Take screenshot if enabled
                    if (enableScreenshot) {
                        // Get Chrome path from environment variable or node parameter
                        const envChromePath = process.env.PUPPETEER_EXECUTABLE_PATH;
                        const paramChromePath = this.getNodeParameter('chromePath', i);
                        const chromePath = envChromePath || paramChromePath;
                        const screenshotOptions = this.getNodeParameter('screenshotOptions', i, {});
                        const width = screenshotOptions.width || 1920;
                        const height = screenshotOptions.height || 1080;
                        const waitTime = screenshotOptions.waitTime || 2000;
                        const fullPage = screenshotOptions.fullPage || false;
                        const outputFormat = screenshotOptions.outputFormat || 'binary';
                        try {
                            const screenshotBuffer = await takeScreenshot(html, chromePath, width, height, waitTime, fullPage);
                            if (outputFormat === 'binary') {
                                // Return as binary data
                                result.binary = {
                                    screenshot: {
                                        data: screenshotBuffer.toString('base64'),
                                        mimeType: 'image/png',
                                        fileName: `markmap-${Date.now()}.png`,
                                    },
                                };
                            }
                            else if (outputFormat === 'base64') {
                                // Return as base64 string in JSON
                                result.json.screenshotBase64 = screenshotBuffer.toString('base64');
                                result.json.screenshotMimeType = 'image/png';
                            }
                        }
                        catch (error) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Screenshot failed: ${error.message}. Make sure Chrome is installed at the specified path.`);
                        }
                    }
                    returnData.push(result);
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            ...items[i].json,
                            error: error.message,
                        },
                    });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.Markmap = Markmap;
//# sourceMappingURL=Markmap.node.js.map