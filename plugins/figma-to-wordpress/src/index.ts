export type FigmaNodeType =
  | "FRAME"
  | "GROUP"
  | "TEXT"
  | "RECTANGLE"
  | "IMAGE"
  | "COMPONENT"
  | "INSTANCE";

export interface FigmaSceneNode {
  id: string;
  name: string;
  type: FigmaNodeType | string;
  children?: FigmaSceneNode[];
  characters?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fills?: FigmaPaint[];
  strokes?: FigmaPaint[];
  opacity?: number;
  cornerRadius?: number;
  visible?: boolean;
  style?: FigmaTextStyle;
  image?: FigmaImageSource;
  href?: string;
}

export interface FigmaPaint {
  type?: string;
  visible?: boolean;
  color?: string | FigmaRgbColor;
  opacity?: number;
}

export interface FigmaRgbColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface FigmaTextStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number | string;
  lineHeight?: number | string;
  textAlignHorizontal?: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED" | string;
}

export interface FigmaImageSource {
  src?: string;
  dataUri?: string;
  alt?: string;
}

export interface WebsiteArtifact {
  files: Record<string, string>;
  diagnostics: ArtifactDiagnostic[];
  metadata?: ArtifactMetadata;
}

export interface ArtifactDiagnostic {
  level: "warning" | "error";
  nodeId: string;
  nodeName: string;
  message: string;
}

export interface ArtifactMetadata {
  title: string;
  generatedAt?: string;
  nodeCount: number;
  diagnostics: ArtifactDiagnostic[];
}

export interface GenerateArtifactOptions {
  title?: string;
  includeMetadata?: boolean;
  generatedAt?: string;
}

interface RenderContext {
  diagnostics: ArtifactDiagnostic[];
  cssRules: string[];
  usedClasses: Map<string, number>;
  assets: Record<string, string>;
  nodeCount: number;
}

const containerTypes = new Set(["FRAME", "GROUP", "COMPONENT", "INSTANCE"]);
const supportedTypes = new Set(Array.from(containerTypes).concat(["TEXT", "RECTANGLE", "IMAGE"]));

export function generateWebsiteArtifact(
  scene: FigmaSceneNode,
  options: GenerateArtifactOptions = {},
): WebsiteArtifact {
  const title = options.title || scene.name || "Figma export";
  const context: RenderContext = {
    diagnostics: [],
    cssRules: [],
    usedClasses: new Map(),
    assets: {},
    nodeCount: 0,
  };

  const body = renderNode(scene, context, true);
  const styles = [baseCss()].concat(context.cssRules).join("\n\n");
  const metadata: ArtifactMetadata = {
    title,
    generatedAt: options.generatedAt,
    nodeCount: context.nodeCount,
    diagnostics: context.diagnostics,
  };

  const files: Record<string, string> = {
    "index.html": renderDocument(title, body),
    "assets/styles.css": styles,
  };

  for (const [assetPath, assetContent] of Object.entries(context.assets)) {
    files[assetPath] = assetContent;
  }

  if (options.includeMetadata) {
    files["metadata.json"] = `${JSON.stringify(metadata, null, 2)}\n`;
  }

  return {
    files,
    diagnostics: context.diagnostics,
    metadata: options.includeMetadata ? metadata : undefined,
  };
}

function renderNode(node: FigmaSceneNode, context: RenderContext, isRoot = false): string {
  context.nodeCount += 1;

  if (node.visible === false) {
    return "";
  }

  if (!supportedTypes.has(node.type)) {
    context.diagnostics.push({
      level: "warning",
      nodeId: node.id,
      nodeName: node.name,
      message: `Unsupported node type: ${node.type}`,
    });
    return renderChildren(node, context);
  }

  if (node.type === "TEXT") {
    return renderText(node, context);
  }

  if (node.type === "IMAGE") {
    return renderImage(node, context);
  }

  if (node.type === "RECTANGLE" && !node.children?.length) {
    return renderRectangle(node, context);
  }

  return renderContainer(node, context, isRoot);
}

function renderContainer(node: FigmaSceneNode, context: RenderContext, isRoot: boolean): string {
  const className = addCssRule(node, context, ["section"]);
  const tagName = isRoot ? "main" : isButtonLike(node) ? "a" : "section";
  const attrs = [
    `class="${className}"`,
    isButtonLike(node) ? `href="${escapeAttribute(node.href || "#")}"` : "",
  ].filter(Boolean);
  const children = renderChildren(node, context);

  return `<${tagName} ${attrs.join(" ")}>\n${children}\n</${tagName}>`;
}

function renderText(node: FigmaSceneNode, context: RenderContext): string {
  const className = addCssRule(node, context, ["text"]);
  const content = escapeHtml(node.characters || "");
  const tagName = textTagName(node);

  return `<${tagName} class="${className}">${content}</${tagName}>`;
}

function renderRectangle(node: FigmaSceneNode, context: RenderContext): string {
  const className = addCssRule(node, context, ["shape"]);
  return `<div class="${className}" aria-hidden="true"></div>`;
}

function renderImage(node: FigmaSceneNode, context: RenderContext): string {
  const className = addCssRule(node, context, ["image"]);
  const src = resolveImageSource(node, context);
  const alt = escapeAttribute(node.image?.alt || node.name || "");

  return `<img class="${className}" src="${escapeAttribute(src)}" alt="${alt}">`;
}

