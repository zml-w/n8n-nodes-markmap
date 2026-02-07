import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import puppeteer from 'puppeteer-core';

/**
 * Markmap HTML template – a self-contained page that loads d3 and markmap-view
 * from a CDN at runtime and renders the mind-map from an embedded JSON tree.
 */
function buildHtml(
	rootJson: string,
	title: string,
	jsonOptionsJson: string,
	colorFreezeLevel: number,
): string {
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

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/**
 * Take a screenshot of HTML content using Puppeteer
 */
async function takeScreenshot(
	html: string,
	chromePath: string,
	width: number,
	height: number,
	waitTime: number,
	fullPage: boolean = false,
): Promise<Buffer> {
	const browser = await puppeteer.launch({
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
	} finally {
		await browser.close();
	}
}

export class Markmap implements INodeType {
		description: INodeTypeDescription = {
			displayName: 'Markmap',
			name: 'markmap',
			icon: 'file:markmap.svg',
			group: ['transform'],
			version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description:
			'Convert Markdown text into an interactive markmap mind-map HTML page. Can be used as a tool by AI Agents to visualize structured information.',
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
						description:
							'Transform Markdown text into a self-contained markmap HTML page',
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
				placeholder:
					'# My Topic\n\n## Branch 1\n\n- item a\n- item b\n\n## Branch 2\n\n- item c',
				description:
					`The Markdown content to convert into a markmap mind-map.

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
				description:
					'Title for the generated HTML page',
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
				description:
					'Whether to generate a screenshot of the mindmap using Puppeteer',
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
				description:
					'Path to the Chrome/Chromium executable for Puppeteer. This parameter is automatically added when screenshot is enabled',
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
						description:
							'Width of the screenshot in pixels',
					},
					{
						displayName: 'Screenshot Height',
						name: 'height',
						type: 'number',
						default: 1080,
						description:
							'Height of the screenshot in pixels',
					},
					{
						displayName: 'Wait Time (ms)',
						name: 'waitTime',
						type: 'number',
						default: 2000,
						description:
							'Time to wait for the mindmap animation to complete before taking screenshot (in milliseconds)',
					},
					{
						displayName: 'Full Page Screenshot',
						name: 'fullPage',
						type: 'boolean',
						default: false,
						description:
							'Whether to capture the full scrollable page (true) or just the viewport (false). Full page captures the entire mindmap even if it extends beyond the screen',
					},
					{
						displayName: 'Output Format',
						name: 'outputFormat',
						type: 'options',
						default: 'binary',
						description:
							'How to output the screenshot: binary data or base64 encoded string',
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
						displayName: 'Color Freeze Level',
						name: 'colorFreezeLevel',
						type: 'number',
						default: 0,
						description:
							'Freeze colors at a specific branch depth (0 = no freeze)',
					},
					{
						displayName: 'Initial Expand Level',
						name: 'initialExpandLevel',
						type: 'number',
						default: -1,
						description:
							'The maximum level of nodes to expand on initial render (-1 = expand all)',
					},
					{
						displayName: 'Max Width',
						name: 'maxWidth',
						type: 'number',
						default: 0,
						description:
							'Maximum width of each node content in pixels (0 = no limit)',
					},
					{
						displayName: 'Zoom',
						name: 'zoom',
						type: 'boolean',
						default: true,
						description:
							'Whether to enable zoom and pan on the mind-map',
					},
					{
						displayName: 'Pan',
						name: 'pan',
						type: 'boolean',
						default: true,
						description:
							'Whether to enable panning on the mind-map',
					},
					{
						displayName: 'Output Field',
						name: 'outputField',
						type: 'string',
						default: 'html',
						description:
							'Name of the output field that will contain the HTML string',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Dynamic import so we can use the ESM markmap-lib package
		let Transformer: any;
		try {
			const markmapLib = await import('markmap-lib');
			Transformer = markmapLib.Transformer;
		} catch (err) {
			throw new NodeOperationError(
				this.getNode(),
				'Failed to load markmap-lib. Make sure markmap-lib is installed.',
			);
		}

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;

				if (operation === 'markdownToHtml') {
					const markdown = this.getNodeParameter('markdown', i) as string;
					const title = this.getNodeParameter('title', i) as string;
					const options = this.getNodeParameter('options', i, {}) as {
						colorFreezeLevel?: number;
						initialExpandLevel?: number;
						maxWidth?: number;
						zoom?: boolean;
						pan?: boolean;
						outputField?: string;
					};
					const enableScreenshot = this.getNodeParameter('enableScreenshot', i) as boolean;

					const outputField = options.outputField || 'html';
					const colorFreezeLevel = options.colorFreezeLevel ?? 0;

					// 1. Transform Markdown -> tree
					const transformer = new Transformer();
					const { root, frontmatter } = transformer.transform(markdown);

					// 2. Build jsonOptions from frontmatter + user options
					const jsonOptions: Record<string, unknown> = {
						...((frontmatter as any)?.markmap || {}),
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

					// 3. Build self-contained HTML
					const rootJson = JSON.stringify(root);
					const jsonOptionsJson = JSON.stringify(jsonOptions);
					const html = buildHtml(rootJson, title, jsonOptionsJson, colorFreezeLevel);

					const result: INodeExecutionData = {
						json: {
							...items[i].json,
							[outputField]: html,
						},
					};

					// 4. Take screenshot if enabled
					if (enableScreenshot) {
						// Chrome path is now a separate required parameter
						const chromePath = this.getNodeParameter('chromePath', i) as string;

						const screenshotOptions = this.getNodeParameter('screenshotOptions', i, {}) as {
							width?: number;
							height?: number;
							waitTime?: number;
							fullPage?: boolean;
							outputFormat?: 'binary' | 'base64';
						};

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
							} else if (outputFormat === 'base64') {
								// Return as base64 string in JSON
								result.json.screenshotBase64 = screenshotBuffer.toString('base64');
								result.json.screenshotMimeType = 'image/png';
							}
						} catch (error) {
							throw new NodeOperationError(
								this.getNode(),
								`Screenshot failed: ${(error as Error).message}. Make sure Chrome is installed at the specified path.`,
							);
						}
					}

					returnData.push(result);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							...items[i].json,
							error: (error as Error).message,
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
