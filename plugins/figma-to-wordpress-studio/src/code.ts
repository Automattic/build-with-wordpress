import { generateStaticArtifact } from "./exporter";
import type { NormalizedAsset, NormalizedDocument, NormalizedSceneNode, PluginToUiMessage, UiToPluginMessage } from "./types";

figma.showUI(__html__, { width: 420, height: 420, themeColors: true });

function postToUi(message: PluginToUiMessage) {
  figma.ui.postMessage(message);
}

type AssetExportFormat = "PNG" | "SVG";

type NormalizeContext = {
  assets: Map<string, NormalizedAsset>;
};

function clonePaints(node: SceneNode | PageNode, property: "fills" | "strokes") {
  if (property === "fills" && "fills" in node) {
    return node.fills === figma.mixed ? "mixed" : node.fills;
  }

  if (property === "strokes" && "strokes" in node) {
    return node.strokes;
  }

  return undefined;
}

function normalizePaints(paints: unknown, assetId?: string) {
  if (!Array.isArray(paints)) {
    return undefined;
  }

  return paints
    .filter((paint) => paint && typeof paint === "object" && "type" in paint)
    .map((paint) => {
      const typedPaint = paint as Paint;
      return {
        type: typedPaint.type,
        visible: typedPaint.visible,
        opacity: typedPaint.opacity,
        imageHash: "imageHash" in typedPaint && typeof typedPaint.imageHash === "string" ? typedPaint.imageHash : undefined,
        imageRef: "imageHash" in typedPaint && typeof typedPaint.imageHash === "string" ? typedPaint.imageHash : undefined,
        asset_id: typedPaint.type === "IMAGE" ? assetId : undefined,
        color: "color" in typedPaint ? typedPaint.color : undefined,
      };
    });
}

function hasImagePaint(paints: unknown): boolean {
  return Array.isArray(paints) && paints.some((paint) => {
    return !!paint && typeof paint === "object" && "type" in paint && paint.type === "IMAGE" && (!("visible" in paint) || paint.visible !== false);
  });
}

function firstImageHash(paints: unknown): string | undefined {
  if (!Array.isArray(paints)) {
    return undefined;
  }

  for (const paint of paints) {
    if (
      paint &&
      typeof paint === "object" &&
      "type" in paint &&
      paint.type === "IMAGE" &&
      (!("visible" in paint) || paint.visible !== false) &&
      "imageHash" in paint &&
      typeof paint.imageHash === "string"
    ) {
      return paint.imageHash;
    }
  }

  return undefined;
}

function isVectorLikeNode(node: SceneNode | PageNode): node is SceneNode {
  return ["VECTOR", "STAR", "LINE", "ELLIPSE", "POLYGON", "BOOLEAN_OPERATION"].includes(node.type);
}

function normalizeTextStyle(node: TextNode) {
  return {
    fontFamily: typeof node.fontName === "object" ? node.fontName.family : undefined,
    fontSize: typeof node.fontSize === "number" ? node.fontSize : undefined,
    fontWeight: typeof node.fontName === "object" ? node.fontName.style : undefined,
    lineHeight: typeof node.lineHeight === "object" && node.lineHeight.unit === "PIXELS" ? node.lineHeight.value : undefined,
    textAlignHorizontal: node.textAlignHorizontal,
  };
}

function applyDerivedBounds(node: NormalizedSceneNode) {
  const children = (node.children || []).filter(
    (child) => child.x !== undefined && child.y !== undefined && child.width !== undefined && child.height !== undefined,
  );

  if (!children.length) {
    return;
  }

  const minX = Math.min(...children.map((child) => child.x || 0));
  const minY = Math.min(...children.map((child) => child.y || 0));
  const maxX = Math.max(...children.map((child) => (child.x || 0) + (child.width || 0)));
  const maxY = Math.max(...children.map((child) => (child.y || 0) + (child.height || 0)));

  if (node.x === undefined) normalizedNumberAssign(node, "x", minX);
  if (node.y === undefined) normalizedNumberAssign(node, "y", minY);
  if (node.width === undefined) normalizedNumberAssign(node, "width", maxX - minX);
  if (node.height === undefined) normalizedNumberAssign(node, "height", maxY - minY);
}

function normalizedNumberAssign(node: NormalizedSceneNode, key: "x" | "y" | "width" | "height", value: number) {
  if (Number.isFinite(value)) {
    node[key] = value;
  }
}