function renderChildren(node: FigmaSceneNode, context: RenderContext): string {
  return (node.children || [])
    .map((child) => renderNode(child, context))
    .filter(Boolean)
    .join("\n");
}

function addCssRule(node: FigmaSceneNode, context: RenderContext, parts: string[]): string {
  const baseClass = toClassName([node.name].concat(parts).join("-"));
  const count = context.usedClasses.get(baseClass) || 0;
  context.usedClasses.set(baseClass, count + 1);
  const className = count === 0 ? baseClass : `${baseClass}-${count + 1}`;
  const declarations = cssDeclarations(node);

  if (declarations.length) {
    context.cssRules.push(`.${className} {\n${declarations.map((rule) => `  ${rule}`).join("\n")}\n}`);
  }

  return className;
}

function cssDeclarations(node: FigmaSceneNode): string[] {
  const declarations: string[] = [];
  const fill = firstVisiblePaint(node.fills);
  const stroke = firstVisiblePaint(node.strokes);

  if (node.width !== undefined) declarations.push(`width: ${formatPx(node.width)};`);
  if (node.height !== undefined && node.type !== "TEXT") declarations.push(`min-height: ${formatPx(node.height)};`);
  if (node.opacity !== undefined && node.opacity < 1) declarations.push(`opacity: ${node.opacity};`);
  if (node.cornerRadius !== undefined) declarations.push(`border-radius: ${formatPx(node.cornerRadius)};`);
  if (fill) declarations.push(`background: ${paintToCss(fill)};`);
  if (stroke) declarations.push(`border: 1px solid ${paintToCss(stroke)};`);

  if (containerTypes.has(node.type)) {
    declarations.push("display: flex;");
    declarations.push("flex-direction: column;");
    declarations.push("gap: 1rem;");
  }

  if (node.type === "TEXT") {
    if (node.style?.fontFamily) declarations.push(`font-family: ${quoteFontFamily(node.style.fontFamily)};`);
    if (node.style?.fontSize) declarations.push(`font-size: ${formatPx(node.style.fontSize)};`);
    if (node.style?.fontWeight) declarations.push(`font-weight: ${node.style.fontWeight};`);
    if (node.style?.lineHeight) declarations.push(`line-height: ${formatLineHeight(node.style.lineHeight)};`);
    if (node.style?.textAlignHorizontal) declarations.push(`text-align: ${textAlign(node.style.textAlignHorizontal)};`);
  }

  if (node.type === "IMAGE") {
    declarations.push("display: block;");
    declarations.push("object-fit: cover;");
  }

  if (isButtonLike(node)) {
    declarations.push("align-items: center;");
    declarations.push("justify-content: center;");
    declarations.push("text-decoration: none;");
  }

  return declarations;
}

function resolveImageSource(node: FigmaSceneNode, context: RenderContext): string {
  if (node.image?.src) {
    return node.image.src;
  }

  if (node.image?.dataUri) {
    const extension = node.image.dataUri.startsWith("data:image/svg") ? "svg" : "png";
    const fileName = `assets/${toClassName(node.name || node.id)}.${extension}`;
    context.assets[fileName] = node.image.dataUri;
    return fileName;
  }

  context.diagnostics.push({
    level: "warning",
    nodeId: node.id,
    nodeName: node.name,
    message: "Image node is missing image.src or image.dataUri",
  });

  return "";
}

function renderDocument(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
${body}
</body>
</html>
`;
}

function baseCss(): string {
  return `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  color: #111827;
  background: #ffffff;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

img {
  max-width: 100%;
}`;
}

function textTagName(node: FigmaSceneNode): "h1" | "h2" | "h3" | "p" {
  const name = node.name.toLowerCase();
  const size = node.style?.fontSize || 0;

  if (name.includes("title") || name.includes("hero") || size >= 40) return "h1";
  if (name.includes("heading") || size >= 28) return "h2";
  if (size >= 22) return "h3";
  return "p";
}

function firstVisiblePaint(paints?: FigmaPaint[]): FigmaPaint | undefined {
  return paints?.find((paint) => paint.visible !== false && paint.color);
}

function paintToCss(paint: FigmaPaint): string {
  const opacity = paint.opacity ?? 1;

  if (typeof paint.color === "string") {
    return paint.color;
  }

  if (paint.color) {
    const r = Math.round(paint.color.r * 255);
    const g = Math.round(paint.color.g * 255);
    const b = Math.round(paint.color.b * 255);
    const a = paint.color.a ?? opacity;
    return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
  }

  return "transparent";
}

function isButtonLike(node: FigmaSceneNode): boolean {
  return /button|cta|call to action/i.test(node.name);
}

function toClassName(value: string): string {
  const className = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return className || "node";
}

function formatPx(value: number): string {
  return `${trimNumber(value)}px`;
}

function trimNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function quoteFontFamily(value: string): string {
  return /\s/.test(value) ? `"${value.replace(/"/g, "\\\"")}"` : value;
}

function formatLineHeight(value: number | string): string {
  return typeof value === "number" ? formatPx(value) : value;
}

function textAlign(value: string): string {
  const normalized = value.toLowerCase();
  return normalized === "justified" ? "justify" : normalized;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/`/g, "&#96;");
}