async function normalizeNode(node: SceneNode | PageNode, context: NormalizeContext, fallbackType?: string): Promise<NormalizedSceneNode> {
  const bounds = "absoluteBoundingBox" in node ? node.absoluteBoundingBox : null;
  const fills = "fills" in node ? clonePaints(node, "fills") : undefined;
  const hasImageFill = hasImagePaint(fills);
  const shouldExportAsAsset = hasImageFill || isVectorLikeNode(node);
  const exportedAsset = shouldExportAsAsset && "exportAsync" in node
    ? await exportAsset(node as SceneNode, isVectorLikeNode(node) ? "SVG" : "PNG", firstImageHash(fills))
    : null;
  if (exportedAsset) {
    context.assets.set(exportedAsset.id, exportedAsset);
  }
  const normalized: NormalizedSceneNode = {
    id: node.id,
    name: node.name,
    type: fallbackType || (shouldExportAsAsset && exportedAsset ? "IMAGE" : node.type),
    visible: "visible" in node ? node.visible : true,
    x: bounds?.x,
    y: bounds?.y,
    width: bounds?.width,
    height: bounds?.height,
    absoluteBoundingBox: bounds ? {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    } : undefined,
    fills: normalizePaints(fills, exportedAsset?.id),
    strokes: "strokes" in node ? normalizePaints(clonePaints(node, "strokes"), exportedAsset?.id) : undefined,
  };

  if (exportedAsset) {
    normalized.asset_id = exportedAsset.id;
    normalized.image = {
      asset_id: exportedAsset.id,
      imageHash: exportedAsset.imageHash,
      dataUri: exportedAsset.dataUrl,
      alt: node.name,
    };
  }

  if (node.type === "TEXT") {
    normalized.characters = node.characters;
    normalized.style = normalizeTextStyle(node);
  }

  if ("opacity" in node) {
    normalized.opacity = node.opacity;
  }

  if ("cornerRadius" in node && typeof node.cornerRadius === "number") {
    normalized.cornerRadius = node.cornerRadius;
  }

  if ("children" in node) {
    normalized.children = await Promise.all(node.children.map((child) => normalizeNode(child, context)));
    applyDerivedBounds(normalized);
  }

  return normalized;
}

function bytesToDataUrl(bytes: Uint8Array, mimeType: string) {
  return `data:${mimeType};base64,${figma.base64Encode(bytes)}`;
}

function assetId(node: SceneNode, format: AssetExportFormat) {
  return `${node.id}:${format.toLowerCase()}`;
}

function assetPath(node: SceneNode, format: AssetExportFormat) {
  const extension = format === "SVG" ? "svg" : "png";
  const slug = node.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "asset";

  return `assets/${slug}-${node.id.replace(/[^a-z0-9]+/gi, "-")}.${extension}`;
}

function contentBase64FromDataUrl(dataUrl: string) {
  return dataUrl.replace(/^data:[^;,]+;base64,/, "");
}

async function exportAsset(node: SceneNode, format: AssetExportFormat, imageHash?: string): Promise<NormalizedAsset | null> {
  if (!("exportAsync" in node)) {
    return null;
  }

  const mimeType = format === "SVG" ? "image/svg+xml" : "image/png";

  try {
    const bytes = format === "SVG"
      ? await node.exportAsync({ format: "SVG" })
      : await node.exportAsync({ format: "PNG", constraint: { type: "SCALE", value: 1 } });
    const dataUrl = bytesToDataUrl(bytes, mimeType);

    return {
      id: assetId(node, format),
      name: `${node.name}.${format.toLowerCase()}`,
      format,
      dataUrl,
      mime_type: mimeType,
      content_base64: contentBase64FromDataUrl(dataUrl),
      path: assetPath(node, format),
      node_id: node.id,
      imageHash,
    };
  } catch (error) {
    console.warn("Unable to export Figma asset", error);
    return null;
  }
}

async function getDocument(): Promise<NormalizedDocument> {
  if ("loadAllPagesAsync" in figma) {
    await figma.loadAllPagesAsync();
  }

  const context: NormalizeContext = { assets: new Map() };
  const pages = await Promise.all(figma.root.children.map((page) => normalizeNode(page, context, "PAGE")));
  const root: NormalizedSceneNode = {
    id: figma.root.id,
    name: figma.root.name || "Figma document",
    type: "DOCUMENT",
    visible: true,
    children: pages,
  };
  applyDerivedBounds(root);

  return {
    id: figma.root.id,
    name: figma.root.name || "Figma document",
    type: "DOCUMENT",
    exportedAt: new Date().toISOString(),
    root,
    assets: Array.from(context.assets.values()),
  };
}

async function refreshDocument() {
  try {
    const selection = await getDocument();
    postToUi({
      type: "selection",
      selection,
      artifact: generateStaticArtifact(selection),
    });
  } catch (error) {
    postToUi({ type: "error", message: error instanceof Error ? error.message : "Failed to read the Figma document." });
  }
}

figma.ui.onmessage = async (message: UiToPluginMessage) => {
  if (message.type === "refresh-document") {
    await refreshDocument();
    return;
  }

  if (message.type === "notify") {
    figma.notify(message.message);
  }
};

void refreshDocument();
